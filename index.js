#!/usr/bin/env node

'use strict';

const path = require('path');

require('./src/cli/cli.js');

global.__nodeModules = path.join(__dirname, '/node_modules/');
