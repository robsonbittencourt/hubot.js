'use strict';

exports.handle = handle;

const speech = require(__base + 'src/lib/speech');

function handle(hubot, message) {
   if (isGearDeactivateMessage(hubot, message)) {
      
      function deactivateGear(isAdmin) {
         if (isAdmin) {
            var gearDescription = message.text.replace("deactivate ", "");

            hubot._deactivateGear(gearDescription).then(function() {
               let sucessMessage = speech.start('Successfully deactivated ').bold('gear ' + gearDescription).end()
               hubot.postMessage(hubot.getRecipient(message), sucessMessage, {as_user: true});
            
            }, function() {
               let errorMessage = speech.start('Could not deactivate ').bold('gear ' + gearDescription).period().append('See the detailed error in logs').end()
               hubot.postMessage(hubot.getRecipient(message), errorMessage, {as_user: true});
            });
         }         
      }

      hubot._isAdminUser(message.user).then(deactivateGear);
   }
}

function isGearDeactivateMessage(hubot, message) {
   return hubot.gears.find(function(gear) {
      var configureMessage = 'deactivate ' + gear.description; 
    
      return message.text === configureMessage;
   }) != null;
}
