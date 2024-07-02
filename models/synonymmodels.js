const Sequelize = require('sequelize');
const dbcontext = require('../dbcontext');
const usermodel = dbcontext.define('synonym', {
    // attributes
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    word: {
        type: Sequelize.STRING
    },
    related: {
        type: Sequelize.STRING
    },

  }, {
    // options
  }
);


module.exports = usermodel;