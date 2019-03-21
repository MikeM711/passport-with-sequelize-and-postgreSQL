/* 1.1 ALL OF THIS HAS BEEN COPY/PASTED FROM SEQUELIZE DOCS
  Only change: 'config.json' */

/* 
1.2 This 'index' model "Collects all the models from the models directory and associates them if needed."

This is where Sequelize ORM is used
*/

'use strict';

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(__filename);
var env = process.env.NODE_ENV || 'development';

// Initialize sequelize with heroku postgres - the actual address comes from the DATABASE_URL environment variable
// FIXED WITH IF STATEMENT TO RUN LOCALLY!!!
if (process.env.DATABASE_URL) {
  var sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: true
    }
  });
}
 

/* 
1.3 our config.json file path
  The below file, config.json, was copied from Sequelize Docs (Migration Configuration page) 
  Proper database credentials and dialect have been edited
*/
var config = require(__dirname + '/../config/config.json')[env];
var db = {};

// 1.4 Create a Sequelize connection to the database using the database name in config/config.js
if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // 1.5 database, username, password, config object - found in our config.json file
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// 1.6 Load all the models
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// 1.7 Export the db Object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
// 1.8 File gets ran when we start the server - models.sequelize.sync() in server.js in "root"