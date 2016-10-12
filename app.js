'use strict';

global.__base = __dirname + '/';
global.__gears = __base + 'src/gears/';
global.__nodeModules = __base + 'node_modules/';

var Core = require(__base + 'src/core');
var token = process.env.BOT_API_KEY
var name = process.env.BOT_NAME || 'hubot';
var db = require(__base + 'src/lib/db');

db.startDb().then(function() {
   var core = new Core({
      token: token,
      name: name
   });

   core.run();   
});

