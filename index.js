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
	var defer = Q.defer();
	entity.save (function (err, res) {
		if (err) defer.reject(err);
		else defer.resolve(res);
	});
	return defer.promise;
};
Entities.prototype.createComponent = function (component, data, callback) {
	var dataID = mongoose.Types.ObjectId();
	if (data) {
		data["_id"] = dataID;
	}
	var defer = Q.defer();
	if (!this.dataModels[component]) {
		console.log("data models " + this.dataModels);
		console.log("conponent " + component);
		defer.reject ("unknown type");
		return defer.promise;
	}
	var comp = new this.dataModels[component](data);
	comp.save (function (err, res) {
		if (err) defer.reject (err);
		else defer.resolve (res);
	});
	return defer.promise;
};
Entities.prototype.createComponentAndAddTo = function (component, entity, data, callback) {
	var deferred = Q.defer();
	this.createComponent (component, data).then (function (compo) { // Create the component
		entity.components.push(component);
		entity.data.push(compo._id); // Adds info to component
		entity.save(function (err, res) {
			if (err) deferred.reject (err);
			else deferred.resolve(res);
		});
	}, function (err) {
		deferred.reject (err);
	});
	return deferred.promise;
};
Entities.prototype.addMultipleComponents = function (components, entity) {
	var funcs = [];
	var that=this;
	var deferred = Q.defer();
	for (var i = 0; i < components.length; i++) {
		(function (i) {
			var fnc = function () {
				var defer =  Q.defer();
				that.createComponentAndAddTo (components[i], entity).
				then (function (res) {
					defer.resolve (res);
				}, function (err) {
					defer.reject (err);
				});
				return defer.promise;
			};
			funcs.push (fnc);
		})(i);
	};
	funcs.reduce (Q.when, Q()).
	then (function (res) {
		deferred.resolve (res);
	}, function (err) {
		deferred.reject (err);
	});
	return deferred.promise;
}
Entities.prototype.createAssemblage = function (asm, data) {
	var assemblage = this.assemblages[asm];
	var defer = Q.defer();
	var that = this;
	this.createEntity().
	then(function (entity) { //  Reussi a creer une entite
		var deferred = Q.defer();
		that.addMultipleComponents (assemblage, entity).
		then (function (res) { // Reussi a add les components
			deferred.resolve (res);
		}, function (err) {
			deferred.reject (err);
		});
		return deferred.promise;
	}, function (err) {
		defer.reject (err);
	}).
	then (function (res) { // a ajoute les components
		defer.resolve (res);
	}, function ( err) {
		defer.reject (err);
	});
	return defer.promise;
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