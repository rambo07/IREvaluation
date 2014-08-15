//use to provide routes for json info out of the uploads db.
var express = require('express');
var router = express.Router();
var UM = require('./managers/uploadmanager');

/*
 *GET prev uploads json
 */
router.get('/runlist', function(req, res) {
	//empty strings are for unused parameters
	UM.uploadManage("getall", req.session.user.name, "", "", "", "", function(err, output) { //TEMP: need to implement a user session
		if (err) {
			console.log("error: "+err); //temp
			res.send("An error occurred getting your account details.");
		} else {
			//console.log(output); //temp
			res.json(output);
		}
	});
});

module.exports = router;