'use strict';

exports.handle = handle;

function handle(hubot, message, core) {
   if (core.isFirstRun) {
      return true;
   } 

   return false;
}
