const Sequelize = require('sequelize');
const dbcontext = require('../dbcontext');
const usermodel = dbcontext.define('users', {
    // attributes
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
        type: Sequelize.STRING
    },
    roleId: {
        type: Sequelize.INTEGER
    },

  }, {
    // options
  }
);


module.exports = usermodel;