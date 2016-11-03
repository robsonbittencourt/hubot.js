'use strict';

const Core = require('../core');
const db = require('../lib/db');
const path = require('path');

global.__nodeModules = path.join(__dirname, '../../node_modules/');

const token = 'xoxb-56400686804-GLgqTqg6spBpLBc3T08XhYYg';
const name = process.env.BOT_NAME || 'hubot';

function start() {
  db.startDb().then(() => {
    const core = new Core({ token, name });

    core.run();
  });
}

start();
