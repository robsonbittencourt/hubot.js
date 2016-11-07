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
  const token = getToken(config, args);
  const name = getName(config, args);

  db.getDb().run('UPDATE config SET token = ?, name = ?', token, name);
}

function getToken(config, args) {
  if (args && args.token) {
    return args.token;
  }

  if (config && config.token) {
    return config.token;
  }

  return null;
}

function getName(config, args) {
  if (args && args.name) {
    return args.name;
  }

  if (config && config.name) {
    return config.name;
  }

  return null;
}
