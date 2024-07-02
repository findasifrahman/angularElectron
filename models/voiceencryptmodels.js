const Sequelize = require('sequelize')
const dbcontext = require('../dbcontext')

const voice_enc_models = dbcontext.define('voice_encrypt',{
        // attributes
        id: {
            type:Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        key: {
            type: Sequelize.STRING
        }
    
      }, {
        // options
      }
)
module.exports = voice_enc_models