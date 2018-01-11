'use strict';

/* globals module */

var { NOT_AUTHORIZED } = require('../constants/response-codes');
var translator = require.main.require('./public/src/modules/translator');
var isLanguageKey = /^\[\[[\w.\-_:]+]]$/;
var errorHandlers = {};

errorHandlers.respond = function (status, res) {
  var code = null;
  var message = null;
  var params = null;

  if (res.params) {
    params = res.params;
    message = res.message;
    code = res.code;
  }

  var errorPayload = errorHandlers.generate(status, code, message, params);

  res.status(status).json(errorPayload);
  return true;
};

errorHandlers.handle = function (err, res, payload) {
  if (err) {
    if (isLanguageKey.test(err.message)) {
      translator.translate(err.message, 'en_GB', function (translated) {
        res.status(500).json(errorHandlers.generate(500, undefined, translated));
      });
    } else {
      res.status(500).json(errorHandlers.generate(500, undefined, err.message));
    }
  } else {
    res.status(200).json({
      code: 'ok',
      payload: payload || {}
    });
  }
};

errorHandlers.generate = function (status, code, message, params) {
  // All arguments are optional
  var errorPayload = errorHandlers.statusToCode(status);

  errorPayload.code = code || errorPayload.code;
  errorPayload.message = message || errorPayload.message;
  errorPayload.params = params || errorPayload.params;

  return errorPayload;
};

errorHandlers.statusToCode = function (status) {
  var payload = {
    code: 'internal-server-error',
    message: 'An unexpected error was encountered while attempting to service your request.',
    params: {}
  };

  switch (status) {
    case 400:
      payload.code = 'bad-request';
      payload.message = 'Something was wrong with the request payload you passed in.';
      break;

    case 401:
      payload.code = NOT_AUTHORIZED;
      payload.message = 'A valid login session was not found. Please log in and try again.';
      break;

    case 403:
      payload.code = 'forbidden';
      payload.message = 'You are not authorized to make this call';
      break;

    case 404:
      payload.code = 'not-found';
      payload.message = 'Invalid API call';
      break;

    case 422:
      payload.code = 'invalid-param';
      payload.message = 'Invalid API params call';
      break;

    case 426:
      payload.code = 'upgrade-required';
      payload.message = 'HTTPS is required for requests to the TT API, please re-send your request via HTTPS';
      break;
  }

  return payload;
};

module.exports = errorHandlers;
