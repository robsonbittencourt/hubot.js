'use strict';

exports.callTasks = callTasks;

function callTasks(message, hubot) {
   let handlers = getHandlers();

   for (let i = 0; i < handlers.length; i++) {
      let handler = require(__base + 'src/message-handler/handlers/' + handlers[i]);
      
      let isHandled = handler.handle(hubot, message);
      
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
