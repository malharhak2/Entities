var mysql = require('mysql');
var DbManager = require('./js/DbManager');

var Entities = function () {

};

Entities.prototype.configMysql = function (options) {
	this.mysql = options;
	this.database = {};
};
Entities.prototype.connect = function (callback) {
	var that = this;
	this.connection = mysql.createConnection (this.mysql);
	this.connection.connect (function (err) {
		if (err) {
			callback (err);
		} else {
			that.dbManager = new DbManager(that.connection);
			callback();
		}
	});
};
Entities.prototype.generateTables = function (components, assemblages, callback) {
	this.dbManager.generateEveryTable (components, assemblages, callback);
};
Entities.prototype.resetDatabase = function (database, callback) {
	var that = this;
	this.dbManager.resetDatabase (database, function (err) {
		if (err) callback (err);
		else that.connect (callback);
	});
};

module.exports = new Entities();