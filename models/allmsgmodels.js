/*create table all_msg(id serial primary key,mleft text,mright text,
    sender text,rcvr text,enc text,msg_serial text,len text,text text,
    showtime text,rawtime text);
*/
const Sequelize = require('sequelize');
const dbcontext = require('../dbcontext');
const usermodel = dbcontext.define('all_msg', {
    // attributes
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mleft: {
        type: Sequelize.STRING
    },
    mright: {
        type: Sequelize.STRING
    },
    sender: {
        type: Sequelize.STRING
    },
    rcvr: {
        type: Sequelize.STRING
    },
    enc: {
        type: Sequelize.STRING
    },
    msg_serial: {
        type: Sequelize.STRING
    },
    len: {
        type: Sequelize.STRING
    },
    text: {
        type: Sequelize.STRING
    },
    showtime:{
        type: Sequelize.STRING
    },
    rawtime:{
        type: Sequelize.STRING
    }

  }, {
    // options
  }
);


module.exports = usermodel;