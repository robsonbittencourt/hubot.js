'use strict';

const winston = require('winston');

exports.info = info;
exports.error = error;
exports.detailedError = detailedError;

winston.add(winston.transports.File, { filename: __base + 'logs/hubot.log', handleExceptions: true });
winston.remove(winston.transports.Console);

function info(info) {
   winston.info(info);
}

function error(error) {
   winston.error(error);
}

function detailedError(error, metadata) {
   winston.error('error', error, {error: metadata});
}
