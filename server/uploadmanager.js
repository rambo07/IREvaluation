//uploadmanager.js
//accepts files and metadata (uploader, file descriptor to be displayed, system/task name)

/* TODO: add in 'file parsing' methods, calling some other code to get correct data from file to store in db (trec output -> JSON)? 
change 'file' into qrels/results later, add sending query to TREC (all external methods)*/

// Retrieve
var MongoClient = require('mongodb').MongoClient
var fileupload = require('fileupload').createFileUpload('/uploadDir')

// Connect to the db
function getConnection(callback) { //localhostetc temporary
	MongoClient.connect("mongodb://localhost:27017/database", function(err, db) {
  if(err) {
    return callback(err)
  }
  //create new collection if it's not there
  var collection = db.collection('uploads')

  //index  by name, for speed 
  collection.ensureIndex({name: true}, function (err) {
  	if (err) {
  		return callback(err)
  	}
  	callback(null, collection)
  })
})
}

//to add or change a document
//TODO: change to manage actual uploaded items, check if that run name is already used for a run?
function replaceRun(collection, name, file, task, runname, callback) { 
	var date = new Date()
	collection.findAndModify({name: name, task: task}, {}, 
		{$set: {runname: runname, file: file, date: date}}, 
		{upsert: true, new: true}, callback)
}

function addRun(collection, name, file, task, runname, callback) {
	var date = new Date()
	collection.find({name:name, task:task, runname:runname}).toArray(function(err, docs){
		if (docs.length === 0) { //i.e. there are no documents with that name
			collection.insert({name:name, task:task, runname: runname, file:file, date:date}, {w:1}, callback) //insert the file
		} else {
			return callback(new Error("There is already a run for that task with that description, please choose another."))
		}
	})	
}

function deleteRuns(collection, name, task, callback) {
	collection.findAndRemove({name: name, task: task}, {w:1}, callback)
}

function deleteRun(collection, name, task, runname, callback) {
	collection.findAndRemove({name: name, task: task, runname: runname}, {w:1}, callback)
}

//to fetch a specific upload
function readRun(collection, name, task, runname, callback) {
	collection.findOne({name: name, task: task, runname: runname}, callback)
}
 
//or multiple specific uploads from the same task
function readMany(collection, name, task, callback) {
	collection.find({name: name}, callback) //TODO: EDIT
}

//or fetch everything that user has uploaded (e.g. on startup)
function readAll(collection, name, callback) {
	collection.find({name: name}, callback)
}

function printDescription(upload) {
	if (!upload) {
		console.log("No such record.")
	} else {
		console.log(upload.name +", " + upload.task +", "+upload.runname+", "+upload.date)
	}
}

//to "print" a single upload - for now just prints runname, 
//will actually pass the correct json for the graph, or the names
//for the table?
function printRun(upload) { //TEMPORARY
	if (!upload) {
		console.log("Could not find specified record")
	}
	console.log(upload.runname + " from " + upload.task + " by " + upload.name)
}

//"main"
function uploadManage(operation, name, file, task, runname, callback) {
	getConnection(function(err, collection) {
		if (err) {
			return callback(err)
		}

		function processUpload(err, upload) { //handles added files
			if (err) return callback(err)
			console.log("uploaded.")
			collection.db.close()
			callback()
		}

		function processRequest(err, upload) { //passes file to data handler/client
			if (err) return callback(err)
			printRun(upload) 
			collection.db.close()
			callback()
		}

		function processRequests(err, uploads) { //passes files to data handler/client
			if (err) return callback(err)
			uploads.each(function(err, upload) {
				if (upload) {
					printRun(upload)
				} else {
					collection.db.close()
					callback()
				}
			})
		}

		function processDisplay(err, uploads) {
			if (err) return callback(err)
			uploads.each(function(err, upload) {
				if (upload) {
					printDescription(upload)
				} else {
					collection.db.close()
					callback()
				}
			})
		}

		function processDeletion(err, upload) {
			if (err) return callback(err)
			collection.db.close()
			callback()
		}

		//operate based on input:
		//May change 'file' to just be text output from trec_eval, have separate methods for handling qrels + results
		if (operation === "upload") {
			addRun(collection, name, file, task, runname, processUpload)
		} else if (operation === "delete") {
			deleteRun(collection, name, task, runname, processDeletion)
		} else if (operation === "deleteall") {
			deleteRuns(collection, name, task, processDeletion)
		} else if (operation === "get") { //to display a single run
			readRun(collection, name, task, runname, processRequest)
		} else if (operation === "getmultiple") {
			readMany(collection, name, task, runname, processRequests) //TODO: accept multiple 'runname' values?
		} else if (operation === "getall") { //e.g. on sign in, return all metadata
			readAll(collection, name, processDisplay)
		} else { //TO ADD: 'qrel' == store a qrel file 'results' = store a results file
			return callback(new Error("Operation unknown."))
		}
	})
}

//take inputs and assign to useful readable variables
var operation = process.argv[2] //presumably 'upload' or 'delete'?
var name = process.argv[3] //the username of the person uploading
var file = process.argv[4] //eventually will be qrels/results, to be stored as files in binary, run through TREC_EVAL, producing the results
							//which are stored and sent to client?
var task = process.argv[5] //the task name attached to this run
var runname = process.argv[6] //the 'name' attached to the specific run

//*will eventually be the file passed from the client but that part's not even started yet.

//run main with inputs:
uploadManage(operation, name, file, task, runname, function(err) {
  if (err) {
    console.log("An error occurred:", err)
    process.exit(1)
  }
})
//TODO: accept (input file), create document(s)
