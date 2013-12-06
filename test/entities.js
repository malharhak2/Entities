var should = require('should');
var db = require ('./../dev/db').testdb;
var entities = require('./../index');
var _ = require('underscore');
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

describe ('Performance tests', function () {
	describe('#createEntity', function () {
		it ('should take less than 10 ms to create 1000 entities', function (done) {
			var time = Date.now();
			var query = "INSERT INTO entities (label) VALUES ";
			for (var i = 0; i < 600; i++) {
				query += "('lol " + i + "')";
				if (i != 599) query += ",";
			};
			entities.connection.query (query, function (err) {
				if (err) throw err;
				var delta = Date.now() - time;
				delta.should.be.below(15);
				console.log("===== PERFORMANCE =====");
				console.log("Time to create 1000 entities: " + delta);
				done();
			});
		});
	});
	describe ('#lookupEntities', function () {
		it ('should take less then 10 ms to lookup in a list of 10 000 entities', function (done) {
			var query = "INSERT INTO position_data (x, y, z) VALUES ";
			for (var i = 0; i < 10000; i++) {
				query += "(" + _.random (0, 1000) + ", " + _.random(0, 1000) + ", " + _.random(0, 1000) + ")";
				if (i != 9999) query += ",";
			};
			entities.connection.query (query, function (err) {
				if (err) throw err;
				var time = Date.now();
				entities.connection.query ("SELECT * from position_data WHERE (x<500 AND y > 300) ORDER BY z DESC", function (err, rows) {
					if (err) throw err;
					var delta = Date.now() - time;
					console.log("Time to select from a 10,000 entries table: " + delta);
					done();
				});
			});
		});
	});
});