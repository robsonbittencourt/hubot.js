'use strict';

exports.getDb = getDb;

var path = require('path');
var fs = require('fs');
var sqlite3 = require('sqlite3');

function getDb() {
   var dbPath = path.resolve(process.cwd(), 'data', 'hubot.db');

   if (!fs.existsSync(dbPath)) {
      return createDb();
   }

   return updateDb(dbPath);
}

function createDb() {
   var outputFile = path.resolve(process.cwd(), 'data', 'hubot.db');
   var db = new sqlite3.Database(outputFile);

   db.serialize();
   
   db.run('CREATE TABLE IF NOT EXISTS hubot (name TEXT NOT NULL, first_use TEXT NOT NULL)');
   db.run('CREATE TABLE IF NOT EXISTS admin (user TEXT NOT NULL)');
   db.run('CREATE TABLE IF NOT EXISTS gears (name TEXT NOT NULL, active TEXT NOT NULL)');

   return db;
}

function updateDb(dbPath) {
   var db = new sqlite3.Database(dbPath);

   return db;
}
