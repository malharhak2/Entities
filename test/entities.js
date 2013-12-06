var should = require('should');
var db = require ('./../dev/db').testdb;
var entities = require('./../index');

// An example components and assemblage list that will be added to the test DB
var componentsList = require('./../dev/testComponents');
var assemblagesList = require('./../dev/testAssemblages');

describe('Entities', function () {
	describe ('#configMysql', function () {
		it ('should configure the Entities', function () {
			entities.configMysql(db);
			entities.should.have.property('mysql');
		});
	});
	describe ('#connect', function () {
		it ('should connect to mysql', function (done) {
			entities.connect (function (err) {
				if (err) throw err;
				done();
			});
		});
	});
	describe ('#resetDatabase', function () {
		it ('should recreate the database and reconnect', function (done) {
			entities.resetDatabase (db.database, function (err) {
				if (err) throw err;
				done();
			});
		});
	});
	describe ('#generateTables', function () {
		it ('should generate every table', function (done) {
			entities.generateTables (componentsList, assemblagesList, function (err) {
				if (err) throw err;
				done();
			});
		});
		it ('should exist a position_data table', function (done) {
			entities.connection.query("INSERT INTO position_data (x, y, z) VALUES (5, 10, 15)", function (err) {
				if (err) throw err;
				done();
			});
		});
		it ('should exist an assemblage named "player"', function (done) {
			entities.connection.query("SELECT * from assemblages WHERE (name='player')", function (err, rows) {
				if (err) throw err;
				should.exist(rows);
				rows[0].should.have.property('assemblage_id');
				done();
			});
		});
	});
});

describe ('Entities abstraction', function () {
	
	describe ('#initializeIds', function () {
		it ('should return the list of components and assemblages', function (done) {
			entities.initializeIds(componentsList, assemblagesList, function (err, res) {
				if (err) throw err;
				should.exist (res);
				res.should.have.property('position', 1);
				res.should.have.property('position_table', 'position_data');
				res.should.have.property('player', 1);
				res.should.have.property('player_label', 'Player');
				res.should.have.property('player_comps');
				done();
			});
		})
	})
});

describe ('Entities usage', function () {
	describe ('#createEntity', function () {
		it ('should create an entity and return its id', function (done) {
			entities.createEntity("lol", function (err, res) {
				if (err) throw err;
				should.exist(res);
				res.should.equal(1);
				done();
			});
		});
	});
	describe ('#createComponentAndAddTo', function () {
		it ('should create a position component and add it to the first entity', function (done) {
			entities.createComponentAndAddTo("position", 1, function (err) {
				if (err) throw err;
				done();
			}, {x : 10, y : 20, z : 100});
		});
	});
	describe ('#getComponentDataForEntity', function () {
		it ('should return the data previously added', function (done) {
			entities.getComponentDataForEntity ("position", 1, function (err, res) {
				if (err) throw err;
				should.exist (res);
				res.should.have.property('x', 10);
				res.should.have.property ('z', 100);
				done();
			});
		});
	});
	describe ('#setComponentDataForEntity', function () {
		it ('should set the data correctly', function (done) {
			entities.setComponentDataForEntity ("position", 1, {x : 666}, function (err) {
				if (err) throw err;
				done();
			});
		});
	});
});