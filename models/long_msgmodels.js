/*create table all_msg(id serial primary key,mleft text,mright text,
    sender text,rcvr text,enc text,msg_serial text,len text,text text,
    showtime text,rawtime text);
*/
const Sequelize = require('sequelize');
const dbcontext = require('../dbcontext');
const usermodel = dbcontext.define('long_msg', {
    // attributes
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sender: {
        type: Sequelize.STRING
    },
    rcvr: {
        type: Sequelize.STRING
    },
    mtime: {
        type: Sequelize.STRING
    },
    mtext: {
        type: Sequelize.STRING
    },
    isinbox: {
        type: Sequelize.STRING
    },
    isdraft: {
        type: Sequelize.STRING
    },
    issent: {
        type: Sequelize.STRING
    },
    isunsent: {
        type: Sequelize.STRING
    },
    isold:{
        type: Sequelize.STRING
    },
    other:{
        type: Sequelize.STRING
    },
  }, {
    // options
  }
);


module.exports = usermodel;