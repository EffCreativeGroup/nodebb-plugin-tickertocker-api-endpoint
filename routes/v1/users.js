'use strict';

/* globals module, require */

var user = require.main.require('./src/user');
var groups = require.main.require('./src/groups');
var apiMiddleware = require('./middleware');
var errorHandler = require('../../lib/errorHandler');
var utils = require('./utils');
var async = require.main.require('async');
var plugin = require('../../index');
var { ROLE_ADMIN, ROLE_INVESTOR, ROLE_LEADER } = require('../../constants/user-roles');
var nodebbGroups = {
  administrators: 'administrators',
  investors: 'Investors',
  leaders: 'Leaders'
};
var rolesMap = {
  [ROLE_ADMIN]: nodebbGroups.administrators,
  [ROLE_LEADER]: nodebbGroups.leaders,
  [ROLE_INVESTOR]: nodebbGroups.investors
};
const db = require.main.require('./src/database');
const winston = module.parent.require('winston');

module.getSessionSharingPropertyKey = function (prop) {
  var name = 'appId';
  var isAttrInSettings = typeof plugin.settings.sessionSharingSettings !== 'undefined'
    && typeof plugin.settings.sessionSharingSettings.name !== 'undefined'
    && plugin.settings.sessionSharingSettings.name.length > 0;
  if (isAttrInSettings) {
    name = plugin.settings.sessionSharingSettings.name;
  }

  winston.info('[tt-api-endpoint] param to connect user from session-sharring:', name);

  return prop ? `${name}:${prop}` : name;
};

/**
 * Given a remoteId, show user data
 */
module.getUser = function (remoteId, callback) {
  async.waterfall([
    async.apply(db.sortedSetScore, module.getSessionSharingPropertyKey('uid'), remoteId),
    function (uid, next) {
      if (uid) {
        user.getUserFields(uid, ['uid', 'email', 'username'], next);
        return;
      }
      setImmediate(next);
    }
  ], callback);
};

module.exports = function () {
  var app = require('express').Router();

  app.post('/', apiMiddleware.requireUser, function (req, res) {
    var requiredFields = [
      'externalUserId',
      'externalUserRole',
      'username',
      'email'
    ];

    winston.info('[tt-api-endpoint][create user] start:');

    if (!utils.checkRequired(requiredFields, req, res)) {
      return false;
    }

    var queries = {};
    if (req.body.email && req.body.email.length) {
      queries.mergeUid = async.apply(db.sortedSetScore, 'email:uid', req.body.email);
    }
    queries.uid = async.apply(db.sortedSetScore, module.getSessionSharingPropertyKey('uid'), req.body.externalUserId);

    var callback = function (err, uid, res) {
      return errorHandler.handle(err, res, { uid: uid });
    };

    async.parallel(queries, function (err, checks) {
      if (err) {
        return callback(err);
      }

      async.waterfall([
        /* check if found something to work with */
        function (next) {
          if (checks.uid && !isNaN(parseInt(checks.uid, 10))) {
            const uid = parseInt(checks.uid, 10);
            /* check if the user with the given id actually exists */
            return user.exists(uid, function (err, exists) {
              /* ignore errors, but assume the user doesn't exist */
              if (err) {
                return next(null, null);
              }

              if (exists) {
                return next(null, uid);
              }

              /* reference is outdated, user got deleted */
              db.sortedSetRemove(module.getSessionSharingPropertyKey('uid'), req.body.externalUserId, function (err) {
                next(err, null);
              });
            });
          }
          if (checks.mergeUid && !isNaN(parseInt(checks.mergeUid, 10))) {
            winston.info(`[tt-api-endpoint][create user] Found user via their email, associating this id (${req.body.externalUserId}) with their NodeBB account ${checks.mergeUid}`);
            return db.sortedSetAdd(
              module.getSessionSharingPropertyKey('uid'),
              checks.mergeUid,
              req.body.externalUserId,
              function (err) {
                next(err, parseInt(checks.mergeUid, 10));
              }
            );
          }
          setImmediate(next, null, null);
        },
        /* create the user from payload if necessary */
        function (uid, next) {
          winston.info('[tt-api-endpoint][create user] need create user? :', !uid);
          if (!uid) {
            return user.create(req.body, function (err, uid) {
              winston.info('[tt-api-endpoint][create user] user created');

              var role = rolesMap[parseInt(req.body.externalUserRole, 10)];
              if (!role) {
                return next(new Error(`User role "${req.body.externalUserRole}" is invalid.`));
              }

              groups.join(role, uid);

              winston.info(`[tt-api-endpoint][create user] add to db, associating id (${req.body.externalUserId}) with their NodeBB account ${uid}`);
              db.sortedSetAdd(
                module.getSessionSharingPropertyKey('uid'),
                uid,
                req.body.externalUserId,
                function (err, ourId = uid, ttId = req.body.externalUserId) {
                  winston.info('[tt-api-endpoint][create user] associated', { ourId, ttId });
                }
              );

              next(err, uid, res, true);
            });
          }
          setImmediate(next, err, uid, res, false);
        }
      ], callback);
    });
  });

  app.delete('/', apiMiddleware.requireUser, function (req, res) {
    winston.info('[tt-api-endpoint][delete user] start, ', { uid: req.body.externalUserId });

    if (!utils.checkRequired(['externalUserId'], req, res)) {
      return false;
    }

    var callback = function (err, res, uid) {
      return errorHandler.handle(err, res, { uid: uid });
    };

    // Clear out any user tokens belonging to the to-be-deleted user
    async.waterfall([
      function (next) {
        module.getUser(req.body.externalUserId, function (err, response) {
          if (err) {
            return next(null, null);
          }

          var userId = 0;
          if (typeof response !== 'undefined') {
            userId = parseInt(response.uid, 10);
          }

          next(null, userId);
        });
      },
      function (uid, next) {
        if (uid > 0) {
          user.delete(uid, uid, function (err) {
            winston.info('[tt-api-endpoint][delete user] ', { err: err });

            return next(null, res, null);
          });
        } else {
          winston.info('[tt-api-endpoint][delete user] user not exists');

          return next(null, res, null);
        }
      }
    ], callback);
  });

  app.put('/', apiMiddleware.requireUser, function (req, res) {
    winston.info('[tt-api-endpoint][put user] start, ', { uid: req.body.externalUserId });

    if (!utils.checkRequired('externalUserId', req, res)) {
      return false;
    }

    var callback = function (err, res, uid) {
      winston.info('[tt-api-endpoint][put user] callback', { err, uid });

      return errorHandler.handle(err, res, { uid });
    };

    async.waterfall([
      function (next) {
        module.getUser(req.body.externalUserId, function (err, response) {
          if (err) {
            return next(null, null);
          }

          winston.info('[tt-api-endpoint][get user from tt]: ', { response });

          var userId = 0;
          if (typeof (response) !== 'undefined') {
            userId = parseInt(response.uid, 10);
          }

          next(null, userId);
        });
      },
      function (uid, next) {
        if (uid > 0) {
          var data = req.body;
          data.uid = uid;

          winston.info(`[tt-api-endpoint][put user] trying update ${uid}`, { data });

          user.updateProfile(uid, data, function (err, user) {
            if (err) {
              if (err.message === '[[error:email-taken]]') {
                winston.error('[tt-api-endpoint] Email already taken.');
                res.code = 422;
                res.message = 'Email already taken';
                res.params = ['email'];

                return errorHandler.respond(422, res);
              }

              winston.error(`[tt-api-endpoint] Error encountered while parsing token: ${err.message}`);

              return errorHandler.respond(422, res);
            }

            if (req.body.externalUserRole) {
              (function () {
                for (var role in nodebbGroups) {
                  if (nodebbGroups.hasOwnProperty(role)) {
                    groups.leave(nodebbGroups[role], uid);
                  }
                }
              }());

              var role = rolesMap[parseInt(req.body.externalUserRole, 10)];
              if (!role) {
                return next(new Error(`User role "${req.body.externalUserRole}" is invalid.`));
              }

              groups.join(role, uid);
            }

            // Update avatar
            if (typeof data.picture === 'string') {
              db.setObjectField(`user:${uid}`, 'picture', data.picture);
            }

            return next(null, res, user.uid);
          });
        } else {
          winston.info('[tt-api-endpoint][put user] user not exists');

          return errorHandler.respond(404, res);
        }
      }
    ], callback);
  });

  app.route('/ban')
    .post(apiMiddleware.requireUser, function (req, res) {
      if (!utils.checkRequired(['externalUserId'], req, res)) {
        return false;
      }

      var callback = function (err, res, uid) {
        winston.info('[tt-api-endpoint][ban] callback', { err: err, uid: uid });

        return errorHandler.handle(err, res, { uid: uid });
      };

      async.waterfall([
        function (next) {
          module.getUser(req.body.externalUserId, function (err, response) {
            if (err) {
              return next(null, null);
            }

            var userId = 0;
            if (typeof (response) !== 'undefined') {
              userId = parseInt(response.uid, 10);
            }

            next(null, userId);
          });
        },
        function (uid, next) {
          if (uid > 0) {
            winston.info('[tt-api-endpoint][try ban] : ');
            user.ban(uid, function (err) {
              winston.info('[tt-api-endpoint][ban] : ', { uid, err });

              return next(null, res, user.uid);
            });
          } else {
            winston.error('[tt-api-endpoint][nban user] user not exists');

            return errorHandler.respond(404, res);
          }
        }
      ], callback);
    })
    .delete(apiMiddleware.requireUser, function (req, res) {
      if (!utils.checkRequired(['externalUserId'], req, res)) {
        return false;
      }

      var callback = function (err, res, uid) {
        winston.info('[tt-api-endpoint][unban] callback', { err: err, uid: uid });

        return errorHandler.handle(err, res, { uid: uid });
      };

      async.waterfall([
        function (next) {
          module.getUser(req.body.externalUserId, function (err, response) {
            if (err) {
              return next(null, null);
            }

            var userId = 0;
            if (typeof (response) !== 'undefined') {
              userId = parseInt(response.uid, 10);
            }

            next(null, userId);
          });
        },
        function (uid, next) {
          if (uid > 0) {
            winston.info('[tt-api-endpoint][try unban] : ');
            user.unban(uid, function (err) {
              winston.info('[tt-api-endpoint][unban] : ', { uid: uid, err: err });

              return next(null, res, user.uid);
            });
          } else {
            winston.error('[tt-api-endpoint][unban user] user not exists');

            return errorHandler.respond(404, res);
          }
        }
      ], callback);
    });

  return app;
};
