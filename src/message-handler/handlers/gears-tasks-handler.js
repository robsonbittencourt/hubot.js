'use strict';

const Hubot = require(__base + 'src/hubot');
const trigger = require(__base + 'src/message-handler/trigger');

exports.handle = handle;

function handle(hubot, message, core) {
   hubot.gears.forEach(function(gear) {
      gear.tasks.forEach(function(task) {

         const acceptance = trigger.check(message.text, task.trigger);
         
         if (acceptance.ok) {
            if (gear.active) {
               if (incorretMessageSource(hubot, task, message)) {
                  return true;
               }              

               const hubotClone = getHubotClone(core);
               const handler = getHandler(gear, task);
               handler.handle(hubotClone, message, task, acceptance.params);
            } else {
               hubot.speak(message, "Sorry, this feature is disabled.");
            }
            
            return true;
         }

      }); 
   });

   return false;
}

function incorretMessageSource(hubot, task, message) {
   if (task.onlyInChannel && !hubot.isFromChannel(message)) {
      hubot.speak(message, "Sorry, this feature can only be performed on a channel.");
      return true;
   } 

   if (task.onlyInPrivate && !hubot.isFromPrivate(message)) {
      hubot.speak(message, "Sorry, this feature can only be performed directly with me in private.");
      return true;
   }

   return false; 
}

function getHubotClone(core) {
   const hubotClone = new Hubot(core);
   hubotClone.gears = JSON.parse(JSON.stringify(core.hubot.gears));
   
   return hubotClone;
}

function getHandler(gear, task) {
   return gear.handlers.find(h => h.key === task.handler);
}
