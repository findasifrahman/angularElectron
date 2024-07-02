const Sequelize = require('sequelize');
const dbcontext = require('../dbcontext');
const usermodel = dbcontext.define('data_channel_id', {
    // attributes
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    channel_id: {
        type: Sequelize.STRING
    },
    type: {
        type: Sequelize.STRING
    },
    other: {
        type: Sequelize.STRING
    }

  }, {
    // options
  }
);


module.exports = usermodel;