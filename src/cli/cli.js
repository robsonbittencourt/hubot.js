'use strict';

const pm2 = require('pm2');
const yargs = require('yargs');

const configure = require('./configure');

const START_COMMAND = 'start';
const STOP_COMMAND = 'stop';
const RESTART_COMMAND = 'restart';
const CONFIGURE_COMMAND = 'configure';

const argv = yargs.usage(`Pluralsight Downloader \n
Usage: hubot <command> [options]`)
  .command(START_COMMAND, 'Start the hubot')
  .command(STOP_COMMAND, 'Stop the hubot')
  .command(RESTART_COMMAND, 'Restart the hubot')
  .command(CONFIGURE_COMMAND, 'Restart the hubot')
  .alias('t', 'token')
  .alias('n', 'name')
  .describe('t', 'Use the token')
  .describe('n', 'Use the bot name')
  .argv;

const command = argv._[0];

switch (command) {
  case START_COMMAND:
    executeProcessManager(start);
    break;
  case STOP_COMMAND:
    executeProcessManager(stop);
    break;
  case RESTART_COMMAND:
    executeProcessManager(restart);
    break;
  case CONFIGURE_COMMAND:
    configure.configure(argv);
    break;
  default:
    yargs.showHelp();
    process.exit(0);
    break;
}

function start() {
  const config = { script: 'src/cli/init-core.js', name: 'hubot', maxRestarts: 2 };
  pm2.start(config, () => pm2.disconnect());
}

function stop() {
  pm2.stop('hubot', () => pm2.disconnect());
}

function restart() {
  pm2.restart('hubot', () => pm2.disconnect());
}

function executeProcessManager(action) {
  try {
    pm2.connect(() => action());
  } catch (err) {
    process.exit(2);
  }
}
