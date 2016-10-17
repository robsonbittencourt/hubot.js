'use strict';

const stringfy = require('string');

exports.check = check;

function check(message, trigger) {
  return new Trigger('$').with(normalize(trigger)).accept(normalize(message));
}

class Trigger {
  constructor(placeholder) {
    this.placeholder = placeholder;
  }

  with(trigger) {
    this.trigger = trigger;
    this.params = new TriggerParams(this.trigger, this.placeholder);
    return this;
  }

  accept(message) {
    if (this.params.has()) {
      return this.acceptWithParams(message);
    }

    return this.acceptWithoutParams(message);
  }

  acceptWithParams(message) {
    const count = this.params.count();
    const params = this.params.capture(message);
    const matches = params.length === count;
    return { ok: matches, params: matches ? params : [] };
  }

  acceptWithoutParams(message) {
    return { ok: this.trigger === message, params: [] };
  }
}

class TriggerParams {
  constructor(trigger, placeholder) {
    this.trigger = trigger;
    this.placeholder = placeholder;
  }

  has() {
    return this.trigger.includes(this.placeholder) && !this.trigger.startsWith(this.placeholder);
  }

  count() {
    return this.trigger.match(new RegExp(`\\${this.placeholder}`, 'g')).length;
  }

  capture(message) {
    let newMessage = message;

    // trigger: 'get $ to $'  >  ['get ', ' to ']
    const triggerParts = this.trigger.split(this.placeholder).filter(s => s);

    // message must includes all trigger parts
    if (triggerParts.find(t => !newMessage.includes(t))) return [];

    // message: 'get alpha to beta'  >  'alpha$beta'
    triggerParts.forEach(trigger => (newMessage = newMessage.replace(trigger, this.placeholder)));

    // message: 'alpha$beta'  >  ['alpha', 'beta']
    return newMessage.split(this.placeholder).filter(s => s);
  }
}

function normalize(text) {
  return stringfy(text).trim().latinise().s.toLowerCase();
}
