'use strict';

exports.handle = handle;

function handle(hubot, message) {
   if (isGearActivateMessage(hubot, message)) {
      function activateGear(isAdmin) {
         if (isAdmin) {
            var gearDescription = message.text.replace("activate ", "");

            hubot._activateGear(gearDescription);
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
