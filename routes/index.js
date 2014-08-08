var express = require('express');
var router = express.Router();
var session = require('express-session');
var AM = require('./managers/accountmanager');
var UM = require('./managers/uploadmanager');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'IR Evaluation Tool' });
});

/* GET login page. might later have login on index page */
router.get('/login', function(req, res) {
	//if already signed in, redirect to records
	if (req.session.user == null) {
		res.render('login', { title: 'Login'});
	} else {
		//log/alert "you are already logged in" somehow?
		res.redirect('records');
	}
	
});

router.get('/logout', function(req, res) {
	if (req.session.user == null) {
		res.redirect('/');
	} else {
		res.render('logout', {title: 'Logout'});
	}
})

/* GET signup page. */
router.get('/signup', function(req, res) {
	//if already signed in, redirect to records
	if (req.session.user == null) {
		res.render('signup', { title: 'Create an Account'});
	} else {
		res.redirect('record');
	}
	
});

/* GET results page */
router.get('/records', function(req, res) {
	//if not signed in, redirect to signup
	if (req.session.user == null) {
		res.render('signup', { title: 'Create an Account'});
	} else {
		console.log(req.session.user);
	    res.render('records', { title: 'View Runs'});
	}
});

/* GET uploads page */
router.get('/upload', function(req, res) {
	//if not signed in, redirect to signup
	if (req.session.user == null) {
		res.render('signup', { title: 'Create an Account'});
	} else {
		res.render('upload', { title: 'Upload New Run'});
	}
	
});

/**/
router.get('/about', function(req, res) {
	res.render('about', { title: 'Information Retrieval Evaluation Tool'})
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
			req.session.user = output;
			res.location("records"); //redirect to see if added to users (TEMP)
			res.redirect("records");
		}
	});
});

router.post('/logout', function(req, res) {
	req.session.user = null;
	res.redirect('/');
})

/* POST to uploadmanager (new upload) ?? deal with downloading file from user??*/ 
router.post('/upload', function(req, res) {
	console.log("task: "+req.body.runname); //temp
	pathname = __dirname + "/uploads/"+req.body.runname;

	fs.writeFile(pathname, req.body.file, function(err) {
		if (err) {
			res.send("Something has gone wrong.");
		} else {
			UM.uploadManage("upload", req.session.user.name, pathname, req.body.taskname, function(err, output) {
		        if (err) {
			        console.log(err);
			        res.send("An error occurred while uploading your file. Please try again.");
		        } else {
			        res.location("records");
			        res.redirect("records");
		        }
	        });
		}

	});
	
});

//accessible to other fns:
module.exports = router;
