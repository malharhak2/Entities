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
	this.entities = {};
	this.ids = [];
};
Entities.prototype.createEntity = function (label) {
	//var id = mongoose.Types.ObjectId();
	var id = this.entities.length;
	this.ids.push(0);
	var entity = {
		_id : id, 
		label : label,
		components : [],
		data : []
	};
	/*
	var entity = new Entity({
		label : label,
		"_id" : id
	});
	*/
	this.entities[id] = entity;
	return entity;
};
Entities.prototype.destroyEntity = function (entity) {
	for (var i = 0; i < entity.components.length; i++) {
		compo = entity.components[i] + 'datas';
		var dataId = entity.data[i];
		this[compo][dataId].remove();
		delete this[compo][dataId];
	}
	//entity.remove();
	delete this.entities[entity._id];
};
Entities.prototype.createComponent = function (component, data) {
	//var dataId = mongoose.Types.ObjectId();
	var dataId = this.ids.length;
	this.ids.push (0);
	var d = _.extend({"_id" : dataId}, data);

	if (!this.dataModels[component]) {
		return false;
	}
	/*
	var comp = new this.dataModels[component](d);
	*/
	var comp = d;
	this[component + 'datas'][dataId] = comp
	return comp;
};
Entities.prototype.destroyComponent = function (component, id) {
	//this[component + 'datas'][id].remove();
	delete this[component + 'datas'][id];
};
Entities.prototype.saveComponent = function (component) {
	var defer = Q.defer();
	component.save (function (err) {
		if (err) promise.reject(err);
		else promise.resolve();
	})
	return defer.promise;
};
Entities.prototype.saveEntity = function (entity ) {
	var defer = Q.defer();
	entity.save (function (err) {
		if (err) promise.reject(err);
		else promise.resolve();
	});
	return defer.promise;
}
Entities.prototype.createComponentAndAddTo = function (component, entity, data) {
	var comp = this.createComponent (component, data)
	entity.components.push (component);
	entity.data.push (comp._id);
	return entity;
};
Entities.prototype.addMultipleComponents = function (components, entity, data) {
	for (var i = 0; i < components.length; i++) {
		var d = (typeof data == 'object') ? data[i] : false;
		var comp = this.createComponent (components[i], d);
		entity.components.push (components[i]);
		entity.data.push (comp._id);
	};
	return entity;
}
Entities.prototype.createAssemblage = function (asm, data, label) {
	var components = this.assemblages[asm].components;
	var lab = label ? label : this.assemblages[asm].defaultLabel;
	var entity = this.createEntity(label);
	this.addMultipleComponents (components, entity, data);
	return entity;
};
Entities.prototype.getComponentId = function (entity, component) {
	var dataId = 0;
	for (var i = 0; i < entity.components.length; i++) {
		if (component = entity.components[i]);
		return entity.data[i];
	};
};
Entities.prototype.getComponentForEntity = function (entity, component) {
	var dataId = this.getComponentId(entity, component);
	return this.getComponentData (component, dataId);
};
Entities.prototype.setComponentForEntity = function (entity, component, data) {
	var dataId = this.getComponentId(entity, component);
	this.setComponentData (component, _.extend(data, {"_id" : dataId}));
};
Entities.prototype.getComponentData = function (component, id) {
	return this[component + 'datas'][id];
}
Entities.prototype.setComponentData = function (component, data) {
	_.extend(this[component + 'datas'][data._id], data);
	//this[component + 'datas'][data._id].save();
};
Entities.prototype.getComponentsData = function (component) {
	return this[component + 'datas'];
};
Entities.prototype.setComponentsData = function (component, data) {
	for (var i = 0; i < data.length; i++) {
		this.setComponentData (component, data[i]);
	};
};
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
	var dataModel = mongoose.model(data.name + 'datas', data.schema);
	this.dataModels[data.name] = dataModel;
	this[data.name + 'datas'] = {};
}
Entities.prototype.registerAssemblages = function (assemblages) {
	for (var i in assemblages) {
		this.assemblages[i] = assemblages[i];
	};
};
module.exports = new Entities();