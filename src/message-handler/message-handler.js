'use strict';

exports.callTasks = callTasks;

function callTasks(message, core) {
   let handlers = getHandlers();

   for (let i = 0; i < handlers.length; i++) {
      let handler = require(__base + 'src/message-handler/handlers/' + handlers[i]);
      
      let isHandled = handler.handle(core.hubot, message, core);
      
      if (isHandled) {
         break;
      }
   };   
}

function getHandlers() {
   return [
      'first-run-handler',
      'conversation-handler',
      'gear-activate-handler',
      'gear-deactivate-handler',
      'gear-configure-handler',
      'tasks-handler'
   ];
}
