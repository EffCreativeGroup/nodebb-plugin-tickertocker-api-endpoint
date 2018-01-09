'use strict';

/* globals module, require */

var apiMiddleware = require('./middleware'),
  errorHandler = require('../../lib/errorHandler'),
  plugins = require.main.require('./src/plugins'),
  ttapi = module.parent.parent.exports;

module.exports = function (app, coreMiddleware) {
  app.use('/users', require('./users')(coreMiddleware));

  app.get('/ping', function (req, res) {
    res.status(200).json({
      code: 'ok',
      message: 'pong',
      params: {}
    });
  });

  app.post('/ping', apiMiddleware.requireUser, function (req, res) {
    res.status(200).json({
      code: 'ok',
      message: 'pong, accepted test POST ping for uid ' + req.user.uid,
      params: {
        uid: req.user.uid
      }
    });
  });

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
