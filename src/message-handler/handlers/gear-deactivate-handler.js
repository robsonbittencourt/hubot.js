'use strict';

exports.handle = handle;

const speech = require(__base + 'src/speech');

function handle(hubot, message, core) {
   if (isGearDeactivateMessage(hubot, message)) {

      core._isAdminUser(message.user)
         .then(getGear)
         .then(deactivateGear);

      function getGear(isAdmin) {
         if (isAdmin) {
            var gearDescription = message.text.replace("deactivate ", "");

            return core._getGear(gearDescription);
         }         
      }

      function deactivateGear(gear) {
         if (gear && 'NO' == gear.active) {
            hubot.speak(message, 'This gear is already inactive.');
         } else {
            core._deactivateGear(gear.description).then(function() {
               hubot.speak(message, sucessMessage(gear.description));
            }, function() {
               hubot.speak(message, errorMessage(gear.description));
            });
         } 
      }
   }
}

function isGearDeactivateMessage(hubot, message) {
   return hubot.gears.find(function(gear) {
      var configureMessage = 'deactivate ' + gear.description; 
    
      return message.text === configureMessage;
   }) != null;
}

function sucessMessage(gearDescription) {
   return speech.start('Successfully deactivated ').bold('gear ' + gearDescription).end();
}

function errorMessage(gearDescription) {
   return speech.start('Could not deactivate ').bold('gear ' + gearDescription).period().append('See the detailed error in logs').end()
}
