const Sequelize = require('sequelize');
const dbcontext = require('../dbcontext');
const usermodel = dbcontext.define('my_id', {
    // attributes
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    uid: {
        type: Sequelize.STRING
    },
    ship: {
        type: Sequelize.STRING
    }

  }, {
    // options
  }
);


module.exports = usermodel;