'use strict';

const db = require('sqlite');
const path = require('path');

exports.startDb = startDb;
exports.getDb = getDb;

let database;

function startDb() {
   const dbFile = path.resolve(process.cwd(), 'data', 'hubot.db');
   const migrations = path.resolve(process.cwd(), 'migrations');

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
