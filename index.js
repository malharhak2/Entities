var mysql = require('mysql');

var Entities = function () {

};

Entities.prototype.configMysql = function (options) {
	this.mysql = options;
};
Entities.prototype.connect = function (callback) {
	this.connection = mysql.createConnection (this.mysql);
	this.connection.connect (function (err) {
		if (err) {
			callback (err);
		} else {
			callback();
		}
	});
};

module.exports = new Entities();