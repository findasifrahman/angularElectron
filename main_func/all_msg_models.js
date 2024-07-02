var all_msg_models = require('../models/allmsgmodels')
var moment = require('moment');
module.exports.all_msg_models_create = function(obj,rcvrlist,mtext,mainWindow){
    let mod_obj = {
        mleft: true, mright: false,
        sender_uid: obj.sender,
        sender: rcvrlist.find(x => x.uid == obj.sender).ship,
        rcvr: obj.rcvr,
        enc: obj.enc, len: obj.len, text: mtext,
        showtime: moment(obj.time).format("DDHHmm MMM YY"),
        rawtime: obj.time
      }
      return new Promise((resolve, reject) => {
          all_msg_models.create({
              mleft: true, mright: false,
              sender: rcvrlist.find(x => x.uid == obj.sender).ship,
              rcvr: obj.rcvr,
              enc: obj.enc, msg_serial: obj.msg_serial, len: obj.len,
              text: mtext,
              showtime: moment(obj.time).format("DDHHmm MMM YY"),
              rawtime: obj.time.format('YYYY-MM-DD HH:mm:ss')
            }).then(result => { 
                all_msg_models.findAll({
                  raw: true,
                  limit: 30,
                  order: [['id', 'DESC']]
                  })
                .then(result => { //data:result
                  resolve({msg:result,mod_obj: mod_obj});
                  mainWindow.webContents.send('text_msg', { msg: result, new_msg: mod_obj });
                })
            })
        })
}
