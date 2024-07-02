


var gps_data_models = require('../models/gps_datamodels')
var curr_chan_models = require('../models/curr_chanmodels')
var voice_set_models = require('../models/voice_setmodels')
var usergroup_models = require('../models/usergroupmodels')
var all_msg_models = require('../models/allmsgmodels')
var user_Settings_models = require('../models/usersettingsmodels')
var my_id_model = require('../models/myidmodels')
var data_enc_models = require('../models/dataencryptmodel')
var bncg_enc_models = require('../models/bncg_encryptmodels')
var voice_enc_models = require('../models/voiceencryptmodels')
var allship_models = require('../models/allusermodels')
var long_msg_models = require('../models/long_msgmodels')
var curr_data_chan_models = require('../models/curr_datachanmodels')
var data_freq_models = require('../models/datafreqsetmodels')
var status_msg_models = require('../models/statusmsgmodels')
var mesh_state_models = require('../models/mesh_statemodels')
const system_task_const = require('../constants/system_task')

var moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const LONG_MSG_INBOX_SHOW_LIMIT = system_task_const.LONG_MSG_INBOX_SHOW_LIMIT//1
const SHORT_MSG_SHOW_LIMIT = system_task_const.SHORT_MSG_SHOW_LIMIT //60

module.exports.get_my_id_obj = function(){
  return new Promise((resolve,reject) =>{
    my_id_model.findAll({raw:true}).then(result=>{ 
      my_id_obj = { id: result[0].id, uid: result[0].uid, ship: result[0].ship }
      resolve(my_id_obj)
    })
  })
}
module.exports.get_data_enc = function(){
  return new Promise((resolve,reject)=>{
    data_enc_models.findAll({raw:true}).then(result=>{
       resolve(result[0].key)
    })
  })
}
module.exports.get_bncg_key = function(){
  return new Promise((resolve,reject)=>{
    bncg_enc_models.findAll({raw:true}).then(result=>{
       resolve(result[0].key)
    })
  })
}
module.exports.update_data_enc = function(args){
  return new Promise((resolve,reject)=>{
    data_enc_models.update({
      key: args.key
    },{where:{ id:args.id}}).then(result => {
      resolve(result)
    })
      .catch(err => { console.log(err);reject(err) });
  })
}
module.exports.update_bncg_enc = function(args){
  return new Promise((resolve,reject)=>{
    bncg_enc_models.update({
      key: args.key
    },{where:{ id:args.id}}).then(result => {
      resolve(result)
    })
      .catch(err => { console.log(err);reject(err) });
  })
}
module.exports.get_voice_enc = function(){
  return new Promise((resolve,reject)=>{
    voice_enc_models.findAll({raw:true}).then(result=>{
      resolve(result[0].key)
    })
  })
}
module.exports.update_voice_enc = function(args){
  return new Promise((resolve,reject)=>{
    voice_enc_models.update({
      key: args.key
    },{where:{ id:args.id}}).then(result => {
      resolve(result)
    })
      .catch(err => { console.log(err);reject(err) });
  })
}
module.exports.get_all_ship = function(){
  return new Promise((resolve,reject)=>{
    allship_models.findAll(
      {
        raw:true,
        order: [['ship', 'ASC']]
      }
      ).then(result=>{
      resolve(result)
    })
  })
}
module.exports.update_user_pin = function(args){
  //console.log("user pin srgs", args)
  let pinval
  if(args.pin == true || args.pin == "true"){
    pinval = 1
  }else{
    pinval = 0
  }
  return new Promise((resolve,reject)=>{
    allship_models.update({pin: pinval},
      { where: { uid: args.uid }})
      .then(result=>{
        resolve(result)
      }) .catch(err => { console.log(err); });
  })
}
module.exports.usersettings_get_all = function(){
  return new Promise((resolve, reject) => {
    user_Settings_models.findAll({ raw: true }).then(result => {
      resolve(result)
    }).catch(err => { console.log(err) });
  })
}
module.exports.updateuserSet = function(args){
  return new Promise((resolve,reject) =>{
    user_Settings_models.update({
      isgps: args.isgps.toString()
    }, { where: { id: parseInt(args.id) } }).then(result => {
      resolve(result)
      //console.log("update success user set-")
    })
      .catch(err => { console.log(err); });
  })
}
// update status message state
module.exports.update_status_msg_state = function(args){
  return new Promise((resolve,reject) =>{
    status_msg_models.update({
      state: args.state.toString()
    }, { where: { id: parseInt(args.id) } }).then(result => {
      resolve(result)
      //console.log("update success status msg-")
    })
      .catch(err => { console.log(err); });
  })
  
}
// updatw mesh msg state == mesh_state_models
module.exports.update_mesh_state = function(args){
  return new Promise((resolve,reject) =>{
    mesh_state_models.update({
      state: args.state.toString()
    }, { where: { id: parseInt(args.id) } }).then(result => {
      resolve(result)
      //console.log("update success status msg-")
    })
      .catch(err => { console.log(err); });
  })
}
// get all status msg
module.exports.status_msg_get_all = function(){
  return new Promise((resolve, reject) => {
    status_msg_models.findAll({ raw: true }).then(result => {
      resolve(result)
    }).catch(err => { console.log(err) });
  })
}
// get all mesh state
module.exports.mesh_msg_get_all = function(){
  return new Promise((resolve, reject) => {
    mesh_state_models.findAll({ raw: true }).then(result => {
      resolve(result)
    }).catch(err => { console.log(err) });
  })
}
module.exports.usergroup_get_all = function(){
  return new Promise((resolve, reject) => {
    usergroup_models.findAll({ raw: true }).then(result => {
      resolve(result)
    }).catch(err => { console.log(err) });
  })
}
module.exports.gps_data_create = function(obj){
  //console.log("gps create obj is--", obj)
    gps_data_models.create({
        uid: obj.sender,
        mtime: moment().format("YYYY-MM-DD HH:mm:ss"),
        //mtime: moment.unix(parseInt(Number("0x" + data.substr(8+len+2+len,8)),10)).format("YYYY-MM-DD HH:mm:ss"),
        lat: obj.lat, long: obj.long, other1: "", other2: "", other3: ""
      }).then(result => {
        if(system_task_const.MODE_DEBUG)
          console.log("saved gps data")
      }).catch(err => { console.log(err); });
}

module.exports.gps_data_get_all = function(){
  const TODAY_START = new Date(moment().startOf('day').add(6, 'hours'))//new Date().setHours(0, 0, 0, 0);
  const NOW_N = new Date(moment().add(6, 'hours'))
  return new Promise((resolve, reject) => {
    gps_data_models.findAll({
      where: {
        mtime: {
          [Op.gt]: TODAY_START,
          [Op.lt]: NOW_N
        }
      },
      raw: true,
      //limit:1000,
      order: [['mtime', 'ASC']]
    }).then(result_gps => {
      resolve(result_gps);
    })
  })
}
module.exports.only_last_gps_pos = function(){
  var arrgps = []
  const TODAY_START = new Date(moment().startOf('day').add(6, 'hours'))//new Date().setHours(0, 0, 0, 0);
  const NOW_N = new Date(moment().add(6, 'hours'))

  return new Promise((resolve, reject) => {

    my_id_model.findAll({raw:true}).then(my_id_obj=>{ 
            
      gps_data_models.findOne({
        where: {
          uid:   my_id_obj[0].uid,//req.query.uid
          mtime:{
            [Op.gt]: TODAY_START,
            [Op.lt]: NOW_N
          }
        },
        order: [ [ 'mtime', 'DESC' ]],
        raw:true
      }).then(function(resu){
        if(resu)
          arrgps.push(resu)
        allship_models.findAll({raw:true}).then(allship=>{
          allship.map((shipval,index)=>{
            gps_data_models.findAll({
              where: {
                uid: shipval.uid,//req.query.uid
                mtime:{
                  [Op.gt]: TODAY_START,
                  [Op.lt]: NOW_N
                }
              },
              raw:true
            }).then(function(allresu){
              //console.log(allresu)
              //if(allresu.length > 2){
                gps_data_models.findOne({
                  where: {
                    uid: shipval.uid,//req.query.uid
                    mtime:{
                      [Op.gt]: TODAY_START,
                      [Op.lt]: NOW_N
                    }
                  },
                  raw:true,
                  order: [ [ 'mtime', 'DESC' ]]
                }).then(function(resu){
                  if(resu && allresu.length > 3)
                    arrgps.push(resu)
                  if(index == (allship.length -1)){            
                    //console.log("promise of last known gps resolved,", arrgps)
                    resolve(arrgps)
                    
                  }
                })   
              
            })
              
            /*gps_data_models.findOne({
              where: {
                uid: shipval.uid,//req.query.uid
                mtime:{
                  [Op.gt]: TODAY_START,
                  [Op.lt]: NOW_N
                }
              },
              raw:true,
              order: [ [ 'mtime', 'DESC' ]]
            }).then(function(resu){
              if(resu)
                arrgps.push(resu)
              if(index == (allship.length -1)){            
                //console.log("promise of last known gps resolved,", arrgps)
                resolve(arrgps)
                
              }
            }) */       
          })
          
        })// end of all ship model last known gps
        //
      })
    })
  })
}
module.exports.gps_data_get_single = function(uidval){
  const TODAY_START = new Date(moment().startOf('day').add(6, 'hours'))//new Date().setHours(0, 0, 0, 0);
  const NOW_N = new Date(moment().add(6, 'hours'))
  return new Promise((resolve, reject) => {
    gps_data_models.findAll({
      where: {
        mtime: {
          [Op.gt]: TODAY_START,
          [Op.lt]: NOW_N
        },
        uid: uidval
      },
      raw: true,
      //limit:1000,
      order: [['mtime', 'ASC']]
    }).then(result_gps => {
      resolve(result_gps);
    })
  })
}
module.exports.curr_chan_models = function(){
  return new Promise((resolve, reject) => {
    curr_chan_models.findAll({ raw: true }).then(result => {
      //my_id_obj = {id:result[0].id,uid:result[0].uid,ship:result[0].ship}
      //console.log("Current channel-", result[0], result)
      resolve(result)
    }).catch(err => { console.log(err) });
  })
}
module.exports.curr_data_chan_models = function(){
  return new Promise((resolve, reject) => {
    curr_data_chan_models.findAll({ raw: true }).then(result => {
      //my_id_obj = {id:result[0].id,uid:result[0].uid,ship:result[0].ship}
      //console.log("Current channel-", result[0], result)
      resolve(result)
    }).catch(err => { console.log(err) });
  })
}
//
module.exports.data_freq_models_update = function(args){
  //console.log("data freq updation--", args)
  return new Promise((resolve, reject) =>{
    data_freq_models.update({
      frequency: args.frequency
    }, { where: { channel_id: args.channel_id } }).then(result => {
      //console.log("update data success-")
      data_freq_models .findAll({ raw: true }).then(result =>{
        resolve(result)
      }).catch(err => { console.log(err); });
      //resolve(args.channel_id )
      //mainWindow.webContents.send('update_success_freq_custom', { msg: true });
    }).catch(err => { reject(false) });
  })
}
//
module.exports.curr_data_chan_update = function(channel_id){
  return new Promise((resolve, reject) => {// only first row
    curr_data_chan_models.update({channel_id},{where:{id:1}}).then(result => {
      //my_id_obj = {id:result[0].id,uid:result[0].uid,ship:result[0].ship}
      //console.log("Current channel-", result[0], result)
      resolve(result)
    }).catch(err => { console.log(err) });
  })
}
module.exports.curr_chan_update = function(channel_id,frequency){
  return new Promise((resolve, reject) =>{
    curr_chan_models.update({
      channel_id, frequency
    }, { where: { id: 3 } }).then(result => {
      resolve(result)
      //console.log("update success ch",)
    }).catch(err => { console.log(err); });
  })
}
module.exports.voice_set_models = function(){
  return new Promise((resolve, reject) =>{
    voice_set_models.findAll({ raw: true }).then(result =>{
      resolve(result)
    }).catch(err => { console.log(err); });
  })
}
module.exports.data_freq_get_all = function(){
  return new Promise((resolve, reject) =>{
    data_freq_models .findAll({ raw: true }).then(result =>{
      resolve(result)
    }).catch(err => { console.log(err); });
  })
}
module.exports.voice_set_models_update = function(args){
  return new Promise((resolve, reject) =>{
    voice_set_models.update({
      frequency: args.frequency
    }, { where: { channel_id: args.channel_id } }).then(result => {

      resolve(true)
      //mainWindow.webContents.send('update_success_freq_custom', { msg: true });
    }).catch(err => { reject(false) });
  })
}
module.exports.get_all_msg = function(){
 
  return new Promise((resolve,reject)=>{
    all_msg_models.findAll({
      raw: true,
      limit:  SHORT_MSG_SHOW_LIMIT,
      order: [['id', 'DESC']]
    }).then(result=>{
      resolve(result)
    }).catch(err=>{reject(err) })
  })
}
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
              if(system_task_const.MODE_DEBUG)
                console.log("msg saved")
              all_msg_models.findAll({
                raw: true,
                limit: SHORT_MSG_SHOW_LIMIT,
                order: [['id', 'DESC']]
                })
              .then(result => { //data:result
                mainWindow.webContents.send('text_msg', { msg: result, new_msg: mod_obj });
                mainWindow.webContents.send('new_text_msg', { msg: result, new_msg: mod_obj });
                resolve({msg:result,mod_obj: mod_obj});

              })
          }).catch(err=>{console.log("errins save--", err)})
      })
}
module.exports.all_msg_Sender_create = function(args){
  return new Promise((resolve,reject)=>{
    all_msg_models.create({
      mleft: args.mleft.toString(), mright: args.mright.toString(),
      sender: args.sender,
      rcvr: args.rcvr,
      enc: args.enc, msg_serial: args.msg_serial, len: args.len,
      text: args.text, showtime: args.showtime,
      rawtime: args.rawtime//parseInt(Number("0x" + args.rawtime,10))
    }).then(result => {
      //console.log("create res- ok txt");
      resolve(result)
    })
  })
}
module.exports.all_msg_find_by_date_group = function(args){
  const _START = new Date(moment(args.dt1).add(6, 'hours'))//new Date().setHours(0, 0, 0, 0);
  const _END = new Date(moment(args.dt2).add(6, 'hours'))//new Date().setHours(0, 0, 0, 0);
  
  return new Promise((resolve,reject)=>{
    all_msg_models.findAll({
      where: { 
        rcvr: args.rcvr,
        rawtime: {
          [Op.gte]:  _START,//new Date(args.dt1),
          [Op.lte]: _END//new Date(args.dt2),
        },
      }, 
      raw: true,
      order: [['id', 'DESC']]

    }).then(result =>{
      resolve(result)
    })
  })
}
module.exports.all_msg_find_by_date_single = function(args,my_id){
  const _START = new Date(moment(args.dt1).add(6, 'hours'))//new Date().setHours(0, 0, 0, 0);
  const _END = new Date(moment(args.dt2).add(6, 'hours'))//new Date().setHours(0, 0, 0, 0);
  return new Promise((resolve,reject)=>{
    all_msg_models.findAll({
      where: { 
        rawtime: {
          [Op.gte]: _START,
          [Op.lte]: _END,
        },
        [Op.or]:[
          {
            [Op.and]:[
              {sender: args.rcvr_name},//args.rcvr,
              {rcvr: my_id}
            ],
          },
          {
            [Op.and]:[
              {sender: my_id},
              {rcvr: args.rcvr_name}
            ]
          },
          {
            [Op.and]:[
              {sender: my_id},
              {rcvr: args.rcvr}
            ]
          }
        ]
      }, 
      raw: true,
      order: [['id', 'DESC']]
  
    }).then(result =>{
      resolve(result)
    })
  })
  
}
module.exports.all_msg_destroy_by_time = function(args){
  const NOW_N = moment(new Date(args.dt1)).add(6, 'hours')
  return new Promise((resolve,reject)=>{
    all_msg_models.destroy({
      where: {
        rawtime: {
          [Op.lte]: new Date(NOW_N)//args.dt1),
        },
      },
      //truncate: true
    }).then(result => {
      if(system_task_const.MODE_DEBUG)
        console.log("success delete")
      resolve(result)
    }).catch(err => { console.log(err) });
  })
}
module.exports.all_msg_destroy = function(){
  return new Promise((resolve,reject)=>{
    all_msg_models.destroy({
      where: {},
      truncate: true
    }).then(result => {
      resolve(result)
    }).catch(err => { console.log(err) });
  })
}
//////////////////////
module.exports.long_msg_destroy_by_id = function(args){
  const END = new Date(moment().subtract(LONG_MSG_INBOX_SHOW_LIMIT, 'days').startOf('day'))//new Date().setHours(0, 0, 0, 0);

  return new Promise((resolve,reject)=>{
    long_msg_models.destroy({
      where: {id : args}//mtime: moment(args).format('YYYY-MM-DD HH:mm:ss') }         
    }).then(result => {
      
      long_msg_models.findAll({
        raw: true,
        //limit: LONG_MSG_INBOX_SHOW_LIMIT,
        order: [['id', 'DESC']],
    
        where: {
          mtime: {
            [Op.gt]: END,
            //[Op.lt]: END
          },
      
        }
      }).then(result => {
            resolve(result)
        })
        .catch(err  => {reject(err)}); 
    })
    .catch(err => {reject(err)});
  })
}
//////////////////////
module.exports.long_msg_get_atchieve = function(args){
  //const START = new Date(moment().subtract(14, 'days').startOf('day'))//new Date().setHours(0, 0, 0, 0);
  const END = new Date(moment().subtract(LONG_MSG_INBOX_SHOW_LIMIT, 'days').startOf('day'))//new Date().setHours(0, 0, 0, 0);
  console.log("end date is ", END)
  return new Promise((resolve,reject)=>{

    long_msg_models.findAll({
      raw: true,
      order: [['id', 'DESC']],
      where: {
        mtime: {
          //[Op.gt]: END,
          [Op.lt]: END
        },
    
      }
    }).then(result => {
      //console.log("archieved msg",result)
      resolve(result)
    })
    .catch(err  => {reject(err)}); 

  })
}
///////////////////////////////
module.exports.long_msg_create = function(args){
  const END = new Date(moment().subtract(LONG_MSG_INBOX_SHOW_LIMIT, 'days').startOf('day'))//new Date().setHours(0, 0, 0, 0);

  return new Promise((resolve,reject)=>{
    let obj = {sender:args.sender, rcvr:args.rcvr, mtext:args.text,mtime:args.mtime,isdraft: args.isDraft
      ,isinbox: args.isinbox,issent: args.issent,isunsent:args.isunsent,isold: args.isold}
    try{
      long_msg_models.create(obj).then(result => {
  
          long_msg_models.findAll({
            raw: true,
            //limit: LONG_MSG_INBOX_SHOW_LIMIT,
            order: [['id', 'DESC']],
         
            where: {
              mtime: {
                [Op.gt]: END,
                //[Op.lt]: END
              },
          
            }
          }).then(result => {
            resolve(result)
           })
        })
      }catch(ex){
        reject(ex)
      
      }
  })
}
module.exports.long_msg_inbox_create = function(tobj){
  const END = new Date(moment().subtract(LONG_MSG_INBOX_SHOW_LIMIT, 'days').startOf('day'))//new Date().setHours(0, 0, 0, 0);

  return new Promise((resolve,reject)=>{
      //////
      try{
        //console.log("saved obj is --", tobj)
        long_msg_models.create(tobj).then(result => {
            if(system_task_const.MODE_DEBUG)
              console.log("Long msg saved");
            long_msg_models.findAll({
              raw: true,
              //limit: LONG_MSG_INBOX_SHOW_LIMIT,
              order: [['id', 'DESC']],
            
              where: {
                mtime: {
                  [Op.gt]: END
                  //[Op.lt]: END
                },
            
              }
            }).then(result => {
              resolve(result)
            })
        })
      }catch(ex){
        if(system_task_const.MODE_DEBUG)
          console.log("long msg save error --", ex)
      }
  })
    
}
module.exports.long_msg_get_all = function(){
  const END = new Date(moment().subtract(LONG_MSG_INBOX_SHOW_LIMIT, 'days').startOf('day'))//new Date().setHours(0, 0, 0, 0);

  return new Promise((resolve,reject)=>{
    long_msg_models.findAll({
      raw: true,
      //limit: LONG_MSG_INBOX_SHOW_LIMIT,
      order: [['id', 'DESC']],
   
      where: {
        [Op.or]:[
          {
            mtime: {
              [Op.gt]: END,
              //[Op.lt]: END
            }
          },
          {isdraft: "1"}
        ]
      }
    
      
    }).then(result => {
      resolve(result)
    })
  })
}
////////////////////////////////////////////////////////
const START = new Date(moment().subtract(14, 'days').startOf('day'))//new Date().setHours(0, 0, 0, 0);
const END = new Date(moment().subtract(system_task_const.GPS_DATA_DESTROY_DATE, 'days').startOf('day'))//new Date().setHours(0, 0, 0, 0);

gps_data_models.destroy({
  where: {
    mtime: {
      //[Op.gt]: START,
      [Op.lt]: END
    },

  },
  //truncate: true
}).then(result => {
  if(system_task_const.MODE_DEBUG)
    console.log("gps_data destroyed")
  const START = new Date(moment().add(14, 'days').startOf('day'))//new Date().setHours(0, 0, 0, 0);
  gps_data_models.destroy({
    where: {
      mtime: {
        [Op.gt]: START
      },
  
    },
    //truncate: true
  }).then(res=>{
    if(system_task_const.MODE_DEBUG)
      console.log("destroy2")
  })
}).catch(err => { console.log(err) });

