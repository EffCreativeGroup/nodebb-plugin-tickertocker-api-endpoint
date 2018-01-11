'use strict';

/* globals module, require */

var apiMiddleware = require('./middleware');
var errorHandler = require('../../lib/errorHandler');
var plugins = require.main.require('./src/plugins');

module.exports = function (app, coreMiddleware) {
  app.use('/users', require('./users')(coreMiddleware));

  // This router is reserved exclusively for plugins to add their own routes into the TT API plugin. Confused yet? :trollface:
  var customRouter = require('express').Router();
  plugins.fireHook('filter:plugin.ttapi.routes', {
    router: customRouter,
    apiMiddleware: apiMiddleware,
    middleware: coreMiddleware,
    errorHandler: errorHandler
  }, function (err, payload) {
    app.use('/', payload.router);

    app.use(function (req, res) {
      // Catch-all
      errorHandler.respond(404, res);
    });
  });

  return app;
};
