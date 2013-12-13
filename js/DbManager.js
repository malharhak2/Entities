var debug = require('debug')('DbManager');
var mongoose = require('mongoose');

var dbFunctions = {
	createConnection : function (db, callback) {
		mongoose.connect('mongodb://' + db.host + '/' + db.database);
		var con = mongoose.connection;
		con.on('error', function cbError () {
			callback ('error');
		});
		con.once('open', function cb () {
			callback (0, con);
		});
	}
};

module.exports = dbFunctions;