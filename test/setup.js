'use strict';

const path = require('path');

exports.start = start;

function start() {
  global.__nodeModules = path.join(__dirname, '/resource/node_modules_test/');
}
