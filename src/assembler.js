'use strict';

const fs = require('fs');
const path = require('path');

const db = require('./lib/db');
const log = require('./lib/log');
const speech = require('./speech');
const i18n = require('./lib/i18n');

const gearNamePrefix = 'gear-';

module.exports = class Assembler {
  constructor(gearsPath, isInternal) {
    this.gears = [];
    this.gearsPath = gearsPath;
    this.isInternal = isInternal;
  }

  build() {
    this.loadGears(this);
    return this.gears;
  }

  loadGears(self) {
    const list = fs.readdirSync(this.gearsPath);

    const gearsNames = list.filter(e => e.startsWith(gearNamePrefix));

    gearsNames.forEach((gearName) => {
      const gearDescription = gearName.replace('gear-', '');

      self.gears.push({ name: gearName, description: gearDescription });
    });

    self.gears.forEach((gear, index) => self.loadGear(self.gears, gear, index));
  }

  loadGear(gears, gear, index) {
    if (gear) {
      gear.isInternal = this.isInternal;
    }

    logStartAssembling();
    logAddingGear(gears, gear, index);
    this.tryToLoad('gearStatus', gear, this.loadGearStatus);
    this.tryToLoad('configs', gear, this.loadConfigs);
    this.tryToLoad('tasks', gear, this.loadTasks);
    this.tryToLoad('categories', gear, this.loadCategories);
    this.tryToLoad('handlers', gear, this.loadHandlers);
    this.tryToLoad('configHandler', gear, this.loadConfigHandler);
    this.tryToLoad('locales', gear, this.loadLocales);
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
        gear.active = true;
        db.getDb().run('INSERT INTO gears(name, description, active) VALUES(?, ?, ?)',
          gear.name, gear.description, gear.active);
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

  loadLocales(gear, self) {
    fs.readdir(self.localesPath(gear), (error, list) => {
      if (error) return;

      gear.locales = [];

      list.forEach((dir) => {
        const localeFile = require(path.join(self.localesPath(gear), dir, 'translation.json'));
        i18n.addResourceBundle(dir, gear.description, localeFile);

        gear.locales.push(dir.toLowerCase());
      });
    });
  }

  configsPath(gear) {
    return `${this.gearsPath}${gear.name}/config/config.json`;
  }

  tasksPath(gear) {
    return `${this.gearsPath}${gear.name}/config/tasks.json`;
  }

  categoriesPath(gear) {
    return `${this.gearsPath}${gear.name}/config/categories.json`;
  }

  handlersPath(gear, handler) {
    return `${this.gearsPath}${gear.name}/src/handlers/${handler}`;
  }

  configsHandlersPath(gear) {
    return `${this.gearsPath}${gear.name}/src/configHandler/configHandler`;
  }

  localesPath(gear) {
    return `${this.gearsPath}${gear.name}/locales`;
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
