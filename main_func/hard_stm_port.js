const SerialPort = require('serialport')
const data_models_api = require('./data_models_api')
const sytem_task_const = require('../constants/system_task')
var hard_stm_port
var chan_set_state = false
var enc_set_state = false
var freq_set_state = false
var checking_freq = 0

var freq_table_saved
var mainWindow = null
const hard_stm_serial = sytem_task_const.VOICE_COM_PORT//'/dev/ttyACM0'

var still_rcving_call = 0
var curr_v_chan_set; // current set channel
hard_stm_port = new SerialPort(hard_stm_serial, {
    baudRate: sytem_task_const.HARD_STM_BAUD_RATE
}, false)

module.exports.start = function(mainWindow){
    mainWindow = mainWindow
    hard_stm_port.on('error', function (err) {
        console.log("Error opening hardware MCU port"); // THIS SHOULD WORK!
        //hard_stm_connection_state = false
      });
      hard_stm_port.open(function (err) {//stm port opened
      })
      if(hard_stm_port.isOpen){
        send_system_state(mainWindow,voice_module_color = 1,data_module_color = 2,
        voice_rx_color = 2,voice_tx_color = 2,gps_color = 2, curr_v_chan_set)
      }else{
        send_system_state(mainWindow,voice_module_color = 0,data_module_color = 2 ,
        voice_rx_color = 2,voice_tx_color = 2,gps_color = 2,curr_v_chan_set)
      }

      
}
module.exports.write_stm = function(args){
    hard_stm_port.write(args, function (err) {
        if (err) {
          return console.log('Error on write stm dmr: ', err.message)
        }
       
          //console.log('hard stm message written to-', args, typeof args)
    })
} 
function write_stm (args){
  hard_stm_port.write(args, function (err) {
      if (err) {
        return console.log('Error on write stm dmr: ', err.message)
      }
      //console.log('hard stm message written to-', args, typeof args)
  })
} 
function start_hard_stm(mainWindow,ipcMain,voice_enc_key)
{
    /*ipcMain.on('db_save_curr_chan', (event, args) => {
      if (args) {
        channel_id = args.channel_id,
        frequency = 4300025// random number
        let obj = { channel_id: args.channel_id, frequency: 4300025 }
  
        data_models_api.curr_chan_update(channel_id,frequency)
    
      }
    })*/
    // send system restsend_system_reset
    ipcMain.on('send_system_reset', (event, args) => {
      let restt = [0x68, 0xf0, 0x01, 0x01, 0x94, 0xfd, 0x00, 0x01, 0x01, 0x10];
      hard_stm_port.write(restt, function (err) {
        if (err) {
          return console.log('Error on write stm dmr: ', err.message)
        }
      
      })
    })
    // get frequency table and sent to ng
    ipcMain.on('send_freq_table', (event, args) => {

      //if (args) 
      {
        mainWindow.webContents.send('get_freq_table', { msg:  freq_table_saved  });
      }
    })

    // voice encryption update
    ipcMain.on('update-voice-enc', (event, args) => {
      data_models_api.update_voice_enc(args).then(result=>{
        voice_enc_key = args.key
        mainWindow.webContents.send('voice_enc_key_update_success', { msg: result });
      }).catch(err=>{console.log(err)})
    })
    ipcMain.on('set-only-encryption',(event, args) => {

      data_models_api.get_voice_enc().then(result_key=>{

        set_encryption(8,result_key,10)
      })
    })
    // send current chan sock rcvd and send to ng
    ipcMain.on('send_curr_chan', (event, args) => {
      if (args) {
        data_models_api.curr_chan_models().then(result=> {
          data_models_api.get_voice_enc().then(result_key=>{
            mainWindow.webContents.send('get_curr_chan', { msg: result[0],voice_enc_key: result_key});
          })

        })
      }
    })
    //////////////////////////// read chan freq
    ipcMain.on('read_chan_freq', (event, args) => {
      mainWindow.webContents.send('get_chan_freq', { msg: freq_table_saved.find(x => x.channel_id == args) });
      ///////////////////
    })
    //////
    ipcMain.on('update_custom_freq', (event, args) => {
      //if(sytem_task_const.MODE_DEBUG)
        //console.log("args--", args)
      data_models_api.voice_set_models_update(args).then(result =>{
        data_models_api.voice_set_models().then(result => { // get the frequency first
          //find the coresponding frequency
          freq_table_saved = result
          mainWindow.webContents.send('update_success_freq_custom', { msg: result });
        })

      })

    })
    // send stm data
    ipcMain.on('stm_send_dmr', (event, args) => {
      //console.log("stm send dmr", args)
      checking_freq = 0
      write_stm(args)
    })
    // check freq is valid or not
    // send stm data
    ipcMain.on('checque_freq', (event, args) => {
      //console.log("stm send cheq freq", args)
      checking_freq = 1
      write_stm(args)
    })
    // send channel data to MCU
    ipcMain.on('send_freq_val_status', (event, args) => {
      write_stm(args)
    })
    // assign channel based on frontend
    ipcMain.on('set_channel', (event, args) => {
      chan_set_state = false
      freq_set_state = false
      enc_set_state = false
      let cur_chan_from_temp = parseInt(args.channel_id)
      curr_v_chan_set =  cur_chan_from_temp
     let cid
        if (args.channel_id.length < 10) {
          cid = Number("0x0" + args.channel_id)
        } else {
          cid = Number("0x" + args.channel_id)
        }
        ////////////////////////////// now write the hard_stm__channel_data to dmr
        data_models_api.voice_set_models().then(result => { // get the frequency first
          //find the coresponding frequency
          freq_table_saved = result
          let freq_str = Number(result.find(x => parseInt(x.channel_id) == cur_chan_from_temp).frequency).toString(16)
          
          
          assign_frequency(freq_str,chan_set_state,100)
          
          assign_channel(cur_chan_from_temp ,400)
          data_models_api.get_voice_enc().then(result_key=>{
            set_encryption(cur_chan_from_temp,result_key,700)
          })
          if(cur_chan_from_temp < 10){
            assign_rcvr_grp(1000)
            assign_self_id(1300)
            assign_color_code(1600)
          }

          assign_frequency(freq_str,chan_set_state,1900)
          
          assign_channel(cur_chan_from_temp ,2200)
          data_models_api.get_voice_enc().then(result_key=>{
            set_encryption(cur_chan_from_temp,result_key,2500)
          })
          if(cur_chan_from_temp < 10){
            assign_rcvr_grp(2800)
            assign_self_id(3100)
            assign_color_code(3400)
           
            ////////// volume for digital is 5
            setTimeout(function(){
              let vol_data = [0x68,0x02,0x01,0x01,0x91,0xEB,0x00,0x01,0x05,0x10]
              hard_stm_port.write(vol_data, function (err) {
                if (err) {
                  return console.log('Error on write stm dmr: ', err.message)
                }
                //console.log('Update volumke-', vol_data)
              })
            },4100)
            
          }
          else{
            setTimeout(function(){ // vol for analog 7
              let vol_data =   [0x68,0x02,0x01,0x01,0x8e,0xEB,0x00,0x01,0x08,0x10]
              hard_stm_port.write(vol_data, function (err) {
                if (err) {
                  return console.log('Error on write stm dmr: ', err.message)
                }
                //console.log('Update volumke-', vol_data)
              })
            },4100)
          }
          //assign_color_code(3200)
          //// check for encrypt dta return 

          setTimeout(function () {
            if (chan_set_state && freq_set_state && enc_set_state) {// all set success
              //console.log("all set success")
              data_models_api.curr_data_chan_models().then(curr_dt=> {
                let curr_dtt 
                if (curr_dt[0].channel_id.toString(16).length < 10) {
                  curr_dtt = Number("0x0" + curr_dt[0].channel_id.toString(16))
                } else {
                  curr_dtt = Number("0x" + curr_dt[0].channel_id.toString(16))
                }
                let cid
                if (cur_chan_from_temp.toString(16).length < 10) {
                  cid = Number("0x0" + cur_chan_from_temp.toString(16))
                } else {
                  cid = Number("0x" + cur_chan_from_temp.toString(16))
                }
                let fin_val = [0x29, Number("0x" + cur_chan_from_temp.toString().length.toString()),
                  cid,curr_dtt, 0x63]
                //console.log("Fr", fin_val)
                hard_stm_port.write(fin_val, function (err) {
                  if (err) {
                    return console.log('Error on write stm dmr: ', err.message)
                  }
                  //console.log('Update display-', fin_val)
                })
              })
              mainWindow.webContents.send('all_Set_success', { msg: { res: "change encryption success", res_id: 25 } });
              //save to db
              channel_id = args.channel_id,
              frequency = 4300025// random number
              let obj = { channel_id: args.channel_id, frequency: 4300025 }
              //if(sytem_task_const.MODE_DEBUG)
                //console.log("db save curr chan -", args, channel_id)
              data_models_api.curr_chan_update(channel_id,frequency)
            }


            /////
          }, 3800)
          //////

          //////////////////////////////////      
        }).catch(err => { console.log(err) });
        ///////
  
 
    })
    /////////////////////////////////////////////

    hard_stm_port.on("data", data => {
        hard_stm_data_quality = true
        //if(sytem_task_const.MODE_DEBUG)
          //console.log("hard stm: ",data[0], data.length, Buffer.from(data))
      
        if (data[3] == 2) {
          /// 
          mainWindow.webContents.send('dmr_return_msg', { msg: { res: "change encryption success", res_id: 25 } });
          enc_set_state = true
      
        }
        if (data[3] == 0) {
          if (data[1] == 1) {
            mainWindow.webContents.send('dmr_return_msg', { msg: { res: "Channel set success", res_id: 1 } });
            chan_set_state = true
          }
          if (data[1] == 240) {
            mainWindow.webContents.send('system_reset_success', { msg: { res: "system_reset_success", res_id: 1 } });
          }
          if(data[1] == 2){
            //console.log("recieved voulme changed data")
          }
          if (data[1] == 13) {
            if (checking_freq == 1) {
              checking_freq = 0
              mainWindow.webContents.send('cheque_freq_result', { msg: true })
              // its a frequency cheque return. so after changing freq back to pld one
              //now need to get back to prev freq
              // get cur freq and push it
      
            }
            freq_set_state = true
            mainWindow.webContents.send('dmr_return_msg', { msg: { res: "Channel and Frequency set success", res_id: 13 } });
          }
          if (data[1] == 5) {
            //if(sytem_task_const.MODE_DEBUG)
              //console.log("rssi val ...", parseInt(data[data.length - 2]))
            send_system_state(mainWindow,voice_module_color = 2,data_module_color = 2 ,
              voice_rx_color = parseInt((data[data.length - 2])),voice_tx_color = 2,gps_color = 2,curr_v_chan_set)
            
            if(parseInt(data[data.length - 3]) == 1){
              //if(sytem_task_const.MODE_DEBUG)
                //console.log("ok rssi")
              if(parseInt(data[data.length - 2]) < 3){
                //if(sytem_task_const.MODE_DEBUG)
                 // console.log("call rsssi less then 3")//
               
                /*let tochksum = [0x68, 0x02, 0x01, 0x01, 0x00, 0x01, 0x00, 0x10] //vplome 0
                let checksum = checksumcalc(tochksum, tochksum.length).toString(16)
                let finval = [tochksum[0], tochksum[1], tochksum[2], tochksum[3],
                Number("0x" + checksum.substr(0, 2)), Number("0x" + checksum.substr(2, 2)),
                tochksum[4], tochksum[5], tochksum[6], tochksum[7]]
                console.log("volume written")
                hard_stm_port.write(finval, function (err) {
                  if (err) { return console.log('Error on write stm dmr: ', err.message) }
                })*/
              }else{
                /*let tochksum = [0x68, 0x02, 0x01, 0x01, 0x00, 0x01, 0x07, 0x10] //vplome 8
                let checksum = checksumcalc(tochksum, tochksum.length).toString(16)
                let finval = [tochksum[0], tochksum[1], tochksum[2], tochksum[3],
                Number("0x" + checksum.substr(0, 2)), Number("0x" + checksum.substr(2, 2)),
                tochksum[4], tochksum[5], tochksum[6], tochksum[7]]
                console.log("volume written 7")
                hard_stm_port.write(finval, function (err) {
                  if (err) { return console.log('Error on write stm dmr: ', err.message) }
                })*/
              }
            }else{
              if(sytem_task_const.MODE_DEBUG)
                console.log("rssi val is incorrect...",data[data.length - 3])
            } 
            mainWindow.webContents.send('rssi_msg', { msg: parseInt(data[data.length - 2]).toString() })

          }
          if(data[1] == 18){
            mainWindow.webContents.send('sq_set_result', { msg: { res: "SQ Level Set Success" } });
            
          }
          if(data[1] == 11){
            //console.log("MIc gain set success")
            mainWindow.webContents.send('mg_set_result', { msg: { res: "Mic gain Success" } });
            
          }
          if (data[1] == 23)
            mainWindow.webContents.send('dmr_return_msg', { msg: { res: "Set to Low Power", res_id: 23 } });
          if (data[1] == 36){

            //console.log("own id set success")
            mainWindow.webContents.send('dmr_return_msg', { msg: { res: "Own id is - " + data[9].toString() + data[10].toString() + data[11].toString(), res_id: 36 } });
          }
          if (data[1] == 9)
            mainWindow.webContents.send('dmr_return_msg', { msg: { res: "Alarm off success-", res_id: 9 } });
          if (data[1] == 41){
            //console.log("rcv id set success")
            mainWindow.webContents.send('dmr_return_msg', { msg: { res: "Rcv Id set success -", res_id: 41 } });
          }
          if (data[1] == 56) {
            mainWindow.webContents.send('dmr_return_msg', { msg: { res: (Number("0x" + data[12]) + Number("0x" + data[11]) + Number("0x" + data[10]) + Number("0x" + data[9])), res_id: 56 } });
          }
          if (data[1] == 49) {
            mainWindow.webContents.send('dmr_return_msg', { msg: { res: "Color id set success", res_id: 49 } });
          }
          if (data[1] == 20) {
            mainWindow.webContents.send('dmr_return_msg', { msg: { res: "CDS  set success", res_id: 20 } });
          }
          if (data[1] == 27) {
            //console.log("own id set success")
            mainWindow.webContents.send('dmr_return_msg', { msg: { res: "Self  set success", res_id: 27 } });
          }
          if (data[1] == 25) {
            mainWindow.webContents.send('dmr_return_msg', { msg: { res: "change encryption success", res_id: 25 } });
            enc_set_state = true
          }
        }else if (data[3] == 111) { // rcvd end ca
          still_rcving_call = 0
          //console.log("rcvd ca end")
          if (data[1] == 6) {
            send_system_state(mainWindow,voice_module_color = 2,data_module_color = 2 ,
              voice_rx_color = 0,voice_tx_color = 2,gps_color = 2,curr_v_chan_set)
            
          }
        } else if (data[3] == 98 || data[3] == 97) {
          if (data[1] == 6) {
            if (data[3] == 98) {
              call_going_on = 0
              //console.log("ca end")
              send_system_state(mainWindow,voice_module_color = 2,data_module_color = 2 ,
                voice_rx_color = 2,voice_tx_color = 0,gps_color = 2,curr_v_chan_set)
              
            } else {
              call_going_on = 1
              //console.log("ca start")
              send_system_state(mainWindow,voice_module_color = 2,data_module_color = 2 ,
                voice_rx_color = 2,voice_tx_color = 1,gps_color = 2,curr_v_chan_set)
                 /*setTimeout(function () {
                if (call_going_on == 1) {
                  call_going_on = 0
                }
              }, 60 * 1000)*/
            }
          }
        }
        else if (data[2] == 2 && data[1] == 6 && data[3] == 96) {
          still_rcving_call = 1;
          //console.log("rcvd ca")
          let finarr = [0x68, 0x05, 0x01, 0x01, 0x95, 0xe8, 0x00, 0x01, 0x01, 0x10]
          hard_stm_port.write(finarr, function (err) {
            if (err) { return console.log('Error on write stm dmr: ', err.message) }
          })

          setTimeout(function(){
            if(still_rcving_call == 1 ){
              hard_stm_port.write(finarr, function (err) {
                if (err) { return console.log('Error on write stm dmr: ', err.message) }
              })
            }
          },5000)
          send_system_state(mainWindow,voice_module_color = 2,data_module_color = 2 ,
            voice_rx_color = 1,voice_tx_color = 2,gps_color = 2,curr_v_chan_set)
          
        }
        else {
          if (data[1] == 13) {
            if (checking_freq == 1) {
              checking_freq = 0
              mainWindow.webContents.send('cheque_freq_result', { msg: false })
              // its a frequency cheque return. so after changing freq back to pld one
            }
          }
          mainWindow.webContents.send('dmr_return_msg', { msg: Buffer.from(data) });
        }
      
    })

}
/*
*/
module.exports.start_voice_chan_assign = function(mainWindow,ipcMain,voice_enc_key){
  //this.mainWindow = mainWindow
  start_hard_stm(mainWindow,ipcMain,voice_enc_key)

  data_models_api.curr_chan_models().then(result => {
    //my_id_obj = {id:result[0].id,uid:result[0].uid,ship:result[0].ship}
    if(sytem_task_const.MODE_DEBUG)
      console.log("Curr ch-", result[0], result)
    mainWindow.webContents.send('get_curr_chan', { msg: result[0],voice_enc_key:voice_enc_key });
    let cur_chan_from_temp = parseInt(result[0].channel_id)
    curr_v_chan_set = cur_chan_from_temp
    setTimeout(function () {
        /////////////////////////////////////////////hard stm test

      let cid
      if (result[0].channel_id.length < 10) {
        cid = Number("0x0" + result[0].channel_id)
      } else {
        cid = Number("0x" + result[0].channel_id)
      }

      ////////////////////////////// now write the hard_stm__channel_data to dmr
      data_models_api.voice_set_models().then(result => { // get the frequency first
        //find the coresponding frequency
        freq_table_saved = result
        let freq_str = Number(result.find(x => parseInt(x.channel_id) == cur_chan_from_temp).frequency).toString(16)
        
        ///////////////////////////////////////////////
        assign_frequency(freq_str,chan_set_state,100)
          
        assign_channel(cur_chan_from_temp ,400)
        data_models_api.get_voice_enc().then(result_key=>{
          set_encryption(cur_chan_from_temp,result_key,700)
        })
        if(cur_chan_from_temp < 10){
          assign_rcvr_grp(1000)
          assign_self_id(1300)
          assign_color_code(1600)
        }

        assign_frequency(freq_str,chan_set_state,1900)
        
        assign_channel(cur_chan_from_temp ,2200)
        data_models_api.get_voice_enc().then(result_key=>{
          set_encryption(cur_chan_from_temp,result_key,2500)
        })
        if(cur_chan_from_temp < 10){
          assign_rcvr_grp(2800)
          assign_self_id(3100)
          assign_color_code(3400)

          //////////
          setTimeout(function(){
            let vol_data = [0x68,0x02,0x01,0x01,0x91,0xEB,0x00,0x01,0x05,0x10]
            hard_stm_port.write(vol_data, function (err) {
              if (err) {
                return console.log('Error on write stm dmr: ', err.message)
              }
              //console.log('Update volumke-', vol_data)
            })
          },4100)
          
        }
        else{
          setTimeout(function(){
            let vol_data =   [0x68,0x02,0x01,0x01,0x8e,0xEB,0x00,0x01,0x08,0x10]
            hard_stm_port.write(vol_data, function (err) {
              if (err) {
                return console.log('Error on write stm dmr: ', err.message)
              }
              //console.log('Update volumke-', vol_data)
            })
          },4100)
        }
        ////////////////////////////////////////////////////////////
        
        
        //set_encryption(cur_chan_from_temp,voice_enc_key,5)

        //assign_channel(cur_chan_from_temp ,500)
        //assign_frequency(freq_str,chan_set_state,1500)
        setTimeout(function () {
          if (chan_set_state && freq_set_state) {// all set success
           
            let cid
            if (cur_chan_from_temp.toString(16).length < 10) {
              cid = Number("0x0" + cur_chan_from_temp.toString(16))
            } else {
              cid = Number("0x" + cur_chan_from_temp.toString(16))
            }
 
        
  
            ///
            ////test volume increase
            /*setTimeout(function(){
              let vol_data = [0x68,0x02,0x01,0x01,0x93,0xEB,0x00,0x01,0x03,0x10]
              hard_stm_port.write(vol_data, function (err) {
                if (err) {
                  return console.log('Error on write stm dmr: ', err.message)
                }
                //console.log('Update volumke-', vol_data)
              })
            },4100)*/
            ///
          }
        }, 3800)

        //assign_rcvr_grp(3500)
        //assign_self_id(4500)
        assign_high_power(5500)
        assign_mic_gain(5800)
        //////////////////////////////////      
      }).catch(err => { console.log(err) });
      ///////

    }, 500)

  }).catch(err => { console.log(err) });
}


function checksumcalc(buf, len) {
    let sum = 0
    var index = 0
    while (len > 1) {
      // console.log("buf index--", buf[index], buf[index] << 8 )
      sum += 0xFFFF & (buf[index] << 8 | buf[index + 1]);
      index += 2
      len -= 2
      // console.log("sum--",sum)
  
      //index++
    }
    if (len) {
      sum += (0xff & buf[index]) << 8
  
    }
    while (sum >> 16) {
      sum = (sum & 0xFFFF) + (sum >> 16)
    }
    return sum ^ 0xFFFF
  }
  ////
  function set_encryption(cur_chan_from_temp,voice_enc_key,interval){
    setTimeout(function(){
      if (cur_chan_from_temp <= 9) {// digital channel then encryption is necessary
        if (cur_chan_from_temp == 7 || cur_chan_from_temp == 8) 
        {
          // enc cde ...
          let a1,a2,a3,a4,a5,a6,a7,a8
          if(!isNaN(voice_enc_key.substr(0,1))){
            a1 = parseInt("0x3" + voice_enc_key.substr(0,1),16)
          }else{
            a1 = parseInt("0x6" + voice_enc_key.substr(0,1),16)
          }
          if(!isNaN(voice_enc_key.substr(1,1))){
            a2 = parseInt("0x3" + voice_enc_key.substr(1,1),16)
          }else{
            a2 = parseInt("0x6" + voice_enc_key.substr(1,1),16)
          }
          if(!isNaN(voice_enc_key.substr(2,1))){
            a3 = parseInt("0x3" + voice_enc_key.substr(2,1),16)
          }else{
            a3 = parseInt("0x6" + voice_enc_key.substr(2,1),16)
          }
          if(!isNaN(voice_enc_key.substr(3,1))){
            a4 = parseInt("0x3" + voice_enc_key.substr(3,1),16)
          }else{
            a4 = parseInt("0x6" + voice_enc_key.substr(3,1),16)
          }
          if(!isNaN(voice_enc_key.substr(4,1))){
            a5 = parseInt("0x3" + voice_enc_key.substr(4,1),16)
          }else{
            a5 = parseInt("0x6" + voice_enc_key.substr(4,1),16)
          }
          if(!isNaN(voice_enc_key.substr(5,1))){
            a6 = parseInt("0x3" + voice_enc_key.substr(5,1),16)
          }else{
            a6 = parseInt("0x6" + voice_enc_key.substr(5,1),16)
          }
          if(!isNaN(voice_enc_key.substr(6,1))){
            a7 = parseInt("0x3" + voice_enc_key.substr(6,1),16)
          }else{
            a7 = parseInt("0x6" + voice_enc_key.substr(6,1),16)
          }
          if(!isNaN(voice_enc_key.substr(7,1))){
            a8 = parseInt("0x3" + voice_enc_key.substr(7,1),16)
          }else{
            a8 = parseInt("0x6" + voice_enc_key.substr(7,1),16 )
          }
          
          let tochksum = [0x68, 0x19, 0x01, 0x01, 0x00, 0x09, 
            0x01,a1,a2,a3,a4,a5,a6,a7,a8, 0x10]
          let checksum = checksumcalc(tochksum ,tochksum.length).toString(16)
          let finval = [tochksum[0],tochksum[1],tochksum[2],tochksum[3],
            Number("0x"+ checksum.substr(0,2)),  Number("0x"+ checksum.substr(2,2)),
            tochksum[4],tochksum[5],tochksum[6],tochksum[7],
            tochksum[8],tochksum[9],tochksum[10],tochksum[11],tochksum[12],tochksum[13],
            tochksum[14],tochksum[15]
          ]
          //console.log("Writing encryption..", finval)
          hard_stm_port.write(finval, function (err) {
            if (err) { return console.log('Error write dfr: ', err.message) }
          })
          //////////////////// new encryption end
        } else { //remove encryption
          //console.log("removing enc")
          let finarr = [0x68, 0x19, 0x01, 0x01, 0x97, 0xd3, 0x00, 0x01, 0xFF, 0x10]
          hard_stm_port.write(finarr, function (err) {
            if (err) { return console.log('Error write dfr: ', err.message) }
          })
        }
      }else{
        enc_set_state = true
      }
    },interval)

  }
  ///
  function assign_channel(cur_chan_from_temp,interval){
    setTimeout(function () {
      if(cur_chan_from_temp == 9){
        cur_chan_from_temp = 2
        curr_v_chan_set =  cur_chan_from_temp
      }else if(cur_chan_from_temp == 18 || cur_chan_from_temp == 17 || cur_chan_from_temp == 16){
        cur_chan_from_temp = 14
        curr_v_chan_set =  cur_chan_from_temp
      }else if(cur_chan_from_temp > 9 ){
        cur_chan_from_temp = cur_chan_from_temp - 1
        curr_v_chan_set =  cur_chan_from_temp
      }
    
      { // enc set success not set channel
        //console.log("enc set")
        let cid
        if (cur_chan_from_temp.toString().length < 10) {
          cid = Number("0x0" + cur_chan_from_temp.toString(16))
        } else {
          cid = Number("0x" + cur_chan_from_temp.toString(16))
        }
        //console.log("setting ch-", cid)
        //////////////////////////////////////////////////////
        let tochksum = [0x68, 0x01, 0x01, 0x01, 0x00, 0x01, cid, 0x10]
        let checksum = checksumcalc(tochksum, tochksum.length).toString(16)
        let finval = [tochksum[0], tochksum[1], tochksum[2], tochksum[3],
        Number("0x" + checksum.substr(0, 2)), Number("0x" + checksum.substr(2, 2)),
        tochksum[4], tochksum[5], tochksum[6], tochksum[7]]

        hard_stm_port.write(finval, function (err) { //now write channel
          if (err) { return console.log('Error on write stm dmr: ', err.message) }
        })
        //////////////////////////////////
      }
    }, interval)
  }
  function assign_frequency(freq_str,chan_set_state,interval){
    setTimeout(function () {
      //console.log("freq--",freq_str)
      //if (chan_set_state) 
      {// both success set frequency
        //console.log("enc and chaneel set")
        if (freq_str) {
          let setfre = [0x68, 0x0d, 0x01, 0x01, 0x00, 0x08,
            Number("0x" + freq_str.substr(6, 2)), Number("0x" + freq_str.substr(4, 2)),
            Number("0x" + freq_str.substr(2, 2)), Number("0x" + freq_str.substr(0, 2)),
            Number("0x" + freq_str.substr(6, 2)), Number("0x" + freq_str.substr(4, 2)),
            Number("0x" + freq_str.substr(2, 2)), Number("0x" + freq_str.substr(0, 2)),
            0x10]
          let checksum = checksumcalc(setfre, setfre.length).toString(16)
          let finarr = [setfre[0], setfre[1], setfre[2], setfre[3],
          Number("0x" + checksum.substr(0, 2)), Number("0x" + checksum.substr(2, 2)),
          setfre[4], setfre[5], setfre[6], setfre[7], setfre[8], setfre[9], setfre[10], setfre[11],
          setfre[12], setfre[13], setfre[14]]

          hard_stm_port.write(finarr, function (err) {
            if (err) { return console.log('Error on write stm dmr: ', err.message) }
          })

        }
      }
    }, interval)
  }
  
  function assign_rcvr_grp(interval){
    setTimeout(function () {
      // set rcvr group // 
      let rcvr_gr = [0x68, 0x29, 0x01, 0x01, 0x85, 0xC9, 0x00, 0x04, 0x01, 0x06, 0x00, 0x02, 0x10];
      hard_stm_port.write(rcvr_gr, function (err) {
        if (err) {
          return console.log('Error on write dfr : ', err.message)
        }
        //console.log('rcvr grp-', rcvr_gr)
      })
    }, interval)
  }

  function assign_self_id(interval){
    setTimeout(function () {
      // set self con
      let self_gr = [0x68, 0x18, 0x01, 0x01, 0x84, 0xDa, 0x00, 0x04, 0x02, 0x06, 0x00, 0x02, 0x10];
      hard_stm_port.write(self_gr, function (err) {
        if (err) {
          return console.log('Error on write stm dmr self gr: ', err.message)
        }
        //console.log('hard stm high power message written to-', self_gr)
      })
    }, interval)
  }

  function assign_high_power(interval){
    setTimeout(function () {
      // set high power
      let high_power = [0x68, 0x17, 0x01, 0x01, 0x95, 0xD6, 0x00, 0x01, 0x01, 0x10];
      hard_stm_port.write(high_power, function (err) {
        if (err) {
          return console.log('Error on write stm dmr: ', err.message)
        }
        //console.log('H.P-', high_power)
      })
    }, interval)
  }
  function assign_mic_gain(interval){
    setTimeout(function () {
      // set high power
      let high_power = [0x68, 0x0b, 0x01, 0x01, 0x95, 0xe2, 0x00, 0x01, 0x01, 0x10];
      hard_stm_port.write(high_power, function (err) {
        if (err) {
          return console.log('Error on write stm dmr: ', err.message)
        }
        //console.log('H.P-', high_power)
      })
    }, interval)
  }
  function assign_color_code(interval){
    let AA = [0x68, 0x31, 0x01, 0x01, 0x00, 0x01, 0x09, 0x10];
    let checksum = checksumcalc(AA, AA.length).toString(16)
    
    setTimeout(function () {
      let finarr = [AA[0], AA[1], AA[2], AA[3],
      Number("0x" + checksum.substr(0, 2)), Number("0x" + checksum.substr(2, 2)),
      AA[4], AA[5], AA[6],AA[7]]

      // set color power

      hard_stm_port.write(finarr, function (err) {
        if (err) {
          return console.log('Error on write stm dmr: ', err.message)
        }
        //console.log('CC-', finarr)
      })
    }, interval)
  }
  function send_system_state(mWindow,voice_module_color,data_module_color,
    voice_rx_color,voice_tx_color,gps_color,curr_voice_chan_set){
    mWindow.webContents.send('get_system_state',{
      voice_module_color: voice_module_color,
      data_module_color: data_module_color,
      voice_rx_color: voice_rx_color,
      voice_tx_color: voice_tx_color,
      gps_color: gps_color,
      curr_voice_chan_set : curr_v_chan_set
    })
  }