require('dotenv').config()
var OS =require('os')
process.env.UV_THREADPOOL_SIZE = OS.cpus().length


const { app } = require('electron')
const url = require("url");
const path = require("path");
var resend_arr = require('./main_func/send_data_arr_state')
var hard_stm_port = require('./main_func/hard_stm_port')
var crc16_kermit = require('./main_func/crc16_kermit')
var play_sound = require('./main_func/play_sound')
var moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const electron = require('electron');
const ipcMain = electron.ipcMain;
var CryptoJS = require("crypto-js");

const BrowserWindow = electron.BrowserWindow;

const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const GPS = require('gps')
var server = require('./server')

const system_task_const = require('./constants/system_task')

///////////////////////////////////
const RESTART_TIME_FOR_DATA_RESET_FREQ_UPDATE = 30000 // 30sec after lora reset stm , send data freq
const GPS_START_BIT = '15'
const DATA_END_BIT = '91'
////// main functions
var text_message_check = require('./main_func/rcvd_text_ack_process')
var obj_format = require('./main_func/obj_format')
///// Data models
var  data_models_api = require('./main_func/data_models_api')

var isgps = "1"
var current_status_msg_state = "1"
var  current_mesh_state = "1"
var usersetobj
var islowrssidrop = 0
// get my id
const fs = require('fs')
var port;
////////////////////////////////////////
var curr_data_chan = ""

const gps_serial = system_task_const.GPS_COM_PORT//'/dev/ttyAMA0'
const lora_serial = system_task_const.LORA_COM_PORT//'/dev/ttyACM2'//'/dev/ttyUSB0'

// connection state var
var lora_connection_state = true
var gps_connection_state = true
var hard_stm_connection_state = true
var hard_stm_data_quality = false
var lora_data_recieved = false

// spread factor variable
/*var sf7_time = 100
var sf8_time = 350
var sf9_time = 550
var sf10_time = 1100
var sf11_time = 2500

var sf_7_active  = false
var sf_8_active  = true
var sf_9_active  = false
var sf_10_active  = false
var sf_11_active  = false*/

var selected_sf_time = system_task_const.SELECTED_SF_TIME//350

//other variable
var my_id;// = "0001"
var my_id_obj;
var connectionstate = false;
var data_enc_key_saved; // encryption key
var voice_enc_key_saved;// voice_enc key
var bncg_enc_key_saved; // bncg enc key saved
var data_freq_table_saved // frequency list of data table
var rcvrlist = []
let usergroup_arr_list = []
let  all_rcvr_and_grp = [] // rcvr + gropu [{user,uid,members,membar_id}]


var just_rcvd_short_msg = false

var perm_of_acceptance_long_msg = false // permission to accept obj
/* long dat variable declare*/ 
let long_data_handshake_str = "" // 15 l1 num_of_part sender rcvr mtime(6) crc(4) end(91)
rcving_long_data_start_obj ={}//raw_data: data.substr(0,30),start: data.substr(0, 2), num_of_part: data.substr(4, 2),sender: data.substr(6, 4), rcvr: data.substr(10, 4), time: data.substr(14, 6),enc: data.substr(20, 4), crc: data.substr(24, 4), end: data.substr(28, 2)
let long_data_starting_config_obj = {
  startdata: "",
  stringval: "", 
  recieved_from_arr: [],
  mtime: moment().format('YYYY-MM-DD HH:mm:ss'), state: false
}



let long_str_ack_rcvd_arr = []// ack arr
let rcv_mode_chk_rcvr = {} // data recieving from group object

let final_longdata_rcv_arr = []
let long_data_recieving_mode = false
var long_msg_rcv_timeout_interval // setimeout to clear msg to begaining
let long_data_all_msg_rcvd = false
let long_data_transmit_mode = false
let duplicate_long_msg_arr = []
/* long dat variable declaration end*/

let short_msg_transmitting = false

var lora_reset_check = 0
var recieved_own_status_msg_count = 0
/*  */
function all_init_data_model() {
  // find current set frequency
  data_models_api.get_my_id_obj().then(my_id_obj_result=>{
    my_id_obj = my_id_obj_result
    my_id = my_id_obj.uid
    data_models_api.get_bncg_key().then(bncg_key_result=>{
      bncg_enc_key_saved = bncg_key_result
        data_models_api.get_data_enc().then(data_enc_result=>{
          data_enc_key_saved = data_enc_result
          data_models_api.get_voice_enc().then(voice_enc_result=>{
            voice_enc_key_saved = voice_enc_result
            hard_stm_port.start_voice_chan_assign(mainWindow,ipcMain,voice_enc_key_saved)
            data_models_api.get_all_ship().then(allship_result=>{
              rcvrlist = allship_result
              data_models_api.usergroup_get_all().then(ress=>{
                usergroup_arr_list = ress
                usergroup_arr_list.map(x=>{
                  all_rcvr_and_grp.push({user: x.gr_name,uid: x.gr_number,pin:x.pin, members: x.members,membar_id: x.membar_id,no_of_membar: x.no_of_membar})
                })
                rcvrlist.map(x=>{
                  all_rcvr_and_grp.push({user: x.ship,uid: x.uid,pin: x.pin ,members: null,membar_id: null,no_of_membar: 1})
                })
                ///////////////////////usersettingsmodels
                data_models_api.usersettings_get_all().then(ress=>{
                  usersetobj = ress[0]
                  isgps = ress[0].isgps
                  islowrssidrop = ress[0].islowrssidrop
                  ////////////////////////////////////
                  data_models_api.data_freq_get_all().then(all_data_freq=> {
                      data_freq_table_saved = all_data_freq
                      
                      data_models_api.curr_data_chan_models().then(result=> {
                        curr_data_chan = result[0].channel_id
                        write_to_lora("ch:" + result[0].channel_id + all_data_freq.find(x=> x.channel_id == curr_data_chan).frequency + "49")
                        /////////////////////////////////// write data ch to lcd
                        data_models_api.curr_chan_models().then(curr_vc=> {
                          let up_vc_ch =  parseInt(curr_vc[0].channel_id)
           
                            let cid
                            if (result[0].channel_id.toString(16).length < 10) {
                              cid = Number("0x0" + result[0].channel_id.toString(16))
                            } else {
                              cid = Number("0x" + result[0].channel_id.toString(16))
                            }
                            let cvc
                            if (up_vc_ch.toString(16).length < 10) {
                              cvc = Number("0x0" + up_vc_ch.toString(16))
                            } else {
                              cvc = Number("0x" + up_vc_ch.toString(16))
                            }
                            let fin_val = [0x29, Number("0x" + curr_vc[0].channel_id.toString().length.toString()),
                              cvc,cid, 0x63]
                     
                            hard_stm_port.write_stm(fin_val, function (err) {
                              if (err) {
                                return console.log('Error on write stm dmr: ', err.message)
                              }
                  
                            })
                        })
                        ////////////////////////////////////////
                      })
                      /////////////////////////////////////
                  })
                ////////////////////
                })

                /////////////////////////current_status_msg_state
                data_models_api.status_msg_get_all().then(ress=>{
                  current_status_msg_state = ress[0].state
                  if(system_task_const.MODE_DEBUG)
                      console.log("current status msg state--",current_status_msg_state )
                  data_models_api.mesh_msg_get_all().then(mesh_ss=>{
                    current_mesh_state = mesh_ss[0].state
                    console.log("current mesh state--",current_mesh_state )
                  })
                })
                /////////////////////////////////////

              })
            })
          })
        })
      })
      ////////////////////////////
      
    
  })

}

var gpio = require('onoff').Gpio;


var system_led = new gpio(19, 'out')
var gps_led = new gpio(26, 'out')
if(system_task_const.SHOULD_LORA_RESET){
  var stm_reset_out = new gpio(13, 'out')//new gpio(13,'out') // stm_reset
  stm_reset_out.writeSync(1)
  update_data_frequency()
}
var buzzer = new gpio(2, 'out')
buzzer.writeSync(0)

system_led.writeSync(1)

function unexportOnClose() {
  sw1.unexport()
}
process.on('SIGINT', unexportOnClose)

lora_port = new SerialPort(lora_serial, {
  baudRate: system_task_const.LORA_BAUD_RATE
}, false)
port = new SerialPort(gps_serial, {
  baudRate: system_task_const.GPS_BAUD_RATE
}, false)
/// harware serial for stm configure


/// gps data rcv configure
const gps = new GPS()
const parser = port.pipe(new Readline())
var gps_data_quality = false
var lat = false
var long = false
var gps_time = false
var prev_status_msg = []
var prev_ack_msg = []
var prev_long_data_msg = []


var message_clear_count = 0;

gps.on("data", data => {
  if(system_task_const.MODE_DEBUG_GPS){
    console.log("raw gps msg--",data)
  }
  if (data.type == "GGA") {
    //console.log(data.time, data.lat, data.lon, data)
    if (data.quality != null) {

      gps_data_quality = true
      lat = parseFloat(data.lat).toFixed(5)
      long = parseFloat(data.lon).toFixed(5)
      gps_time = moment().format('YYYY-MM-DD HH:mm')
      gps_led.writeSync(1)
    }
    else {

      if (gps_time) {
        var dur = moment.duration(moment().diff(gps_time));
        var minutes = parseInt(dur.asMinutes()) % 60;
        if (minutes > 10) {
          gps_led.writeSync(0)
          gps_data_quality = false
          lat = false
          long = false
          gps_time = false
          send_system_state(mainWindow,voice_module_color = 2,data_module_color =  2,
            voice_rx_color = 2,voice_tx_color = 2,gps_color = 0)
        }
      }
    }
  }
})
parser.on("data", data => {
  gps.update(data)
})

const lora_parser = lora_port.pipe(new Readline())
var resend_arr_count = 0
var error_open_lora_port_count = 0

var online_ofline_state = [{ uid: "0001", mstatus: false, lat: 0, long: 0, time: moment().format("YYYY-MM-DD HH:mm:ss") },
{ uid: "0002", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0003", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0004", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0005", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0006", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0007", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0008", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0009", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0010", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0011", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0012", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0013", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0014", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0015", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0016", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0017", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0018", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0019", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0020", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0021", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0022", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0023", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0024", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0025", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0026", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0027", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0028", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0029", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0030", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0031", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0032", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0033", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0034", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0035", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0036", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0037", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0038", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0039", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0040", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0041", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0042", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0043", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0044", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0045", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0046", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0047", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0048", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0049", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0050", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0051", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0052", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0053", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0054", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0055", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0056", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0057", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0058", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0059", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0060", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0061", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
{ uid: "0062", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 }, { uid: "0063", mstatus: false, time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0 },
]



lora_parser.on('data', function (data) {
  try{
      if(data){
        if(system_task_const.MODE_DEBUG){
          console.log("lora rcv-", data,moment().format('HH:mm:ss'),moment().millisecond())
        }
          if(data[0] == 's' && data[1] == 't' && data[2] == 'r'
            && data[3] == '#' && data[4] == '5' && data[5] == 'p'
            && data[6] == '@' && data[7] == '_' && data[8] == 'q'){
              //str#5p@_q
              mainWindow.webContents.send('sf_chan_state', { msg: true })
              if(data[9] == '1'){sf_7_active = true; selected_sf_time = 200}
              else if(data[9] == '3'){sf_9_active = true;selected_sf_time = 350}
              else if(data[9] == '4'){sf_10_active = true; selected_sf_time = 700}
              else if(data[9] == '5'){sf_11_active = true;selected_sf_time = 1400}
              else {sf_8_active = true}
          }else if(data[0] == 's' && data[1] == 'c' && data[2] == 'h'
          && data[3] == '#'  && data[5] == 'p'
          && data[6] == '@' && data[7] == '_' && data[8] == 'q'){
            if(data[4] == '1'){
              data_models_api.curr_data_chan_update(curr_data_chan).then(result=>{
                mainWindow.webContents.send('success_data_ch_change',{msg:{channel_id:curr_data_chan}})
                curr_data_chan = curr_data_chan//'1'
                if(system_task_const.MODE_DEBUG)
                  console.log("success data set chan")
              })
            }
          }
          //lora_port.flush(function(err,results){});
          lora_data_recieved = true // update lora rcvd
          if (connectionstate == false) {
            mainWindow.webContents.send('lora_connection_state', { msg: true })
            connectionstate = true
            error_open_lora_port_count = 0
          }

          if (data[0] == '1' && data[1] == '3') {
            let obj = obj_format.process_direct_text_msg(data)
            
            if (obj.sender == my_id) { // recieved own data ignore
              if(system_task_const.MODE_DEBUG)
                console.log("own data msg")
              recieved_own_status_msg_count++
            }
            else {
              if(system_task_const.MODE_DEBUG)
                console.log("rcvd msg", obj.sender)
              let isrcvrinlist = rcvrlist.find(x => x.uid == obj.sender)
              if (isrcvrinlist && obj.end == DATA_END_BIT) {
                if(curr_data_chan == system_task_const.BNCG_DATA_CHAN)
                  text_message_check(obj, bncg_enc_key_saved,rcvrlist,all_rcvr_and_grp,my_id,mainWindow,false,selected_sf_time,current_mesh_state)
                else{
                  text_message_check(obj, data_enc_key_saved,rcvrlist,all_rcvr_and_grp,my_id,mainWindow,false,selected_sf_time,current_mesh_state)
                }
                let isrcvrinlist = rcvrlist.find(x => x.uid == obj.sender)
                if(isrcvrinlist){
                  just_rcvd_short_msg = true
                  update_online_offline_sate(obj)
                }
                /////////////////
              }// check of end data and date and rcvr is valid or not
            }

          }
          if (data[0] == '1' && data[1] == '4') { // relay and ack data
            let obj = obj_format.text_msg_ack_relay_rcvd(data)
            let isrcvrinlist = rcvrlist.find(x => x.uid == obj.sender)
            if(isrcvrinlist){
                update_online_offline_sate(obj)
                if(obj.sender != my_id){
                    if (obj.original_sender == my_id && obj.sender == obj.rcvr) { // recieved data is ack
                      if(system_task_const.MODE_DEBUG)
                        console.log("its an ack data")
                        if(obj.rcvr.substr(0,1).localeCompare('f') != 0){// check if broadcast or group msg
                          let set_online = 0
                          online_ofline_state.map((mapvaa, index) => {
                            if (mapvaa.mstatus) {
                              set_online++
                            }
                            if (index == online_ofline_state.length - 1) {
                              let original_dat = "13" + obj.raw_data.substr(6)
                              let found = resend_arr.find(x => x.args == original_dat)
                              if (found) { // if messege in arry found then attach ack
                             
                                if (found.ack_from.length > 0) {
                                  // check if ack already their
                                  let nny = found.ack_from.find(x => x.localeCompare(obj.sender) == 0)
                                  if (!nny) {
                                    if(system_task_const.MODE_DEBUG)
                                      console.log("ack recieved from ...", obj.sender)
                                    // check encryption before processing ack
                                    ack_process(found, original_dat, obj, set_online, mainWindow)

                                    
                                    
                                    //////////////////
                                  } else {
                                    if(system_task_const.MODE_DEBUG)
                                      console.log("ack already recieved...")
                                  }
                                } else {
                                  if(system_task_const.MODE_DEBUG)
                                    console.log("ack recieved from ...", obj.sender)

                                  ack_process(found, original_dat, obj, set_online, mainWindow)
                                    
                                  

                                  //////////////////
                                }
                                
                              }// end of found check
                            }
                          })
                      }
                      else{
                        
                      }

                    } // if end ack check
                    else { //so this is a message
                      if(obj.original_sender !== my_id ){
                        if(system_task_const.MODE_DEBUG)
                          console.log("rcvd mesh msg from", obj.sender)
                        let original_dat = "13" + obj.raw_data.substr(6)
                        obj = obj_format.process_direct_text_msg(original_dat)
                        let isrcvrinlist = rcvrlist.find(x => x.uid == obj.sender)
                        if (isrcvrinlist && obj.end == DATA_END_BIT && moment.unix(obj.rawtime).isValid) {
                        
                          if(curr_data_chan == system_task_const.BNCG_DATA_CHAN){
                            text_message_check(obj, bncg_enc_key_saved,rcvrlist,all_rcvr_and_grp,my_id,mainWindow,true,selected_sf_time,current_mesh_state)        
                          }
                          else{
                            text_message_check(obj, data_enc_key_saved,rcvrlist,all_rcvr_and_grp,my_id,mainWindow,true,selected_sf_time,current_mesh_state)
                          }
                          ////////////////////////////
                        }
                      }
                    }

                }
                else{
                  recieved_own_status_msg_count++
                  if(system_task_const.MODE_DEBUG)
                    console.log("Own repeat ack relay")
                }
            }// is in rcvr list check
          }
          if (data[0] == '1' && data[1] == '5') { //gps status data
            ///////////////////
            let gps_state_rcvr = data.substr(6, 2)
            if (data[2] !== 'l') {

              if (gps_state_rcvr == "00") {// no gps 
                obj_format.no_gps_data_process(data)
                let obj = obj_format.no_gps_data_process(data)
                let id_check = /^\d+$/.test(obj.sender);
                let isrcvrinlist = rcvrlist.find(x => x.uid == obj.sender)
                if (obj.sender == my_id) { // recieved own data ignore
                  if(system_task_const.MODE_DEBUG)
                    console.log("own gps")
                  recieved_own_status_msg_count++
                } else {
                  if (id_check && isrcvrinlist && obj.end == DATA_END_BIT) {
                    update_online_offline_sate(obj)
                    if(system_task_const.MODE_DEBUG)
                      console.log("rcvd No gps-", obj.sender)
                    mainWindow.webContents.send('status_msg', { msg: obj });
                    //relay_data
                    if(!long_data_recieving_mode || !long_data_transmit_mode)
                    {
                      if (prev_status_msg.length != 0) {
                        if (!prev_status_msg.find(x => x == obj.raw_data)) {
                          if(short_msg_transmitting){
                            if(system_task_const.MODE_DEBUG)
                              console.log("No relay as short msg xmit")
                          }else{
                            setTimeout(function () { //relay data
                              if(system_task_const.MODE_DEBUG)
                                console.log("relat n_gps")
                              write_to_lora(obj.raw_data)
                            }, system_task_const.GPS_RELAY_TIME_AFTER_RCV)//1500 + (500 * Math.floor(Math.random() * (6 - 1 + 1) + 1)))
                          }

                          prev_status_msg.push(obj.raw_data)
                        } else {
                          if(system_task_const.MODE_DEBUG)
                           console.log("N_GPS_allrdy_rcvd")
                        }
                      } else {
                        if(short_msg_transmitting){
                          if(system_task_const.MODE_DEBUG)
                            console.log("no relay.short msg xmit")
                        }else if(long_data_recieving_mode){
                          if(system_task_const.MODE_DEBUG)
                            console.log("no relay.long msg rcv")
                        }else if(long_data_transmit_mode){
                          if(system_task_const.MODE_DEBUG)
                            console.log("no relay.long msg xmit")
                        }else{
                          if(current_mesh_state && current_mesh_state == "1"){
                            setTimeout(function () { //relay data
                              if(system_task_const.MODE_DEBUG)
                                console.log("relay gps data")
                              write_to_lora(obj.raw_data)
                            }, system_task_const.GPS_RELAY_TIME_AFTER_RCV)//1500 + (500 * Math.floor(Math.random() * (6 - 1 + 1) + 1)))
                          }else{
                            if(system_task_const.MODE_DEBUG)
                              console.log("Mesh is turned off")
                          }
                        }
                        prev_status_msg.push(obj.raw_data)
                      }
                    }else{
                      if(system_task_const.MODE_DEBUG)
                        console.log("not repeating gps message as we are in rcv or tx mode")
                    }
                    /////////////////////////// t=relay data end
                  }
                }
              } else {//valid gps recieved
                let obj = obj_format.valid_gps_data_process(data) 
                let id_check = /^\d+$/.test(obj.sender);
                const isLat = isFinite(obj.lat) && Math.abs(obj.lat) <= 90;
                const isLon = isFinite(obj.long) && Math.abs(obj.long) <= 180;
                let isrcvrinlist = rcvrlist.find(x => x.uid == obj.sender)
                if (obj.sender == my_id) { // recieved own data ignore
                  if(system_task_const.MODE_DEBUG)
                    console.log("own gps rcv")
                  recieved_own_status_msg_count++
                } else {
                  if (isrcvrinlist && id_check && isLat && isLon && obj.end == DATA_END_BIT) {
                    update_online_offline_sate(obj) // update state
                    if(system_task_const.MODE_DEBUG)
                      console.log("gps stat msg-", obj.sender)
                    mainWindow.webContents.send('status_msg', { msg: obj });
                    obj.time = moment().format("HH:mm")
                    // save to db
                    //relay_data
                    if (prev_status_msg.length != 0) {
                      if (!prev_status_msg.find(x => x == obj.raw_data)) {
                        mainWindow.webContents.send('status_msg_map', { msg: obj });
                        if(short_msg_transmitting){
                          if(system_task_const.MODE_DEBUG)
                            console.log("No relay,short msg xmit")
                        }else if(long_data_recieving_mode){
                          if(system_task_const.MODE_DEBUG)
                            console.log("No relay,short msg xmit")
                        }else if(long_data_transmit_mode){
                          if(system_task_const.MODE_DEBUG)
                            console.log("No relay,short msg xmit")
                        }else{
                          setTimeout(function () { //relay data
                            if(system_task_const.MODE_DEBUG)
                              console.log("relay gps data")
                            write_to_lora(obj.raw_data)
                          }, system_task_const.GPS_RELAY_TIME_AFTER_RCV)
                        }
                        prev_status_msg.push(obj.raw_data)
                        
                        data_models_api.gps_data_create(obj)
                      } else {
                        if(system_task_const.MODE_DEBUG)
                          console.log("Valid GPS alrdy rcv")
                      }
                    } else {
                      if(short_msg_transmitting){
                        if(system_task_const.MODE_DEBUG)
                          console.log("No relay,short msg xmit")
                      }else if(long_data_recieving_mode){
                        if(system_task_const.MODE_DEBUG)
                          console.log("No relay,short msg xmit")
                      }else if(long_data_transmit_mode){
                        if(system_task_const.MODE_DEBUG)
                          console.log("No relay,short msg xmit")
                      }else{
                        
                        setTimeout(function () { //relay data
                          if(system_task_const.MODE_DEBUG)
                            console.log("relay gps data")
                          write_to_lora(obj.raw_data)
                        },system_task_const.GPS_RELAY_TIME_AFTER_RCV)
                      }
                      prev_status_msg.push(obj.raw_data)
                      data_models_api.gps_data_create(obj)
                    }

                  }
                } //  end of else

              }
            
            }// l check end
            else { // if long message
              //if(!duplicate_long_msg_arr.find(x=> x == obj))
              {
                duplicate_long_msg_arr.push(obj)
                  if (data[3] == '1') { // start config of long message handshake rc            
                    let obj = obj_format.long_msg_start_config_process(data)
                    let crc_val_chk = crc16_kermit(data.substr(4, 16))
                    let isrcvrinlist =  all_rcvr_and_grp.find(x => x.uid == obj.sender)
                    let chk_rcvr = all_rcvr_and_grp.find(x => x.uid == obj.rcvr)
                    let isgrprcvrok = 0
                    rcv_mode_chk_rcvr = chk_rcvr
                  
                    if(obj.rcvr == my_id){
                      isgrprcvrok = 1
                      if(system_task_const.MODE_DEBUG)
                        console.log("p2p start cfg is ok")
                    }
                    if(chk_rcvr){
                      if(chk_rcvr.members){// means msg is for group
                        // Now check this user belongs to this group
                        if(chk_rcvr.members.includes(my_id)){
                          isgrprcvrok = 1
                        }
                      }
                    }
                  
                    if (obj.sender == my_id) { // recieved own data ignore
                      recieved_own_status_msg_count++
                      if(system_task_const.MODE_DEBUG)
                        console.log("own lm handsh")
                    }
                    else{
                      if (obj.end == DATA_END_BIT) {
                        if (crc_val_chk == obj.crc && isrcvrinlist) { // crc ok
                          update_online_offline_sate(obj) // update state
                          if(isgrprcvrok){ // its found on group
                             

                              // send ack of handshake for starting data
                              if(!rcving_long_data_start_obj.sender || rcving_long_data_start_obj.sender == obj.sender)
                              //if(!long_data_recieving_mode)
                              {  
                                if(!perm_of_acceptance_long_msg){
                                  mainWindow.webContents.send('ack_perm_for_long_msg_star_handshake',obj)
                                  mainWindow.webContents.send('ack_perm_for_long_msg_star_handshake_inside_comp',obj)
                                }
                                //setTimeout(function()
                                //{
                                  if(perm_of_acceptance_long_msg){
                                    
                                    let fin_val = obj_format.long_msg_start_config_ack_create(obj,my_id)
                                    long_data_recieving_mode = true
          
                                    rcving_long_data_start_obj = obj//
                                    /*
                                    long_msg_rcv_timeout_interval =  setTimeout(function(){
                                     
                                      long_str_ack_rcvd_arr = [] //clear ack rcvd arr
                                      final_longdata_rcv_arr = []
                                      rcving_long_data_start_obj = {}
                                      rcv_mode_chk_rcvr = {}
                                      long_data_recieving_mode = false // clear after 5 min
                                      long_data_all_msg_rcvd = false
                                    },(60000 + ((Math.ceil(4* obj.num_of_part * .350)))*1000) )//1000*60* Math.ceil((parseInt(obj.num_of_part)/6 )) )
                                    */
                                    if(chk_rcvr){
                                      if(chk_rcvr.membar_id){ // means gropu
                                        setTimeout(function () { // create ack and send
                                          write_to_lora(fin_val)
                                        }, selected_sf_time)//500 + (800 * (parseInt(chk_rcvr.membar_id) - 1) ))
                                       
                                        
                                      }else{
                                        setTimeout(function () { // create ack and send
                                          write_to_lora(fin_val)
                                        },selected_sf_time)// + (800 * 1))
                                      }
                                    }else{
                                      setTimeout(function () { // create ack and send
                                        write_to_lora(fin_val)
                                      }, selected_sf_time)// + (800 * 1))
                                    }
                                  }
                                //},25 * 1000)
                              }
                              else{
                                if(system_task_const.MODE_DEBUG)
                                  console.log("allready recieving long data")
                              }

                              //// forward data for mesh
                            
                            //////
                            }else{
                              if(system_task_const.MODE_DEBUG)
                                console.log("start config data not for me")
                            }
                        }
                      }
                    }
                    

                    /////
                  } else if (data[3] == '3') {// start config handshake acknowledgement
                    var obj = obj_format.long_msg_start_config_ack_process(data)
                    let isrcvrinlist = rcvrlist.find(x => x.uid == obj.sender)


                    if (obj.sender == my_id) { // recieved own data ignore
                      recieved_own_status_msg_count++
                      if(system_task_const.MODE_DEBUG)
                        console.log("own long msg handsk")
                    } 
                    else{
                      if(obj.rcvr == my_id){
                          if (obj.end == DATA_END_BIT) {
                            if (isrcvrinlist  && obj.crc == long_data_handshake_str.substr(20, 4)) {
                              update_online_offline_sate(obj) // update state
                              if (obj.rcvr == my_id) { // if handshake intended towards me
  
                                //////////////////////// Now prepare
                                if(!long_data_recieving_mode){ // check if not already rcving
                                  let narr = long_data_starting_config_obj.recieved_from_arr
                                  if (!narr.find(x => x == obj.sender)){
                                    narr.push(obj.sender)
                                  }
                                  // ac ack is recieved it is ok to start sending string value
                                  long_data_starting_config_obj = {
                                    startdata: long_data_handshake_str,//long_data_start_tmp,
                                    stringval: "",//long_data_tmp_str, 
                                    recieved_from_arr: narr,
                                    mtime: moment().format('YYYY-MM-DD HH:mm:ss'), 
                                    state: true
                                  }
                                  long_data_transmit_mode = true
                                }else{
                                  if(system_task_const.MODE_DEBUG)
                                    console.log("cant send,in rcving mode")
                                }

                              }else{
                                if(system_task_const.MODE_DEBUG)
                                  console.log("Long data handshak not me..")
                                /// relay data

                                //////////////// end relay data
                              }
                            }

                          }// if check end end data 91
                      }else{
                        if(system_task_const.MODE_DEBUG)
                          console.log("Not Part of this mail")
                      }
                    }
                  }
                  else if (data[3] == '5') { //long str recieve and prepare ack
                    // check if starting config rcvd
                    let obj = obj_format.long_msg_string_process(data) 
                    let isrcvrinlist = rcvrlist.find(x => x.uid == obj.sender) 
                        if(obj.sender !== my_id){
                          if (obj.end == DATA_END_BIT && isrcvrinlist) {
                            update_online_offline_sate(obj) // update state
                            if(rcving_long_data_start_obj.sender && rcving_long_data_start_obj.sender == obj.sender)           
                            //if(long_data_recieving_mode )
                            { 
                                let crc_kermit = crc16_kermit(obj.sender + obj.part_no + obj.length + obj.text)
                                if (crc_kermit == obj.crc) {
                                  let nf = final_longdata_rcv_arr.find(x=> x.data.raw_data == obj.raw_data)
                                  if(!nf){ // if data already not there
                                    if(system_task_const.MODE_DEBUG)
                                      console.log("crc ok long dt")
                                    ////////////////// check if num of part rcvd equals start config
                                    //duplicate_long_msg_arr.push(obj)
                                    if( long_data_recieving_mode){
                                      final_longdata_rcv_arr.push({data:obj})
                                      if(system_task_const.MODE_DEBUG)
                                        console.log("final_longdata_rcv_arr len", final_longdata_rcv_arr.length)
                                    
                                      if(final_longdata_rcv_arr.length == parseInt(rcving_long_data_start_obj.num_of_part)){


                                        ///// save to db
                                        let strrr  = ""
                                     
                                        for(let i = 0;i< final_longdata_rcv_arr.length ; i++){
                                          let yuu = final_longdata_rcv_arr.find(x=> parseInt(x.data.part_no) == (i + 1))
                                          if(yuu){
                                            //console.log("all long data rcvd single obj ff",yuu)
                                            strrr = strrr + yuu.data.text
                                         
                                          }
                                          if(i == final_longdata_rcv_arr.length - 1){
                                            ////////////////////
                                            //console.log("final strrr-",strrr)
                                            
                                            let isrcvrinlist = rcvrlist.find(x => x.uid == final_longdata_rcv_arr[0].data.sender)
                                            let recieved_from = ""
                                            if(isrcvrinlist)
                                                recieved_from =  isrcvrinlist.ship   
                                            
                                            
                                            let et = moment().format('YYYY-MM-DD HH:mm:ss')
                                              if(strrr){
                                                let ref_index2 = strrr.indexOf("</ref>")
                                                if(ref_index2 > 0){
                                                    let textt
                                                    textt = strrr.substr(ref_index2 + 6)
                                                    // decrypt and check
                                                    var f_text
                                                    if(curr_data_chan == system_task_const.BNCG_DATA_CHAN){ 
                                                      try{                                              
                                                      var bytes  = CryptoJS.AES.decrypt(textt.toString(), bncg_enc_key_saved.toString());
                                                      f_text = bytes.toString(CryptoJS.enc.Utf8)
                                                      }catch(e){
                                                        if(system_task_const.MODE_DEBUG)
                                                          console.log("cryptoerror")
                                                        f_text= ""
                                                      }
                                                    }
                                                    else{  
                                                      try{                                                         
                                                        var bytes  = CryptoJS.AES.decrypt(textt.toString(),   data_enc_key_saved.toString());
                                                        f_text = bytes.toString(CryptoJS.enc.Utf8)
                                                      }catch(e){
                                                        if(system_task_const.MODE_DEBUG)
                                                          console.log("cryptoerror")
                                                        f_text= ""
                                                      }

                                                    }
                                                    if(system_task_const.MODE_DEBUG)
                                                      console.log("long f text", f_text,textt)
                                                    if(f_text){
                                                      let full = strrr.substr(0,ref_index2 + 6) + f_text
                                                      let tobj = {sender: final_longdata_rcv_arr[0].data.sender,rcvr:my_id,mtime:et,mtext:full,
                                                        isdraft: "0"
                                                        ,isinbox: "1",issent: "0",isunsent: "0",isold: "0"}
                                                        //////
                                                        data_models_api.long_msg_inbox_create(tobj).then(result=>{
                                                          mainWindow.webContents.send('rcv_all_long_msg', { msg: result });
                                                        })
                                                        ///////
                                                        mainWindow.webContents.send('long_data_all_str_rcvd',{msg:final_longdata_rcv_arr,yyy:rcving_long_data_start_obj})         
                                                        mainWindow.webContents.send('long_data_all_str_rcvd_inside_comp',{msg:final_longdata_rcv_arr,yyy:rcving_long_data_start_obj})         
                                            
                                                        ///////////
                                                    }else{
                                                      mainWindow.webContents.send('long_data_decrypt_failed',true)         
                                            
                                                    }
                                                  }
                                                  
                                              }
                                            
                                              long_data_all_msg_rcvd = true
                                            ///////
                                          }
                                        }
                                        
                                            //////////////////////////
                                          setTimeout(function(){
                                            if(long_msg_rcv_timeout_interval){
                                              clearTimeout(long_msg_rcv_timeout_interval)
                                              long_msg_rcv_timeout_interval = null
                                            }
                                            if(system_task_const.MODE_DEBUG)
                                              console.log("cleared rcvr start config 3")
                                            long_data_recieving_mode = false
                                            final_longdata_rcv_arr = []
                                            rcving_long_data_start_obj = {}
                                            rcv_mode_chk_rcvr = {}
                                            long_str_ack_rcvd_arr = [] //clear ack rcvd arr
                                            long_data_all_msg_rcvd = false
                                            perm_of_acceptance_long_msg = false
                                            
                                          },12000)
                                          if(system_task_const.MODE_DEBUG)
                                            console.log("all long data_rcvd..")
                                      }
                                      ///////////////
                                      if(system_task_const.MODE_DEBUG)
                                        console.log("main_str_data_rcv is --", obj)
                                    }
                                                
                                  }
                                  else{
                                    if(system_task_const.MODE_DEBUG)
                                      console.log("long str message already recieved")
                                  }
                                  let return_ack = obj_format.long_msg_string_ack_create(obj,my_id)
                                  
                                  if(long_data_all_msg_rcvd){
                                    if(rcving_long_data_start_obj){
                                      let ter_obj = obj_format.long_msg_termination_create(obj,my_id,rcving_long_data_start_obj.time,rcving_long_data_start_obj.crc) 
                                      if(rcv_mode_chk_rcvr){// msg from group
                                        setTimeout(function () {
                                          write_to_lora(ter_obj) // ack write
                                        }, selected_sf_time)//500 + (800 * (parseInt(rcv_mode_chk_rcvr.membar_id) - 1) ) ) //(200 * Math.floor(Math.random() * (6 - 1 + 1) + 1)))
                                      }else{ // single user
                                        setTimeout(function () {
                                          write_to_lora(ter_obj) // ack write
                                        }, selected_sf_time)//500 + 200 )//+ (800 * ((my_id % 5) - 1)) )//(200 * Math.floor(Math.random() * (6 - 1 + 1) + 1)))
                                    
                                      }
                                      if(long_msg_rcv_timeout_interval){
                                        clearTimeout(long_msg_rcv_timeout_interval)
                                        long_msg_rcv_timeout_interval = null
                                      }
                                      if(system_task_const.MODE_DEBUG)
                                        console.log("all msg rcvd.send termina",ter_obj)
                                    }
                                  }else{
                                      if(rcv_mode_chk_rcvr){
                                        if(system_task_const.MODE_DEBUG)
                                          console.log("long msg returning ack rcv_mode_chk_rcvr.membar_id found is  -",rcv_mode_chk_rcvr)
                                      
                                          setTimeout(function () {
                                            write_to_lora(return_ack) // ack write
                                          }, selected_sf_time)//500 + (800 * (parseInt(rcv_mode_chk_rcvr.membar_id) - 1) ) ) //(200 * Math.floor(Math.random() * (6 - 1 + 1) + 1)))
                                      }else{
                                        if(system_task_const.MODE_DEBUG)
                                          console.log("sngl long str_m")
                                        setTimeout(function () {
                                          write_to_lora(return_ack) // ack write
                                        },  0 * selected_sf_time)//500 + 200 )//+ (800 * ((my_id % 5) - 1)) )//(200 * Math.floor(Math.random() * (6 - 1 + 1) + 1)))
                                    
                                      }
                                  }

                                  ////////////////////////////////////
                                }// crc check end
                              }else{
                                if(system_task_const.MODE_DEBUG)
                                  console.log("long str message discarded as start config not defined")
                  
                              }
                          }
                        }else{
                          recieved_own_status_msg_count++
                          if(system_task_const.MODE_DEBUG)
                            console.log("own repeat long str rcvd")
                        }
              
                  }
                  
                  else if (data[3] == '7') { //ack for long str message rcvd
                    //15l7000100020140d691
                    let obj = obj_format.long_msg_string_ack_provess(data)
                    
                    let isrcvrinlist = rcvrlist.find(x => x.uid == obj.sender)
                    if(obj.sender !== my_id){

                      if (obj.end == DATA_END_BIT) {
                        if(obj.crc && isrcvrinlist){
                          update_online_offline_sate(obj) // update state                 
                          if(obj.rcvr == my_id && long_data_transmit_mode){ // if towards me then its a ack
                            let oo = long_str_ack_rcvd_arr.find(x=> (x.crc == obj.crc && x.sender == obj.sender && x.rcvr == obj.rcvr && x.part_no == obj.part_no))
                            if(!oo){
                              long_str_ack_rcvd_arr.push(obj)
                              if(system_task_const.MODE_DEBUG)
                                console.log("rcvd string ack-", obj)
                              if(system_task_const.MODE_DEBUG)
                                console.log("Total ack--", long_str_ack_rcvd_arr.length)
                              mainWindow.webContents.send('long_msg_string_ack_rcvd',obj)
                            }
                          }else{
                            if(system_task_const.MODE_DEBUG)
                              console.log("long str ack not for me or not in transmit mode")
                            // relay_data

                          }
                        }
                      }
                    }
                    else{
                      if(system_task_const.MODE_DEBUG)
                        console.log("long data string own ack rcvd")
                      recieved_own_status_msg_count++
                    }
              
                } 
                else if(data[3] == '8'){ // long data termination string
                  let obj = obj_format.long_msg_termination_process(data)
                  let isrcvrinlist = rcvrlist.find(x => x.uid == obj.sender)
                  if(obj.sender !== my_id){
                    if (obj.end == DATA_END_BIT) {
                      if(obj.crc && isrcvrinlist){
                        update_online_offline_sate(obj) // update state  
                        if(obj.rcvr == my_id && long_data_transmit_mode){
                          /// compare crc of current obj with rcvd
                          let hd = obj_format.long_msg_start_config_process(long_data_handshake_str)
                          if(hd.crc == obj.crc){
                            if(system_task_const.MODE_DEBUG)
                              console.log("termination string crc ok")
                            // now assign that all ack from send
                            mainWindow.webContents.send('long_msg_termination_ack_rcvd',obj)
                        
                          }
                        }else{
                          if(system_task_const.MODE_DEBUG)
                            console.log("Termination string is not for me or not in transmit mode")
                        }
                      }
                    }
                  }else{
                    if(system_task_const.MODE_DEBUG)
                      console.log("Own repeat Termination string rcvd")
                  }
                }
                
              }/*else{
                console.log("Will not oblize duplicae")
              }*/

            }
          }
      }
  }catch(e){
    console.log("lora port data error",e)
  }
})
/////////////////////////////////////
ipcMain.on('sendHandshakelongData_lora', (event, args) => {
  // start config write
  short_msg_transmitting = false
  clearInterval(cancel_text_send_interval)
  long_data_transmit_mode = true // saying transmit mode enabled
  /*setTimeout(function(){
    long_data_transmit_mode = false
  },60*1000)*/
  // 15 ll 2bytepart my_id(4 byte) rcvr_id(4) time-6 enc(4) crc(4) 91
  long_data_handshake_str = args // 15 l1 num_of_part sender rcvr mtime(6) crc(4) end(91)
  write_to_lora(args)
  lora_reset_check++
})
ipcMain.on('sendACKforStartConfig', (event, args) => {
  mainWindow.webContents.send('getACKforStartConfig', long_data_starting_config_obj)
})
ipcMain.on('sendlongData_lora', (event, args) => {
  long_data_transmit_mode = true
  long_data_starting_config_obj.stringval = args
  write_to_lora(args)

})
ipcMain.on('perm_of_acceptance_long_msg',(event,args)=>{
  perm_of_acceptance_long_msg = args

})
ipcMain.on('enableTransmitMode', (event, args) => {
  if(args){
    if(typeof(args) == "boolean"){
      long_data_transmit_mode = true
    }else{
        if(args == "true"){
          long_data_transmit_mode = true
        }else{
          if(long_msg_rcv_timeout_interval){
            clearTimeout(long_msg_rcv_timeout_interval)
            long_msg_rcv_timeout_interval = null
          }
        
            long_data_transmit_mode = false
            long_data_handshake_str = "" // 15 l1 num_of_part sender rcvr mtime(6) crc(4) end(91)
            rcving_long_data_start_obj ={}//raw_data: data.substr(0,30),start: data.substr(0, 2), num_of_part: data.substr(4, 2),sender: data.substr(6, 4), rcvr: data.substr(10, 4), time: data.substr(14, 6),enc: data.substr(20, 4), crc: data.substr(24, 4), end: data.substr(28, 2)
            long_data_starting_config_obj = {
              startdata: "",
              stringval: "", 
              recieved_from_arr: [],
              mtime: moment().format('YYYY-MM-DD HH:mm:ss'), state: false
            }
            long_str_ack_rcvd_arr = []// ack arr
          }
    }
  }else{
    if(long_msg_rcv_timeout_interval){
      clearTimeout(long_msg_rcv_timeout_interval)
      long_msg_rcv_timeout_interval = null
    }
    long_data_transmit_mode = false
    rcving_long_data_start_obj ={}//raw_data: data.substr(0,30),start: data.substr(0, 2), num_of_part: data.substr(4, 2),sender: data.substr(6, 4), rcvr: data.substr(10, 4), time: data.substr(14, 6),enc: data.substr(20, 4), crc: data.substr(24, 4), end: data.substr(28, 2)
           
    long_data_handshake_str = "" // 15 l1 num_of_part sender rcvr mtime(6) crc(4) end(91)
    long_data_starting_config_obj = {
      startdata: "",
      stringval: "", 
      recieved_from_arr: [],
      mtime: moment().format('YYYY-MM-DD HH:mm:ss'), state: false
    }
    long_str_ack_rcvd_arr = []// ack arr
  }
})
/////////////////////////////////////
var prev_msg_clear_count = 0
var cancel_text_send_interval
function start_send_interval(inetrval_for_msg,factor_of_) {
    cancel_text_send_interval = setInterval(function () { // clear msg array after ten second
      prev_msg_clear_count++
      prev_ack_msg = []
      
      if(prev_msg_clear_count == 1){
        prev_msg_clear_count = 0
      }
      //// check msg time elapsed . if over 1 min then clear from resend_arr
      //// otherwise send again 13110001ffff153048018803goofda891
      let ok_to_send_data = true
      let no_of_set_online = 0
      online_ofline_state.map((mapvaa, index) => {
        if (mapvaa.mstatus) {
          no_of_set_online++
        }
      })
      if(resend_arr.length > 0){
        try{
            resend_arr.map((mapval,index) =>{
              var timm = moment(moment().format('YYYY-MM-DD') + ' ' + mapval.args.substr(12, 2) + ':' + mapval.args.substr(14, 2) + ':' + mapval.args.substr(16, 2),
                'YYYY-MM-DD HH:mm:ss')
              var ms = moment(moment().format('YYYY-MM-DD HH:mm:ss'))
                .diff(timm)
              var d = moment.duration(ms)
              //var interval_duration = ((selected_sf_time * 25 * 5)/1000 )

              if (d.asSeconds() > ((selected_sf_time * factor_of_ * system_task_const.NUMBER_OF_REPEAT_TEXT_MESSAGE)/1000 )){
                if(system_task_const.MODE_DEBUG)
                  console.log("duration passed for this data-", mapval.args, d.asMinutes())
                short_msg_transmitting = false
                clearInterval(cancel_text_send_interval)
                mapval.cleardata = true
                ok_to_send_data = false
                
              }
              else{// send data again
                ok_to_send_data = true
              }
              if(index == resend_arr.length - 1){
                resend_arr = resend_arr.filter(x=> !x.cleardata)
                if(resend_arr.length == 0){
                  short_msg_transmitting = false
                  if(system_task_const.MODE_DEBUG)
                    console.log("after clearing filter resend arr is", resend_arr)
                }
                /////////////////
                var rand_data = Math.random()
                var factor_value = 3 //at which side of random
                if(rand_data <0.5){
                  rand_data = 0
                }else{
                  if(resend_arr.length < 4)
                    rand_data = 0
                  else
                    rand_data = 0
                }
                if(system_task_const.MODE_DEBUG)
                  console.log("rand data-",rand_data)
                //check random starts for 3 part
                if(ok_to_send_data){
                  if(resend_arr.length == 1){
                    if(mapval.args)
                    write_to_lora(mapval.args)
                    
                  }
                  else if(resend_arr.length == 2){

                    if(resend_arr[0].args.substr(8,1).localeCompare("f") == 0){// means group broadcast
                      if(resend_arr[0] && resend_arr[0].args){
                        setTimeout(function(){
                          write_to_lora(resend_arr[0].args)
                        },selected_sf_time * factor_value * rand_data)
                        
                      }
                      setTimeout(function(){
                        //lora_reset_check++
                        if(resend_arr[1] && resend_arr[1].args)
                          write_to_lora(resend_arr[1].args) 
                      },selected_sf_time + (selected_sf_time * factor_value * rand_data))
                    }else{
                        if(resend_arr[0].ack_from.length <= 1){//< no_of_set_online){
                          setTimeout(function(){
                            write_to_lora(resend_arr[0].args)
                          },selected_sf_time * factor_value * rand_data)
                        }
                        if(resend_arr[1].ack_from.length <= 1){//< no_of_set_online){
                          setTimeout(function(){
                            //lora_reset_check++
                            if(resend_arr[1] && resend_arr[1].args)
                              write_to_lora(resend_arr[1].args) 
                          },selected_sf_time + (selected_sf_time * factor_value * rand_data))

                        }
                    }
                  }
                  else if(resend_arr.length == 3){
                    if(resend_arr[0].args.substr(8,1).localeCompare("f") == 0){// means group broadcast
                      
                      if(resend_arr[0] && resend_arr[0].args){
                        setTimeout(function(){
                          write_to_lora(resend_arr[0].args)
                        },selected_sf_time * factor_value * rand_data)
                      }

                      setTimeout(function(){ 
                        //lora_reset_check++
                        if(resend_arr[1] && resend_arr[1].args)
                          write_to_lora(resend_arr[1].args) 
                      },selected_sf_time + (selected_sf_time * factor_value * rand_data))
                      setTimeout(function(){ 
                        //lora_reset_check++
                        if(resend_arr[2] && resend_arr[2].args)
                          write_to_lora(resend_arr[2].args) 
                        },(selected_sf_time * 2) + (selected_sf_time * factor_value * rand_data))
                    }else{ // one to one msg
                      if(resend_arr[0].ack_from.length <= 1){// < no_of_set_online){
                        setTimeout(function(){
                          if(resend_arr[0] && resend_arr[0].args)
                            write_to_lora(resend_arr[0].args)
                          //lora_reset_check++
                        },selected_sf_time * factor_value * rand_data)
                      }
                      if(resend_arr[1].ack_from.length <= 1){// < no_of_set_online)
                        //lora_reset_check++
                        
                        setTimeout(function(){ 
                          if(resend_arr[1] && resend_arr[1].args)
                            write_to_lora(resend_arr[1].args) 
                        },selected_sf_time + (selected_sf_time * factor_value * rand_data))
                      }
                      if(resend_arr[2].ack_from.length <= 1){// < no_of_set_online)
                        //lora_reset_check++
                        
                          setTimeout(function(){ 
                            if(resend_arr[2] && resend_arr[2].args)
                              write_to_lora(resend_arr[2].args) 
                          },(selected_sf_time * 2) + (selected_sf_time * factor_value * rand_data))
                      }
                    }
                  }
                  // checkrandom ends
                  else if(resend_arr.length == 4){
                    if(resend_arr[0].args.substr(8,1).localeCompare("f") == 0){// means group broadcast
                      if(resend_arr[0] && resend_arr[0].args){
                        setTimeout(function(){
                          write_to_lora(resend_arr[0].args)
                        },selected_sf_time * factor_value * rand_data)
                      }
                      setTimeout(function(){ 
                        //lora_reset_check++
                        if(resend_arr[1] && resend_arr[1].args)
                          write_to_lora(resend_arr[1].args) 
                      },selected_sf_time + (selected_sf_time * factor_value * rand_data))
                      setTimeout(function(){ 
                        //lora_reset_check++
                        if(resend_arr[2] && resend_arr[2].args)
                          write_to_lora(resend_arr[2].args) 
                      },(selected_sf_time * 2) + (selected_sf_time * factor_value * rand_data))
                      setTimeout(function(){ 
                        //lora_reset_check++
                        if(resend_arr[3] && resend_arr[3].args)
                          write_to_lora(resend_arr[3].args) },(selected_sf_time * 3)  + (selected_sf_time * factor_value * rand_data))
                    }else{
                      if(resend_arr[0].ack_from.length == 1 ){//< no_of_set_online){
                        setTimeout(function(){
                          write_to_lora(resend_arr[0].args)
                        },selected_sf_time * factor_value * rand_data)

                      }
                      if(resend_arr[1].ack_from.length <= 1){//< no_of_set_online)
                        //lora_reset_check++                 
                        setTimeout(function(){ 
                          if(resend_arr[1] && resend_arr[1].args)
                            write_to_lora(resend_arr[1].args) 
                          },selected_sf_time + (selected_sf_time * factor_value * rand_data))
                      }
                      if(resend_arr[2].ack_from.length <= 1){// < no_of_set_online)
                        //lora_reset_check++                     
                        setTimeout(function(){ 
                          if(resend_arr[2] && resend_arr[2].args)
                            write_to_lora(resend_arr[2].args) 
                          },(selected_sf_time * 2) + (selected_sf_time * factor_value * rand_data))
                      }
                      if(resend_arr[3].ack_from.length <= 1){// < no_of_set_online)
                        //lora_reset_check++                      
                          setTimeout(function(){ 
                            if(resend_arr[3] && resend_arr[3].args)
                              write_to_lora(resend_arr[3].args) 
                          },(selected_sf_time * 3)  + (selected_sf_time * factor_value * rand_data))
                      }
                    } 
                  }
                  ///////////////////
                  else if(resend_arr.length == 5){
                    if(resend_arr[0].args.substr(8,1).localeCompare("f") == 0){// means group broadcast
                      if(resend_arr[0] && resend_arr[0].args)
                        write_to_lora(resend_arr[0].args)
                      setTimeout(function(){ 
                        //lora_reset_check++
                        if(resend_arr[1] && resend_arr[1].args)
                          write_to_lora(resend_arr[1].args) 
                      },selected_sf_time + (selected_sf_time * 12 * rand_data))
                      setTimeout(function(){ 
                        //lora_reset_check++
                        if(resend_arr[2] && resend_arr[2].args)
                          write_to_lora(resend_arr[2].args) 
                      },(selected_sf_time * 2) + (selected_sf_time * 12 * rand_data))
                      setTimeout(function(){ 
                        //lora_reset_check++
                        if(resend_arr[3] && resend_arr[3].args)
                          write_to_lora(resend_arr[3].args) 
                      },(selected_sf_time * 3)  + (selected_sf_time * 12 * rand_data))
                      setTimeout(function(){ 
                        //lora_reset_check++
                        if(resend_arr[4] && resend_arr[4].args)
                          write_to_lora(resend_arr[4].args) 
                      },(selected_sf_time * 4)  + (selected_sf_time * 12 * rand_data))
                    }else{
                      if(resend_arr[0].ack_from.length <= 1 ){//< no_of_set_online){
                        if(resend_arr[0] && resend_arr[0].args)
                            write_to_lora(resend_arr[0].args)

                      }
                      if(resend_arr[1].ack_from.length <= 1){//< no_of_set_online)
                        //lora_reset_check+
                          setTimeout(function(){ 
                            if(resend_arr[1] && resend_arr[1].args)
                              write_to_lora(resend_arr[1].args) 
                          },selected_sf_time + (selected_sf_time * 12 * rand_data))
                      }
                      if(resend_arr[2].ack_from.length <= 1){// < no_of_set_online)
                        //lora_reset_check++
                       
                          setTimeout(function(){ 
                            if(resend_arr[2] && resend_arr[2].args)
                              write_to_lora(resend_arr[2].args) 
                          },(selected_sf_time * 2) + (selected_sf_time * 12 * rand_data))
                      }
                      if(resend_arr[3].ack_from.length <= 1){// < no_of_set_online)
                        //lora_reset_check++
                      
                          setTimeout(function(){ 
                            if(resend_arr[3] && resend_arr[3].args)
                              write_to_lora(resend_arr[3].args) 
                          },(selected_sf_time * 3)  + (selected_sf_time * 12 * rand_data))
                      }
                      if(resend_arr[4].ack_from.length <= 1){// < no_of_set_online)
                        //lora_reset_check++
                        
                          setTimeout(function(){ 
                            if(resend_arr[4] && resend_arr[4].args)
                              write_to_lora(resend_arr[4].args) 
                          },(selected_sf_time * 4)  + (selected_sf_time * 2 * rand_data))
                      }
                    } 
                  }
                  //////////////////////////////////
                  else if(resend_arr.length == 6){
                    if(resend_arr[0].args.substr(8,1).localeCompare("f") == 0){// means group broadcast
                      if(resend_arr[0] && resend_arr[0].args)
                        write_to_lora(resend_arr[0].args)

                      setTimeout(function(){ 
                        //lora_reset_check++
                        if(resend_arr[1] && resend_arr[1].args)
                          write_to_lora(resend_arr[1].args) 
                      },selected_sf_time + (selected_sf_time * 12 * rand_data))
                      setTimeout(function(){ 
                        //lora_reset_check++
                        if(resend_arr[2] && resend_arr[2].args)
                          write_to_lora(resend_arr[2].args) 
                      },(selected_sf_time * 2) + (selected_sf_time * 12 * rand_data))
                      setTimeout(function(){ 
                        //lora_reset_check++
                        if(resend_arr[3] && resend_arr[3].args)
                          write_to_lora(resend_arr[3].args) },(selected_sf_time * 3)  + (selected_sf_time * 12 * rand_data))
                      setTimeout(function(){ 
                        //lora_reset_check++
                        if(resend_arr[4] && resend_arr[4].args)
                          write_to_lora(resend_arr[4].args) },(selected_sf_time * 4)  + (selected_sf_time * 12 * rand_data))
                      setTimeout(function(){ 
                        //lora_reset_check++
                        if(resend_arr[5] && resend_arr[5].args)
                          write_to_lora(resend_arr[5].args) 
                      },(selected_sf_time * 5)  + (selected_sf_time * 12 * rand_data))
                    }else{
                      if(resend_arr[0].ack_from.length <= 1 ){//< no_of_set_online){
                        if(resend_arr[0] && resend_arr[0].args)
                            write_to_lora(resend_arr[0].args)

                      }
                      if(resend_arr[1].ack_from.length <= 1){//< no_of_set_online)
                        //lora_reset_check++                        
                          setTimeout(function(){ 
                            if(resend_arr[1] && resend_arr[1].args)
                               write_to_lora(resend_arr[1].args) 
                          },selected_sf_time  + (selected_sf_time * 12 * rand_data))
                      }
                      if(resend_arr[2].ack_from.length <= 1){// < no_of_set_online)
                        //lora_reset_check++
                        
                          setTimeout(function(){ 
                            if(resend_arr[2] && resend_arr[2].args)
                              write_to_lora(resend_arr[2].args) 
                          },(selected_sf_time * 2) + (selected_sf_time * 12 * rand_data))
                      }
                      if(resend_arr[3].ack_from.length <= 1){// < no_of_set_online)
                        //lora_reset_check++
                        
                        setTimeout(function(){ 
                          if(resend_arr[3] && resend_arr[3].args)
                            write_to_lora(resend_arr[3].args) 
                        },(selected_sf_time * 3)  + (selected_sf_time * 12 * rand_data))
                      }
                      if(resend_arr[4].ack_from.length <= 1){// < no_of_set_online)
                        //lora_reset_check++
                        
                        setTimeout(function(){ 
                          if(resend_arr[4] && resend_arr[4])
                            write_to_lora(resend_arr[4].args) 
                        },(selected_sf_time * 4)  + (selected_sf_time * 12 * rand_data))
                      }
                      if(resend_arr[5].ack_from.length <= 1){// < no_of_set_online)
                        //lora_reset_check++
                        
                          setTimeout(function(){ 
                            if(resend_arr[5] && resend_arr[5].args)
                              write_to_lora(resend_arr[5].args) 
                          },(selected_sf_time * 5)  + (selected_sf_time * 12 * rand_data))
                      }
                    } 
                  }
                  /////////////////////////////////////////////
                }
                ////////////////////////////
              }
            }) 
          
        }catch(e){
          if(system_task_const.MODE_DEBUG)
            console.log("repeat msg error is--", e)
        }
      }
    }, inetrval_for_msg)
}
////////////////////////////////////////////

let mainWindow
var set_interval_count_gps = 16
var own_gps_save_to_db_count = 0
var random_gps_count = 5
var prev_gps_send_time
var first_time_gps_send = true
var total_lora_reset_count = 0
var port_closed_update_track = 0
function createWindow() {

  mainWindow = new BrowserWindow({
    width: 1920, height: 1080, show: false,
    webPreferences: {
      webSecurity: false, nodeIntegration: true,
      devTools:false, autoHideMenuBar: true, frame: false,
      webviewTag: true,
      nativeWindowOpen: true // This flag is not letting recieve new-window event from webview
    },
    backgroundColor: "#000000",
  });

 
  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadURL(//"http://localhost:5020"
    url.format({
      pathname: path.join(__dirname, `/dist/electronchat/index.html`),
      protocol: "file:",
      slashes: true
    })
  );

  mainWindow.setBackgroundColor('#000000') // turns opaque brown
  // Show the window when the .html file is loaded
  mainWindow.once('ready-to-show', function () {
    mainWindow.show();
    mainWindow.setBackgroundColor('#000000') // turns opaque brown
 
    all_init_data_model() // inititlize all init model data
    //////////////////// open gps serial port then
    hard_stm_port.start(mainWindow)

    port.on('error', function (err) {
      console.log("we got error opening gps port"); // THIS SHOULD WORK!
      gps_connection_state = false
    });
    port.open(function (err) {//gps port opened
    })
    lora_port.on('error', function (err) {
      console.log("error opening lora port"); // THIS SHOULD WORK!
      lora_connection_state = false
      error_open_lora_port_count++
      if (error_open_lora_port_count > 14) { // if 10 times fail urge to restart
        if(system_task_const.MODE_DEBUG)
          console.log("This is pid " + process.pid);
        lora_port.flush(function(err,results){});

        setTimeout(function () {
          if(system_task_const.MODE_DEBUG)
            console.log("No data , system refresh needed")

          if (lora_reset_check > 10) {
            connectionstate = false
            mainWindow.webContents.send('lora_connection_state', { msg: false })
          }
        })
        //require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg) });
        /*setTimeout(function () {
            process.on("exit", function () {
                require("child_process").spawn(process.argv.shift(), process.argv, {
                    cwd: process.cwd(),
                    detached : true,
                    stdio: "inherit"
                });
            });
            process.exit();
        }, 5000 * 3);
       */
        connectionstate = false
        mainWindow.webContents.send('lora_connection_state', { msg: false })
      }
    });
    lora_port.open(function (err) {}.bind(this))

    setTimeout(function(){
      let ss_data = GPS_START_BIT + my_id + "0" + "0" + DATA_END_BIT
      lora_reset_check++
  
      write_to_lora(ss_data) // write my position
      setTimeout(function(){
        lora_reset_check++
        write_to_lora(ss_data) 
      },system_task_const.MULTIPLE_GPS_SEND_INTERVAL * 1)

    },30 * 1000)
    send_system_state(mainWindow,voice_module_color = 2,data_module_color = lora_port.isOpen ?true: false ,
      voice_rx_color = 2,voice_tx_color = 2,gps_color = 0)
    // auto send status to other lora
    setInterval(function () {
      //my_gps_sent_count++
      set_interval_count_gps++
      own_gps_save_to_db_count++
      if(set_interval_count_gps >  120){//32){// means after 12 sec
        set_interval_count_gps = 0
        prev_status_msg = []
        prev_long_data_msg = []
        duplicate_long_msg_arr = []
        if (!lora_port.isOpen) {// check if port is open or not, then open
          if(system_task_const.MODE_DEBUG)
            console.log("lra port clsd, retry")
          lora_port.open()
          port_closed_update_track = 1
          
          send_system_state(mainWindow,voice_module_color = 2,data_module_color = 0,
            voice_rx_color = 2,voice_tx_color = 2,gps_color = 2)
        
        }
        else
        { //means lora port is open then send data
            ///////////////////////////////////
            if(port_closed_update_track == 1){
              update_data_frequency()
              port_closed_update_track = 0
            }
           if(gps_data_quality){
            send_system_state(mainWindow,voice_module_color = 2,data_module_color =  1,
              voice_rx_color = 2,voice_tx_color = 2,gps_color = 1)
           }else{
            send_system_state(mainWindow,voice_module_color = 2,data_module_color =  1,
              voice_rx_color = 2,voice_tx_color = 2,gps_color = 2)
           }
        }
        /// own gps save to db after 1min
        if (gps_data_quality && own_gps_save_to_db_count > 1200) {// 120 means after 2 min
          own_gps_save_to_db_count = 0;
          if (lat && lat != 0) {
              /// save to db
              let obj = {
                sender: my_id,
                mtime: moment().format("YYYY-MM-DD HH:mm:ss"),
                lat: lat, long: long, other1: "", other2: "", other3: ""
              }
              if(system_task_const.MODE_DEBUG)
                console.log("saving gps own")
              data_models_api.gps_data_create(obj)
            ///////////////////////////////////
          }
        }
        ////////////////////////////////// reset check
        if (lora_reset_check  >= system_task_const.LORA_RESET_ON_NO_RCV_CNT) { // after every 3 check if you are 
          if(system_task_const.MODE_DEBUG)
            console.log("current lorarest ", lora_reset_check,recieved_own_status_msg_count)
          if (recieved_own_status_msg_count == 0 && lora_reset_check != 0) {
            //lora_port.flush(function(err,results){});
            //console.log("num of time reset", total_lora_reset_count++)
            /*lora_port.on('close', function (err) {
              console.log('lora port closed..', err); 
              if (!lora_port.isOpen) {// check if port is open or not, then open
                console.log("lora port closed Will,retry")
                lora_port.open()
                //update_data_frequency()
              } 
              lora_port.open()
            });*/
            //////
            if(system_task_const.SHOULD_LORA_RESET){
              stm_reset_out.writeSync(0)
            }
                setTimeout(function () {
                  if(system_task_const.MODE_DEBUG)
                    console.log("No rcv,reset needed")
                  if(system_task_const.SHOULD_LORA_RESET){
                    if(system_task_const.MODE_DEBUG)
                      console.log("reset done")
                    stm_reset_out.writeSync(1)
                  }
            
                    //update_data_frequency()
                }, 700)
            lora_reset_check = 0
            recieved_own_status_msg_count = 0
          }else{
            lora_reset_check = 0
            recieved_own_status_msg_count = 0
          }
          
        
          //lora_reset_check = 1
        }
        ////////////////////////////////////////// online offline state upd
        online_ofline_state = online_ofline_state.map(x=>{
          var ms = moment(moment().format('YYYY-MM-DD HH:mm:ss')).diff(moment(x.time))
          var d = moment.duration(ms)
          if(d.asMinutes() > 7){
            x.mstatus = false
          }
          return x
        })
        //////////////////////////////////////////////
      }// end condition check after 8 sec
      
        
        if(first_time_gps_send && (new Date().getSeconds()) == ((parseInt(my_id) % 1000) - 1) ){

          // at second == my_id send gps location
          first_time_gps_send = false
          let s_data
          if (gps_data_quality && isgps == "1")// means user wants to send
            s_data = GPS_START_BIT + my_id + lat + long + DATA_END_BIT
          else {

              s_data = GPS_START_BIT + my_id + "0" + "0" + DATA_END_BIT
          }
          /// kepp the time for first time send and send data
          prev_gps_send_time = moment()
          lora_reset_check = 0
          //for(var i=1;i<=system_task_const.NUM_OF_GPS_DATA_SEND_AT_1_TIME;i++ ){
          if(current_status_msg_state == "1") { // check if status message is on or not
              lora_reset_check++
                write_to_lora(s_data) // write my position
                setTimeout(function(){
                  lora_reset_check++
                  write_to_lora(s_data) // write my position
                },system_task_const.MULTIPLE_GPS_SEND_INTERVAL )//*random_gps_count)
          }else{
            if(system_task_const.MODE_DEBUG)
              console.log("sts msg turned off")
          }
          //}
        }
        if(!first_time_gps_send){
          if(prev_gps_send_time ){
            var timm = prev_gps_send_time.format('YYYY-MM-DD HH:mm:ss')
            var ms = moment(moment().format('YYYY-MM-DD HH:mm:ss'))
              .diff(timm)
            var d = moment.duration(ms)
            
       
            if (d.asSeconds() == system_task_const.TOTAL_NETWORK_SHIP) {
              // if number of ship duration passed means all ship has send there position
              prev_gps_send_time = moment()
              let s_data

                if (gps_data_quality && isgps == "1")// means user wants to send
                  s_data = GPS_START_BIT + my_id + lat + long + DATA_END_BIT
                else {
                  s_data = GPS_START_BIT + my_id + "0" + "0" + DATA_END_BIT
                }
       
              let cant_write
              if(system_task_const.GPS_NOT_WRITE_AT_LONG_MSG_RCV && long_data_recieving_mode ){
                cant_write = 1
              }
              else if(system_task_const.GPS_NOT_WRITE_AT_LONG_MSG_XMIT && long_data_transmit_mode){
                cant_write = 1
              }
              else if(system_task_const.GPS_NOT_WRITE_AT_SHORT_MSG_XMIT && short_msg_transmitting){
                cant_write = 1
                if(system_task_const.MODE_DEBUG)
                  console.log("short msg transmitting")
                short_msg_transmitting = false
              }else if(system_task_const.GPS_NOT_WRITE_AT_SHORT_MSG_RCV && just_rcvd_short_msg){
                cant_write = 1
                if(system_task_const.MODE_DEBUG)
                  console.log("n_write. short msg rcvd")
                just_rcvd_short_msg = false
              }
              else {
                cant_write = 0
              }
              if(cant_write == 0){
                if(current_status_msg_state == "1") {
                    //lora_reset_check = 0
                      lora_reset_check++
                      write_to_lora(s_data) // write my position 
                    setTimeout(function(){
                        lora_reset_check++
                        write_to_lora(s_data) // write my position
                      },system_task_const.MULTIPLE_GPS_SEND_INTERVAL)//*random_gps_count)
        
                      if(system_task_const.MODE_DEBUG)
                          console.log("gps pos written")
                  }else{
                    if(system_task_const.MODE_DEBUG)
                      console.log("status msg is turned off")
                  }
              }else{
                if(system_task_const.MODE_DEBUG)
                  console.log("in rcving transmit mode....")
              }
            }
          }
        
        }

    }, system_task_const.AUTO_GPS_SEND_INTERVAL_DELAY)//7000 )//5000 * Math.floor(Math.random() * (11 - 6 + 1) + 6))
    /////////////////////////////////////////////////////////////////
  });

  mainWindow.on('closed', () => mainWindow = null);
  mainWindow.webContents.openDevTools()
}

// send lora data
ipcMain.on('sendData_lora', (event, args) => {
  //////////////////////////////////// send to serial
  if (args) {
    lora_port.write(args, function (err) {
      if (err) {
        return console.log('Error on write: ', err.message)
      }
      if(system_task_const.MODE_DEBUG)
        console.log('msg to lora-', args, moment().format('mm:ss'),moment().millisecond())
      if(args.substr(2,2) == '22'){// two part message
      }else if(args.substr(2,2) == '33' || args.substr(2,2) == '32'){
      }else if(args.substr(2,2) == '42' || args.substr(2,2) == '43' || args.substr(2,2) == '44'){
      }else if(args.substr(2,2) == '52' || args.substr(2,2) == '53' || args.substr(2,2) == '54' || args.substr(2,2) == '55'){
      }else if(args.substr(2,2) == '62' || args.substr(2,2) == '63' || args.substr(2,2) == '64' || args.substr(2,2) == '65' || args.substr(2,2) == '66'){
    
      }else{
        resend_arr = [] // clear all old message
    
      }
      resend_arr.push({ args: args, count: 0, ack: 0, ack_from: [] })
 
      if(args.substr(2,2) == '11' || args.substr(2,2) == '21' || 
      args.substr(2,2) == '31' || args.substr(2,2) == '41' || args.substr(2,2) == '51'
      || args.substr(2,2) == '61'){
            clearInterval(cancel_text_send_interval)
            short_msg_transmitting = true
            if(args.substr(2,1) == '5' || args.substr(2,1) == '6'){
              start_send_interval(selected_sf_time * 25,25)//17000)
            
            }else if(args.substr(2,1) == '4'){
              start_send_interval(selected_sf_time * 18,18)//11 * 1000)
            }else if(args.substr(2,1)== '3'){
              start_send_interval(selected_sf_time * 14,14)
            }else {
              start_send_interval(selected_sf_time * 11,11)
            }
      }
      lora_reset_check++
      

    })
  }
  //////////////////////////////////////

});
// send lora data
ipcMain.on('sendACK_lora', (event, args) => {
  if(system_task_const.MODE_DEBUG)
    console.log("got ACK-", args)
  //////////////////////////////////// send to serial
  if (args) {
    lora_port.write(args, function (err) {
      if (err) {
        return console.log('Error on write: ', err.message)
      }
      if(system_task_const.MODE_DEBUG)
        console.log('ACK written to lora-', args)

      //mainWindow.webContents.send('text_msg_sent', {msg: args});  
    })
  }
  //////////////////////////////////////
});
ipcMain.on('send_my_id_enc_data_shipl', (event, args) => {
  my_id_obj.connectionstate = connectionstate
  if (my_id) {
    data_models_api.curr_data_chan_models().then(curr_data_chan=> {
        data_models_api.get_all_msg()
          .then(result => {
            //data_models_api.gps_data_get_all().then(result_gps => {
            data_models_api.only_last_gps_pos().then(result_gps => { 
              ////////////////////////////////////////////////////
              if(curr_data_chan[0].channel_id == system_task_const.BNCG_DATA_CHAN){
                mainWindow.webContents.send('rcv_my_id_enc_data_shipl',
                {
                  msg: {
                    my_id_obj: my_id_obj, enc_key: bncg_enc_key_saved, data: result,
                    shipl: rcvrlist, prestate: online_ofline_state, all_gps: result_gps,
                    usergroup: all_rcvr_and_grp,selected_sf_time: selected_sf_time,
                    bncg_enc_key: bncg_enc_key_saved,curr_data_chan: curr_data_chan[0].channel_id

                  }
                });
             }
              else{
                mainWindow.webContents.send('rcv_my_id_enc_data_shipl',
                {
                  msg: {
                    my_id_obj: my_id_obj, enc_key: data_enc_key_saved, data: result,
                    shipl: rcvrlist, prestate: online_ofline_state, all_gps: result_gps,
                    usergroup: all_rcvr_and_grp,selected_sf_time: selected_sf_time,
                    bncg_enc_key: bncg_enc_key_saved,curr_data_chan: curr_data_chan[0].channel_id

                  }
                });
              }

                ///////////////////////////////////
            })
          })
    })
  } else {

  }
})
///// send all usergroup

ipcMain.on('send_group_all',(event, args) => {
  data_models_api.get_all_ship().then(allship_result=>{
    rcvrlist = allship_result
    data_models_api.usergroup_get_all().then(ress=>{
      mainWindow.webContents.send('get_group_all',ress)
      usergroup_arr_list = ress
      all_rcvr_and_grp = []
      usergroup_arr_list.map(x=>{
        all_rcvr_and_grp.push({user: x.gr_name,uid: x.gr_number,pin:x.pin, members: x.members,membar_id: x.membar_id,no_of_membar: x.no_of_membar})
      })
      rcvrlist.map(x=>{
        all_rcvr_and_grp.push({user: x.ship,uid: x.uid,pin: x.pin ,members: null,membar_id: null,no_of_membar: 1})
      })
    })
  })

})
//////////////////// pin unpin
ipcMain.on('pin_unpin_user',(event, args) => {

  data_models_api.update_user_pin(args).then(x=>{
    data_models_api.get_all_ship().then(allship_result=>{
      rcvrlist = allship_result
      data_models_api.usergroup_get_all().then(ress=>{
        usergroup_arr_list = ress
        all_rcvr_and_grp = []
        usergroup_arr_list.map(x=>{
          all_rcvr_and_grp.push({user: x.gr_name,uid: x.gr_number,pin:x.pin, members: x.members,membar_id: x.membar_id,no_of_membar: x.no_of_membar})
        })
        rcvrlist.map(x=>{
          all_rcvr_and_grp.push({user: x.ship,uid: x.uid,pin: x.pin ,members: null,membar_id: null,no_of_membar: 1})
        })
      })
      ////////////////////////
    })
  })

})
////////////////////////////////////////
ipcMain.on('send_single_gps', (event, args) => {
  if(system_task_const.MODE_DEBUG)
    console.log("single gps args--", args)
  my_id_obj.connectionstate = connectionstate
  if (my_id && args) {
        data_models_api.gps_data_get_single(args).then(result_gps => {
          data_models_api.only_last_gps_pos().then(result_all_gps => { 
       
              mainWindow.webContents.send('rcv_single_gps',
                {
                  msg: {
                    my_id_obj: my_id_obj, enc_key: data_enc_key_saved,
                    shipl: rcvrlist, prestate: online_ofline_state, single_all_gps: result_gps,
                    all_gps: result_all_gps,
                    usergroup: all_rcvr_and_grp
                  }
                });
            })
         })

  } else {

  }
})
//
ipcMain.on('send_data_freq_table', (event, args) => {
  mainWindow.webContents.send('get_data_freq_table', data_freq_table_saved  )
})
ipcMain.on('read_data_chan_freq', (event, args) => {
  mainWindow.webContents.send('get_data_chan_freq', { msg: data_freq_table_saved.find(x => x.channel_id == args) });
  ///////////////////
})
ipcMain.on('chenge_data_freq', (event, args) => {
  data_models_api.data_freq_models_update(args).then(x=>{
    if(x){
      data_freq_table_saved = x
    }
    mainWindow.webContents.send('update_success_data_freq_custom', { msg: data_freq_table_saved.find(x => x.channel_id == args.channel_id) }); 
  })
  ///////////////////
})
///
ipcMain.on('send_online_offline_state', (event, args) => {
  mainWindow.webContents.send('online_offline_state',online_ofline_state)
})
// db save all msg send data
ipcMain.on('allmsg_save_to_db', (event, args) => {
  if (args) {
    data_models_api.all_msg_Sender_create(args).then(x=>{})
  }
})
// getcurrent user-set
ipcMain.on('get-current_user_set_obj', (event, args) => {
  mainWindow.webContents.send('return_user_set_obj', { msg: usersetobj});
})
/// get current status message settings status_msg_set_update_success
ipcMain.on('get-current_status_msg_set_obj', (event, args) => {
  data_models_api.status_msg_get_all().then(result=>{
    mainWindow.webContents.send('return_status_msg_set', { msg: result});
  })
  //mainWindow.webContents.send('return_status_msg_set', { msg: usersetobj});
})
///// updat status msg
ipcMain.on('edit_status_msg_state', (event, args) => {
  data_models_api.update_status_msg_state(args).then(result=>{
    current_status_msg_state  = args.state.toString()
    mainWindow.webContents.send('status_msg_set_update_success', { msg: result});
  })
  //mainWindow.webContents.send('return_status_msg_set', { msg: usersetobj});
})
// get current mesh msg set
ipcMain.on('get-current_mesh_msg_set_obj', (event, args) => {
  data_models_api.mesh_msg_get_all().then(result=>{
    mainWindow.webContents.send('return_mesh_msg_set', { msg: result});
  })

})
// update mesh msg
ipcMain.on('edit_mesh_msg',(event,args)=>{
  data_models_api.update_mesh_state(args).then(result=>{
    current_mesh_state  = args.state.toString()
    console.log("mesh state updated--", current_mesh_state)
    mainWindow.webContents.send('mesh_state_set_update_success', { msg: result});
  })
})
ipcMain.on('get-chat-print-by-date',(event,args)=>{
  if(args.rcvr.substr(0,1) == "f"){
    data_models_api.all_msg_find_by_date_group(args).then(result=>{
      mainWindow.webContents.send("send_chat_print_by_date",result)
    })
  }else{
    data_models_api.all_msg_find_by_date_single(args,my_id).then(result=>{
      mainWindow.webContents.send("send_chat_print_by_date",result)
    })
  }
})
// update user settings
ipcMain.on('edit-user-set', (event, args) => {
  data_models_api.updateuserSet(args ).then(res=>{
    isgps = args.isgps.toString()
    usersetobj.isgps = args.isgps.toString()
    mainWindow.webContents.send('user_set_update_success', { msg: res});
  })
})
// update data,voice enc
ipcMain.on('update-data-enc', (event, args) => {
  data_models_api.update_data_enc(args).then(result=>{
    data_enc_key_saved = args.key
    mainWindow.webContents.send('data_enc_key_update_success', { msg: result });
  }).catch(err=>{console.log(err)})
})
// update data,voice enc
ipcMain.on('update-bncg-enc', (event, args) => {
  data_models_api.update_bncg_enc(args).then(result=>{
    bncg_enc_key_saved = args.key
    mainWindow.webContents.send('bncg_enc_key_update_success', { msg: result });
  }).catch(err=>{console.log(err)})
})
/*
ipcMain.on('update-voice-enc', (event, args) => {
  data_models_api.update_voice_enc(args).then(result=>{
    voice_enc_key_saved = args.key
    mainWindow.webContents.send('voice_enc_key_update_success', { msg: result });
  }).catch(err=>{console.log(err)})
})*/
///

ipcMain.on('mail-delete', (event, args) => {
  data_models_api.long_msg_destroy_by_id(args).then(result=>{
    mainWindow.webContents.send('rcv_all_long_msg', { msg: result });
  })

})
// retrieve atchieve == retrieve-archieve
ipcMain.on('retrieve-archieve', (event, args) => {
  data_models_api.long_msg_get_atchieve(args).then(result=>{
    mainWindow.webContents.send('get_archieve_list', { msg: result });
  })
})
// delete * text from db
ipcMain.on('delete_all_text_db', (event, args) => {
  data_models_api.all_msg_destroy().then(result=>{
    mainWindow.webContents.send('delete_db_text_result', { msg: true });
  })
})
ipcMain.on('all_diag', (event, args) => {
  let obj = {
    lora_comm: lora_connection_state, gps_comm: gps_connection_state,
    hard_arm_comm: hard_stm_connection_state, hard_arm_data: hard_stm_data_quality,
    lora_data: lora_data_recieved, gps_data: gps_data_quality
  }
  mainWindow.webContents.send('all_diag_res', { msg: obj });
  if(system_task_const.MODE_DEBUG)
    console.log("all diag result--", obj)

})
ipcMain.on('save_to_long_msg', (event, args) => {
  data_models_api.long_msg_create(args).then(result=>{
    mainWindow.webContents.send('rcv_all_long_msg', { msg: result });
  })
})
ipcMain.on('send_long_msg_list', (event, args) => {
  data_models_api.long_msg_get_all().then(result=>{
    mainWindow.webContents.send('rcv_all_long_msg', { msg: result });
  })
})

ipcMain.on('new_longmsg_rcvd', (event, args) => {
  play_sound()
  this.setTimeout(function(){
    play_sound()
  },5000)
  
})
/////////////////// change sprea factor
ipcMain.on('change_spread_factor', (event, args) => {
  if(args){
    write_to_lora(args + "abc89")
  }
})

// send current data chan sock rcvd and send to ng
ipcMain.on('send_curr_data_chan', (event, args) => {
  if (args) {
    data_models_api.curr_data_chan_models().then(result=> {
    
        mainWindow.webContents.send('get_curr_data_chan', { msg: result[0]});
    })
  }
})
/// 
ipcMain.on('rcv_msg_timout_end',(event,args) =>{

    long_str_ack_rcvd_arr = [] //clear ack rcvd arr
    final_longdata_rcv_arr = []
    rcving_long_data_start_obj = {}
    rcv_mode_chk_rcvr = {}
    long_data_recieving_mode = false // clear after 5 min
    long_data_all_msg_rcvd = false

})
ipcMain.on('set_data_channel', (event, args) => {
  if (args) {
    write_to_lora("ch:" + args.channel_id + data_freq_table_saved.find(x=> x.channel_id == args.channel_id).frequency + "49")
    curr_data_chan =  args.channel_id                    
    //write_to_lora("ch:" + args.channel_id + "49")
    /////////////////////////
    data_models_api.curr_chan_models().then(curr_vc=> {
      let up_vc_ch =  parseInt(curr_vc[0].channel_id)

        let cid
        if (args.channel_id.toString(16).length < 10) {
          cid = Number("0x0" + args.channel_id.toString(16))
        } else {
          cid = Number("0x" + args.channel_id.toString(16))
        }
        let cvc
        if (up_vc_ch.toString(16).length < 10) {
          cvc = Number("0x0" + up_vc_ch.toString(16))
        } else {
          cvc = Number("0x" + up_vc_ch.toString(16))
        }
        let fin_val = [0x29, Number("0x" + curr_vc[0].channel_id.toString().length.toString()),
          cvc,cid, 0x63]

        hard_stm_port.write_stm(fin_val, function (err) {
          if (err) {
            return console.log('Error on write stm dmr: ', err.message)
          }
   
        })
    })
    //////////////////////////////////
  }
})
//////////////////
ipcMain.on('delete_chat_by_time',(event, args) => {
  if(args){
    data_models_api.all_msg_destroy_by_time(args).then(result=>{
      if(system_task_const.MODE_DEBUG)
        console.log("chat deleted")
      //mainWindow.webContents.send("send_chat_print_by_date",result)
    })
  }
})
////////////////////////////////////////
let last_write_time = moment().format('YYYY-MM-DD HH:mm:ss')
module.exports.write_to_lora = function(args) {
  f_write_to_lora(args)

}
function write_to_lora(args) {
  lora_port.write(args, function (err) {
    if (err) {
      lora_port.flush(function(err,results){});
      return console.log('Error on write: ', err.message)
    }
    if(system_task_const.MODE_DEBUG)
      console.log('to lora', args, moment().format('mm:ss'),moment().millisecond())

  })
}
function f_write_to_lora(args){
  //var ms = moment(moment().format('YYYY-MM-DD HH:mm:ss')).diff(last_write_time)
  //var d = moment.duration(ms)
  if(args.length <= 64){
    //if(d.asMilliseconds() > 200)
    {
      lora_port.write(args, function (err) {
        if (err) {
          lora_port.flush(function(err,results){});
          if(system_task_const.MODE_DEBUG)
            return console.log('Error on write: ', err.message)
        }

        lora_port.flush(function(err,results){});
        ///////////////////////////////
        if(system_task_const.MODE_DEBUG)
          console.log('r to lora', args, moment().format('mm:ss'),moment().millisecond())
        //last_write_time = moment(moment().format('YYYY-MM-DD HH:mm:ss'))
      })
    }
    /*else{

    }*/
  }else{
    if(system_task_const.MODE_DEBUG)
      console.log("arguments length more then 64 char", args)
  }
}

function add_padd(val, padding) {
  //var hex = this.cur_msg_ser.toString(16)
  if (val.length < padding) {
    while (val.length < padding) {
      val = "0" + val
    }
  }
  return val
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})
process.on('uncaughtException',(e)=>{
  console.log("Uncaught exception is --", e)
})

function send_system_state(mWindow,voice_module_color,data_module_color,
  voice_rx_color,voice_tx_color,gps_color){
  mWindow.webContents.send('get_system_state',{
    voice_module_color: voice_module_color,
    data_module_color: data_module_color,
    voice_rx_color: voice_rx_color,
    voice_tx_color: voice_tx_color,
    gps_color: gps_color
  })
}

function update_online_offline_sate(obj){
  let testt = online_ofline_state.find(x => x.uid == obj.sender)
  if (testt) {
    online_ofline_state = online_ofline_state.filter(x => x.uid != obj.sender)
    online_ofline_state.push({
      uid: obj.sender, mstatus: true,
      time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: testt.lat, long: testt.long
    })
  } else {
    online_ofline_state.push({
      uid: obj.sender, mstatus: true,
      time: moment().format("YYYY-MM-DD HH:mm:ss"), lat: 0, long: 0
    })
  }
}
////////////////////////////////////////
function ack_process(found, original_dat, obj, set_online,mainWindow){
  if(system_task_const.MODE_DEBUG)
    console.log("found.ack_from--", found.ack_from, obj.sender,obj.rcvr)
  if(obj.sender == obj.rcvr){ // if ack is from who it is directed
      let narr = found.ack_from;//.push(obj.sender.toString())
      narr.push(obj.sender.toString())

      let new_obj = {
        args: original_dat, count: 0, ack: 0,
        ack_from: narr
      }
      resend_arr = resend_arr.filter(x => x.args != original_dat)
      resend_arr.push(new_obj)
      if (original_dat.substr(2, 1) == '1') {// single part msg ok
        let new_ack = found.ack_from.length

        set_ack_sent_to_web(new_ack, set_online, original_dat, mainWindow)
        this.resend_arr = []
        clearInterval(cancel_text_send_interval)
      } else { // two part or three or four so double ack needed
        //ack_msg_arr.push({original_dat: original_dat, sender:obj.sender})
        let finres = resend_arr.filter(x => (x.args.substr(2, 2) != '21' || x.args.substr(2, 2) != '22') &&
          x.args.substr(12, 6) == original_dat.substr(12, 6)) /// check if time is same

        if (finres.length == 2) {
          let new_ack = 0
          finres[0].ack_from.map((mapval, index) => {
            /*let strl1 =  finres[0].args.substr(18, 2)
            let text1 =  finres[0].args.substr(20, parseInt(Number("0x" + strl1), 10))

            let strl2 =  finres[1].args.substr(18, 2)
            let text2 =  finres[1].args.substr(20, parseInt(Number("0x" + strl2), 10))

            console.log("ack data is--",text1,text2)*/

            let temp_obj1 = finres[1].ack_from.find(x => x == mapval)
            if (temp_obj1) {
              // one ack found
              if(system_task_const.MODE_DEBUG)
                console.log("complete ack from --", mapval)
              new_ack++
              set_ack_sent_to_web(new_ack, set_online, original_dat,mainWindow)
              
              this.resend_arr = []
              clearInterval(cancel_text_send_interval)
            }
            if (index == finres[0].ack_from.length - 1) {

              //set_ack_sent_to_web(new_ack, set_online, original_dat,mainWindow)
            }
          })
        }
        // two part checj ended
        let finres2 = resend_arr.filter(x => (x.args.substr(2, 2) != '31' || x.args.substr(2, 2) != '32' || x.args.substr(2, 2) != '33') &&
          x.args.substr(12, 6) == original_dat.substr(12, 6)) /// check if time is same
      
        if (finres2.length == 3) {
          let new_ack = 0
          finres2[0].ack_from.map((mapval, index) => {
            let temp_obj1 = finres2[1].ack_from.find(x => x == mapval)
            let temp_obj2 = finres2[2].ack_from.find(x => x == mapval)
            if (temp_obj1 && temp_obj2) {
              if(system_task_const.MODE_DEBUG)
                console.log("complete ack from part3 --", mapval)
              new_ack++
              set_ack_sent_to_web(new_ack, set_online, original_dat,mainWindow)
              
              this.resend_arr = []
              clearInterval(cancel_text_send_interval)
            }
            if (index == finres2[0].ack_from.length - 1) {

              //set_ack_sent_to_web(new_ack, set_online, original_dat,mainWindow)
            }
          })
        }
        let finres3 = resend_arr.filter(x => (x.args.substr(2, 2) != '41' || x.args.substr(2, 2) != '42' || x.args.substr(2, 2) != '43' || x.args.substr(2, 2) != '44') &&
          x.args.substr(12, 6) == original_dat.substr(12, 6)) /// check if time is same
        if (finres3.length == 4) {
          let new_ack = 0
          finres3[0].ack_from.map((mapval, index) => {
            let temp_obj1 = finres3[1].ack_from.find(x => x == mapval)
            let temp_obj2 = finres3[2].ack_from.find(x => x == mapval)
            let temp_obj3 = finres3[3].ack_from.find(x => x == mapval)
            if (temp_obj1 && temp_obj2 && temp_obj3) {
              if(system_task_const.MODE_DEBUG)
                console.log("complete ack from part4 --", mapval)
              new_ack++

                set_ack_sent_to_web(new_ack, set_online, original_dat,mainWindow)
              
              resend_arr = []
              clearInterval(cancel_text_send_interval)
            }
            if (index == finres3[0].ack_from.length - 1) {

              //set_ack_sent_to_web(new_ack, set_online, original_dat,mainWindow)
            }
          })
        }
        /////
        let finres4 = resend_arr.filter(x => (x.args.substr(2, 2) != '51' || x.args.substr(2, 2) != '52' || x.args.substr(2, 2) != '53' || x.args.substr(2, 2) != '54' || x.args.substr(2, 2) != '55') &&
          x.args.substr(12, 6) == original_dat.substr(12, 6)) /// check if time is same
        if (finres4.length == 5) {
          let new_ack = 0
          finres4[0].ack_from.map((mapval, index) => {
            let temp_obj1 = finres4[1].ack_from.find(x => x == mapval)
            let temp_obj2 = finres4[2].ack_from.find(x => x == mapval)
            let temp_obj3 = finres4[3].ack_from.find(x => x == mapval)
            let temp_obj4 = finres4[4].ack_from.find(x => x == mapval)
            
            if (temp_obj1 && temp_obj2 && temp_obj3 && temp_obj4) {
              if(system_task_const.MODE_DEBUG)
                onsole.log("complete ack from part5 --", mapval)
              new_ack++
              set_ack_sent_to_web(new_ack, set_online, original_dat,mainWindow)
              
              clearInterval(cancel_text_send_interval)
            }
            if (index == finres4[0].ack_from.length - 1) {
            }
          })
        }
        ///////////////////
        let finres5 = resend_arr.filter(x => (x.args.substr(2, 2) != '61' || x.args.substr(2, 2) != '62' || x.args.substr(2, 2) != '63' || x.args.substr(2, 2) != '64' || x.args.substr(2, 2) != '65' || x.args.substr(2, 2) != '66') &&
        x.args.substr(12, 6) == original_dat.substr(12, 6)) /// check if time is same
        if (finres5.length == 6) {
          let new_ack = 0
          finres5[0].ack_from.map((mapval, index) => {
            let temp_obj1 = finres5[1].ack_from.find(x => x == mapval)
            let temp_obj2 = finres5[2].ack_from.find(x => x == mapval)
            let temp_obj3 = finres5[3].ack_from.find(x => x == mapval)
            let temp_obj4 = finres5[4].ack_from.find(x => x == mapval)
            let temp_obj5 = finres5[5].ack_from.find(x => x == mapval)

            if (temp_obj1 && temp_obj2 && temp_obj3 && temp_obj4  && temp_obj5) {
              if(system_task_const.MODE_DEBUG)
                console.log("complete ack from part6 --", mapval)
              new_ack++
              set_ack_sent_to_web(new_ack, set_online, original_dat,mainWindow)
              
              clearInterval(cancel_text_send_interval)
            }
            if (index == finres5[0].ack_from.length - 1) {
              //set_ack_sent_to_web(new_ack, set_online, original_dat,mainWindow)

            }
          })
        }
    
      }// two three four part check ended
  }else{
    if(system_task_const.MODE_DEBUG)
      console.log("ack is not from intended user")
  }
}
/////////////////////

function set_ack_sent_to_web(new_ack, set_online, original_dat,mainWindow) {
  mainWindow.webContents.send('text_msg_sent',
  {
    time: original_dat.substr(12, 6),
    num_of_ack: new_ack, allOnlineSent: true, sent: true,
    groupSent: true
  });
  resend_arr = []//resend_arr.filter(x => x.args.substr(12, 6) !== original_dat.substr(12, 6))// remove message from resend arr
  if(system_task_const.MODE_DEBUG)
    console.log("resend arr after filter-", resend_arr)
  /*if (new_ack < 4) {
    if (set_online == new_ack) {
      mainWindow.webContents.send('text_msg_sent',
        {
          time: original_dat.substr(12, 6),
          num_of_ack: new_ack, allOnlineSent: true, sent: true,
          groupSent: false
        });
      resend_arr = resend_arr.filter(x => x.args.substr(12, 6) !== original_dat.substr(12, 6))// remove message from resend arr
      console.log("resend arr after filter-", resend_arr)
    } else {
      mainWindow.webContents.send('text_msg_sent',
        {
          time: original_dat.substr(12, 6),
          num_of_ack: new_ack, allOnlineSent: false, sent: true,
          groupSent: false
        });
    }
  } else {
    mainWindow.webContents.send('text_msg_sent',
      {
        time: original_dat.substr(12, 6),
        num_of_ack: new_ack, allOnlineSent: true, sent: true,
        groupSent: true
      });
    resend_arr = resend_arr.filter(x => x.args.substr(12, 6) !== original_dat.substr(12, 6))// remove message from resend arr
    console.log("resend arr after filter-", resend_arr)
  }*/
}

////////////////////////////////////////////////////
function update_data_frequency(){
  setTimeout(function(){ // send data freq after 30secas restart occured
    data_models_api.curr_data_chan_models().then(result=> {
      curr_data_chan = result[0].channel_id
      //write_to_lora("ch:" + result[0].channel_id + "49")
      write_to_lora("ch:" + result[0].channel_id  + data_freq_table_saved.find(x=> x.channel_id == result[0].channel_id ).frequency + "49")
      if(system_task_const.MODE_DEBUG)
        console.log("updated data freq--", "ch:" + result[0].channel_id  + data_freq_table_saved.find(x=> x.channel_id == result[0].channel_id ).frequency + "49")
    })
  },RESTART_TIME_FOR_DATA_RESET_FREQ_UPDATE)
}
///////////////////////////////////////////////////////
