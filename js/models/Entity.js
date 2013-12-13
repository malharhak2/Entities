var mongoose = require('mongoose');
var schema = new mongoose.Schema({
	label : String,
	components : [String],
	data : [Number]
});
var Entity = mongoose.model('Entity', schema);

module.exports = Entity;