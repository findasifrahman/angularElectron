module.exports.LORA_COM_PORT = '/dev/tty_d'
module.exports.VOICE_COM_PORT = '/dev/tty_v'
module.exports.GPS_COM_PORT = '/dev/ttyAMA0'

module.exports.LORA_BAUD_RATE = 9600
module.exports.GPS_BAUD_RATE = 9600
module.exports.HARD_STM_BAUD_RATE = 57600

module.exports.LONG_MSG_INBOX_SHOW_LIMIT = 60 //unit in days , how many long msg to show before archieve
module.exports.SHORT_MSG_SHOW_LIMIT = 60 // number of short msg to show in chat window

module.exports.GPS_SEND_DELAY_COUNT = 1 //1 = 7sec 5 * 7000 = 35 SEC
module.exports.MULTIPLE_GPS_SEND_INTERVAL = 350 // in ms
module.exports.NUM_OF_GPS_DATA_SEND_AT_1_TIME = 2
module.exports.SHOULD_LORA_RESET = true
module.exports.LORA_RESET_ON_NO_RCV_CNT = 6
module.exports.GPS_NOT_WRITE_AT_SHORT_MSG_RCV = false
module.exports.GPS_NOT_WRITE_AT_SHORT_MSG_XMIT = true
module.exports.GPS_NOT_WRITE_AT_LONG_MSG_XMIT = true
module.exports.GPS_NOT_WRITE_AT_LONG_MSG_RCV = true

module.exports.DEVICE_OFFLINE_LIMIT = 8 // in min , devive will show offline if no data between this time

module.exports.GPS_RELAY_TIME_AFTER_RCV = 1//700 // ms

// after every 7sec == 7000ms prev_msg arr will be cleared. for new relay

module.exports.TOTAL_NETWORK_SHIP = 60 // total max ship is 60

module.exports.AUTO_GPS_SEND_INTERVAL_DELAY = 100 // in ms , this is setinterval delay time in mainwindow

module.exports.SELECTED_SF_TIME = 350 // in ms

module.exports.GPS_DATA_DESTROY_DATE = 1
module.exports.BNCG_DATA_CHAN = "6"
module.exports.NUMBER_OF_REPEAT_TEXT_MESSAGE = 5 //howmany time txtmsg will repaet in a single send
module.exports.MODE_DEBUG = false
module.exports.MODE_DEBUG_GPS = false