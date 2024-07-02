const Sequelize = require('sequelize');
const dbcontext = require('../dbcontext');
const usermodel = dbcontext.define('alluser', {
    // attributes
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    uid: {
        type: Sequelize.STRING
    },
    uname: {
        type: Sequelize.STRING
    },
    ship: {
        type: Sequelize.STRING
    },
    pin:{
        type: Sequelize.BOOLEAN
    }

  }, {
    // options
  }
);


module.exports = usermodel;