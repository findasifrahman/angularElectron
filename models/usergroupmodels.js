const Sequelize = require('sequelize');
const dbcontext = require('../dbcontext');
const usermodel = dbcontext.define('user_group', {
    // attributes
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    gr_name: {
        type: Sequelize.STRING
    },
    gr_number: {
        type: Sequelize.STRING
    },
    no_of_membar: {
        type: Sequelize.STRING
    },
    membar_id: {
        type: Sequelize.STRING
    },
    members:{
        type: Sequelize.STRING
    }
  }, {
    // options
  }
);


module.exports = usermodel;