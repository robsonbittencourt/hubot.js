'use strict';

exports.handle = handle;

const speech = require(__base + 'src/speech');

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
            hubot.talk(message, 'This gear is already active.');
         } else {
            hubot._activateGear(gear.description).then(function() {
               hubot.talk(message, sucessMessage(gear.description));
            }, function() {
               hubot.talk(message, errorMessage(gear.description));
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
