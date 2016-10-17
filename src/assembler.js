'use strict';

const fs = require('fs');

const db = require('./lib/db');
const log = require('./lib/log');
const speech = require('./speech');

const gearNamePrefix = 'gear-';

module.exports = class Assembler {

  constructor() {
    this.gears = [];
  }

  build() {
    this.loadGears(this);
    return this.gears;
  }

  loadGears(self) {
    fs.readdir(global.__nodeModules, (error, list) => {
      const gearsNames = list.filter(e => e.startsWith(gearNamePrefix));

      gearsNames.forEach((gearName) => {
        const gearDescription = gearName.replace('gear-', '');

        self.gears.push({ name: gearName, description: gearDescription });
      });

      self.gears.forEach((gear, index) => self.loadGear(self.gears, gear, index));
    });
  }

  loadGear(gears, gear, index) {
    logStartAssembling();
    logAddingGear(gears, gear, index);
    this.tryToLoad('gearStatus', gear, this.loadGearStatus);
    this.tryToLoad('configs', gear, this.loadConfigs);
    this.tryToLoad('tasks', gear, this.loadTasks);
    this.tryToLoad('categories', gear, this.loadCategories);
    this.tryToLoad('handlers', gear, this.loadHandlers);
    this.tryToLoad('configHandler', gear, this.loadConfigHandler);
  }

  tryToLoad(type, gear, assemble) {
    try {
      logInfoLoadingGear(type);
      assemble(gear, this);
    } catch (error) {
      logErrorLoadingGear(type, error);
    }
  }

  loadGearStatus(gear) {
    db.getDb().get('SELECT * FROM gears WHERE name = ?', gear.name).then((record) => {
      if (!record) {
        gear.active = false;
        db.getDb()
          .run('INSERT INTO gears(name, description, active) VALUES(?, ?, ?)', gear.name, gear.description, false);
      } else {
        gear.active = record.active === '1';
      }
    });
  }

  loadConfigs(gear, self) {
    gear.configs = [];
    gear.configs = gear.configs.concat(require(self.configsPath(gear)));
  }

  loadTasks(gear, self) {
    gear.tasks = [];
    gear.tasks = gear.tasks.concat(require(self.tasksPath(gear)));
  }

  loadCategories(gear, self) {
    gear.categories = [];
    gear.categories = gear.categories.concat(require(self.categoriesPath(gear)));
  }

  loadHandlers(gear, self) {
    gear.handlers = [];

    gear.tasks.forEach((task) => {
      const handler = require(self.handlersPath(gear, task.handler));

      gear.handlers.push({ key: task.handler, handle: handler.handle });
    });
  }

  loadConfigHandler(gear, self) {
    gear.configHandler = require(self.configsHandlersPath(gear));
  }

  configsPath(gear) {
    return `${global.__nodeModules}${gear.name}/config/config.json`;
  }

  tasksPath(gear) {
    return `${global.__nodeModules}${gear.name}/config/tasks.json`;
  }

  categoriesPath(gear) {
    return `${global.__nodeModules}${gear.name}/config/categories.json`;
  }

  handlersPath(gear, handler) {
    return `${global.__nodeModules}${gear.name}/src/handlers/${handler}`;
  }

  configsHandlersPath(gear) {
    return `${global.__nodeModules}${gear.name}/src/configHandler/configHandler`;
  }

};

function logStartAssembling() {
  log.info('Starting assembly hubot...');
}

function logAddingGear(gears, gear, index) {
  if (!gears) return log.error('Could not load gears.');
  if (!gear) return log.error(`Could not load gear at index ${index}`);
  return log.info(speech.start('Adding ').refer(gear.name).progress(index + 1, gears.length).end());
}

function logInfoLoadingGear(gear) {
  log.info(speech.start(' > Loading ').append(gear).append('...').end());
}

function logErrorLoadingGear(gear, error) {
  log.error(speech.start(' > There was an error loading ')
    .append(gear).append(' gear. This functionality can not be used.').end());
  log.error(error);
}
