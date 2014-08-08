var express = require('express');
var router = express.Router();
var AM = require('./managers/accountmanager');
var UM = require('./managers/uploadmanager');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'IR Evaluation Tool' });
});

/* GET login page. might later have login on index page */
router.get('/login', function(req, res) {
	res.render('login', { title: 'Login'});
});

/* GET signup page. */
router.get('/signup', function(req, res) {
	res.render('signup', { title: 'Create an Account'});
});

/* GET results page */
router.get('/records', function(req, res) {
	res.render('records', { title: 'Previous Uploads'});
});

/* GET uploads page */
router.get('/upload', function(req, res) {
	res.render('upload', { title: 'Upload New Run'});
});

/**/
router.get('/about', function(req, res) {
	res.render('about', { title: 'Information Retrieval Evaluation Tool'})
});

/* GET list of users (temp/admin) */
router.get('/userlist', function(req, res) {
	AM.accountManage("list", "", "", function(err, output) {
		if (!output) {
			res.send(err, 400);
		} else {
			res.render('userlist', {
				"userlist" : output
			});
		}
	});
});

/* POST to accountmanager (new user)*/
router.post('/adduser', function(req, res) {
	AM.accountManage("create", req.body.username, req.body.password, function(err, output) {
		if (err) {
			console.log(err);
			res.send("An error occurred while creating your account. Please try again.");
		} else {
			res.location("upload");
			res.redirect("upload");	
		}
	});
});

/* POST to accountmanager (log in) add some kind of session data?*/
router.post('/login', function(req, res) {
	AM.accountManage("login", req.body.username, req.body.password, function(err, output) {
		if (!output) {
			console.log(err); //temp: print more informatively to page?
			//res.location("login");
			//res.redirect("login");
			res.send("Your username or password was incorrect. Please try again"); //temp: should get to display on login page?
		} else {
			res.location("records"); //redirect to see if added to users (TEMP)
			res.redirect("records");
		}
	});
});

/* POST to uploadmanager (new upload) ?? deal with downloading file from user??*/ 
router.post('/newupload', function(req, res) {
	UM.uploadManage("upload", req.body.username, req.body.file, req.body.taskname, function(err, output) {
		if (err) {
			console.log(err);
			res.send("An error occurred while uploading your file. Please try again.");
		} else {
			res.location("records");
			res.redirect("records");
		}
	});
});

//accessible to other fns:
module.exports = router;
