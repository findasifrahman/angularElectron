var crc16_kermit = require('./crc16_kermit')
//var all_msg_models = require('./all_msg_models')
var data_models_api = require('./data_models_api')
var play_sound = require('./play_sound')
var CryptoJS = require("crypto-js");
const system_task_const = require('../constants/system_task')
//var resend_arr = require('./send_data_arr_state')
var main_f = require('../main')
var moment = require('moment');
var prev_msg = []
var prev_msg_permanent = [] // this array will not be cleared
var prev_msg_relay = []
var two_part_msg = [] // 2 part message half
var three_part_msg = [] // 3 part message half
var four_part_msg = [] // 4 part message half
var five_part_msg = [] // 5 part message half
var six_part_msg = [] // 6 part message half


//text_message_check
// obj format = start(13) , msg_part(31,21,11,32..) , sender(4 byte) , 
//  rcvr (4 byte) , time(moment(yyyy-mm-dd) + 6 byte hhmmss) , enc (4 byte)
//  , len (2 byte) , text, crc (4 byte) , end (91)
module.exports = function (obj, enc_key_saved,rcvrlist,all_rcvr,my_id,mainWindow,is_14,selected_sf_time,current_mesh_state) {

      let kermit = crc16_kermit(obj.raw_data.substr(2, 18 + parseInt(Number("0x" + obj.len), 10)))
      if(system_task_const.MODE_DEBUG)
        console.log("crc is", kermit, obj.raw_data.substr(2, 18 + parseInt(Number("0x" + obj.len), 10)))
      setTimeout(function(){
          if (!prev_msg.find(x => x == obj.raw_data)) {  
            if (kermit.localeCompare(obj.crc) == 0) {
              if(system_task_const.MODE_DEBUG)
                console.log("crc ok")
              //////////////////////////////////////decrypt
              if (obj.msg_part == "11") {
                if (!prev_msg_permanent.find(x => x == obj.raw_data)) {
                  let should_i_sent = false
                  if(obj.rcvr == 'ffff'){
                    
                    should_i_sent = true
                  }else if(obj.rcvr.substr(0,1) == "f"){
                    
                    let chk = all_rcvr.find(x=> x.uid == obj.rcvr)
                    //console.log("Group msg",chk)
                    if(chk){//group found
                      var str_array = chk.members.split(',');
                      if(str_array.length > 0){
                        if(str_array.find(x=> x.localeCompare(my_id) == 0) ){
                  
                          should_i_sent = true
                        }else{
                        
                        }
                      }
                    }else{
                   
                    }
                  }else{// One to One msg
                    if(obj.rcvr == my_id){
                 
                      should_i_sent = true
                    }
                  }
                  if(should_i_sent){
                      let aes_enc_key = enc_key_saved
                      var bytes  = CryptoJS.AES.decrypt(obj.text,  aes_enc_key);
                      var f_text = bytes.toString(CryptoJS.enc.Utf8)
              
                      if(f_text){
                        data_models_api.all_msg_models_create(obj,rcvrlist,f_text).then(result=>{
                          mainWindow.webContents.send('text_msg', { msg: result.msg, new_msg: result.mod_obj });
                          mainWindow.webContents.send('new_text_msg', { msg: result.msg, new_msg: result.mod_obj });
                        })
                        play_sound()
                      }
                  }else{
                  
                  }
                  /////////////////
                }
      
              }// end of single part msg
              else if (obj.msg_part[0] == "2") {// two part msg
                let u = two_part_msg.find(x => x.raw_data == obj.raw_data)
                if (obj.msg_part[1] == '1') { // first part
                  //console.log("first part")           
                  if (!u)
                    two_part_msg.push(obj)
                } else if (obj.msg_part[1] == '2') {
                  //console.log("second part")
                  if (!u)
                    two_part_msg.push(obj)
                }
                let should_i_sent = false
                if(obj.rcvr == 'ffff'){
             
                  should_i_sent = true
                }else if(obj.rcvr.substr(0,1) == "f"){
                    
                  let chk = all_rcvr.find(x=> x.uid == obj.rcvr)
                  //console.log("Group msg",chk)
                  if(chk){//group found
                    var str_array = chk.members.split(',');
                    if(str_array.length > 0){
                      if(str_array.find(x=> x.localeCompare(my_id) == 0) ){
                        //console.log("Group fnd")
                        should_i_sent = true
                      }else{
                        //console.log("Group not found",str_array)
                      }
                    }
                  }else{
                    //console.log("group not fnd")
                  }
                }else{// One to One msg
                  //console.log("One to One msg")
                  if(obj.rcvr == my_id){
                    //console.log("to reciever")
                    should_i_sent = true
                  }
                }
                if(should_i_sent){
                    if(!u){
               
                      let res_obj = two_part_msg.filter(x => x.sender == obj.sender
                        && x.rcvr == obj.rcvr && x.time.format('HH:mm:ss').localeCompare(obj.time.format('HH:mm:ss')) == 0)
                      /*let chk_duplicate = prev_msg_permanent.filter(x => x.sender == obj.sender
                        && x.rcvr == obj.rcvr && x.time.format('HH:mm:ss').localeCompare(obj.time.format('HH:mm:ss')) == 0)*/
                      if (res_obj && res_obj.length == 2 ){//&& chk_duplicate < 3) {// both part found 
                        if(res_obj.find(x => x.msg_part == "21") && res_obj.find(x => x.msg_part == "22")){  
                     
                          // Decrypt
                          let aes_enc_key = enc_key_saved.toString()
                          let tr = res_obj.find(x => x.msg_part == "21").text +
                          res_obj.find(x => x.msg_part == "22").text
                          var bytes  = CryptoJS.AES.decrypt(tr,  aes_enc_key)//.toString();
                          var f_text = bytes.toString(CryptoJS.enc.Utf8)
                          if(system_task_const.MODE_DEBUG)
                            console.log("decrypted text -",aes_enc_key,tr,bytes.toString(CryptoJS.enc.Utf8))//,decryptedData)
                          if(f_text){
                            data_models_api.all_msg_models_create(obj,rcvrlist,f_text, mainWindow )                     
                            play_sound()
                          }
                            //let newo = two_part_msg.filter(x => x !== res_obj)
                            //two_part_msg = newo
                            ///////////////////////////
                        }
                      }
                    }else{
                      if(system_task_const.MODE_DEBUG)
                        console.log("Two part repeat msg rcvd. No need to check")
                    }
                }else{
                  if(system_task_const.MODE_DEBUG)
                    console.log("I have nothing to do with this text")
                }
              }// end of two part msg
              else if (obj.msg_part[0] == '3') {// three part msg
                ////////////////////////////////////////
                /////////////////////////////////////////
                let u = three_part_msg.find(x => x.raw_data == obj.raw_data)
                if (obj.msg_part[1] == '1') { // first part
                  // add to 2 part fraction array
                  if (!u)
                    three_part_msg.push(obj)
                } else if (obj.msg_part[1] == '2') {
                  if(system_task_const.MODE_DEBUG)
                    console.log("2 of 3")
                  if (!u)
                    three_part_msg.push(obj)
                } else if (obj.msg_part[1] == '3') {
                  if(system_task_const.MODE_DEBUG)
                    console.log("3 to 3")
                  if (!u)
                    three_part_msg.push(obj)
                }
                ///////////////////
                let should_i_sent = false
                if(obj.rcvr == 'ffff'){
              
                  should_i_sent = true
                }else if(obj.rcvr.substr(0,1) == "f"){
                    
                  let chk = all_rcvr.find(x=> x.uid == obj.rcvr)
              
                  if(chk){//group found
                    var str_array = chk.members.split(',');
                    if(str_array.length > 0){
                      if(str_array.find(x=> x.localeCompare(my_id) == 0) ){
                       
                        should_i_sent = true
                      }else{
                  
                      }
                    }
                  }else{
                
                  }
                }else{// One to One msg
             
                  if(obj.rcvr == my_id){
   
                    should_i_sent = true
                  }
                }
                if(should_i_sent){
                      if(!u){
                        let res_obj = three_part_msg.filter(x => x.sender == obj.sender
                          && x.rcvr == obj.rcvr && x.time.format('HH:mm:ss').localeCompare(obj.time.format('HH:mm:ss')) == 0)
                        let chk_duplicate = prev_msg_permanent.filter(x => x.sender == obj.sender
                          && x.rcvr == obj.rcvr && x.time.format('HH:mm:ss').localeCompare(obj.time.format('HH:mm:ss')) == 0)
              
                        if (res_obj && res_obj.length == 3 ){//&& chk_duplicate < 4) { //both part there
                          
                          if(res_obj.find(x => x.msg_part == "31") && res_obj.find(x => x.msg_part == "32")
                          && res_obj.find(x => x.msg_part == "33")){
                            // all part found in 3 part message
                            // Decrypt
                            let aes_enc_key = enc_key_saved
                            let tr = res_obj.find(x => x.msg_part == "31").text +
                            res_obj.find(x => x.msg_part == "32").text + res_obj.find(x => x.msg_part == "33").text
                            var bytes  = CryptoJS.AES.decrypt(tr,  aes_enc_key);
                            var f_text = bytes.toString(CryptoJS.enc.Utf8)
                            if(system_task_const.MODE_DEBUG)
                             console.log("decrypted text -",tr,bytes.toString(CryptoJS.enc.Utf8))//,decryptedData)
                            if(f_text)
                            data_models_api.all_msg_models_create(obj,rcvrlist,f_text, mainWindow )
                        
                            //let newo = three_part_msg.filter(x => x.sender !== obj.sender
                                //&& x.rcvr !== obj.rcvr && x.time.format('HH:mm:ss').localeCompare(obj.time.format('HH:mm:s')) == 0)
                            //three_part_msg = newo
                            play_sound()
                          }
                        }
                      }
                }else{
               
                }
              }//end of three part msg
              else if (obj.msg_part[0] == '4') {// four part msg
                ////////////////////////////////////////
                /////////////////////////////////////////
                let u = four_part_msg.find(x => x.raw_data == obj.raw_data)
                if (obj.msg_part[1] == '1') { // first part
                  // add to 2 part fraction array
                  if (!u)
                    four_part_msg.push(obj)
                } else if (obj.msg_part[1] == '2') {
                  if(system_task_const.MODE_DEBUG)
                    console.log("second part in 4 to 2")
                  if (!u)
                    four_part_msg.push(obj)
                } else if (obj.msg_part[1] == '3') {
                  if(system_task_const.MODE_DEBUG)
                    console.log("third part in 4 to 3")
                  if (!u)
                    four_part_msg.push(obj)
                }
                else if (obj.msg_part[1] == '4') {
                  if(system_task_const.MODE_DEBUG)
                    console.log("four part in 4 to 4")
                  if (!u)
                    four_part_msg.push(obj)
                }
                ///////////////////
                
                let res_obj = four_part_msg.filter(x => x.sender == obj.sender
                  && x.rcvr == obj.rcvr && x.time.format('HH:mm:ss').localeCompare(obj.time.format('HH:mm:ss')) == 0)
                let chk_duplicate = prev_msg_permanent.filter(x => x.sender == obj.sender
                  && x.rcvr == obj.rcvr && x.time.format('HH:mm:ss').localeCompare(obj.time.format('HH:mm:ss')) == 0)
                let should_i_sent = false
                if(obj.rcvr == 'ffff'){
      
                  should_i_sent = true
                }else if(obj.rcvr.substr(0,1) == "f"){
                    
                  let chk = all_rcvr.find(x=> x.uid == obj.rcvr)
                 
                  if(chk){//group found
                    var str_array = chk.members.split(',');
                    if(str_array.length > 0){
                      if(str_array.find(x=> x.localeCompare(my_id) == 0) ){
                        if(system_task_const.MODE_DEBUG)
                          console.log("I am part of the group")
                        should_i_sent = true
                      }else{
                        if(system_task_const.MODE_DEBUG)
                          console.log("I am not part of the group",str_array)
                      }
                    }
                  }else{
                    if(system_task_const.MODE_DEBUG)
                      console.log("Not Part of group")
                  }
                }else{// One to One msg
                  if(system_task_const.MODE_DEBUG)
                    console.log("One to One msg rcvd")
                  if(obj.rcvr == my_id){
                    if(system_task_const.MODE_DEBUG)
                      console.log("I am rcvr")
                    should_i_sent = true
                  }
                }
                if(should_i_sent){
                    if(!u){
                      if (res_obj && res_obj.length == 4 ){//&& chk_duplicate < 4) { //both part there
                        if(system_task_const.MODE_DEBUG)
                          console.log("Four part all 4 found")
                        if(res_obj.find(x => x.msg_part == "41") && res_obj.find(x => x.msg_part == "42")
                        && res_obj.find(x => x.msg_part == "43") && res_obj.find(x => x.msg_part == "44")){
                          // all part found in 3 part message
                          // Decrypt
                          let aes_enc_key = enc_key_saved
                          let tr = res_obj.find(x => x.msg_part == "41").text +
                          res_obj.find(x => x.msg_part == "42").text + res_obj.find(x => x.msg_part == "43").text
                          + res_obj.find(x => x.msg_part == "44").text
                          var bytes  = CryptoJS.AES.decrypt(tr,  aes_enc_key);
                          var f_text = bytes.toString(CryptoJS.enc.Utf8)
                          if(system_task_const.MODE_DEBUG)
                            console.log("decrypted text is-",aes_enc_key,tr,bytes.toString(CryptoJS.enc.Utf8))//,decryptedData)
                          if(f_text){
                            data_models_api.all_msg_models_create(obj,rcvrlist,f_text, mainWindow )
                          
                            //console.log("f text is -- ",f_text)
                            //let newo = four_part_msg.filter(x => x.sender !== obj.sender
                                //&& x.rcvr !== obj.rcvr && x.time.format('HH:mm:ss').localeCompare(obj.time.format('HH:mm:s')) == 0)
                            //four_part_msg = newo
                            play_sound()
                          }
                        }
                      }
                    }
                }else{
                  if(system_task_const.MODE_DEBUG)
                   console.log("I have nothing to do with this text")
                }
              }//end of Four part msg
              else if (obj.msg_part[0] == '5') {// five part msg
                ////////////////////////////////////////
                let u = five_part_msg.find(x => x.raw_data == obj.raw_data)
                if (obj.msg_part[1] == '1') { // first part
                  // add to 2 part fraction array
                  if (!u)
                    five_part_msg.push(obj)
                } else if (obj.msg_part[1] == '2') {
                  if(system_task_const.MODE_DEBUG)
                    console.log("second part in 5 to 2")
                  if (!u)
                    five_part_msg.push(obj)
                } else if (obj.msg_part[1] == '3') {
                  if(system_task_const.MODE_DEBUG)
                    console.log("third part in 5 to 3")
                  if (!u)
                    five_part_msg.push(obj)
                }
                else if (obj.msg_part[1] == '4') {
                  if(system_task_const.MODE_DEBUG)
                    console.log("four part in 5 to 4")
                  if (!u)
                    five_part_msg.push(obj)
                }
                else if (obj.msg_part[1] == '5') {
                  if(system_task_const.MODE_DEBUG)
                    console.log("five part in 5 to 5")
                  if (!u)
                    five_part_msg.push(obj)
                }
                ///////////////////
                
                let res_obj = five_part_msg.filter(x => x.sender == obj.sender
                  && x.rcvr == obj.rcvr && x.time.format('HH:mm:ss').localeCompare(obj.time.format('HH:mm:ss')) == 0)

                let should_i_sent = false
                if(obj.rcvr.substr(0,1) == 'f'){
            
                  should_i_sent = true
                }else if(obj.rcvr.substr(0,1) == "f"){
                    
                  let chk = all_rcvr.find(x=> x.uid == obj.rcvr)
   
                  if(chk){//group found
                    var str_array = chk.members.split(',');
                    if(str_array.length > 0){
                      if(str_array.find(x=> x.localeCompare(my_id) == 0) ){
                
                        should_i_sent = true
                      }else{
                    
                      }
                    }
                  }else{
              
                  }
                }else{// One to One msg
    
                  if(obj.rcvr == my_id){
           
                    should_i_sent = true
                  }
                }
                if(should_i_sent){
                    if(!u){
                      if (res_obj && res_obj.length == 5 ){//&& chk_duplicate < 4) { //both part there
                        if(system_task_const.MODE_DEBUG)
                          console.log("5 part msg all five found")
                        if(res_obj.find(x => x.msg_part == "51") && res_obj.find(x => x.msg_part == "52")
                        && res_obj.find(x => x.msg_part == "53") && res_obj.find(x => x.msg_part == "54") 
                        && res_obj.find(x => x.msg_part == "55")){
                          // all part found in 3 part message
                          // Decrypt
                          let aes_enc_key = enc_key_saved
                          let tr = res_obj.find(x => x.msg_part == "51").text +
                          res_obj.find(x => x.msg_part == "52").text + res_obj.find(x => x.msg_part == "53").text
                          + res_obj.find(x => x.msg_part == "54").text + res_obj.find(x => x.msg_part == "55").text
                          var bytes  = CryptoJS.AES.decrypt(tr,  aes_enc_key);
                          var f_text = bytes.toString(CryptoJS.enc.Utf8)
                          if(system_task_const.MODE_DEBUG)
                            console.log("decrypted text is-",aes_enc_key,tr,bytes.toString(CryptoJS.enc.Utf8))//,decryptedData)
                          if(f_text){
                            data_models_api.all_msg_models_create(obj,rcvrlist,f_text, mainWindow )
                          
                   
                            //let newo = four_part_msg.filter(x => x.sender !== obj.sender
                                //&& x.rcvr !== obj.rcvr && x.time.format('HH:mm:ss').localeCompare(obj.time.format('HH:mm:s')) == 0)
                            //four_part_msg = newo
                            play_sound()
                          }
                        }
                      }
                    }
                }else{
                
                }
              }//end of Five part msg
              else if (obj.msg_part[0] == '6') {// six part msg
                ////////////////////////////////////////
                let u = six_part_msg.find(x => x.raw_data == obj.raw_data)
                if (obj.msg_part[1] == '1') { // first part
                  // add to 2 part fraction array
                  if (!u)
                    six_part_msg.push(obj)
                } else if (obj.msg_part[1] == '2') {
                  if(system_task_const.MODE_DEBUG)
                    console.log("second part in 6 to 2")
                  if (!u)
                    six_part_msg.push(obj)
                } else if (obj.msg_part[1] == '3') {
                  if(system_task_const.MODE_DEBUG)
                    console.log("third part in 6 to 3")
                  if (!u)
                    six_part_msg.push(obj)
                }
                else if (obj.msg_part[1] == '4') {
                  if(system_task_const.MODE_DEBUG)
                    console.log("four part in 6 to 4")
                  if (!u)
                    six_part_msg.push(obj)
                }
                else if (obj.msg_part[1] == '5') {
                  if(system_task_const.MODE_DEBUG)
                    console.log("five part in 6 to 5")
                  if (!u)
                    six_part_msg.push(obj)
                }
                else if (obj.msg_part[1] == '6') {
                  if(system_task_const.MODE_DEBUG)
                    console.log("six part in 6 to 6")
                  if (!u)
                    six_part_msg.push(obj)
                }
                ///////////////////
                
                let res_obj = six_part_msg.filter(x => x.sender == obj.sender
                  && x.rcvr == obj.rcvr && x.time.format('HH:mm:ss').localeCompare(obj.time.format('HH:mm:ss')) == 0)

                let should_i_sent = false
                if(obj.rcvr.substr(0,1) == 'f'){
                  if(system_task_const.MODE_DEBUG)
                    console.log("broadcast msg rcvd")
                  should_i_sent = true
                }else if(obj.rcvr.substr(0,1) == "f"){
                    
                  let chk = all_rcvr.find(x=> x.uid == obj.rcvr)
           
                  if(chk){//group found
                    var str_array = chk.members.split(',');
                    if(str_array.length > 0){
                      if(str_array.find(x=> x.localeCompare(my_id) == 0) ){
                
                        should_i_sent = true
                      }else{
                     
                      }
                    }
                  }else{
                    //console.log("Not Part of the group")
                  }
                }else{// One to One msg
                  //console.log("One to One msg rcvd")
                  if(obj.rcvr == my_id){
                    //console.log("I am The reciever")
                    should_i_sent = true
                  }
                }
                if(should_i_sent){
                    if(!u){
                      if (res_obj && res_obj.length == 6 ){//&& chk_duplicate < 4) { //both part there
                        if(system_task_const.MODE_DEBUG)
                          console.log("Six part message all six found")
                        if(res_obj.find(x => x.msg_part == "61") && res_obj.find(x => x.msg_part == "62")
                        && res_obj.find(x => x.msg_part == "63") && res_obj.find(x => x.msg_part == "64") 
                        && res_obj.find(x => x.msg_part == "65") && res_obj.find(x => x.msg_part == "66") ){
                          // all part found in 3 part message
                          // Decrypt
                          let aes_enc_key = enc_key_saved
                          let tr = res_obj.find(x => x.msg_part == "61").text +
                          res_obj.find(x => x.msg_part == "62").text + res_obj.find(x => x.msg_part == "63").text
                          + res_obj.find(x => x.msg_part == "64").text + res_obj.find(x => x.msg_part == "65").text
                          + res_obj.find(x => x.msg_part == "66").text
                          var bytes  = CryptoJS.AES.decrypt(tr,  aes_enc_key);
                          var f_text = bytes.toString(CryptoJS.enc.Utf8)
                          if(system_task_const.MODE_DEBUG)
                            console.log("decrypted text is-",aes_enc_key,tr,bytes.toString(CryptoJS.enc.Utf8))//,decryptedData)
                          if(f_text){
                            data_models_api.all_msg_models_create(obj,rcvrlist,f_text, mainWindow )
                          
                            //console.log("f text is -- ",f_text)
                            //let newo = four_part_msg.filter(x => x.sender !== obj.sender
                                //&& x.rcvr !== obj.rcvr && x.time.format('HH:mm:ss').localeCompare(obj.time.format('HH:mm:s')) == 0)
                            //four_part_msg = newo
                            play_sound()
                          }
                        }
                      }
                    }
                }else{
              
                }
              }//end of Six part msg
              //////////////////////
      
            }// crc kermit check end
            ///////////////////////// end save to db
          }// if condition for duplicate end
          else {
            if(system_task_const.MODE_DEBUG)
              console.log("msg rly already rcvd")
            //console.log("message in message array already rcvd")
          }
      
      
          //////////////////// relay data
          var relay_delay
          if(current_mesh_state){
                if (kermit.localeCompare(obj.crc) == 0 && current_mesh_state == "1") {// only relay if crc is ok
                  if (prev_msg_relay.length == 0) {
                    prev_msg.push(obj.raw_data)
                    let time_to__ = moment()
                    prev_msg_relay.push({obj: obj.raw_data,total_rly:0,start_tme: time_to__,last_tme: time_to__ })
                    let new_data
                    if(is_14){
                      //new_data = obj.raw_data
                      new_data = "14" + my_id + obj.raw_data.substr(2)
                      relay_delay = 0
                    }else{
                      if(obj.rcvr == my_id){
                        new_data = "14" + my_id + obj.raw_data.substr(2)
                      }else{
                        //new_data = obj.raw_data
                        new_data = "14" + my_id + obj.raw_data.substr(2)            
                      }
                      if(obj.msg_part.substr(0,1) == "5" || obj.msg_part.substr(0,1) == "6"){
                        relay_delay = (selected_sf_time * 7) + ((parseInt(obj.msg_part.substr(1))- 1) * (selected_sf_time + selected_sf_time))
                      }else if(obj.msg_part.substr(0,1) == "4"){
                        relay_delay = (selected_sf_time * 4) + ((parseInt(obj.msg_part.substr(1))- 1) * (selected_sf_time + selected_sf_time))
                    
                      }
                      else if(obj.msg_part.substr(0,1) == "3"){
                        relay_delay = (selected_sf_time * 3) + ((parseInt(obj.msg_part.substr(1))- 1) * (selected_sf_time + selected_sf_time))            
                      }
                      else {
                        relay_delay = (selected_sf_time * 2) + ((parseInt(obj.msg_part.substr(1))- 1) * (selected_sf_time + selected_sf_time))          
                      }
                    }
                    // relay//
                    //
                    if(obj.msg_part.substr(0,1) == "5" || obj.msg_part.substr(0,1) == "6"){
                      ///////////////////////
                      setTimeout(function () { 
                        if(system_task_const.MODE_DEBUG)
                          console.log("Writing 5 or 6 part relay")
                        main_f.write_to_lora(new_data) //relay
                      }, relay_delay)
                    }else{
                      setTimeout(function () { 
                        if(system_task_const.MODE_DEBUG)
                          console.log("relay 4 part")
                        main_f.write_to_lora(new_data)
                      },relay_delay)//2600)
                    }
                    prev_msg_permanent.push(obj.raw_data)
                  }
                  else {
                    //if (!prev_msg.find(x => x == obj.raw_data)) {
                      prev_msg.push(obj.raw_data)

                        let new_data
                        if(is_14){
                          //new_data = obj.raw_data
                          new_data = "14" + my_id + obj.raw_data.substr(2)
                          relay_delay = 0
                        }else{
                          if(obj.rcvr == my_id){
                            new_data = "14" + my_id + obj.raw_data.substr(2)
                          }else{
                            new_data = "14" + my_id + obj.raw_data.substr(2)
                          }
                          if(obj.msg_part.substr(0,1) == "5" || obj.msg_part.substr(0,1) == "6"){
                            relay_delay = (selected_sf_time * 7) + ((parseInt(obj.msg_part.substr(1))- 1) * (selected_sf_time + selected_sf_time))
                          }else if(obj.msg_part.substr(0,1) == "4"){
                            relay_delay = (selected_sf_time * 4) + ((parseInt(obj.msg_part.substr(1))- 1) * (selected_sf_time + selected_sf_time))
                        
                          }
                          else if(obj.msg_part.substr(0,1) == "3"){
                            relay_delay = (selected_sf_time * 3) + ((parseInt(obj.msg_part.substr(1))- 1) * (selected_sf_time + selected_sf_time))            
                          }
                          else {
                            relay_delay = (selected_sf_time * 2) + ((parseInt(obj.msg_part.substr(1))- 1) * (selected_sf_time + selected_sf_time))          
                          }
                        }
                      /// relay
                        ////
                        var ok_to_relay = false
                        var aui = prev_msg_relay.find(x => x.obj == obj.raw_data)
                        if (!aui) {
                          ok_to_relay = true
                        }else{// check time diff
                          if(!is_14){
                            ok_to_relay = true
                          }else{
                            let t_elp_from_last = moment(moment(), 'YYYY/MM/DD HH:mm:ss:SSS').diff(moment(aui.last_tme,'YYYY/MM/DD HH:mm:ss:SSS'))
                            let t_elp_from_start = moment(moment(), 'YYYY/MM/DD HH:mm:ss:SSS').diff(moment(aui.start_tme,'YYYY/MM/DD HH:mm:ss:SSS'))
                            // update last_tme

                            if(t_elp_from_last > 800 && t_elp_from_start < 50000){
                              ok_to_relay = true
                              if(system_task_const.MODE_DEBUG){
                                  console.log("rly time elapsed2--",t_elp_from_start,t_elp_from_last)
                              }
                            }else{
                                console.log("no relayfor subsequentcv")
                              ok_to_relay = false
                            }
                            if(system_task_const.MODE_DEBUG){
                              console.log("rly time elapsed--",t_elp_from_start,t_elp_from_last)
                              console.log("rly time elapsed--",t_elp_from_start,t_elp_from_last)
                            }
                            let new_obj = {obj: aui.obj,total_rly:aui.total_rly,start_tme:aui.start_tme,last_tme: moment() }
                            prev_msg_relay = prev_msg_relay.filter(x => x.obj != obj.raw_data)
                            prev_msg_relay.push(new_obj)
                          }
                        }
                        if(ok_to_relay){
                              if(obj.msg_part.substr(0,1) == "5" || obj.msg_part.substr(0,1) == "6"){
                                  setTimeout(function () { 
                                      if(system_task_const.MODE_DEBUG)
                                      console.log("Writing 5 or 6 part relay")
                                      main_f.write_to_lora(new_data)
                                      //clearprev array
                                      if( new_data.substr(6,2) == "55" || new_data.substr(6,2) == "66"   ){
                                      //prev_msg = []
                                      //console.log("cleared")
                                      }
                                  },relay_delay)
                                  
                              }else{
                                  setTimeout(function () { 
                                  if(system_task_const.MODE_DEBUG)
                                      console.log("relay 4 part")
                                  main_f.write_to_lora(new_data)
                                  //clearprev arr
                                  if(new_data.substr(6,2)  == "22" || new_data.substr(6,2)  == "33" ||
                                      new_data.substr(6,2) == "44"   ){
                                      //prev_msg = []
                                  }
                                  },relay_delay)//2600)
                              }
                          }
                      //}
                      //else{
                        //console.log("already relayed")
                      //}
                    
                    }
                  
                    if (!prev_msg_relay.find(x => x.obj == obj.raw_data)) {
                      let time_to__ = moment()
                      prev_msg_relay.push({obj: obj.raw_data,total_rly:0,start_tme: time_to__,last_tme: time_to__ })
                    }
                    if (!prev_msg_permanent.find(x => x == obj.raw_data)) {
                      prev_msg_permanent.push(obj.raw_data)
                    }
                  }else{
                    console.log("Mesh is turned off")
                  }
          }
            
          

    },5)
    

}
var clear_prev_rly_cnt = 0
clearPrev_msg_interval = setInterval(function(){
  clear_prev_rly_cnt++
  if(clear_prev_rly_cnt > 50){
    clear_prev_rly_cnt = 0
    prev_msg_relay = []
  }
  prev_msg = []
},8800)
/*

module.exports.ack_process = function(found, original_dat, obj, set_online,mainWindow){
  console.log("found.ack_from--", found.ack_from, obj.sender)
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
    //console.log("didnot came to this 2..", narr, new_obj)
    set_ack_sent_to_web(new_ack, set_online, original_dat, mainWindow)

  } else { // two part or three so double ack needed
    //ack_msg_arr.push({original_dat: original_dat, sender:obj.sender})
    let finres = resend_arr.filter(x => (x.args.substr(2, 2) != '21' || x.args.substr(2, 2) != '22') &&
      x.args.substr(12, 6) == original_dat.substr(12, 6)) /// check if time is same
    console.log("finres isss", finres)
    if (finres.length == 2) {
      let new_ack = 0
      finres[0].ack_from.map((mapval, index) => {
        let temp_obj1 = finres[1].ack_from.find(x => x == mapval)
        if (temp_obj1) {
          // one ack found
          console.log("complete ack from --", mapval)
          new_ack++
        }
        if (index == finres[0].ack_from.length - 1) {
          set_ack_sent_to_web(new_ack, set_online, original_dat,mainWindow)
        }
      })
    }
    let finres2 = resend_arr.filter(x => (x.args.substr(2, 2) != '31' || x.args.substr(2, 2) != '32' || x.args.substr(2, 2) != '33') &&
      x.args.substr(12, 6) == original_dat.substr(12, 6)) /// check if time is same

    if (finres2.length == 3) {
      let new_ack = 0
      finres2[0].ack_from.map((mapval, index) => {
        let temp_obj1 = finres2[1].ack_from.find(x => x == mapval)
        let temp_obj2 = finres2[2].ack_from.find(x => x == mapval)
        if (temp_obj1 && temp_obj2) {
          console.log("complete ack from part3 --", mapval)
          new_ack++
        }
        if (index == finres2[0].ack_from.length - 1) {
          set_ack_sent_to_web(new_ack, set_online, original_dat,mainWindow)
        }
      })
    }
  }// two part check ended
}

//////////////////
function set_ack_sent_to_web(new_ack, set_online, original_dat,mainWindow) {
  if (new_ack < 4) {
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
  }
}

*/