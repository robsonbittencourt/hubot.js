'use strict';

let db = require('sqlite');
let path = require('path');

exports.startDb = startDb;
exports.getDb = getDb;

var database;

function startDb() {
   let dbFile = path.resolve(process.cwd(), 'data', 'hubot.db');
   let migrations = path.resolve(process.cwd(), 'migrations');

   function open(dbFile) {
      return db.open(dbFile);
   }

   function migrate(db) {
      db.migrate({migrationsPath: migrations}).then(function(result) {
         database = result;
      });
   }
   
   return open(dbFile)
      .then(migrate)
      .catch(function() {
         //do nothing
      }); 
}

function getDb() {
   return database;
}
