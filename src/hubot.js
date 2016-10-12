'use strict';

let Q = require('q');
var log = require(__base + 'src/lib/log');
var speech = require(__base + 'src/speech');
let _core;

module.exports = class Hubot {
   
   constructor(core) {
      this.gears = [];
      _core = core;
   }

   speakTo(recipient, text, message, delay = 1000) {
      let deferred = Q.defer();
      let channel = message ? message.channel : recipient;

      _core.ws.send(JSON.stringify({ type: 'typing', channel: channel }));
      
      setTimeout(() => {
         
         _core.postMessage(recipient, text, {as_user: true}).then(function() {
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
      return _core._isChannelConversation(message);
   }

   isFromPrivate(message) {
      return _core._isPrivateConversation(message);
   }

   getUser(message) {
      return _core._getUserById(message.user);
   }

   getRecipient(message) {
      return _core.getRecipient(message);
   }

   speech(message) {
      return speech.start(message);
   }

   findGear(gear) {
      return this.gears.find(g => g.description === gear);
   }
   
}


