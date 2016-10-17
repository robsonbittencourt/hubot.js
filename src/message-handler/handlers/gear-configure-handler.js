'use strict';

const conversation = require('../conversation');

exports.handle = handle;

function handle(hubot, message) {
  if (isGearConfigureMessage(hubot, message)) {
    const param = {
      user: message.user,
      gear: gearDescription(message),
      interactions: discoverConfig(hubot, message)
    };

    conversation.startConversation(hubot, param, message);
  }
}

function isGearConfigureMessage(hubot, message) {
  return hubot.gears.find((gear) => {
    const configureMessage = `configure ${gear.description}`;

    return message.text === configureMessage;
  }) != null;
}

function discoverConfig(hubot, message) {
  return hubot.gears.find(g => g.description === gearDescription(message)).configs;
}

function gearDescription(message) {
  return message.text.replace('configure ', '');
}
