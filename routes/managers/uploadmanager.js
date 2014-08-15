//uploadmanager.js
//accepts files and metadata (uploader, file descriptor to be displayed, system/task name)

// TODO: add 'add queries' for a new set of results for a given run, modify return values of 'gets' to be more appropriate

// Retrieve various
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var byline = require('byline');
//var express = require('express')

// Connect to the db
function getConnection(callback) { //localhostetc temporary
	MongoClient.connect("mongodb://localhost:27017/database", function(err, db) {
  if(err) {
    return callback(err);
  }
  //create new collection if it's not there
  var collection = db.collection('uploads');

  //index  by name, for speed 
  collection.ensureIndex({name: true}, function (err) {
  	if (err) {
  		return callback(err);
  	}
  	callback(null, collection);
  });
});
}

//to add things to an uploaded document. CURRENTLY UNUSED
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

//creates a new document for a new uploaded run.
function newRun(collection, name, taskname, runname, file, comments, callback) {
	var date = new Date(); 

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
				var words = line.split("\t"); //split by tabs: works for now, may not on final product
				var measure = words[0].trim(); //remove excess whitespace
				var query = words[1];
				var value = words[2];
				var document = { //create object for each line
					measure: measure,
					query: query,
					value: value
				}

				documents.results.push(document) //add object to 'results'
			});
			stream.on('error', function(err) { //an error occurs in filereading
				return callback(new Error("An error occurred"));
			});
			stream.on('end', function() { //when everything has been read, add document to database and return.
				collection.insert(documents, {new: true}, callback);
			});
		} else { //there is already a run+task with that name.
			return callback(new Error("There is already a run for that task with that description, please choose a different description."));
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

/*/to fetch a specific upload
function readRun(collection, name, task, runname, callback) { //UNUSED: should be modified to suit getting multiple named runs.
	collection.findOne({name: name, task: task, run: runname}, callback);
}*/

//or fetch everything that user has uploaded (e.g. on startup)
function readAll(collection, name, callback) {
	collection.find({name: name}, callback);
}

//the "main" function
exports.uploadManage = function(operation, name, file, task, runname, comments, callback) {
	getConnection(function(err, collection) {
		if (err) {
			return callback(err)
		}

		function processUpload(err, upload) { //handles added files
			if (err) return callback(err)
			console.log("uploaded."); //temp: for acknowledgement
			collection.db.close();
			callback();
		}

		function processRequest(err, upload) { //passes file to data handler/client
			if (err) return callback(err)
			//printRun(upload); 
			collection.db.close();
			callback(upload, err);
		}

		/*
		function processRequests(err, uploads) { //UNUSED
			if (err) return callback(err);
			collection.db.close();
			callback(uploads, err); //temp, may require other processing
		}*/

		function processDisplay(err, uploads) {
			if (err) return callback(err);
			uploads.toArray(function (err, docs) {
				if (err) return callback(err);
				else callback(err, docs);
			});
		}

		function processDeletion(err, upload) { //UNUSED
			if (err) return callback(err);
			collection.db.close();
			callback();
		}

		//operate on input:
		if (operation === "upload") {
			newRun(collection, name, task, runname, file, comments, processUpload); //uploads a file
		} else if (operation === "delete") { 
			deleteRun(collection, name, task, runname, processDeletion); //"delete" is currently unused, should be added later
		} else if (operation === "deleteall") {
			deleteRuns(collection, name, task, processDeletion); //"deleteall" is currenty unused, may be implemented for when deleting a user account?
		} else if (operation === "get") { 
			readRun(collection, name, task, runname, processRequest); //"get" is currently unused, should be added to get a single run later
		/*} else if (operation === "getmultiple") { //(TBA)
			readMany(collection, name, task, runname, processRequests) *///"getmultiple" is currently unused, should be added to get many runs later
		} else if (operation === "getall") {
			readAll(collection, name, processDisplay); //gets all runs for that user (to populate 'records/runlist').
		} else { 
			return callback(new Error("Operation unknown."));
		}
	})
}