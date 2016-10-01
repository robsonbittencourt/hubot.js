 'use strict';

var util = require('util');
var Bot = require('slackbots');
var log = require(__base + 'src/lib/log');
var Assembler = require(__base + 'src/lib/assembler');
var messageHandler = require(__base + 'src/lib/message-handler/message-handler');
var speech = require(__base + 'src/lib/speech');
let Q = require('q');
var db = new (require(__base + 'src/lib/db'));

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
   let self = this;

   db.get('SELECT * FROM first_use').then(function(record) {
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
   db.run("INSERT INTO admins(admin) VALUES(?)", message.user);
   
   this.isFirstRun = false;
   this.postMessage(this.getRecipient(message), message1(this, message), {as_user: true});
   this.postMessage(this.getRecipient(message), message2(this), {as_user: true});
   this.postMessage(this.getRecipient(message), message3(this), {as_user: true});
   this.postMessage(this.getRecipient(message), message4(this), {as_user: true});
   this.postMessage(this.getRecipient(message), message5(this), {as_user: true});
   this.postMessage(this.getRecipient(message), postGearsNames(this), {as_user: true});
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

Hubot.prototype._isAdminUser = function (user) {
   return db.get('SELECT * FROM admins WHERE admin = ?', user);
};

Hubot.prototype._activateGear = function (gear) {
   return db.run('UPDATE gears SET active = "YES" WHERE description = ?', gear);
}

Hubot.prototype._deactivateGear = function (gear) {
   return db.run('UPDATE gears SET active = "NO" WHERE description = ?', gear);
}

function isFirstInteraction(hubot, message) {
   return hubot.isFirstRun && hubot._isPrivateConversation(message) && message.text === hubot.name;
}

function message1(hubot, message) {
   return hubot.speech().hello(hubot._getUserById(message.user)).append("My name is ").append(hubot.name).append(" and from now on I will help you with some tasks using the Slack.").end();
}

function message2(hubot) {
   return hubot.speech().append("Before I need you to do some settings. How was you who started me I will define it as my system administrator. So you can access the settings in the future.").end();
}

function message3(hubot) {
   return hubot.speech().append("Initially I do not know perform tasks. But there are gears that when coupled to me add me skills.").end();
}

function message4(hubot) {
   return hubot.speech().append("At this time all the gears are inactive. You can activate them and set them up after using the command ").bold("activate gear-name").end();
}

function message5(hubot) {
   return hubot.speech().append("Below is a list of gears available:").end();
}

function postGearsNames(hubot) {
   var speech = hubot.speech();
   
   hubot.gears.forEach(g => speech.item(g.description).line());

   return speech.end();
}
