 'use strict';

var util = require('util');
var Bot = require('slackbots');
var log = require(__base + 'src/lib/log');
var Assembler = require(__base + 'src/assembler');
var messageHandler = require(__base + 'src/message-handler/message-handler');
var speech = require(__base + 'src/speech');
var firstRun = require(__base + 'src/first-run');
var Hubot = require(__base + 'src/hubot');
var db = new (require(__base + 'src/lib/db'));
let Q = require('q');

process.on('uncaughtException', function (exception) {
  log.error(exception);
});

var Core = function Constructor(settings) {
   this.settings = settings;
   this.name = this.settings.name;
   this.user = null;
   this.isFirstRun = false;
};

util.inherits(Core, Bot);

module.exports = Core;

Core.prototype.run = function () {
   Core.super_.call(this, this.settings);

   this.on('start', this._onStart);
   this.on('message', this._onMessage);
};

Core.prototype._onStart = function () {
   loadBotUser(this);
   this.hubot = new Hubot(this);
   this.hubot.gears = new Assembler().build();
   this._firstRunChecker();
};

Core.prototype._firstRunChecker = function () {
   let self = this;

   db.get('SELECT * FROM first_use').then(function(record) {
      if (!record || !record.first_use) {
         self.isFirstRun = true;
      } 
   });
};

Core.prototype._onMessage = function (message) {
    if (isChatMessage(message) && !isFromHubot(message, this)) {
      if (isFirstInteraction(this, message)) {
         this.isFirstRun = false;
         firstRun.firstRun(this, message);
      } else {
         messageHandler.callTasks(message, this);
      }  
   }
};

Core.prototype._loadBotUser = function () {
   this.user = this._getUserByName(this.name);
};

Core.prototype._getUserByName = function (name) {
   return this.users.find(user => user.name === name);
};

Core.prototype._getUserById = function (userId) {
   return this.users.find(user => user.id === userId);
};

Core.prototype._isChannelConversation = function (message) {
   return typeof message.channel === 'string' && message.channel[0] === 'C';
};

Core.prototype._isPrivateConversation = function (message) {
   return typeof message.channel === 'string' && message.channel[0] === 'D';
};

Core.prototype.getRecipient = function (message) {
   if (this._isPrivateConversation(message)) {
      return message.user;
   } else {
      return message.channel;
   }
}

Core.prototype._isAdminUser = function (user) {
   return db.get('SELECT * FROM admins WHERE admin = ?', user);
};

Core.prototype._getGear = function (gear) {
   return db.get('SELECT * FROM gears WHERE description = ?', gear);
}

function loadBotUser(core) {
   core.user = core._getUserByName(core.name);
};

function isFromHubot(message, core) {
   return message.user === core.user.id;
};

function isChatMessage(message) {
   return message.type === 'message' && Boolean(message.text);
};

function isFirstInteraction(core, message) {
   return core.isFirstRun && core._isPrivateConversation(message) && message.text === core.name;
}
