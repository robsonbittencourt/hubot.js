'use strict';

global.__base = __dirname + '/';
global.__gears = __base + 'src/gears/';
global.__nodeModules = __base + 'node_modules/';

const Core = require(__base + 'src/core');
const db = require(__base + 'src/lib/db');

const token = process.env.BOT_API_KEY
const name = process.env.BOT_NAME || 'hubot';

db.startDb().then(function() {
   const core = new Core({
      token: token,
      name: name
   });

   core.run();   
});

