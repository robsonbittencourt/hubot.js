'use strict';

exports.startConversation = startConversation;
exports.hasActiveConversation = hasActiveConversation;
exports.notify = notify;

const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

var activeConversations = [];

function startConversation(hubot, conversation, callback) {
   activeConversations.push(conversation);
   start(0, hubot, conversation, callback);
}

function start(i, hubot, conversation, callback) {
   var configs = conversation.configs;

   if (i < configs.length) {
      talk(hubot, conversation.user, configs[i], i, function(answer, nextQuestion) {
         if (answer) {
            configs[i].answer = answer;   
         }

         start(nextQuestion, hubot, conversation, callback);
      })
   } 

   if (i == configs.length - 1) {
      callback(configs);
      endConversation(conversation);
   }
}

function talk(hubot, recipient, config, actualQuestion, callback) {
   hubot.postMessage(recipient, config.question, {as_user: true});

   myEmitter.once(recipient, function(message) {
      var isInvalidAnwser = config.expectedResponses && !config.expectedResponses.find(r => r === message.text); 

      if (isInvalidAnwser) {
         hubot.postMessage(recipient, invalidResponseMessage(hubot, config.expectedResponses), {as_user: true});
         callback(null, actualQuestion);
      } else {
         callback(message.text, actualQuestion + 1);   
      }
   });
}

function invalidResponseMessage(hubot, expectedResponses) {
   return hubot.speech().append("Sorry, I didn't understand.").append("(Expected awnsers: ").bold(expectedResponses.join(", ")).append(").").end();
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

function endConversation(conversation) {
   activeConversations = activeConversations.filter(c => c.user !== conversation.user);
}
