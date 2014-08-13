//uploadmanager.js
//accepts files and metadata (uploader, file descriptor to be displayed, system/task name)

// TODO: add 'add queries' for a new set of results for a given run, modify return values of 'gets' to be more appropriate

// Retrieve
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var byline = require('byline');
//var express = require('express')

// Connect to the db
function getConnection(callback) { //localhostetc temporary
	MongoClient.connect("mongodb://localhost:27017/database", function(err, db) {
  if(err) {
    return callback(err)
  }
  //create new collection if it's not there
  var collection = db.collection('uploads');

  //index  by name, for speed 
  collection.ensureIndex({name: true}, function (err) {
  	if (err) {
  		return callback(err)
  	}
  	callback(null, collection);
  });
});
}

//to add things to an uploaded document?
//TODO: change to add extra 'comments' files/strings?
function modifyRun(collection, name, file, task, runname, callback) { 
	var date = new Date();
	var readable = fs.createReadStream(file, {encoding: 'utf8'});
	var stream = byline(readable);
	var documents = {
		date: date,
		results: []
	};
	stream.on('data', function(line) {
		var words = line.split("\t"); //split by tabs: works for now, may not on final product
		var measure = words[0].trim(); //remove excess whitespace
		var query = words[1];
		var value = words[2];
		var result = {
			measure: measure,
			query: query,
			value: value
		};
		documents.results.push(result);
	})
	stream.on('end', function() { //upload to database, date now date of last modification.
		collection.findAndModify({name: name, task: task, run: runname}, {}, 
		{$set: documents}, 
		{upsert: true, new: true}, callback)
	});
} 

function newRun(collection, name, taskname, runname, file, comments, callback) {

	var date = new Date(); //for my records: may be useful to show user

	collection.find({name: name, task: taskname, run: runname}).toArray(function(err, docs) {
		if (docs.length === 0) { //i.e. there is no run for that task with that name: go ahead

			var readable = fs.createReadStream(file, {encoding: 'utf8'}) //create filestream
			var stream = byline(readable) //make it readable by line
			var documents = { //create document to be added to collection
				name: name,
				task: taskname,
				date: date,
				run: runname,
				comments: comments,
				results: [] //array to contain results from file
			}
			stream.on('data', function(line) {
				var words = line.split("\t") //split by tabs: works for now, may not on final product
				var measure = words[0].trim() //remove excess whitespace
				var query = words[1]
				var value = words[2]
				//console.log('\{ '+measure+': '+value+', query: '+query+' \}'); //temp print for checks
				var document = { //create object for each line
					measure: measure,
					query: query,
					value: value
				}

				documents.results.push(document) //add object to 'results'
			})
			stream.on('error', function(err) { //an error occurs in filereading
				return callback(new Error("An error occurred"))
			})
			stream.on('end', function() { //when everything has been read, add document to database and return.
				collection.insert(documents, {new: true}, callback)
			})
		} else {
			return callback(new Error("There is already a run for that task with that description, please choose a different description."))
		}
	})
}

//deletes all runs for a given task
function deleteRuns(collection, name, task, callback) {
	collection.remove({name: name, task: task}, callback);
}

function deleteRun(collection, name, task, runname, callback) {
	collection.findAndRemove({name: name, task: task, run: runname}, {w:1}, callback);
}

//to fetch a specific upload
function readRun(collection, name, task, runname, callback) {
	collection.findOne({name: name, task: task, run: runname}, callback);
}

//or fetch everything that user has uploaded (e.g. on startup)
function readAll(collection, name, callback) {
	collection.find({name: name}, callback);
}

function printDescription(upload) {//temp
	if (!upload) {
		console.log("No such record.");
	} else {
		//console.log(upload.name +", " + upload.task +", "+upload.run+", "+upload.date);
		var date = upload.date.toString();
		var trimdate = date.slice(0, 15); //need to confirm that all dates will be exactly this long
		var desc = {
			"task": upload.task,
			"run": upload.run,
			"date": trimdate
		}
		console.log(desc); //temp
		//return desc; 
	}
}

//TODO: will actually pass the correct file for the graph
function printRun(upload) { //TEMPORARY
	if (!upload) {
		console.log("Could not find specified record");
	} else {
		//console.log(upload.results); //temp
		return upload.results
	}
}

//"main"
exports.uploadManage = function(operation, name, file, task, runname, comments, callback) {
	getConnection(function(err, collection) {
		if (err) {
			return callback(err)
		}

		function processUpload(err, upload) { //handles added files
			if (err) return callback(err)
			console.log("uploaded."); //temp
			collection.db.close();
			callback();
		}

		function processRequest(err, upload) { //passes file to data handler/client
			if (err) return callback(err)
			printRun(upload); 
			collection.db.close();
			callback(err);
		}

		function processRequests(err, uploads) { //passes files to data handler/client
			if (err) return callback(err);
			uploads.each(function(err, upload) {
				if (upload) {
					printRun(upload);
				} else {
					collection.db.close();
					callback();
				}
			})
		}

		function processDisplay(err, uploads) {
			if (err) return callback(err);
			uploads.toArray(function (err, docs) {
				if (err) return callback(err);
				else callback(err, docs);
			});

			/*
			uploads.each(function(err, upload) {
				if (upload) {
					printDescription(upload); //temp
				} else {
					collection.db.close();
					callback(uploads);
				}
			})*/
		}

		function processDeletion(err, upload) {
			if (err) return callback(err);
			collection.db.close();
			callback();
		}

		//operate based on input:
		if (operation === "upload") {
			newRun(collection, name, task, runname, file, comments, processUpload);
		} else if (operation === "delete") {
			deleteRun(collection, name, task, runname, processDeletion);
		} else if (operation === "deleteall") {
			deleteRuns(collection, name, task, processDeletion);
		} else if (operation === "get") { //to display a single run //UNUSED
			readRun(collection, name, task, runname, processRequest);
		/*} else if (operation === "getmultiple") { //(TBA)
			readMany(collection, name, task, runname, processRequests) //TODO: accept multiple 'runname' values?*/
		} else if (operation === "getall") { //e.g. on sign in, return all metadata
			readAll(collection, name, processDisplay);
		} else { //TO ADD: 'qrel' == store a qrel file 'results' = store a results file
			return callback(new Error("Operation unknown."));
		}
	})
}

/*/ALL BELOW IS TEMPORARY: take inputs and assign to useful readable variables (will later be done by method calls, or passed request)
var operation = process.argv[2]; 
var name = process.argv[3]; //the username of the person uploading
var task = process.argv[4]; //the task name attached to this run
var runname = process.argv[5]; //the 'name' attached to the specific run
var file = process.argv[6]; //eventually will be qrels/results, to be stored as files in binary, run through TREC_EVAL, producing the results
							//which are stored and sent to client?


//will eventually be the file passed from the client

//run main with inputs:
uploadManage(operation, name, file, task, runname, function(err) {
  if (err) {
    console.log("An error occurred:", err);
    process.exit(1);
  }
});*/
//TODO: accept (input file), create document(s)