'use strict';

exports.startConversation = startConversation;
exports.hasActiveConversation = hasActiveConversation;
exports.notify = notify;

const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

var activeConversations = [];

function startConversation(hubot, conversation, message, callback) {
   activeConversations.push(conversation);
   start(0, hubot, conversation, message, callback);
}

function start(i, hubot, conversation, message, callback) {
   var configs = conversation.configs;

   if (i < configs.length) {
      talk(hubot, message, configs[i], i, function(answer, nextQuestion) {
         if (answer) {
            configs[i].answer = answer;   
         }

         start(nextQuestion, hubot, conversation, message, callback);
      })
   } 

   if (i == configs.length - 1) {
      callback(configs);
      endConversation(conversation);
   }
}

function talk(hubot, message, config, actualQuestion, callback) {
   hubot.talk(message, config.question);

   myEmitter.once(message.user, function(anwser) {
      var isInvalidAnwser = config.expectedResponses && !config.expectedResponses.find(r => r === anwser.text); 

      if (isInvalidAnwser) {
         hubot.talk(message, invalidResponseMessage(hubot, config.expectedResponses));
         callback(null, actualQuestion);
      } else {
         callback(anwser.text, actualQuestion + 1);   
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
