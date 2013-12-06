var mysql = require('mysql');
var DbManager = require('./js/DbManager');
var _ = require('underscore');
var Entities = function () {

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

Entities.prototype.createComponentAndAddTo = function (component, entity, callback, values) {
	var that = this;
	var component_id = that.ids[component];
	this.connection.query ("INSERT INTO entity_components (component_id, entity_id) VALUES (" + component_id + ", " + entity + ")", function (err) {
		if (err) {
			callback (err);
			return;
		}
		var req = "SELECT LAST_INSERT_ID()";
		that.connection.query (req, function (err, rows) {
			if (err) {
				callback (err);
				return;
			}
			var id = rows[0]['LAST_INSERT_ID()'];
			var valString1 = "";
			var valString2 = "";
			if (values) {
				for (var i in values) {
					valString1 += ", " + i;
					valString2 += ", " + values[i];
				};
			}
			var req = "INSERT INTO " + that.ids[component + "_table"] + " (component_data_id" + valString1 + ") VALUES (" + id + valString2 + ")";
			that.connection.query (req, function (err) {
				callback (err);
			})
		});
	});
};

Entities.prototype.getComponentDataForEntity = function (component, entity, callback) {
	var that = this;
	var component_id = that.ids[component];
	this.connection.query ("SELECT * from entity_components WHERE(component_id=" + component_id + " AND entity_id=" + entity + ")", function (err, rows) {
		if (err) {
			callback (err);
			return;
		}
		var dataId = rows[0]['component_data_id'];
		var req = "SELECT * from " + that.ids[component + "_table"] + " WHERE (component_data_id=" + dataId + ")";
		that.connection.query (req, function (err, rows) {
			callback (err, rows[0]);
		});
	});
};

Entities.prototype.setComponentDataForEntity = function (component, entity, data, callback) {
	var that = this;
	var component_id = that.ids[component];
	var data_table = that.ids[component + "_table"];
	var req = "SELECT * from entity_components WHERE (component_id=" + component_id + " AND entity_id=" + entity + ")";
	this.connection.query (req, function (err, rows) {
		if (err) {
			callback (err);
			return;
		}
		var dataId = rows[0]['component_data_id'];
		var valString = "";
		var first = true;
		for (var i in data) {
			valString += (first ? "" : ", ") + i + "=" + data[i];
			first = false;
		}
		that.connection.query ("UPDATE " + data_table + " SET " + valString + " WHERE (component_data_id=" + dataId + ")", function (err) {
			callback (err);
		})
	})
}

//---------------
// One time functions

Entities.prototype.getConnection = function () {
	return this.connection;
};

Entities.prototype.configMysql = function (options) {
	this.mysql = options;
	this.database = {};
	this.componentsIterator = 0;
	this.assemblagesIterator = 0;
	this.assemblagesCompsIterator = 0;
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

Entities.prototype.initializeIds = function (components, assemblages, callback) {
	var that = this;
	this.ids = {};
	this.getComponentAndDataIdsR(components, function (err, res) {
		if (err) {
			callback (err);
			return;
		}
		that.ids = res;
		that.getAssemblageAndCompsIds (assemblages, function (err, res) {
			if (err) {
				callback (err);
				return;
			} else {
				_.extend(that.ids, res);
				callback (err, that.ids);
			}
		}, {});
	}, {});
}
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