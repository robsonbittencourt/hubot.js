'use strict';

let Q = require('q');
var log = require(__base + 'src/lib/log');
var speech = require(__base + 'src/speech');

module.exports = class Hubot {
   
   constructor(core) {
      this.gears = [];
      this.core = core;
   }

   speakTo(recipient, text, message, delay = 1000) {
      let deferred = Q.defer();
      let channel = message ? message.channel : recipient;

      this.core.ws.send(JSON.stringify({ type: 'typing', channel: channel }));
      
      setTimeout(() => {
         
         this.core.postMessage(recipient, text, {as_user: true}).then(function() {
            deferred.resolve();
         }, function() {
            deferred.reject();
         });

      }, delay);

      return deferred.promise;
   }

   speak(message, text, delay) {
      return this.speakTo(this.getRecipient(message), text, message, delay);
   }

   logInfo(info) {
      log.info(info);
   }

   logError(error) {
      log.error(error);
   }

   logDetailedError(error, metadata) {
      log.detailedError(error, metadata);
   }

   isFromChannel(message) {
      return this.core._isChannelConversation(message);
   }

   isFromPrivate(message) {
      return this.core._isPrivateConversation(message);
   }

   getUser(message) {
      return this.core._getUserById(message.user);
   }

   getRecipient(message) {
      return this.core.getRecipient(message);
   }

   speech(message) {
      return speech.start(message);
   }
   
}


