'use strict';
/* globals module, require */

var apiMiddleware = require('./middleware');

var multipart = require.main.require('connect-multiparty');
var meta = require.main.require('./src/meta');

module.exports = function(/*middleware*/) {
  var app = require('express').Router();
  return app;
}
