const { text } = require('body-parser');
const Sequelize = require('sequelize');
const dbcontext = require('../dbcontext');
const usermodel = dbcontext.define('allevent', {
    // attributes
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    eventname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    title: {
        type: Sequelize.STRING
    },
    subtitle:{
      type: Sequelize.STRING
    },
    place:{
        type: Sequelize.STRING
    },
    date:{
        type: Sequelize.STRING
    },
    datetext:{
        type: Sequelize.STRING
    },
    uploadDate:{
        type: Sequelize.STRING
    },
    priority: {
        type: Sequelize.INTEGER
    },
    uuid: {
        type: Sequelize.STRING
    },
    keyword: {
        type: Sequelize.STRING
    },
    view: {
        type: Sequelize.INTEGER
    },
    category: {
        type: Sequelize.STRING
    },
    relatedWord: {
        type: Sequelize.STRING
    },
    text: {
        type: Sequelize.STRING
    },
    numOfImage:{
        type: Sequelize.INTEGER
    },
    numOfVideo:{
        type: Sequelize.INTEGER
    },
    eventCNS:{
        type: Sequelize.STRING
    },
    tenureCNS:{
        type: Sequelize.STRING
    },
    image1:{
        type: Sequelize.STRING
    },
    image2:{
        type: Sequelize.STRING
    },
    image3:{
        type: Sequelize.STRING
    },
    image4:{
        type: Sequelize.STRING
    },
    image5:{
        type: Sequelize.STRING
    },
    image6:{
        type: Sequelize.STRING
    },
    image7:{
        type: Sequelize.STRING
    },
    image8:{
        type: Sequelize.STRING
    },
    image9:{
        type: Sequelize.STRING
    },
    image10:{
        type: Sequelize.STRING
    },
    image11:{
        type: Sequelize.STRING
    },
    image12:{
        type: Sequelize.STRING
    },
    image13:{
        type: Sequelize.STRING
    },
    image14:{
        type: Sequelize.STRING
    },
    image15:{
        type: Sequelize.STRING
    },
    image1caption:{
        type: Sequelize.STRING
    },
    image2caption:{
        type: Sequelize.STRING
    },
    image3caption:{
        type: Sequelize.STRING
    },
    image4caption:{
        type: Sequelize.STRING
    },
    image5caption:{
        type: Sequelize.STRING
    },
    image6caption:{
        type: Sequelize.STRING
    },
    image7caption:{
        type: Sequelize.STRING
    },
    image8caption:{
        type: Sequelize.STRING
    },
    image9caption:{
        type: Sequelize.STRING
    },
    image10caption:{
        type: Sequelize.STRING
    },
    image11caption:{
        type: Sequelize.STRING
    },
    image12caption:{
        type: Sequelize.STRING
    },
    image13caption:{
        type: Sequelize.STRING
    },
    image14caption:{
        type: Sequelize.STRING
    },
    image15caption:{
        type: Sequelize.STRING
    },
    video:{
        type: Sequelize.STRING
    },
    language:{
        type: Sequelize.STRING
    },
    image1prio:{
        type: Sequelize.BOOLEAN
    },
    image2prio:{
        type: Sequelize.BOOLEAN
    },
    image3prio:{
        type: Sequelize.BOOLEAN
    },
    image4prio:{
        type: Sequelize.BOOLEAN
    },
    image5prio:{
        type: Sequelize.BOOLEAN
    },
    image6prio:{
        type: Sequelize.BOOLEAN
    },
    image7prio:{
        type: Sequelize.BOOLEAN
    },
    image8prio:{
        type: Sequelize.BOOLEAN
    },
    image9prio:{
        type: Sequelize.BOOLEAN
    },
    image10prio:{
        type: Sequelize.BOOLEAN
    },
    image11prio:{
        type: Sequelize.BOOLEAN
    },
    image12prio:{
        type: Sequelize.BOOLEAN
    }
  }, {
    // options
  }
);


module.exports = usermodel;