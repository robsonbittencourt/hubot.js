'use strict';

exports.callTasks = callTasks;

var trigger = require(__base + 'src/lib/trigger');
var conversation = require(__base + 'src/lib/conversation');

var gearConfig = [
   {
      "id": 1,
      "question": "Qual sua url do Jenkins?"
   },

   {
      "id": 2,
      "question": "Você utiliza CRFS no seu Jenkins?",
      "respostasEsperadas": ["Sim", "Não"]
   },

   {
      "id": 3,
      "question": "Tudo certo. Jenkins configurado"
   }
]; 

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
   return hubot.core.gears.find(gear => function(gear) {
      var configureMessage = 'configure ' + gear.replace("gear-", ""); 
      
      return message.text === configureMessage;
   }) != null;
}

function discoverConfig(hubot, message) {
   //var gearName = message.replace("configure ", "");
   return hubot.core.configs;

}

function getHandler(hubot, task) {
   return hubot.core.handlers.find(h => h.key === task.handler);
}
