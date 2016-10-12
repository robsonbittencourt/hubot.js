'use strict';

let db = require('sqlite');
let path = require('path');

exports.getDb = getDb;

function getDb() {
   let dbFile = path.resolve(process.cwd(), 'data', 'hubot.db');
   let migrations = path.resolve(process.cwd(), 'migrations');

   function open(dbFile) {
      return db.open(dbFile);
   }

   function migrate(db) {
      return db.migrate({migrationsPath: migrations});
   }
   
   open(dbFile)
      .then(migrate)
      .catch(function() {
         //do nothing
      }) 

   return db; 
}
