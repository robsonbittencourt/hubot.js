'use strict';

const util = require('util');

const Bot = require('slackbots');

const db = require('./lib/db');
const Hubot = require('./hubot');
const log = require('./lib/log');
const firstRun = require('./first-run');
const Assembler = require('./assembler');
const messageHandler = require('./message-handler/message-handler');

let botName;
let botUser;
let coreSettings;
let isFirstRun = false;

process.on('uncaughtException', (exception) => {
  log.error(exception);
});

const Core = function Constructor(settings) {
  coreSettings = settings;
  botName = settings.name;
};

util.inherits(Core, Bot);
module.exports = Core;

Core.prototype.run = function run() {
  Core.super_.call(this, coreSettings);

  this.on('start', this.onStart);
  this.on('message', this.onMessage);
};

Core.prototype.onStart = function onStart() {
  botUser = this.getUserByName(botName);
  this.hubot = new Hubot(this);
  this.hubot.gears = new Assembler().build();
  this.firstRunChecker();
};

Core.prototype.onMessage = function onMessage(message) {
  if (isChatMessage(message) && !isFromHubot(message)) {
    if (isFirstInteraction(this, message)) {
      isFirstRun = false;
      firstRun.firstRun(this, message);
    } else {
      messageHandler.callTasks(message, this);
    }
  }
};

Core.prototype.firstRunChecker = function firstRunChecker() {
  db.getDb().get('SELECT * FROM first_use').then((record) => {
    if (!record || !record.first_use) {
      isFirstRun = true;
    }
  });
};

Core.prototype.getUserByName = function getUserByName(name) {
  return this.users.find(user => user.name === name);
};

Core.prototype.getUserById = function getUserById(userId) {
  return this.users.find(user => user.id === userId);
};

Core.prototype.isChannelConversation = function isChannelConversation(message) {
  return typeof message.channel === 'string' && message.channel[0] === 'C';
};

Core.prototype.isPrivateConversation = function isPrivateConversation(message) {
  return typeof message.channel === 'string' && message.channel[0] === 'D';
};

Core.prototype.getRecipient = function getRecipient(message) {
  if (this.isPrivateConversation(message)) {
    return message.user;
  }
  return message.channel;
};

Core.prototype.isAdminUser = function isAdminUser(user) {
  return db.getDb().get('SELECT * FROM admins WHERE admin = ?', user);
};

function isFromHubot(message) {
  return message.user === botUser.id;
}

function isChatMessage(message) {
  return message.type === 'message' && Boolean(message.text);
}

function isFirstInteraction(core, message) {
  return isFirstRun && core.isPrivateConversation(message) && message.text === botName;
}
