// send lora data
ipcMain.on('sendACK_lora', (event, args) => {
    // console.log("got dataa")
    console.log("got ACK-", args)
    //////////////////////////////////// send to serial
    if (args) {
      lora_port.write(args, function (err) {
        if (err) {
          return console.log('Error on write: ', err.message)
        }
        console.log('ACK written to lora-', args)
  
        //mainWindow.webContents.send('text_msg_sent', {msg: args});  
      })
    }
    //////////////////////////////////////
  });
  
  ipcMain.on('sendlongData_lora', (event, args) => {
    let num_of_part
    if (args.length < 45) {
      num_of_part = '01'
    } else {
      num_of_part = (parseInt(args.length / 45) + 1).toString()
    }
    console.log("num of part is -- ", args.length, num_of_part)
    if (num_of_part.length < 2) {
      num_of_part = '0' + num_of_part
    }
    let mtime = moment().format('HHmmss')
    let main_str = num_of_part + my_id + 'ffff' + mtime + enc_key_saved;
    let crc = crc16_kermit(main_str)
    let fin_data = '15' + 'l1' + main_str + crc + '91'
    long_data_handshake_obj = fin_data
    write_to_lora(fin_data)
    long_data_start_tmp = fin_data
    long_data_tmp_str = args
    let int_flag = 0
    var myinclose = setInterval(function () {
      write_to_lora(fin_data)
      int_flag = int_flag + 1
      if (int_flag > 3) {
        console.log("interval cleared..", long_data_starting_config)
        clearInterval(myinclose)
      }
    }, 1000 * 10)
    setTimeout(function () {
      console.log("clear inter val from timeout..", long_data_starting_config)
      clearInterval(myinclose);
      if (long_data_starting_config.state) {
        mainWindow.webContents.send('long_data_rcvr_list', long_data_starting_config)
        // start sending data create an arr
        var trminal_val = parseInt(long_data_starting_config.startdata.substr(4, 2))
        for (var i = 0; i < trminal_val; i++) {
          let part_no = (i + 1).toString()
          if (part_no.length < 2) {
            part_no = '0' + part_no
          }
          if (i !== trminal_val - 1) {
            let main_str = my_id + part_no + '45' + long_data_starting_config.stringval.substr(i * 45, 45)
            let crc_kermit = crc16_kermit(main_str)
            var fin_data = "15" + "l5" + main_str + crc_kermit + "91"
            long_data_string_arr.push({ main_data: fin_data, ack_from: [] })
          }
          else {
            let main_str = my_id + part_no + long_data_starting_config.stringval.substr(i * 45).length + long_data_starting_config.stringval.substr(i * 45, 45)
            let crc_kermit = crc16_kermit(main_str)
            var fin_data = "15" + "l5" + main_str + crc_kermit + "91"
            long_data_string_arr.push({ main_data: fin_data, ack_from: [] })
            let flag = 0
            var cancel_long_data_interval = setInterval(function () {
              if (long_data_string_arr[flag].ack_from.length != long_data_starting_config.recieved_from_arr.length)
                write_to_lora(long_data_string_arr[flag].main_data)
              flag++
  
              if (flag == long_data_string_arr.length - 1) {
                flag = 0
              }
              let completed_to_all_sent = 0
              long_data_string_arr.map((mapval, index) => {
                if (mapval.ack_from.length == long_data_starting_config.recieved_from_arr.length) {
                  completed_to_all_sent++
                }
                if (completed_to_all_sent == long_data_string_arr.length) {
                  console.log("all data sent complete....cancel interval")
                  clearInterval(cancel_long_data_interval)
                }
              })
              let timee = moment(long_data_starting_config.mtime)
              var ms = moment(moment().format('YYYY-MM-DD HH:mm:ss')).diff(timee)
              var d = moment.duration(ms)
              if (d.asMinutes() > 2) {
                console.log("over 2 minutes so cancel interval")
                clearInterval(cancel_long_data_interval)
              }
            }, 4000)
            console.log("final long_data string arr--", long_data_string_arr)
          }
        }
      }
    }, 40000) // stop it after 10seconds
  })
  ipcMain.on('send_my_id_enc_data_shipl', (event, args) => {
    my_id_obj.connectionstate = connectionstate
    if (my_id) {
      const TODAY_START = new Date(moment().startOf('day').add(6, 'hours'))//new Date().setHours(0, 0, 0, 0);
      const NOW = new Date();
      all_msg_models.findAll({
        raw: true,
        limit: 20,
        order: [['id', 'DESC']]
      })
        .then(result => {
          gps_data_models.findAll({
            where: {
              mtime: {
                [Op.gt]: TODAY_START
                //[Op.lt]: NOW
              }
            },
            raw: true,
            //limit:1000,
            order: [['mtime', 'ASC']]
          }).then(result_gps => {
            // console.log("result of op today is --", result_gps)
            // console.log("result of op today is --", result_gps)
            // console.log("result of op today is --", result_gps)
            mainWindow.webContents.send('rcv_my_id_enc_data_shipl',
              {
                msg: {
                  my_id_obj: my_id_obj, enc_key: enc_key_saved, data: result,
                  shipl: rcvrlist, prestate: online_ofline_state, all_gps: result_gps
                }
              });
          })
  
        })
    } else {
  
    }
  })
  // frequency tablew get and sent to ng
  ipcMain.on('send_freq_table', (event, args) => {
    if (args) {
      mainWindow.webContents.send('get_freq_table', { msg: freq_table_saved });
    }
  })
  // send_curr_chan
  ipcMain.on('send_curr_chan', (event, args) => {
    if (args) {
      curr_chan_models.findAll({ raw: true }).then(result => {
        //my_id_obj = {id:result[0].id,uid:result[0].uid,ship:result[0].ship}
        console.log("Curr channel select-", result[0], result)
        mainWindow.webContents.send('get_curr_chan', { msg: result[0] });
      }).catch(err => { console.log(err) });
    }
  })
  // db save all msg send data
  ipcMain.on('allmsg_save_to_db', (event, args) => {
    if (args) {
      all_msg_models.create({
        mleft: args.mleft.toString(), mright: args.mright.toString(),
        sender: args.sender,
        rcvr: args.rcvr,
        enc: args.enc, msg_serial: args.msg_serial, len: args.len,
        text: args.text, showtime: args.showtime,
        rawtime: args.rawtime//parseInt(Number("0x" + args.rawtime,10))
      }).then(result => {
        console.log("create res- ok txt");
      })
    }
  })
  // db_save_curr_chan
  ipcMain.on('db_save_curr_chan', (event, args) => {
    if (args) {
      //channel_id: null, frequency: null, type: null, en: null
      channel_id = args.channel_id,
        frequency = 4300025
      let obj = { channel_id: args.channel_id, frequency: 4300025 }
      console.log("db save curr chan -", args, channel_id)
      console.log("db save curr chan -", args, channel_id)
      curr_chan_models.update({
        channel_id, frequency
      }, { where: { id: 3 } }).then(result => {
        console.log("update success channel value",)
      })
        .catch(err => { console.log(err); });
    }
  })
  ipcMain.on('sendrepeat_lora', (event, args) => {
    lora_port.write(args, function (err) {
      if (err) {
        return console.log('Error on write: ', err.message)
      }
      console.log('repeattt message written to lora-', args, typeof args)
    })
  })
  // send stm data
  ipcMain.on('stm_send_dmr', (event, args) => {
    console.log("stm send dmr", args)
    checking_freq = 0
    hard_stm_port.write(args, function (err) {
      if (err) {
        return console.log('Error on write stm dmr: ', err.message)
      }
      console.log('hard stm message written to-', args, typeof args)
    })
  })
  // check freq is valid or not
  // send stm data
  ipcMain.on('checque_freq', (event, args) => {
    console.log("stm send cheq freq", args)
    checking_freq = 1
    hard_stm_port.write(args, function (err) {
      if (err) {
        return console.log('Error on write stm dmr: ', err.message)
      }
      console.log('hard stm message written to-', args, typeof args)
    })
  })
  
  // update enc
  ipcMain.on('update-enc', (event, args) => {
    data_enc_models.update({
      key: args.key
    }, { where: { id: args.id } }).then(result => {
      console.log("update success-")
      enc_key_saved = args.key
      mainWindow.webContents.send('enc_key_update_success', { msg: result });
    })
      .catch(err => { console.log(err); });
  })
  // send channel data to MCU
  ipcMain.on('send_freq_val_status', (event, args) => {
    hard_stm_port.write(args, function (err) {
      if (err) {
        return console.log('Error on write stm dmr: ', err.message)
      }
      console.log('hard stm frequency message written to-', args)
    })
  })
  // delete * text from db
  ipcMain.on('delete_all_text_db', (event, args) => {
    all_msg_models.destroy({
      where: {},
      truncate: true
    }).then(result => {
      mainWindow.webContents.send('delete_db_text_result', { msg: true });
    }).catch(err => { console.log(err) });
  })
  ipcMain.on('all_diag', (event, args) => {
  
    let obj = {
      lora_comm: lora_connection_state, gps_comm: gps_connection_state,
      hard_arm_comm: hard_stm_connection_state, hard_arm_data: hard_stm_data_quality,
      lora_data: lora_data_recieved, gps_data: gps_data_quality
    }
    mainWindow.webContents.send('all_diag_res', { msg: obj });
    console.log("all diag result--", obj)
  
  })
  //////
  ipcMain.on('update_custom_freq', (event, args) => {
    console.log("args--", args)
    voice_set_models.update({
      frequency: args.frequency
    }, { where: { channel_id: args.channel_id } }).then(result => {
      console.log("update success-")
      mainWindow.webContents.send('update_success_freq_custom', { msg: true });
    })
      .catch(err => { console.log(err); mainWindow.webContents.send('update_success_freq_custom', { msg: false }); });
  })
  //////////////////////////// read chan freq
  ipcMain.on('read_chan_freq', (event, args) => {
    console.log("log msg--", freq_table_saved.find(x => x.channel_id == args))
    mainWindow.webContents.send('get_chan_freq', { msg: freq_table_saved.find(x => x.channel_id == args) });
    ///////////////////
  })