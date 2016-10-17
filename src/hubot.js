'use strict';

const Q = require('q');

const log = require('./lib/log');
const speech = require('./speech');

let core;

module.exports = class Hubot {

  constructor(receivedCore) {
    this.gears = [];
    core = receivedCore;
  }

  speakTo(recipient, text, message, delay = 1000) {
    const deferred = Q.defer();
    const channel = message ? message.channel : recipient;

    core.ws.send(JSON.stringify({ type: 'typing', channel }));

    setTimeout(() => {
      core.postMessage(recipient, text, { as_user: true })
        .then(() => deferred.resolve(),
              () => deferred.reject());
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
    return core.isChannelConversation(message);
  }

  isFromPrivate(message) {
    return core.isPrivateConversation(message);
  }

  getUser(message) {
    return core.getUserById(message.user);
  }

  getRecipient(message) {
    return core.getRecipient(message);
  }

  speech(message) {
    return speech.start(message);
  }

  findGear(gear) {
    return this.gears.find(g => g.description === gear);
  }

};
