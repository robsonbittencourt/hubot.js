'use strict';

const path = require('path');

const sqlite = require('sqlite');

exports.startDb = startDb;
exports.getDb = getDb;

let database;

function startDb() {
  return open()
        .then(migrate)
        .catch(() => { }); // do nothing
}

function open() {
  const dbFile = path.join(__dirname, '../..', 'data', 'hubot.db');

  return sqlite.open(dbFile);
}

function migrate(sqliteDb) {
  const migrations = path.join(__dirname, '../..', 'migrations');

  return sqliteDb.migrate({ migrationsPath: migrations })
          .then((result) => { database = result; });
}

function getDb() {
  return database;
}
