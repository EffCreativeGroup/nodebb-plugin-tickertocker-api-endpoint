'use strict';
/* globals module */

var Sockets = {};

Sockets.init = function() {
	var Plugins = module.parent.parent.require('./socket.io/plugins').ttapi = {};

	/*Plugins.createToken = function(socket, uid, callback) {
		auth.generateToken(uid, callback);
	};*/
};

module.exports = Sockets;
