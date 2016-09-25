'use strict';

exports.handle = handle;

const conversation = require(__base + 'src/lib/conversation');

function handle(hubot, message) {
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

function getConfigHandler(hubot, message) {
   var gearDescription = message.text.replace("configure ", "");

   return hubot.gears.find(g => g.description === gearDescription).configHandler;
}
