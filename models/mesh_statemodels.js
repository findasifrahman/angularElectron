/*create table all_msg(id serial primary key,mleft text,mright text,
    sender text,rcvr text,enc text,msg_serial text,len text,text text,
    showtime text,rawtime text);
*/
const Sequelize = require('sequelize');
const dbcontext = require('../dbcontext');
const usermodel = dbcontext.define('mesh_state', {
    // attributes
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    state: {
        type: Sequelize.STRING
    },
    other: {
        type: Sequelize.STRING
    },
    

  }, {
    // options
  }
);


module.exports = usermodel;