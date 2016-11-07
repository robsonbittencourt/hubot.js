'use strict';

const Q = require('q');
const printMessage = require('print-message');

const Core = require('../core');
const db = require('../lib/db');
const path = require('path');

global.__nodeModules = path.join(__dirname, '../../node_modules/');

db.startDb()
  .then(getConfig)
  .then(validate)
  .then(initCore)
  .catch((err) => {
    printMessage([err]);
    process.exit();
  });

function getConfig() {
  return db.getDb().get('SELECT * FROM config');
}

function validate(config) {
  const deferred = Q.defer();

  if (!config) {
    deferred.reject('Please make config before start');
  } else if (!config.token) {
    deferred.reject('Please config token before start');
  } else if (!config.name) {
    deferred.reject('Please config name before start');
  } else {
    deferred.resolve(config);
  }

  return deferred.promise;
}

function initCore(config) {
  new Core({ token: config.token, name: config.name }).run();
}
