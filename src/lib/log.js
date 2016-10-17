'use strict';

const winston = require('winston');

exports.info = info;
exports.error = error;
exports.detailedError = detailedError;

winston.add(winston.transports.File, { filename: '../../logs/hubot.log', handleExceptions: true });
winston.remove(winston.transports.Console);

function info(logInfo) {
  winston.info(logInfo);
}

function error(logError) {
  winston.error(logError);
}

function detailedError(logError, metadata) {
  winston.error('error', logError, { error: metadata });
}
