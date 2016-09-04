'use strict';

exports.startConversation = startConversation;
exports.hasActiveConversation = hasActiveConversation;
exports.notify = notify;

const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

var activeConversations = [];

function startConversation(hubot, conversation) {
   activeConversations.push(conversation);
   start(0, hubot, conversation);
}

function start(i, hubot, conversation) {
   var configs = conversation.configs;

   if (i < configs.length) {
      talk(hubot, conversation.user, configs[i].question, function() {
         start(i + 1, hubot, conversation);
      })
   }
}

function talk(hubot, recipient, question, callback) {
   hubot.postMessage(recipient, question, {as_user: true});

   myEmitter.once(recipient, function(message) {
      getActiveConversation(message).answer = message.text;
      callback();
   });
}

function hasActiveConversation(message) {
   return getActiveConversation(message) != null;
}

function notify(message) {
   myEmitter.emit(message.user, message);
}

function getActiveConversation(message) {
   return activeConversations.find(c => c.user === message.user);
}
