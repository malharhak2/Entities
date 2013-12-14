var mongoose = require('mongoose');
var entities = require('../index');
var schema = new mongoose.Schema ({
	x : {type : Number, default : 0},
	y : {type : Number, default : 0},
	z : {type : Number, default : 0}
});

module.exports = {
	name : "position",
	description : "X Y Z Position",
	schema : schema
};
