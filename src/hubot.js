'use strict';

const Q = require('q');

const log = require('./lib/log');
const i18n = require('./lib/i18n');
const speech = require('./speech');

let core;

module.exports = class Hubot {
  constructor(receivedCore) {
    this.gears = [];
    core = receivedCore;
  }

  speakTo(recipient, text, vars, message, delay = 1000) {
    const deferred = Q.defer();
    const channel = message ? message.channel : recipient;

    core.ws.send(JSON.stringify({ type: 'typing', channel }));

    setTimeout(() => {
      core.postMessage(recipient, i18n.t(text, vars), { as_user: true })
        .then(() => deferred.resolve(),
          () => deferred.reject());
    }, delay);

    return deferred.promise;
  }

  speak(message, text, vars, delay) {
    return this.speakTo(this.getRecipient(message), text, vars, message, delay);
  }

  i18n(text, vars) {
    return i18n.t(text, vars);
  }

  logInfo(info) {
    log.info(i18n.t(info));
  }

  logError(error) {
    log.error(i18n.t(error));
  }

  logDetailedError(error, metadata) {
    log.detailedError(i18n.t(error), metadata);
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

  speech(text) {
    return speech.start(text);
  }

  findGear(gear) {
    return this.gears.find(g => g.description === gear);
  }

  isAdminUser(user) {
    return core.isAdminUser(user);
  }

  removeBotNameFromMessage(message) {
    let messageWithoutBotName = message.text;

    if (messageWithoutBotName.startsWith(`${core.name} `)) {
      messageWithoutBotName = messageWithoutBotName.replace(`${core.name} `, '');
    }

    return messageWithoutBotName;
  }
};
