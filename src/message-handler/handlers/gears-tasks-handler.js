'use strict';

exports.handle = handle;

var Hubot = require(__base + 'src/hubot');
var trigger = require(__base + 'src/message-handler/trigger');

function handle(hubot, message, core) {
   hubot.gears.forEach(function(gear) {
      gear.tasks.forEach(function(task) {

         var acceptance = trigger.check(message.text, task.trigger);
         
         if (acceptance.ok) {
            if (gear.active) {
               var hubotClone = getHubotClone(core);
               var handler = getHandler(gear, task);
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

function getHubotClone(core) {
   var hubotClone = new Hubot(core);
   hubotClone.gears = JSON.parse(JSON.stringify(core.hubot.gears));
   
   return hubotClone;
}

function getHandler(gear, task) {
   return gear.handlers.find(h => h.key === task.handler);
}
