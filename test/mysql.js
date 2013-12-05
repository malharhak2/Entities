var mysql = require('mysql');
var config = require('./../js/db');
var should = require('should');

describe ('config', function () {
	describe('#maxPlayersPerRoom', function () {
		config.should.have.property('host');
	});
});

var connection;
describe ('mysql', function () {
	describe ('#createConnection', function () {
		it('should create without error', function () {
			connection = mysql.createConnection(config);
		});
	});
});

describe('connection', function () {
	describe ('#connect', function () {
		it ('should connect without error', function (done) {
			connection.connect (function (err) {
				if (err) {
					console.log(err.code);
					throw err;
				}
				done();
			});
		});
	});
});