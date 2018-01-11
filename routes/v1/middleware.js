'use strict';

/* globals module, require */

var async = require('async');
var errorHandler = require('../../lib/errorHandler');
var winston = require('winston');
var { TOKEN_INVALID } = require('../../constants/response-codes');
var { ROLE_ADMIN } = require('../../constants/user-roles');

var middlewares = {};
middlewares.requireUser = function (req, res, next) {
  var restApiClientFactory = require('../../rest-api-client');
  var restApi = restApiClientFactory();
  if (req.headers.hasOwnProperty('authorization')) {
    var token = req.headers.authorization.substr(7);
    winston.info('[tt-api-endpoint][A] token:', token);

    restApi.setToken(token);

    var callback = function (err, uid, role) {
      if (err) {
        switch (err.message) {
          case TOKEN_INVALID:
            winston.error('[tt-api-endpoint] The passed-in token was invalid and could not be processed');
            return errorHandler.respond(401, res);

          default:
            winston.error('[tt-api-endpoint] Error encountered while parsing token: ' + err.message);
            return errorHandler.respond(401, res);
        }
      }

      req.uid = uid;
      req.role = role;
      next();
    };

    async.waterfall([
      async.apply(verifyToken, token)
    ], callback);
  } else {
    errorHandler.respond(401, res);
  }

  function verifyToken(token, callback) {
    restApi.currentUser()
      .then(function (res) {
        winston.info('[tt-api-endpoint][A] get current user success');
        // only admin is allowed
        if (parseInt(res.data.result.role) === ROLE_ADMIN) {
          callback(null, res.data.result, res.data.result.role);
        } else {
          callback(new Error('token-invalid'));
        }
      })
      .catch(function (e) {
        winston.info('[tt-api-endpoint][A] get current user error');
        callback(new Error('token-invalid'));
      });
  }
};

module.exports = middlewares;
