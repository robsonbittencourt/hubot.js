 'use strict';

var util = require('util');
var Bot = require('slackbots');
var log = require(__base + 'src/lib/log');
var Assembler = require(__base + 'src/assembler');
var messageHandler = require(__base + 'src/message-handler/message-handler');
var speech = require(__base + 'src/speech');
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
   this._loadBotUser();
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
   if (this._isChatMessage(message) && !this._isFromHubot(message)) {
      if (isFirstInteraction(this, message)) {
         this._firstRun(message);
      } else {
         messageHandler.callTasks(message, this);
      }  
   }
};

Core.prototype._firstRun = function(message) {
   db.run("INSERT INTO first_use(first_use) VALUES('NO')");
   db.run("INSERT INTO admins(admin) VALUES(?)", message.user);
   
   let self = this;
   let hubot = self.hubot;

   self.isFirstRun = false;
   let messageDelay = 3000;
   
   hubot.speak(message, message1(hubot, self, message), messageDelay)
      .then(function() {
         return hubot.speak(message, message2(self), messageDelay);
      })
      .then(function() {
         return hubot.speak(message, message3(self), messageDelay);
      })
      .then(function() {
         return hubot.speak(message, message4(self), messageDelay);
      })
      .then(function() {
         return hubot.speak(message, message5(self), messageDelay);
      })
      .then(function() {
         return hubot.speak(message, message6(self), messageDelay);
      })
      .then(function() {
         hubot.speak(message, postGearsNames(hubot), messageDelay);
      });   
}

Core.prototype._loadBotUser = function () {
   this.user = this._getUserByName(this.name);
};

Core.prototype._getUserByName = function (name) {
   return this.users.find(user => user.name === name);
};

Core.prototype._getUserById = function (userId) {
   return this.users.find(user => user.id === userId);
};

Core.prototype._isChatMessage = function (message) {
   return message.type === 'message' && Boolean(message.text);
};

Core.prototype._isChannelConversation = function (message) {
   return typeof message.channel === 'string' && message.channel[0] === 'C';
};

Core.prototype._isPrivateConversation = function (message) {
   return typeof message.channel === 'string' && message.channel[0] === 'D';
};

Core.prototype._isFromHubot = function (message) {
   return message.user === this.user.id;
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

Core.prototype._activateGear = function (gear) {
   findGear(this.hubot, gear).active = true;

   return db.run('UPDATE gears SET active = "YES" WHERE description = ?', gear);
}

Core.prototype._deactivateGear = function (gear) {
   findGear(this.hubot, gear).active = false;

   return db.run('UPDATE gears SET active = "NO" WHERE description = ?', gear);
}

Core.prototype._getGear = function (gear) {
   return db.get('SELECT * FROM gears WHERE description = ?', gear);
}

function isFirstInteraction(core, message) {
   return core.isFirstRun && core._isPrivateConversation(message) && message.text === core.name;
}

function message1(hubot, core, message) {
   return hubot.speech().hello(core._getUserById(message.user)).append("My name is ").append(core.name).append(" and from now on I will help you with some tasks using the Slack.").end();
}

function message2(hubot) {
   return hubot.speech().append("Before I need you to do some settings. How was you who started me I will define it as my system administrator. So you can access the settings in the future.").end();
}

function message3(hubot) {
   return hubot.speech().append("Initially I do not know perform tasks. But there are gears that when coupled to me add me skills.").end();
}

function message4(hubot) {
   return hubot.speech().append("At this time all the gears are inactive. You can activate them using the command ").bold("activate gear-name").period().end();
}

function message5(hubot) {
   return hubot.speech().append("Some gears have settings. To let them use the command ").bold("configure gear-name").period().end();
}

function message6(hubot) {
   return hubot.speech().append("Below is a list of gears available:").end();
}

function postGearsNames(hubot) {
   var speech = hubot.speech();
   
   hubot.gears.forEach(g => speech.item(g.description).line());

   return speech.end();
}

function findGear(hubot, gear) {
   return hubot.gears.find(g => g.description === gear);
}
