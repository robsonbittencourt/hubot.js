'use strict';

exports.handle = handle;

var trigger = require(__base + 'src/lib/trigger');

function handle(hubot, message) {
   hubot.gears.forEach(function(gear) {
      gear.tasks.forEach(function(task) {

         var acceptance = trigger.check(message.text, task.trigger);
         
         if (acceptance.ok) {
            hubot._isActiveGear(gear.description).then(function(result) {
               if (result && 'YES' == result.active) {
                  var handler = getHandler(gear, task);
                  handler.handle(hubot, message, task, acceptance.params);
               } else {
                  hubot.postMessage(hubot.getRecipient(message), "Sorry, this feature is disabled.", {as_user: true});
               }
               
               return true;
            });  
            
         }

      }); 
   });

   return false;
}

function getHandler(gear, task) {
   return gear.handlers.find(h => h.key === task.handler);
}
