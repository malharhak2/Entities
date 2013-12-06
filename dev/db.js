module.exports = {
	host : "localhost",
	user : "root",
	password : "root",
	port : 8889,
	database : "entities",

	testdb : { // This has to be a root user so the user can drop and recreate the test database
		host : "localhost",
		user : "root",
		password : "root",
		port : 8889,
		database : "teststuff"
	}
};