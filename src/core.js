 'use strict';

var util = require('util');
var Bot = require('slackbots');
var log = require(__base + 'src/lib/log');
var Assembler = require(__base + 'src/assembler');
var messageHandler = require(__base + 'src/message-handler/message-handler');
var firstRun = require(__base + 'src/first-run');
var Hubot = require(__base + 'src/hubot');
var db = require(__base + 'src/lib/db');

var botName;
var botUser;
var coreSettings;
var isFirstRun = false;

process.on('uncaughtException', function (exception) {
  log.error(exception);
});

var Core = function Constructor(settings) {
   coreSettings = settings;
   botName = settings.name;
};

util.inherits(Core, Bot);
module.exports = Core;

Core.prototype.run = function () {
   Core.super_.call(this, coreSettings);

   this.on('start', this.onStart);
   this.on('message', this.onMessage);
};

Core.prototype.onStart = function () {
   botUser = this.getUserByName(botName);
   this.hubot = new Hubot(this);
   this.hubot.gears = new Assembler().build();
   this.firstRunChecker();
};

Core.prototype.onMessage = function (message) {
    if (isChatMessage(message) && !isFromHubot(message)) {
      if (isFirstInteraction(this, message)) {
         isFirstRun = false;
         firstRun.firstRun(this, message);
      } else {
         messageHandler.callTasks(message, this);
      }  
   }
};

Core.prototype.firstRunChecker = function () {
   db.getDb().get('SELECT * FROM first_use').then(function(record) {
      if (!record || !record.first_use) {
         isFirstRun = true;
      } 
   });
};

Core.prototype.getUserByName = function (name) {
   return this.users.find(user => user.name === name);
};

Core.prototype.getUserById = function (userId) {
   return this.users.find(user => user.id === userId);
};

Core.prototype.isChannelConversation = function (message) {
   return typeof message.channel === 'string' && message.channel[0] === 'C';
};

Core.prototype.isPrivateConversation = function (message) {
   return typeof message.channel === 'string' && message.channel[0] === 'D';
};

Core.prototype.getRecipient = function (message) {
   if (this.isPrivateConversation(message)) {
      return message.user;
   } else {
      return message.channel;
   }
}

Core.prototype.isAdminUser = function (user) {
   return db.getDb().get('SELECT * FROM admins WHERE admin = ?', user);
};

function isFromHubot(message) {
   return message.user === botUser.id;
};

function isChatMessage(message) {
   return message.type === 'message' && Boolean(message.text);
};

function isFirstInteraction(core, message) {
   return isFirstRun && core.isPrivateConversation(message) && message.text === botName;
}
