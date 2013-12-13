var dbManager = require('./js/DbManager');
var _ = require('underscore');
var Entity = require('./js/models/Entity');
var Component = require('./js/models/Component');
var mongoose = require('mongoose');
var Q = require('q');

var Entities = function () {
	this.connection;
	this.dataModels = {};
	this.assemblages = {};
};
Entities.prototype.createEntity = function (label, callback) {
	var id = mongoose.Types.ObjectId();
	var entity = new Entity({
		label : label,
		"_id" : id
	});
	entity.save (function (err, res) {
		if (err) throw err;
		callback (id);
	});
};
Entities.prototype.createComponent = function (component, data, callback) {
	var dataID = mongoose.Types.ObjectId();
	data["_id"] = dataID;
	var component = new this.dataModels[component + 'Data'](data);
	component.save (function (err, component) {
		if (err) throw err;
		callback ()
	});
	return dataID;
};
Entities.prototype.createComponentAndAddTo = function (component, entity, data, callback) {
	var dataID = this.createComponent (component, data);
	var entity = Entity.find({"_id" : entity}, function (err, res) {

	});

}
// Initialization stuff
Entities.prototype.createConnection = function (db, callback) {
	var deferred = Q.defer();
	var func = Q.nfbind(dbManager.createConnection.bind(dbManager));
	var that = this;
	func(db).then(function (connection) {
		that.connection = connection;
		deferred.resolve (connection);
	}, function (err) {
		deferred.reject (err);
	});
	return deferred.promise;
};
Entities.prototype.registerComponent = function (data) {
	var dataModel = mongoose.model(data.name + 'Data', data.schema);
	this.dataModels[data.name] = dataModel;
}
Entities.prototype.registerAssemblages = function (assemblages) {
	for (var i in assemblages) {
		this.assemblages[i] = assemblages[i];
	};
};
module.exports = new Entities();