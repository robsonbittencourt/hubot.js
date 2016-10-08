'use strict';

exports.startConversation = startConversation;
exports.hasActiveConversation = hasActiveConversation;
exports.notify = notify;

let Q = require('q');

const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

var activeConversations = [];

function startConversation(hubot, conversation, message) {
   activeConversations.push(conversation);
   
   conversation.nextInteration = 0;
   
   start(hubot, conversation, message);
}

function start(hubot, conversation, message) {
   var interactions = conversation.interactions;

   if (conversation.nextInteration < interactions.length) {
      speak(hubot, message, conversation, function(conversation) {
         start(hubot, conversation, message);
      });
   } 

   if (conversation.nextInteration == interactions.length) {
      if (conversation.previousConversation) {
         start(hubot, conversation.previousConversation, message);
      } else {
         endConversations(conversation);
      }
   }
}

function speak(hubot, message, conversation, callback) {
   var interaction = conversation.interactions[conversation.nextInteration];

   hubot.talk(message, interaction.speak).then(function() {
      if(justSpeak(conversation, interaction, callback)) return;

      myEmitter.once(message.user, function(response) {
         if (withoutExpectedResponse(conversation, interaction, response, hubot, message, callback)) return;

         if (withExpectedResponse(conversation, interaction, response, hubot, message, callback)) return;
         
         Q(handleResponse(conversation, interaction, response)).then(function(text) {
            conversation.nextInteration++;

            if(text) {
               hubot.talk(message, text).then(function() {
                  if(hasAnotherInteraction(conversation, interaction, response, hubot, message)) return; 
                  callback(conversation);
               });
            } else {
               if(hasAnotherInteraction(conversation, interaction, response, hubot, message)) return; 
               callback(conversation);
            }
         }, function(text) {
            speakReturnedText(hubot, message, conversation, text, callback);
         });         
      });
   });
}

function justSpeak(conversation, interaction, callback) {
   if (!interaction.expectedResponses && !interaction.handler) {
      conversation.nextInteration++;
      callback(conversation);
      return true; 
   }

   return false;
}

function withoutExpectedResponse(conversation, interaction, response, hubot, message, callback) {
   if (!interaction.expectedResponses) {
      Q(handleResponse(conversation, interaction, response)).then(function(text) {
         conversation.nextInteration++;
         speakReturnedText(hubot, message, conversation, text, callback);    
      }, function(text) {
         speakReturnedText(hubot, message, conversation, text, callback);
      });
      return true;   
   }

   return false;
}

function speakReturnedText(hubot, message, conversation, text, callback) {
   if(text) {
      hubot.talk(message, text).then(function() {
         callback(conversation);
      });
   } else {
      callback(conversation);
   }  
}

function withExpectedResponse(conversation, interaction, response, hubot, message, callback) {
   if (!getExpectedResponse(interaction.expectedResponses, response)) {
      hubot.talk(message, invalidResponseMessage(hubot, getExpectedResponses(interaction))).then(function() {
         callback(conversation);
      });
      return true;
   }

   return false;
}

function hasAnotherInteraction(conversation, interaction, response, hubot, message) {
   var expectedResponse = getExpectedResponse(interaction.expectedResponses, response);
   
   if (expectedResponse.iteration) {
      var newConversation = {
         user: message.user,
         interactions: [expectedResponse.iteration],
         gear: conversation.gear,
         nextInteration: 0,
         previousConversation: conversation
      };
      
      start(hubot, newConversation, message);
      return true;
   }

   return false;
}

function handleResponse(conversation, interaction, response) {
   if (interaction.handler) {
      var handler = require(__nodeModules + 'gear-' + conversation.gear + '/' + interaction.handler);
      return handler.handle(response.text);
   }    
}

function getExpectedResponse(expectedResponses, response) {
   if (expectedResponses) {
      return expectedResponses.find(r => r.response === response.text);
   } 

   return null;
}

function getExpectedResponses(interaction) {
   let expectedResponses = [];

   interaction.expectedResponses.forEach(e => expectedResponses.push(e.response));

   return expectedResponses;
}

function invalidResponseMessage(hubot, expectedResponses) {
   return hubot.speech().append("Sorry, I didn't understand.").append("(Expected responses: ").bold(expectedResponses.join(", ")).append(").").end();
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

function endConversations(conversation) {
   activeConversations = activeConversations.filter(c => c.user !== conversation.user);
}
