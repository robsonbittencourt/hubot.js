'use strict';

const path = require('path');

const Core = require('./src/core');
const db = require('./src/lib/db');

global.__nodeModules = path.join(__dirname, '/node_modules/');

const token = process.env.BOT_API_KEY;
const name = process.env.BOT_NAME || 'hubot';

db.startDb().then(() => {
  const core = new Core({ token, name });

  core.run();
});

