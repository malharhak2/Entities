var mongoose = require('mongoose');
var entities = require('../index');
var schema = new mongoose.Schema ({
	life : {type : Number, default : 0},
	mana : {type : Number, default : 0}
});
entities.registerComponent ({
	name : "Stats",
	description : "Player stats",
	schema : schema
});
