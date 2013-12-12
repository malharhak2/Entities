var should = require('should');
var db = require ('./../dev/db').testdb;
var entities = require('./../index');
var _ = require('underscore');
// An example components and assemblage list that will be added to the test DB
var componentsList = require('./../dev/testComponents');
var assemblagesList = require('./../dev/testAssemblages');

var ent;
var datalol;
var firstTime = Date.now();
var entitiesCount = 1000;
/*
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
				should.exist(rows[0]);
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
		});
	});
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
			entities.createEntities (entitiesCount, function (err, ret) {
				if (err) throw err;
				should.exist(ret);
				var delta = Date.now() - time;
				console.log("===== PERFORMANCE =====");
				console.log("Time to create 1000 entities: " + delta);
				done();
			}, "lol");
		});
	});
	describe ('#lookupEntities', function () {
		it (('should insert 10,000 entries'), function (done) {
			var query = "INSERT INTO position_data (x, y, z) VALUES ";
			for (var i = 0; i < 10000; i++) {
				query += "(" + _.random (0, 1000) + ", " + _.random(0, 1000) + ", " + _.random(0, 1000) + ")";
				if (i != 9999) query += ",";
			};
			var insertStart = Date.now();
			entities.connection.query (query, function (err) {
				if (err) throw err;
				console.log("10,000 insert time :" + (Date.now() - insertStart));
				done();
			});
		});
		it ('should get back a third of the data', function (done) {
			var time = Date.now();
			entities.connection.query ("SELECT * from position_data WHERE (x<500 AND y > 300) ORDER BY z DESC", function (err, rows) {
				if (err) throw err;
				var delta = Date.now() - time;
				should.exist(rows);
				console.log("select 1/3 of 10,000: " + delta);
				done();
			});
		});
	});
	describe('#createEntity', function () {
		it ('should create an entity in a reasonnable time', function (done) {
			console.log ("=====Entity creation and modification cycle====");
			var entityTime = Date.now();
			firstTime = Date.now();
			entities.createEntity ("test", function (err, res) {
				if (err) throw err;
				should.exist(res);
				ent = res;
				var deltaEnt = Date.now() - entityTime;
				console.log("Time for creating one entity : " + deltaEnt);
				done();
			});
		});
		it ('should create a component and add it to the entity', function (done) {
			var compTime = Date.now();
			entities.createComponentAndAddTo("position", ent, function (err) {
				if (err) throw err;
				var deltaComp = Date.now() - compTime;
				console.log("Time for creating a component : " + deltaComp);
				done();
			}, {x : 1, y : 1, z : 1});
		});
		it ('should get the component data for the entity', function (done) {
			var getTime = Date.now();
			entities.getComponentDataForEntity ("position", ent, function (err, res) {
				if (err) throw err;
				should.exist (res);
				res.should.have.property("x", 1);
				datalol = res;
				var deltaGet = Date.now() - getTime;
				console.log("Time for getting a component : " + deltaGet);
				datalol.x = 2;
				done();
			});
		});
		it ('should set the component data for the entity', function (done) {
			var setTime = Date.now();
			entities.setComponentDataForEntity ("position", ent, datalol, function (err) {
				if (err) throw err;
				var deltaSet = Date.now() - setTime;
				console.log("Time for setting a component : " + deltaSet);
				var overall = Date.now() - firstTime;
				console.log (".Overall cycle time : " + overall);
				done();
			});
		});
		it ('should create a player assemblage', function (done) {
			var asmTime = Date.now();
			entities.createAssemblage("player", function (err, id) {
				if (err) throw err;
				should.exist(id);
				var delta = Date.now() - asmTime;
				console.log("Time to create an assemblage : " + delta);
				done();
			});
		});
	});
});
*/ 