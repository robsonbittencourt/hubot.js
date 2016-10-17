'use strict';

const conversation = require('../conversation');

exports.handle = handle;

function handle(hubot, message) {
  if (conversation.hasActiveConversation(message)) {
    conversation.notify(message);
    return true;
  }

  return false;
}
