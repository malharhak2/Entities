var dbManager = require('./js/DbManager');
var _ = require('underscore');
var Entities = function () {
	this.connection;

};
Entities.prototype.createConnection = function (db, callback) {
	dbManager.createConnection (db, function cb (err, res) {
		if (err) callback (err);
		else {
			this.connection = res;
			callback (0, res);
		}
	});
};

module.exports = new Entities();