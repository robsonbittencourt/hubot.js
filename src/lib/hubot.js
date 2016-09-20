 'use strict';

var util = require('util');
var Bot = require('slackbots');
var log = require(__base + 'src/lib/log');
var Assembler = require(__base + 'src/lib/assembler');
var messageHandler = require(__base + 'src/lib/message-handler');
var speech = require(__base + 'src/lib/speech');
let Q = require('q');
var db = require(__base + 'src/lib/db').getDb();

process.on('uncaughtException', function (exception) {
  log.error(exception);
});

var Hubot = function Constructor(settings) {
   this.settings = settings;
   this.name = this.settings.name;
   this.user = null;
   this.isFirstRun = false;
};

util.inherits(Hubot, Bot);

module.exports = Hubot;

Hubot.prototype.run = function () {
   Hubot.super_.call(this, this.settings);

   this.on('start', this._onStart);
   this.on('message', this._onMessage);
};

Hubot.prototype._onStart = function () {
   this._loadBotUser();
   this.gears = new Assembler().build();
   this._firstRunChecker();
};

Hubot.prototype._firstRunChecker = function () {
   var self = this;
   db.get('SELECT * FROM first_use', function (err, record) {
      if (err) { log.error(err); }

      if (!record || !record.first_use) {
         self.isFirstRun = true;
      } 
   });
};

Hubot.prototype._onMessage = function (message) {
   if (this._isChatMessage(message) && !this._isFromHubot(message)) {
      if (isFirstInteraction(this, message)) {
         this._firstRun(message);
      } else {
         messageHandler.callTasks(message, this);
      }  
   }
};

Hubot.prototype._firstRun = function(message) {
   db.run("INSERT INTO first_use(first_use) VALUES('NO')");
   db.run("INSERT INTO hubot(admin) VALUES(?)", message.user);
   
   this.isFirstRun = false;
   this.postMessage(this.getRecipient(message), this.speech().hello(this._getUserById(message.user)).end(), {as_user: true});
}

Hubot.prototype._loadBotUser = function () {
   this.user = this._getUserByName(this.name);
};

Hubot.prototype._getUserByName = function (name) {
   return this.users.find(user => user.name === name);
};

Hubot.prototype._getUserById = function (userId) {
   return this.users.find(user => user.id === userId);
};

Hubot.prototype._isChatMessage = function (message) {
   return message.type === 'message' && Boolean(message.text);
};

Hubot.prototype._isChannelConversation = function (message) {
   return typeof message.channel === 'string' && message.channel[0] === 'C';
};

Hubot.prototype._isPrivateConversation = function (message) {
   return typeof message.channel === 'string' && message.channel[0] === 'D';
};

Hubot.prototype._isFromHubot = function (message) {
   return message.user === this.user.id;
};

Hubot.prototype.speech = function (message) {
   return speech.start(message);
}

Hubot.prototype.getRecipient = function (message) {
   if (this._isPrivateConversation(message)) {
      return message.user;
   } else {
      return message.channel;
   }
}

Hubot.prototype.talkTo = function (recipient, text, message, delay = 1000) {
   let deferred = Q.defer();
   let channel = message ? message.channel : recipient;

   this.ws.send(JSON.stringify({ type: 'typing', channel: channel }));
   
   setTimeout(() => {
      
      this.postMessage(recipient, text, {as_user: true}).then(function() {
         deferred.resolve();
      }, function() {
         deferred.reject();
      });

   }, delay);

   return deferred.promise;
}

Hubot.prototype.talk = function (message, text, delay) {
   return this.talkTo(this.getRecipient(message), text, message, delay);
}

function isFirstInteraction(hubot, message) {
   return hubot.isFirstRun && hubot._isPrivateConversation(message) && message.text === hubot.name;
}
