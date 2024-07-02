const Sequelize = require('sequelize');
const dbcontext = require('../dbcontext');
const usermodel = dbcontext.define('curr_chann', {
    // attributes
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    channel_id: {
        type: Sequelize.STRING
    },
    frequency: {
        type: Sequelize.STRING
    },
    type: {
        type: Sequelize.STRING
    },
    en: {
        type: Sequelize.STRING
    }

  }, {
    // options
  }
);


module.exports = usermodel;