'use strict';

exports.callTasks = callTasks;

var trigger = require(__base + 'src/lib/trigger');
var conversation = require(__base + 'src/lib/conversation');

function callTasks(message, hubot) {
   if (conversation.hasActiveConversation(message)) {
      conversation.notify(message);
      return;
   } 

   if (isGearConfigureMessage(hubot, message)) {
      var param = {
         user: message.user,
         configs: discoverConfig(hubot, message)
      }

      conversation.startConversation(hubot, param, function(configs) {
         var configHandler = getConfigHandler(hubot, message);
         configHandler.handle(configs);
      });
   }

   hubot.gears.forEach(function(gear) {
      gear.tasks.forEach(function(task) {
         var acceptance = trigger.check(message.text, task.trigger);
         if (acceptance.ok) {
            var handler = getHandler(gear, task);
            handler.handle(hubot, message, task, acceptance.params);
         }
      }); 
   });   
}

function isGearConfigureMessage(hubot, message) {
   return hubot.gears.find(function(gear) {
      var configureMessage = 'configure ' + gear.description; 
    
      return message.text === configureMessage;
   }) != null;
}

function discoverConfig(hubot, message) {
   var gearDescription = message.text.replace("configure ", "");
   
   return hubot.gears.find(g => g.description === gearDescription).configs;
}

function getHandler(gear, task) {
   return gear.handlers.find(h => h.key === task.handler);
}

function getConfigHandler(hubot, message) {
   var gearDescription = message.text.replace("configure ", "");

   return hubot.gears.find(g => g.description === gearDescription).handler;
}
