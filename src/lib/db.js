'use strict';

let Q = require('q');
let fs = require('fs');
let log = require(__base + 'src/lib/log');
let path = require('path');
let sqlite3 = require('sqlite3');

module.exports = class DataBase {

   constructor() {
      this.outputFile = path.resolve(process.cwd(), 'data', 'hubot.db');

      if (!fs.existsSync(this.outputFile)) {
         return createDb(this);
      }

      return updateDb(this);
   }

   run(sql, params) {
      let deferred = Q.defer();
      
      this.db.run(sql, params, function(err) {
         resultHandler(deferred, err);
      });

      return deferred.promise;
   }

   get(sql, params) {
      let deferred = Q.defer();

      this.db.get(sql, params, function(err, row) {
         resultHandler(deferred, err, row);
      });

      return deferred.promise;
   }

   all(sql, params) {
      let deferred = Q.defer();

      this.db.all(sql, params, function(err, rows) {
         resultHandler(deferred, err, rows);
      });

      return deferred.promise;
   }

}

function createDb(dataBase) {
   dataBase.db = new sqlite3.Database(dataBase.outputFile);

   dataBase.db.serialize();
   
   dataBase.db.run('CREATE TABLE IF NOT EXISTS admins (admin TEXT NOT NULL)');
   dataBase.db.run('CREATE TABLE IF NOT EXISTS first_use (first_use TEXT NOT NULL)');
   dataBase.db.run('CREATE TABLE IF NOT EXISTS gears (name TEXT NOT NULL, description TEXT NOT NULL, active TEXT NOT NULL)');

   return dataBase;
}

function updateDb(dataBase) {
   dataBase.db = new sqlite3.Database(dataBase.outputFile);
   
   return dataBase;
}

function resultHandler(deferred, err, result) {
   if (err) {
      log.error(err);
      deferred.reject(err);
   } else {
      deferred.resolve(result);
   }
}
