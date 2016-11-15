'use strict';

const db = require('../lib/db');

exports.configure = configure;

function configure(args) {
  db.startDb()
    .then(getConfig)
    .then((config) => {
      updateConfig(config, args);
    });
}

function getConfig() {
  return db.getDb().get('SELECT * FROM config');
}

function updateConfig(config, args) {
  const token = chooseConfig(config, args, 'token');
  const name = chooseConfig(config, args, 'name');

  db.getDb().run('UPDATE config SET token = ?, name = ?', token, name);
}

function chooseConfig(config, args, propertie) {
  if (args && args[propertie]) {
    return args[propertie];
  }

  if (config && config[propertie]) {
    return config[propertie];
  }

  return null;
}
