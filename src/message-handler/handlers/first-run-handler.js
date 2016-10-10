'use strict';

exports.handle = handle;

function handle(hubot, message) {
   if (hubot.isFirstRun) {
      return true;
   } 

   return false;
}
