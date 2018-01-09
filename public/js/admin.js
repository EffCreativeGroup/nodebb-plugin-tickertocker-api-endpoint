'use strict';

/* globals define, $, socket, ajaxify, app */

define('admin/plugins/nodebb-plugin-tickertocker-api-endpoint', ['settings'], function (Settings) {
  var Admin = {};

  Admin.init = function () {
    Admin.initSettings();
  };

  Admin.initSettings = function () {
    Settings.load('ttapi', $('.ttapi-settings'));

    $('#save').on('click', function () {
      Settings.save('ttapi', $('.ttapi-settings'), function () {
        app.alert({
          type: 'success',
          alert_id: 'tt-api-saved',
          title: 'Settings Saved',
          timeout: 2500
        });
      });
    });
  };

  return Admin;
});
