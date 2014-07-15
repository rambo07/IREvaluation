//accountmanager.js
//accepts username/password combos and updates/reads database accordingly

/*TODO: add salt-and-hash (for basic safety?), add return object to pass to client on login (pass/fail status code?), 
confirmation of current pass on password change, object to pass to uploadmanager on login to get those files sent to the client, 
add time-created, email address for password recovery?, some client-side code to check if details are kept in a cookie, 
may need some intermediate validator for the form, could add timestamps for creation ...*/

// Retrieve
var MongoClient = require('mongodb').MongoClient

// Connect to the db
function getConnection(callback) { //temporary localhost/port/database marker
	MongoClient.connect("mongodb://localhost:27017/database", function(err, db) {
  if(err) {
    return callback(err)
  }
  //create new collection (only if it's not there)
  var collection = db.collection('users')
  //index  by name, for search speed
  collection.ensureIndex({name: true}, function (err) {
  	if (err) {
  		return callback(err)
  	}
  	callback(null, collection)
  })
})
}

//to change a password: finds an account with that username, sets password, returns document (user) with changed password
//TODO: need to do this only when 'logged in'
function updateAccount(collection, name, password, callback) {
	collection.findAndModify({name: name}, {}, {$set: {password: password}},
		{upsert: false, new: true}, callback)
}

//creates an account with username: username and password: password
function createAccount(collection, name, password, callback) {
	collection.find({name:name}).toArray(function(err, docs){
		if (docs.length === 0) { //i.e. there are no documents with that name
			collection.insert({name: name, password: password}, callback) //insert the user
		} else {
			console.log("There already exists a user with that name. Please choose another.")
			callback(err,docs) //there must be a better way to do this (i.e. callback when there is no user in question), but I don't know it
		}
	})	
}

// finds if there exists that username/password combo
//TODO: create variable for 'logged in' to be returned/used to access uploaded records
function loginAccount(collection, name, password, callback) {
	collection.findOne({name:name, password:password}, callback)
}

function deleteAccount(collection, name, password, callback) {
	collection.findAndRemove({name: name, password: password}, callback)
}
 
//finds all users in the database
function readAll(collection, callback) {
	collection.find({}, callback)
}

//confirms whether a user with that name exists
function printUser(user) {
	if (!user) {
		console.log("Could not find the specified user.")
	}
	console.log(user.name + " exists.")
}

//confirms whether or not that username/password combination was found
function signinUser(user) {
	if (!user) {
		console.log("Login unsuccessful")
	} else {
		console.log("Login successful.")
	}
}

//"main" function that accepts the input and calls other functions
function accountManage(operation, name, password, callback) {
	getConnection(function(err, collection) {
		if (err) {
			return callback(err)
		}

		//handles create/update requests
		function processUser(err, user) {
			if (err) return callback(err)
			printUser(user)
			collection.db.close()
			callback()
		}

		//handles signin requests
		function processSignin(err, user) {
			if (err) return callback(err)
			signinUser(user)
			collection.db.close()
			callback()
		}

		//handle  account deletion requests
		function processDeletion(err, user) {
			if (err) return callback(err)
			collection.db.close()
			callback()
		}

		//handles list requests
		function processUsers(err, users) {
			if (err) return callback(err)
			//callback called for each result, when it returns null, we're done.
			users.each(function(err, user) {
				if (err) return callback(err)
				if (user) {
					printUser(user)
				} else {
					collection.db.close()
					callback()
				}
			})
		}
		// performs correct operation given input
		if (operation === "list") {
			readAll(collection, processUsers)
		} else if (operation === "create") {
			createAccount(collection, name, password, processUser)
		} else if (operation === "update") {
			updateAccount(collection, name, password, processUser)
		} else if (operation === "login") {
			loginAccount(collection, name, password, processSignin)
		} else if (operation === "delete") {
			deleteAccount(collection, name, password, processDeletion)
		} else {
			return callback(new Error("Operation unknown."))
		}
	})
}

//accepts input of the form "operation name password" (TEMPORARY) - will be able to plug into something else eventually
var operation = process.argv[2]
var name = process.argv[3]
var password = process.argv[4]
//some kind of 'logged in' token, to be passed back to the client on signin then returned in order to access deletion, etc?

//run main to test:
accountManage(operation, name, password, function(err) {
  if (err) {
    console.log("Sorry, an error occurred.", err) //replace with something more specific
    process.exit(1)
  }
})
