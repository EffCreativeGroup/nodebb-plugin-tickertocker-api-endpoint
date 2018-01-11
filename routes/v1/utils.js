'use strict';

/* globals module, require */

var errorHandler = require('../../lib/errorHandler.js');
var utils = {};

utils.checkRequired = function (required, req, res) {
  if (!Array.isArray(required)) {
    required = [required];
  }

  var missing = [];
  for (var i = 0, numRequired = required.length; i < numRequired; i++) {
    if (!req.body.hasOwnProperty(required[i])) {
      missing.push(required[i]);
    }
  }

  if (!missing.length) {
    return true;
  }

  if (res) {
    res.status(400).json(errorHandler.generate(
      400,
      'params-missing',
      'Required parameters were missing from this API call, please see the "params" property',
      missing
    ));
    return false;
  }

  return false;
};

module.exports = utils;
