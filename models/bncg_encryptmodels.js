const Sequelize = require('sequelize');
const dbcontext = require('../dbcontext');
const usermodel = dbcontext.define('bn_cg_encrypt', {
    // attributes
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    key: {
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