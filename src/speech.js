'use strict';

exports.start = start;
exports.error = error;

const Speecher = function Speecher() {
  this.message = null;
};

function start(text) {
  return new Speecher().init(text);
}

function error(text) {
  return new Speecher().errorOccurs(text);
}

Speecher.prototype.init = function init(text) {
  this.message = '';
  this.append(optionalText(text));
  return this;
};

Speecher.prototype.append = function append(text) {
  if (this.initialized()) this.message += text;
  return this;
};

Speecher.prototype.hello = function hello(user) {
  this.append('Hello,').user(user).append('! ');
  return this;
};

Speecher.prototype.thanks = function thanks(user) {
  this.append('Thanks,').user(user).append('!! ');
  return this;
};

Speecher.prototype.user = function user(theUser) {
  this.append(` <@${theUser.id}|${theUser.name}> `);
  return this;
};

Speecher.prototype.channel = function channel() {
  this.append(' <!channel|channel> ');
  return this;
};

Speecher.prototype.bold = function bold(text) {
  this.append(`*${text}*`);
  return this;
};

Speecher.prototype.italic = function italic(text) {
  this.append(`_${text}_`);
  return this;
};

Speecher.prototype.errorOccurs = function errorOccurs(text) {
  this.isError = true;
  this.init().append(':exclamation: _').append(`Ops! ${optionalText(text)}`);
  return this;
};

Speecher.prototype.refer = function refer(text) {
  this.append(`'${text}'`);
  return this;
};

Speecher.prototype.progress = function progress(current, max) {
  this.append(` [${current} of ${max}] `);
  return this;
};

Speecher.prototype.item = function item(text) {
  this.append(`• ${optionalText(text)}`);
  return this;
};

Speecher.prototype.period = function period(text) {
  this.append(`. ${optionalText(text)}`);
  return this;
};

Speecher.prototype.line = function line(text) {
  this.append(`\n${optionalText(text)}`);
  return this;
};

Speecher.prototype.paragraph = function paragraph(text) {
  this.append(`\n\n${optionalText(text)}`);
  return this;
};

Speecher.prototype.separator = function separator(text) {
  this.append(` - ${optionalText(text)}`);
  return this;
};

Speecher.prototype.replace = function replace(key, text) {
  this.message = this.message.replace(`\${${key}}`, optionalText(text));
  return this;
};

Speecher.prototype.end = function end() {
  if (this.isError) this.append('_');
  return this.message;
};

Speecher.prototype.initialized = function initialized() {
  if (this.message === null) {
    throw new Speecher().init('Speecher uninitialized').period().append('Always start with ')
      .bold('speecher.start()').append(' or ').bold('speecher.error()').end();
  }
  return true;
};

function optionalText(text) {
  return text || '';
}
