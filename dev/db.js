module.exports = {
	host : "localhost",
	user : "root",
	password : "root",
	port : 8889,
	database : "entities",

	// This has to be a root user so the user can drop and recreate the test database
	// (The test database is deleted and recreated at each test)
	testdb : { 
		host : "localhost",
		user : "root",
		password : "root",
		port : 3306,
		database : "teststuff"
	}
	
};