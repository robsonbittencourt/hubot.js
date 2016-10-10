'use strict';

exports.handle = handle;

const speech = require(__base + 'src/speech');

function handle(hubot, message) {
   if (isGearDeactivateMessage(hubot, message)) {

      hubot._isAdminUser(message.user)
         .then(getGear)
         .then(deactivateGear);

      function getGear(isAdmin) {
         if (isAdmin) {
            var gearDescription = message.text.replace("deactivate ", "");

            return hubot._getGear(gearDescription);
         }         
      }

      function deactivateGear(gear) {
         if (gear && 'NO' == gear.active) {
            hubot.talk(message, 'This gear is already inactive.');
         } else {
            hubot._deactivateGear(gear.description).then(function() {
               hubot.talk(message, sucessMessage(gear.description));
            }, function() {
               hubot.talk(message, errorMessage(gear.description));
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
