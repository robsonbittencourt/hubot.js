'use strict';

exports.start = start;
exports.error = error;

function start(text) {
   return new Speecher().start(text);
}

function error(text) {
   return new Speecher().error(text);
}

const Speecher = function () {
   this.message = null;
}

Speecher.prototype.start = Speecher.prototype.restart = function(text) {
   this.message = '';
   this.append(optionalText(text));
   return this;
};

Speecher.prototype.append = function(text) {
   if (this.initialized()) this.message += text;
   return this;
};

Speecher.prototype.hello = function(user) {
   this.append(`Hello,`).user(user).append(`! `);
   return this;
};

Speecher.prototype.thanks = function(user) {
   this.append(`Thanks,`).user(user).append(`!! `);
   return this;
};

Speecher.prototype.user = function(user) {
   this.append(` <@${user.id}|${user.name}> `);
   return this;
};

Speecher.prototype.channel = function() {
   this.append(` <!channel|channel> `);
   return this;
};

Speecher.prototype.bold = function(text) {
   this.append(`*${text}*`);
   return this;
};

Speecher.prototype.italic = function(text) {
   this.append(`_${text}_`);
   return this;
};

Speecher.prototype.error = function(text) {
   this.isError = true;
   this.start().append(':exclamation: _').append(`Ops! ${optionalText(text)}`);
   return this;
};

Speecher.prototype.refer = function(text) {
   this.append(`'${text}'`);
   return this;
};

Speecher.prototype.progress = function(current, max) {
   this.append(` [${current} of ${max}] `);
   return this;
};

Speecher.prototype.item = function(text) {
   this.append(`• ${optionalText(text)}`);
   return this;
};

Speecher.prototype.period = function(text) {
   this.append(`. ${optionalText(text)}`);
   return this;
};

Speecher.prototype.line = function(text) {
   this.append(`\n${optionalText(text)}`);
   return this;
};

Speecher.prototype.paragraph = function(text) {
   this.append(`\n\n${optionalText(text)}`);
   return this;
};

Speecher.prototype.separator = function(text) {
   this.append(` - ${optionalText(text)}`);
   return this;
};

Speecher.prototype.replace = function(key, text) {
   this.message = this.message.replace('${' + key + '}', optionalText(text));
   return this;
};

Speecher.prototype.end = function() {
   if (this.isError) this.append('_');
   return this.message;
};

Speecher.prototype.initialized = function() {
   if (this.message === null) throw new Speecher().start('Speecher uninitialized').period().append('Always start with ').bold('speecher.start()').append(' or ').bold('speecher.error()').end();
   return true;
};

function optionalText(text) {
   return text || '';
}
