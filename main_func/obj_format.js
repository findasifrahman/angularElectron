
var moment = require('moment');


module.exports.process_direct_text_msg = function(data){
    // obj format = start(13) , msg_part(31,21,11,32..) ,sender(4 byte) , 
    //  rcvr (4 byte) , time(moment(yyyy-mm-dd) + 6 byte hhmmss)
    //  ,len (2 byte) , text, crc (4 byte) , end (91)
    // ex : 13110001ffff 153048 03 goo fda891
    let strl = data.substr(18, 2)
    let ll = parseInt(Number("0x" + strl), 10)
    return{
        raw_data: data.substr(0, 20 + 6 + ll), start: data.substr(0, 2),
        msg_part: data.substr(2, 2),
        sender: data.substr(4, 4), rcvr: data.substr(8, 4),
        time: moment(moment().format('YYYY-MM-DD') + ' ' + data.substr(12, 2) + ':' + data.substr(14, 2) + ':' + data.substr(16, 2),
          'YYYY-MM-DD HH:mm:ss'),//parseInt(Number("0x" + data.substr(12,8)),10),
        enc: "",//data.substr(18, 4), 
        len: strl,
        text: data.substr(20, parseInt(Number("0x" + strl), 10)),
        crc: data.substr(20 + parseInt(Number("0x" + strl), 10), 4),
        end: data.substr(24 + parseInt(Number("0x" + strl), 10), 2),
        //rawtime: data.substr(12,8)
      }
} 
/*
 text message ack format start(14), sender(4 byte) ,msg_part(31,21,11,32..),
    original_sender( 4 byte), rcvr (4 byte), time(moment(yyyy-mm-dd) + 6 byte hhmmss),
    enc (4 byte) + len (2 byte) , text , crc (4 byte), end(91)
    ex: 140002110001ffff150955018804dsds912591
*/
module.exports.text_msg_ack_relay_rcvd = function(data){

    let strl = data.substr(22, 2)
    let ll = parseInt(Number("0x" + strl), 10)

    return {
      raw_data: data.substr(0, 24 + 6 + ll),
      start: data.substr(0, 2),
      msg_part: data.substr(2 + 4, 2),
      sender: data.substr(2, 4), original_sender: data.substr(8, 4),
      rcvr: data.substr(8 + 4, 4),
      time: moment(moment().format('YYYY-MM-DD') + ' ' + data.substr(16, 2) + ':' + data.substr(18, 2) + ':' + data.substr(20, 2),
        'YYYY-MM-DD HH:mm:ss'),//parseInt(Number("0x" + data.substr(12,8)),10),
      enc: "",//data.substr(18 + 4, 4), 
      len: strl,
      text: data.substr(20 + 4, parseInt(Number("0x" + strl), 10)),
      crc: data.substr(20 + 4 + parseInt(Number("0x" + strl), 10), 4),
      end: data.substr(24 + 4 + parseInt(Number("0x" + strl), 10), 2),
      //rawtime: data.substr(12,8)
    }
}
/*
    No gps data = start(15), sender (4 byte), 0 (lat), 0 (long), '91'
    ex : 15 0002 0 0 91
*/
module.exports.no_gps_data_process = function(data){
    return { 
            raw_data: data.substr(0, 10), start: data.substr(0, 2),
            sender: data.substr(2, 4),
            time: moment().format('YYYY-MM-DD HH:mm:ss'),
             end: data.substr(8, 2)
    }
}
/*
    valid gps format : start(15), sender(4 byte), 23.85567 (lat), 
        90.87254 (long), end(91)
    ex - 15 0001 23.81238 90.96785 91
*/
module.exports.valid_gps_data_process = function(data){
    return {
        raw_data: data.substr(0, 24), start: data.substr(0, 2),
        sender: data.substr(2, 4),
        lat: data.substr(6, 8), long: data.substr(14, 8),
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
        end: data.substr(22, 2)
    }
}
/*
    start (15), message_type (l1), no_of_part: 2 byte, 
    sender (4 byte), rcvr (4 byte) ,
    time : HHmmss(6 byte), enc : 0, crc (4 byte) , end(91)
    ex: 15 l1 03 0001 0002 230307 0188 eb32 91
*/
module.exports.long_msg_start_config_process = function(data){
    return{
        raw_data: data.substr(0,26),start: data.substr(0, 2), num_of_part: data.substr(4, 2),
        sender: data.substr(6, 4), rcvr: data.substr(10, 4), time: data.substr(14, 6),
        enc: "", crc: data.substr(20, 4), end: data.substr(24, 2)
    }
}
module.exports.long_msg_start_config_create = function(data){
    return { }
}
/*
    start(15), message_type (l3), sender (4 byte), rcvr (4 byte),
    crc: (4 byte), end: 91
*/
module.exports.long_msg_start_config_ack_process = function(data){
    return  {
        raw_data: data.substr(0,18),start: data.substr(0, 2), 
        sender: data.substr(4, 4),
        rcvr: data.substr(8, 4), crc: data.substr(12, 4), 
        end: data.substr(16, 2)
    }
}
module.exports.long_msg_start_config_ack_create = function(obj,my_id){
    return '15' + 'l3' + my_id + obj.sender + obj.crc + '91' // handshake ack }
}
/*
    long_msg strib format
    ex: "15" + "l5" + "sender(4)" + part_no(2) + length(2) + 
        main_str + crc_kermit(4) + "91"
*/
module.exports.long_msg_string_process = function(data){
    return {
        raw_data: data.substr(0,12 + parseInt(data.substr(10, 2)) + 6),
        start: data.substr(0, 2), sender: data.substr(4, 4),
        part_no: data.substr(8, 2), length: data.substr(10, 2), text:
        data.substr(12, parseInt(data.substr(10, 2))), crc: data.substr(12 + parseInt(data.substr(10, 2)), 4),
        end: data.substr(12 + 4 + parseInt(data.substr(10, 2)), 2)
      }
}
/*
ack for long string
    15 l7 sender(4) rcvr(4) part_no(2) crc(4) end(91) 
*/
module.exports.long_msg_string_ack_provess = function(data){
    return {
        raw_data: data.substr(0,20),
        start: data.substr(0,2), sender: data.substr(4,4),
        rcvr: data.substr(8,4), part_no: data.substr(12,2),
        crc: data.substr(14,4),
        end:data.substr(18,2)
    }
}
/*
*/
module.exports.long_msg_string_ack_create = function(obj, my_id){
    return "15" + "l7" + my_id + obj.sender + obj.part_no + obj.crc + "91"
}
/*
*/
module.exports.long_msg_termination_create = function(obj,my_id,mtime,mcrc){
    return "15" + "l8" + my_id + obj.sender + mtime + mcrc + "91"
}
/*
    15 l8 sender(4) rcvr(4) mtime(6 - long data start time) 
        crc(4 - long data start config crc)
        91
*/
module.exports.long_msg_termination_process = function(data){
    return {
        raw_data: data.substr(0,24),
        start: data.substr(0,2), sender: data.substr(4,4),
        rcvr: data.substr(8,4), mtime: data.substr(12,6),
        crc: data.substr(18,4),
        end:data.substr(22,2)
    }
}