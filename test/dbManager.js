var should = require('should');
var db = require('./../dev/db').testdb;

var mysql = require('mysql');
var connection;
var DbManager = require('./../js/DbManager');
var dbManager;


// An example components list that will be added to the test DB
var componentsList = require('./../dev/testComponents');

var assemblages = require('./../dev/testAssemblages');

// These tests try to connect to the test database and empty it for testing purposes
describe ('mysql', function () {
	it ('should connect to mysql as root', function (done) {
		connection = mysql.createConnection (db);
		connection.connect (function (err) {
			if (err) throw err;
			done();
		});
	});
	it ('should be able to reset the db', function (done) {
		connection.query("DROP DATABASE " + db.database, function (err) {
			if (err) throw err;
			done();
		});
	});
	it ('should be able to recreate the db', function (done) {
		connection.query('CREATE DATABASE ' + db.database, function (err) {
			if (err) throw err;
			done();
		});
	});
	it('should be able to connect to the new db', function (done) {
		connection = mysql.createConnection(db);
		connection.connect (function (err) {
			if (err) throw err;
			done();
		})
	})
});

describe ('dbManager', function () {

	// This test will try to generate the basic required tables for ES
	describe ("#[Constructor]", function () {
		it ('should initialize and get the mysql options', function () {
			dbManager = new DbManager(connection);
			dbManager.should.have.property('connection');
		});
	});
	describe('#_generateBaseTables', function () {
		it ('should create the basic tables', function (done) {
			dbManager._generateBaseTables(function (err) {
				if (err) throw err;
				done();
			});
		});
		it ('should insert into entities', function (done) {
			connection.query("INSERT INTO entities (label) VALUES ('lol')", function (err) {
				if (err) throw err;
				done();
			});
		});
		it ('should get back the data', function (done) {
			connection.query("SELECT * from entities", function (err, rows) {
				if (err) throw err;
				should.exist(rows);
				rows[0].should.have.property('label');
				done();
			});
		});
	});
	describe('#_generateComponentTablesR', function () {
		it ('should create tables for each component', function (done) {
			dbManager._generateComponentDataTablesR(componentsList, function (err) {
				if (err) throw err;
				done();
			});
		});
		it ('should be possible to write in position_data', function (done) {
			connection.query ("INSERT INTO position_data (x, y, z) VALUES (5, 10, 15)", function (err) {
				if (err) throw err;
				done();
			});
		});
	});
	
	describe('#_generateAssemblagesTablesR', function () {
		it ('should generate the assemblage entries', function (done) {
			dbManager._generateAssemblagesTablesR (assemblages, function (err) {
				if (err) throw err;
				done();
			});
		});
	});
	
});
