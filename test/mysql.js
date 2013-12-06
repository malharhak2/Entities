var should = require('should');
var entities = require('./../index');
var db = require('./../dev/db');

describe('entities', function () {
	describe('#configMysql', function () {
		it ('should set the mysql value of entities', function () {
			entities.configMysql(db);
			entities.mysql.host.should.equal(db.host);
		});
	});
	describe('#connect', function () {
		it ('should connect without error', function (done) {
			entities.connect (function (err) {
				if (err) throw err;
				done();
			});
		});
	});
});