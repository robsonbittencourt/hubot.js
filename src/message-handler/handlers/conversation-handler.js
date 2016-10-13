'use strict';

const conversation = require(__base + 'src/message-handler/conversation');

exports.handle = handle;

function handle(hubot, message) {
   if (conversation.hasActiveConversation(message)) {
      conversation.notify(message);
      return true;  
   } 

   return false;
}
