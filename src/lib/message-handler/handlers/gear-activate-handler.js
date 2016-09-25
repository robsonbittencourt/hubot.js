'use strict';

exports.handle = handle;

const speech = require(__base + 'src/lib/speech');

function handle(hubot, message) {
   if (isGearActivateMessage(hubot, message)) {
      
      function activateGear(isAdmin) {
         if (isAdmin) {
            var gearDescription = message.text.replace("activate ", "");

            hubot._activateGear(gearDescription).then(function() {
               let sucessMessage = speech.start('Successfully activated ').bold('gear ' + gearDescription).end()
               hubot.postMessage(hubot.getRecipient(message), sucessMessage, {as_user: true});
            
            }, function() {
               let errorMessage = speech.start('Could not activate ').bold('gear ' + gearDescription).period().append('See the detailed error in logs').end()
               hubot.postMessage(hubot.getRecipient(message), errorMessage, {as_user: true});
            });
         }         
      }

      hubot._isAdminUser(message.user).then(activateGear);
   }
}

function isGearActivateMessage(hubot, message) {
   return hubot.gears.find(function(gear) {
      var configureMessage = 'activate ' + gear.description; 
    
      return message.text === configureMessage;
   }) != null;
}
