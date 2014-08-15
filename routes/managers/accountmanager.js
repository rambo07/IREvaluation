//accountmanager.js
//accepts username/password combos and updates/reads database accordingly

/*TODO: add salt-and-hash (for basic safety?), confirmation of current pass on password change, 
add time-created, email address for password recovery?, may need some intermediate validator for the form ...*/

// Retrieve mongo
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
function getConnection(callback) { //temporary localhost/port/database marker
	MongoClient.connect("mongodb://localhost:27017/database", function(err, db) {
  if(err) {
    return callback(err);
  }
  //create new collection (only if it's not there)
  var collection = db.collection('users');
  //index  by name, for search speed
  collection.ensureIndex({name: true}, function (err) {
  	if (err) {
  		return callback(err);
  	}
  	callback(null, collection);
  });
});
}

//to change a password: finds an account with that username, sets password, returns document (user) with changed password
function updateAccount(collection, name, password, callback) {
	collection.findAndModify({name: name}, {}, {$set: {password: password}},
		{upsert: false, new: true}, callback);
}

//creates an account with username: username and password: password
function createAccount(collection, name, password, callback) {
	collection.find({name:name}).toArray(function(err, docs){
		if (docs.length === 0) { //i.e. there are no documents with that name
			console.log('inserting: '+name); //temp
			collection.insert({name: name, password: password}, {new: true}, callback); //insert the user
		} else {
			return callback(new Error("There already exists a user with that name. Please choose another."));
		}
	});
}

// finds if there exists that username/password combo: commented to be replaced by 'passport' strat?
//TODO: send request to upload manager for details of uploads?
function loginAccount(collection, name, password, callback) {
	collection.findOne({name:name, password:password}, callback)
}

//deletes an account from the database
function deleteAccount(collection, name, password, callback) { //UNUSED
	collection.findAndRemove({name: name, password: password}, callback);
}
 
//finds all users in the database
function readAll(collection, callback) {
	collection.find({}, callback);
}

//confirms whether a user with that name exists
function printUser(user) { //temp, useful to list users on the console
	if (!user) {
		console.log("Could not find the specified user.");
	}
	console.log(user.name + " exists.");
}

//confirms whether or not that username/password combination was found (TEMP)
function signinUser(user) {
	if (!user) {
		console.log("Login unsuccessful");
	} else {
		console.log("Login successful.");
	}
}

//"main" function that accepts the input and calls other functions
exports.accountManage = function(operation, name, password, callback) {
	getConnection(function(err, collection) {
		if (err) {
			return callback(err);
		}

		//handles create/update requests
		function processUser(err, user) {
			if (err) return callback(err);
			printUser(user); //temporary: for debug purposes
			collection.db.close();
			callback();
		}

		//handles signin requests
		function processSignin(err, user) {
			if (err) return callback(err);
			signinUser(user); //temporary: for debug purposes
			collection.db.close();
			callback(err, user);
		}

		//handle  account deletion requests
		function processDeletion(err, user) {
			if (err) return callback(err);
			collection.db.close();
			callback();
		}

		//handles list requests
		function processUsers(err, users) {
			if (err) return callback(err);
			//callback called for each result, when it returns null, we're done.
			users.each(function(err, user) {
				if (err) return callback(err);
				if (user) {
					printUser(user); //temp for developers use
				} else {
					collection.db.close();
					callback(users); //return userlist to request
				}
			});
		}

		// performs correct operation given input
		if (operation === "list") {
			readAll(collection, processUsers); //not used in project as-is, could be useful to check users later
		} else if (operation === "create") {
			createAccount(collection, name, password, processUser);
		} else if (operation === "update") {
			updateAccount(collection, name, password, processUser);
		} else if (operation === "login") {
			loginAccount(collection, name, password, processSignin);
		} else if (operation === "delete") {
			deleteAccount(collection, name, password, processDeletion);
		} else {
			return callback(new Error("Operation unknown."));
		}
	});
}
