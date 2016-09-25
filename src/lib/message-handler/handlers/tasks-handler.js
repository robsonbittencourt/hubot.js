'use strict';

exports.handle = handle;

var trigger = require(__base + 'src/lib/trigger');

function handle(hubot, message) {
   hubot.gears.forEach(function(gear) {
      gear.tasks.forEach(function(task) {

         var acceptance = trigger.check(message.text, task.trigger);
         
         if (acceptance.ok) {
            var handler = getHandler(gear, task);
            console.log(hubot);
            console.log(task);
            handler.handle(hubot, message, task, acceptance.params);
            return true;
         }

      }); 
   });

   return false;
}

function getHandler(gear, task) {
   return gear.handlers.find(h => h.key === task.handler);
}
