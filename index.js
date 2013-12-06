var mysql = require('mysql');
var DbManager = require('./js/DbManager');

var Entities = function () {

};

Entities.prototype.configMysql = function (options) {
	this.mysql = options;
	this.database = {};
	this.componentsIterator = 0;
	this.assemblagesIterator = 0;
	this.assemblagesCompsIterator = 0;
};

Entities.prototype.getConnection = function () {
	return this.connection;
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

Entities.prototype.createEntity = function (label, callback) {
	var that = this;
	var req = "INSERT INTO entities";
	if (label != "") {
		req += ' (label) VALUES ("' + label + '")';
	}
	this.connection.query(req, function (err) {
		if (err) {
			callback (err);
			return;
		}
		that.connection.query ("SELECT LAST_INSERT_ID()", function (err, rows) {
			callback (err, rows[0]['LAST_INSERT_ID()']);
		});
	});
};

// Gets a list of all components ID and data table
Entities.prototype.getComponentAndDataIdsR = function (components, callback, answer) {
	var that = this;
	var comp = components[this.componentsIterator];
	var name = comp['__name'];
	var req = "SELECT * from components WHERE (name='" + name + "')";
	this.connection.query(req, function (err, rows) {
		answer[name] = rows[0]['component_id'];
		answer[name + "_table"] = rows[0]['table_name'];
		that.componentsIterator++
		if (that.componentsIterator < components.length) {
			that.getComponentAndDataIdsR(components, callback, answer);
		} else {
			that.componentsIterator = 0;
			callback (err, answer);
		}
	});
};

// Gets the list of all assemblages ID, label, and components ID
Entities.prototype.getAssemblageAndCompsIds = function (assemblages, callback, answer) {
	var that = this;
	var asm = assemblages[this.assemblagesIterator];
	var name = asm['__name'];
	var req = "SELECT * from assemblages WHERE(name='" + name + "')";
	this.connection.query (req, function (err, rows) {
		if (err) callback (err);
		else {
			answer[name] = rows[0]['assemblage_id'],
			answer[name + "_label"] = rows[0]['default_label'];
			that.getAssCompsIds(answer[name], function (err, res) {
				answer[name + "_comps"] = res;
				that.assemblagesIterator++;
				if (that.assemblagesIterator < assemblages.length) {
					that.getAssemblageAndCompsIds (assemblages, callback, answer);
				} else {
					that.assemblagesIterator = 0;
					callback (err, answer);
				}
			});
		}
	});
};

// Gets the components IDs for an assemblage
Entities.prototype.getAssCompsIds = function (asm_id, callback) {
	var res = [];
	var that = this;
	var req = "SELECT * from assemblage_components WHERE(assemblage_id='" + asm_id + "')";
	this.connection.query (req, function (err, rows) {
		for (var i = 0; i < rows.length; i++) {
			res.push(rows[i]['component_id']);
		};
		callback (err, res);
	});
};
module.exports = new Entities();