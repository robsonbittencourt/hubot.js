'use strict';

const db = require('../../../../lib/db');
const trigger = require('../../../../message-handler/trigger');

exports.handle = handle;

function handle(hubot, message, task, params) {
  const action = getAction(message, hubot);

  if (action && isGearChangeStatusMessage(action, hubot, message)) {
    hubot.isAdminUser(message.user)
      .then(isAdmin => changeStatus(isAdmin, action, hubot, message, params[0]));

    return true;
  }

  return false;
}

function changeStatus(isAdmin, action, hubot, message, gearDescription) {
  if (isAdmin) {
    const gear = hubot.findGear(gearDescription);

    if (gear && !gear.isInternal) {
      if (gear.active === action.status) {
        hubot.speak(message, 'hubot-gears-status:activation.already', { statusDescription: action.already });
      } else {
        changeGearStatus(action, hubot, gear.description)
          .then(() => hubot.speak(message, sucessMessage(action, hubot, gear.description)),
            () => hubot.speak(message, errorMessage(action, hubot, gear.description)));
      }
    }
  }
}

function changeGearStatus(action, hubot, gear) {
  hubot.findGear(gear).active = action.status;

  return db.getDb().run('UPDATE gears SET active = ? WHERE description = ?', action.status, gear);
}

function isGearChangeStatusMessage(action, hubot, message) {
  return hubot.gears.find(gear => trigger.check(message, `${action.description} ${gear.description}`).ok) !== null;
}

function sucessMessage(action, hubot, gearDescription) {
  const messages = { statusDescription: action.success, gearDescription };
  return hubot.speech().append('hubot-gears-status:activation.success', messages).end();
}

function errorMessage(action, hubot, gearDescription) {
  const messages = { statusDescription: action.description, gearDescription };
  return hubot.speech().append('hubot-gears-status:activation.error', messages).end();
}

function getAction(message, hubot) {
  const active = hubot.i18n('hubot-gears-status:activation.active');
  const inactive = hubot.i18n('hubot-gears-status:activation.inactive');
  const activate = hubot.i18n('hubot-gears-status:activation.activate');
  const deactivate = hubot.i18n('hubot-gears-status:activation.deactivate');
  const activated = hubot.i18n('hubot-gears-status:activation.actived');
  const deactivated = hubot.i18n('hubot-gears-status:activation.deactivated');

  const messageWithoutBotName = hubot.removeBotNameFromMessage(message);

  if (messageWithoutBotName.startsWith(activate)) {
    return { description: activate, status: true, already: active, success: activated };
  }

  if (messageWithoutBotName.startsWith(deactivate)) {
    return { description: deactivate, status: false, already: inactive, success: deactivated };
  }

  return null;
}
