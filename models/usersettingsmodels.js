/*create table all_msg(id serial primary key,mleft text,mright text,
    sender text,rcvr text,enc text,msg_serial text,len text,text text,
    showtime text,rawtime text);
*/
const Sequelize = require('sequelize');
const dbcontext = require('../dbcontext');
const usermodel = dbcontext.define('user_settings', {
    // attributes
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    isgps: {
        type: Sequelize.STRING
    },
    islowrssidrop: {
        type: Sequelize.STRING
    },
    

  }, {
    // options
  }
);


module.exports = usermodel;