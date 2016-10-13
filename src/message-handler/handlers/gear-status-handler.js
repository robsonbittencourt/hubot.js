'use strict';

exports.handle = handle;

const speech = require(__base + 'src/speech');
const db = require(__base + 'src/lib/db');

function handle(hubot, message, core) {
   const action = getAction(message);

   if (action && isGearChangeStatusMessage(action, hubot, message)) {
      core.isAdminUser(message.user).then(changeStatus);          
   } else {
      return false;
   }

   function changeStatus(isAdmin) {
      if (isAdmin) {
         const gear = discoverGear(action, hubot, message);

         if (gear && gear.active === action.status) {
            hubot.speak(message, 'This gear is already ' + action.statusDescription + '.');
         } else {
            changeGearStatus(action, hubot, gear.description).then(function() {
               hubot.speak(message, sucessMessage(action, gear.description));
            }, function() {
               hubot.speak(message, errorMessage(action, gear.description));
            });
         }

         return true;
      }   
   }  
}

function changeGearStatus(action, hubot, gear) {
   hubot.findGear(gear).active = action.status;
   
   return db.getDb().run('UPDATE gears SET active = ? WHERE description = ?', action.status, gear); 
}

function isGearChangeStatusMessage(action, hubot, message) {
   return hubot.gears.find(function(gear) {
      const configureMessage = action.description + ' ' + gear.description; 
    
      return message.text === configureMessage;
   }) != null;
}

function discoverGear(action, hubot, message) {
   const gearDescription = message.text.replace(action.description + ' ', '');
   return hubot.findGear(gearDescription);
} 

function sucessMessage(action, gearDescription) {
   return speech.start('Successfully ' + action.description + 'd ').bold('gear ' + gearDescription).end();
}

function errorMessage(gearDescription) {
   return speech.start('Could not' + action.description + " ").bold('gear ' + gearDescription).period().append('See the detailed error in logs').end()
}

function getAction(message) {
   if (message.text.startsWith('activate')) {
      return { 
         description: 'activate', status: true, statusDescription: 'active'
      };
   } else if (message.text.startsWith('deactivate')) {
      return {
          description: 'deactivate', status: false, statusDescription: 'inactive'
      };
   } 

   return null;
}
