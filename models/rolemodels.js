const Sequelize = require('sequelize');
const dbcontext = require('../dbcontext');
const users = require('./usermodels');
const rolegroup = dbcontext.define('roles', {
    // attributes
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rolename: {
      type: Sequelize.STRING
    },
    
  }, {
    // options
  }
);
rolegroup.users = rolegroup.hasMany(users, { onDelete: 'CASCADE' });//, {foreignKey: 'postId', sourceKey: 'Id'});
users.belongsTo(rolegroup, { onDelete: 'CASCADE' });//, {foreignKey: 'postId', targetKey: 'Id'});

module.exports = rolegroup;