var express = require('express');
var router = express.Router();
var UM = require('./managers/uploadmanager');

/*
 *GET prev uploads json
 */
router.get('/runlist', function(req, res) {
	UM.uploadManage("getall", "Username", "", "", "", function(err, output) { //TEMP: need to implement a user session
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