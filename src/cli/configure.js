'use strict';

const db = require('../lib/db');

exports.configure = configure;

function configure(args) {
  db.startDb().then(() => {
    db.getDb().run('INSERT INTO config(token, name) VALUES(?, ?)', args.token, args.name);
  });
}
