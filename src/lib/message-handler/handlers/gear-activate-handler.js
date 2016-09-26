'use strict';

exports.handle = handle;

const speech = require(__base + 'src/lib/speech');

function handle(hubot, message) {
   if (isGearActivateMessage(hubot, message)) {

      hubot._isAdminUser(message.user)
         .then(getGear)
         .then(activateGear);
      
      function getGear(isAdmin) {
         if (isAdmin) {
            var gearDescription = message.text.replace("activate ", "");

            return hubot._getGear(gearDescription);
         }         
      }

      function activateGear(gear) {
         if (gear && 'YES' == gear.active) {
            hubot.postMessage(hubot.getRecipient(message), 'This gear is already active.', {as_user: true});
         } else {
            hubot._activateGear(gear.description).then(function() {
               hubot.postMessage(hubot.getRecipient(message), sucessMessage(gear.description), {as_user: true});
            }, function() {
               hubot.postMessage(hubot.getRecipient(message), errorMessage(gear.description), {as_user: true});
            });
         } 
      }      
   }
}

function isGearActivateMessage(hubot, message) {
   return hubot.gears.find(function(gear) {
      var configureMessage = 'activate ' + gear.description; 
    
      return message.text === configureMessage;
   }) != null;
}

function sucessMessage(gearDescription) {
   return speech.start('Successfully activated ').bold('gear ' + gearDescription).end();
}

function errorMessage(gearDescription) {
   return speech.start('Could not activate ').bold('gear ' + gearDescription).period().append('See the detailed error in logs').end()
}
