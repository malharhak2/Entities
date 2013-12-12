var debug = require('debug')('DbManager');
var mongoose = require('mongoose');

var dbFunctions = {
	createConnection : function (db, callback) {
		mongoose.connect('mongodb://' + db.host + '/' + db.database);
		var db = mongoose.connection;
		db.on('error', function cbError () {
			callback ('error');
		});
		db.once('open', function cb () {
			callback (0, db);
		});
	}
};

module.exports = dbFunctions;