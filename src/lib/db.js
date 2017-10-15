'use strict';

const path = require('path');

const fs = require('fs-extra');
const sqlite = require('sqlite');

exports.startDb = startDb;
exports.getDb = getDb;

let database;
const dbPath = path.join(process.env.HOME, 'hubot.js', 'data');

function startDb() {
  return createDir()
    .then(open)
    .then(migrate)
    .catch(() => { }); // do nothing
}

function createDir() {
  return fs.ensureDir(dbPath);
}

function open() {
  const dbFile = path.join(dbPath, 'hubot.db');

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
