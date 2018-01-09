(function () {
  'use strict';

  /* globals module */

  var async = module.parent.parent.require('async'),
    fs = require('fs'),
    path = require('path'),
    db = module.parent.parent.require('./database'),
    plugins = module.parent.parent.require('./plugins'),

    buildAdminPage = function (req, res) {
      async.parallel({
        host: async.apply(db.getObject, 'ttapi:host'),
        apiUrlCurrentUser: async.apply(db.getObject, 'ttapi:apiUrlCurrentUser'),
        documentation: function (next) {
          fs.readFile(path.join(__dirname, 'v1/readme.md'), {
            encoding: 'utf-8'
          }, function (err, markdown) {
            plugins.fireHook('filter:parse.raw', markdown, next);
          });
        }
      }, function (err, data) {
        res.render('admin/plugins/nodebb-plugin-tickertocker-api-endpoint', data);
      });
    };

  module.exports = function (app, middleware) {
    app.get('/admin/plugins/nodebb-plugin-tickertocker-api-endpoint', middleware.admin.buildHeader, buildAdminPage);
    app.get('/api/admin/plugins/nodebb-plugin-tickertocker-api-endpoint', buildAdminPage);
  };
}());
