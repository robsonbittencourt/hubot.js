'use strict';

exports.callTasks = callTasks;

function callTasks(message, core) {
   const handlers = getHandlers();

   for (let i = 0; i < handlers.length; i++) {
      const handler = require(__base + 'src/message-handler/handlers/' + handlers[i]);
      
      const isHandled = handler.handle(core.hubot, message, core);
      
      if (isHandled) {
         break;
      }
   };   
}

function getHandlers() {
   return [
      'first-run-handler',
      'conversation-handler',
      'gear-status-handler',
      'gear-configure-handler',
      'gears-tasks-handler'
   ];
}
