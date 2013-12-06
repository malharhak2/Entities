var debug = require('debug')('DbManager');
var DbManager = function (connection) {
	this.connection = connection;
	this.tableGenerationCounter = 0;
	this.secondGenerationCounter = 0;
};
DbManager.prototype._generateBaseTables = function (callback) {
	var err = false;
	// Table containing every assemblage
	var assemblageReq = "CREATE TABLE assemblages (" 
		+ "assemblage_id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,"
		+ "default_label VARCHAR(70),"
		+ "name VARCHAR(70),"
		+ "description VARCHAR(255),"
		+ "PRIMARY KEY (assemblage_id))";
	// Table containing assemblage-component combinations
	var asscompReq = "CREATE TABLE assemblage_components ("
		+ "assemblage_id MEDIUMINT UNSIGNED NOT NULL,"
		+ "component_id MEDIUMINT UNSIGNED NOT NULL)";
	// Table containing all components
	var compReq = "CREATE TABLE components ("
		+ "component_id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,"
		+ "name VARCHAR(70),"
		+ "description VARCHAR(255),"
		+ "table_name VARCHAR(80),"
		+ "PRIMARY KEY (component_id))";
	// Table containing all entities
	var entityReq = "CREATE TABLE entities ("
		+ "entity_id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,"
		+ "label VARCHAR(70),"
		+ "PRIMARY KEY(entity_id))";
	// Table containing entity-component combinations
	var entityCompReq = "CREATE TABLE entity_components ("
		+ "entity_id MEDIUMINT UNSIGNED NOT NULL,"
		+ "component_id MEDIUMINT UNSIGNED NOT NULL,"
		+ "component_data_id MEDIUMINT UNSIGNED NOT NULL)";
	var con = this.connection;
	// Executing all this
	con.query(assemblageReq, function (err) {
		if (err) callback (err);
		else con.query(asscompReq, function (err) {
			if (err) callback (err);
			else con.query (compReq, function (err) {
				if (err) callback (err);
				else con.query (entityReq, function (err) {
					if (err) callback (err);
					else con.query (entityCompReq, function (err) {
						if (err) callback (err);
						callback();
					});
				});
			});
		});
	});
	// Generate stuff, yo
};

// Generate the data tables for each component. Should probably take a long time.
// Recursive function (calls itself until it has generated everything)
DbManager.prototype._generateComponentDataTablesR = function (components, callback) {
	var that = this;
	var comp = components[this.tableGenerationCounter];
	var name = comp["__name"];
	var query = "CREATE TABLE " + name + "_data ("
		+ "component_data_id MEDIUMINT UNSIGNED NOT NULL";
	// Generates the data table SQL query
	for (var j in comp) {
		if (j.substr(0, 2) != "__") {
			query += "," + j + " " + comp[j];
		}
	}
	query += ", PRIMARY KEY (component_data_id))";
	// Creates the data table
	this.connection.query(query, function (err) {
		if (err) {
			callback (err);
			return;
		} else {
			// If succeeded, generates the component table entry
			var req = 'INSERT INTO components (name, description, table_name) VALUES (' 
				+ '"' + name + '"'
				+ ', ' + '"' + comp["__desc"] + '"'
				+ ', ' + '"' + name + '_data' + '")';
			that.connection.query (req, function (err) {
				if (err) {
					callback (err);
					return;
				} else {
					// Recursivity
					that.tableGenerationCounter++;
					if (that.tableGenerationCounter < components.length) {
						that._generateComponentDataTablesR(components, callback);
					} else {
						// Job finished
						that.tableGenerationCounter = 0;
						callback();
					}	
				}
			});
		}
	});
};

// Double recursive
DbManager.prototype._generateAssemblagesTablesR = function (assemblages, callback) {
	var that = this;
	var asm = assemblages[this.tableGenerationCounter];
	var name = asm["__name"];
	var desc = asm["__desc"];
	// Creates the assemblage
	var req = 'INSERT INTO assemblages (default_label, name, description) VALUES ("' + asm['default_label'] + '", "' + name + '", "' + desc + '")';
	that.connection.query (req, function (err) {
		if (err) {
			callback (err);
			return;
		} else {
			// Gets the assemblage id
			var req = "SELECT assemblage_id from assemblages WHERE (name='" + name + "')";
			that.connection.query (req, function (err, rows) {
				var asm_id = rows[0]["assemblage_id"];
				// Fills the assemblage-components data
				that._generateAssemblagesAssociationR (asm_id, asm['components'], function (err) {
					if (err) {
						callback (err);
						return;
					} else if (that.tableGenerationCounter < assemblages.length - 1) {
						// Recursivity
						that.tableGenerationCounter++;
						that._generateAssemblagesTablesR (assemblages, callback);
					} else {
						// Job finished
						that.tableGenerationCounter = 0;
						callback();
					}
				});
			});

		}
	});
};

// Second recursive part of previous function
DbManager.prototype._generateAssemblagesAssociationR = function (assemblage_id, components, callback) {
	var that = this;
	var name = components[this.secondGenerationCounter];
	// Gets the component ID
	var req = "SELECT component_id from components WHERE (name='" + name + "')";
	that.connection.query (req, function (err, rows) {
		if (err) {
			callback (err);
			return;
		} else {
			var comp_id = rows[0]["component_id"];
			// Adds the entry to the assm-comp table
			var req = "INSERT INTO assemblage_components (assemblage_id, component_id) VALUES ('" + assemblage_id + "', '" + comp_id + "')";
			that.connection.query (req, function (err) {
				if (err) {
					callback (err);
					return;
				} else if (that.secondGenerationCounter < components.length - 1) {
					// Recursivity
					that.secondGenerationCounter++;
					that._generateAssemblagesAssociationR (assemblage_id, components, callback);
				} else {
					// Job finished
					that.secondGenerationCounter = 0;
					callback();
				}
			})
		}
	})
};

module.exports = DbManager;