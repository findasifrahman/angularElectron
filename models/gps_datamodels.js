const Sequelize = require('sequelize');
const dbcontext = require('../dbcontext');
const usermodel = dbcontext.define('gps_data', {
    // attributes
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    uid: {
        type: Sequelize.STRING
    },
    mtime: {
        type: Sequelize.STRING
    },
    mtime2: {
        type: Sequelize.STRING
    },
    lat: {
        type: Sequelize.STRING
    },
    long: {
        type: Sequelize.STRING
    },
    other1: {
        type: Sequelize.STRING
    },
    other2: {
        type: Sequelize.STRING
    },
    other3: {
        type: Sequelize.STRING
    },
  }, {
    // options
  }
);


module.exports = usermodel;