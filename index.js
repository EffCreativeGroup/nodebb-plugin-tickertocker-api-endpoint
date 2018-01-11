'use strict';

/* globals module, require */

const meta = module.parent.require('./meta');
const sockets = require('./lib/sockets');
const async = require('async');
const winston = module.parent.require('winston');
const plugin = {
  settingsKey: 'ttapi',
  baseUrl: '/tt-api/v1/',
  settings: {},
  tickertockerAdminRole: 20
};

plugin.init = function (data, callback) {
  // API Versions
  var routes = require('./routes')(data.middleware);
  data.router.use(plugin.baseUrl, routes.v1);

  require('./routes/admin')(data.router, data.middleware);	// ACP
  sockets.init(); // WebSocket listeners

  plugin.initialSettings(callback);
};

plugin.addMenuItem = function (custom_header, callback) {
  custom_header.plugins.push({
    route: '/plugins/tickertocker-api-endpoint',
    icon: 'fa-cogs',
    name: 'TickerTocker API'
  });

  callback(null, custom_header);
};

plugin.authenticate = function (data) {
  require('./routes/v1/middleware').requireUser(data.req, data.res, data.next);
};

plugin.reloadSettings = function (event) {
  meta.settings.get(plugin.settingsKey, function (err, settings) {
    if (err) {
      return err;
    }

    plugin.settings = settings;
  });
};

plugin.initialSettings = function (callback) {
  async.waterfall([
    function (next) {
      meta.settings.get(plugin.settingsKey, function (err, settings) {
        if (err) {
          return next(err);
        }

        plugin.settings = settings;

        next();
      });
    },
    function (next) {
      meta.settings.get('session-sharing', function (err, settings) {
        if (err) {
          return next(err);
        }

        plugin.settings.sessionSharingSettings = settings;

        next();
      });
    }
  ], callback);
};

module.exports = plugin;

