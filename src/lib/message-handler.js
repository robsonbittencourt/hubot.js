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
         //configHandler.config(configs);
      });
   } 

   hubot.core.tasks.forEach(function(task) {
      var acceptance = trigger.check(message.text, task.trigger);
      if (acceptance.ok) {
         var handler = getHandler(hubot, task);
         handler.handle(hubot, message, task, acceptance.params);
      }
   });   
   
}

function isGearConfigureMessage(hubot, message) {
   return hubot.core.gears.find(function(gear) {
      var configureMessage = 'configure ' + gear.replace("gear-", ""); 
    
      return message.text === configureMessage;
   }) != null;
}

function discoverConfig(hubot, message) {
   var gearName = message.text.replace("configure ", "");
   
   return hubot.core.configs.find(c => c.gear === gearName).configs;
}

function getHandler(hubot, task) {
   return hubot.core.handlers.find(h => h.key === task.handler);
}
