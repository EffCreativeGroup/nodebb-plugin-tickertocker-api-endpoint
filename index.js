'use strict';

/* globals module, require */

const meta = module.parent.require('./meta');
const sockets = require('./lib/sockets');
const async = require.main.require('async');
const API = {
  settings: {},
  tickertockerAdminRole: 20
};

API.init = function (data, callback) {
  // API Versions
  var routes = require('./routes')(data.middleware);
  data.router.use('/tt-api/v1', routes.v1);

  require('./routes/admin')(data.router, data.middleware);	// ACP
  sockets.init();	// WebSocket listeners

  API.reloadSettings(callback);
};

API.addMenuItem = function (custom_header, callback) {
  custom_header.plugins.push({
    route: '/plugins/nodebb-plugin-tickertocker-api-endpoint',
    icon: 'fa-cogs',
    name: 'TT API'
  });

  callback(null, custom_header);
};

API.authenticate = function (data) {
  require('./routes/v1/middleware').requireUser(data.req, data.res, data.next);
};

API.reloadSettings = function (callback) {
  async.waterfall([
    function (next) {
      meta.settings.get('ttapi', function (err, settings) {
        if (err) {
          return next(err);
        }

        API.settings = settings;

        next();
      });
    },
    function (next) {
      meta.settings.get('session-sharing', function (err, settings) {
        if (err) {
          return next(err);
        }

        API.settings.sessionSharringSettings = settings;

        // winston.info('[API Settings]', API.settings);

        next();
      });
    }
  ], callback);
};

module.exports = API;

