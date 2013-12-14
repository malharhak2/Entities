var mongoose = require('mongoose');
var schema = new mongoose.Schema({
	name : String,
	description : String
});
var Component = mongoose.model('component', schema);

module.exports = Component;