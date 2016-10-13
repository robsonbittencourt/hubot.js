'use strict';

const db = require(__base + 'src/lib/db');

exports.firstRun = firstRun;

function firstRun(core, message) {
   db.getDb().run("INSERT INTO first_use(first_use) VALUES('NO')");
   db.getDb().run("INSERT INTO admins(admin) VALUES(?)", message.user);

   const hubot = core.hubot;
   const messageDelay = 3000;
   
   hubot.speak(message, message1(hubot, core, message), messageDelay)
      .then(function() {
         return hubot.speak(message, message2(hubot), messageDelay);
      })
      .then(function() {
         return hubot.speak(message, message3(hubot), messageDelay);
      })
      .then(function() {
         return hubot.speak(message, message4(hubot), messageDelay);
      })
      .then(function() {
         return hubot.speak(message, message5(hubot), messageDelay);
      })
      .then(function() {
         return hubot.speak(message, message6(hubot), messageDelay);
      })
      .then(function() {
         hubot.speak(message, postGearsNames(hubot), messageDelay);
      });   
}

function message1(hubot, core, message) {
   return hubot.speech().hello(core.getUserById(message.user)).append("My name is ").append(core.name).append(" and from now on I will help you with some tasks using the Slack.").end();
}

function message2(hubot) {
   return hubot.speech().append("Before I need you to do some settings. How was you who started me I will define you as my system administrator. So you can access the settings in the future.").end();
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
   const speech = hubot.speech();
   
   hubot.gears.forEach(g => speech.item(g.description).line());

   return speech.end();
}
