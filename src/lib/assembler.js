'use strict';

var fs = require('fs');
var log = require(__base + 'src/lib/log');
var speech = require(__base + 'src/lib/speech');
var db = require(__base + 'src/lib/db').getDb();

const gearNamePrefix = 'gear-';

module.exports = class Assembler {

   constructor() {
      this.core = {
         gears: [],
         configs: [],
         tasks: [],
         categories: [],
         handlers: []
      };
   }

   build() {
      this.loadGears(this); 
      return this.core;
   }

   loadGears(self) {
      fs.readdir(__nodeModules, function (error, list) {
         var gears = list.filter(function (e) {
            return e.startsWith(gearNamePrefix);
         });

         self.core.gears = gears;
         
         gears.forEach((gear, index) => self.loadGear(gears, gear, index));
      });
   };

   loadGear(gears, gear, index) {
      logAddingGear(gears, gear, index);
      this.tryToLoad('gearStatus', gear, this.loadGearStatus);
      this.tryToLoad('configs', gear, this.loadConfigs);
      this.tryToLoad('tasks', gear, this.loadTasks);
      this.tryToLoad('categories', gear, this.loadCategories);
      this.tryToLoad('handlers', gear, this.loadHandlers);
   }

   tryToLoad(type, gear, assemble) {
      try {
         logInfoLoadingGear(type);
         assemble(gear, this);
      } catch (error) {
         logErrorLoadingGear(type, error);
      }
   }

   loadGearStatus(gear, self) {
      db.get('SELECT * FROM gears WHERE name = ?', gear, function (err, record) {
         if (err) { log.error(err); }

         if (!record) {
            db.run('INSERT INTO gears(name, active) VALUES(?, ?)', gear, 'NO', function (err) {
               if (err) { log.error(err); }
            });
         }
      });
   }

   loadConfigs(gear, self) {
      var gearName = gear.replace("gear-", "");
      var gearConfig = { gear: gearName, configs: require(self.configsPath(gear)) };

      self.core.configs = self.core.configs.concat(gearConfig);
   }

   loadTasks(gear, self) {
      self.core.tasks = self.core.tasks.concat(require(self.tasksPath(gear)));
   }

   loadCategories(gear, self) {
      self.core.categories = self.core.categories.concat(require(self.categoriesPath(gear)));
   }

   loadHandlers(gear, self) {
      self.core.tasks.forEach(function(task) {
         if (!self.containsHandler(task.handler)) {
            var handler = require(self.handlersPath(gear, task.handler));
            self.core.handlers.push({ key: task.handler, handle: handler.handle});
         }
      });
   }

   containsHandler(handler) {
      return this.core.handlers.find(h => h.key === handler) != null;
   }

   configsPath(gear) {
      return __nodeModules + gear + '/config/config.json';
   }
   
   tasksPath(gear) {
      return __nodeModules + gear + '/config/tasks.json';
   }

   categoriesPath(gear) {
      return __nodeModules + gear + '/config/categories.json';
   }

   handlersPath(gear, handler) {
      return __nodeModules + gear + '/src/handlers/' + handler;
   }
}

function logStartAssembling() {
   log.info('Starting assembly hubot...');
}

function logAddingGear(gears, gear, index) {
   if (!gears) return log.error('Could not load gears.');
   if (!gear) return log.error('Could not load gear at index ' + index);
   log.info(speech.start('Adding ').refer(gear).progress(index + 1, gears.length).end());
}

function logInfoLoadingGear(gear) {
   log.info(speech.start(' > Loading ').append(gear).append('...').end());
}

function logErrorLoadingGear(gear, error) {
   log.error(speech.start(' > There was an error loading ').append(gear).append(' gear. This functionality can not be used.').end());
   log.error(error);
}
