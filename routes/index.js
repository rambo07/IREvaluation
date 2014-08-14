var express = require('express');
var router = express.Router();
var session = require('express-session');
var AM = require('./managers/accountmanager');
var UM = require('./managers/uploadmanager');
var fs = require('fs');
var busboy = require('connect-busboy');
var d3 = require('d3');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'IR Evaluation Tool' });
});

/* GET login page. Might later prefer to have login on index page */
router.get('/login', function(req, res) {
	//if already signed in, redirect to records
	if (req.session.user == null) {
		res.render('login', { title: 'Login'});
	} else {
		// should change to log/alert "you are already logged in" somehow?
		res.redirect('records');
	}
	
});

/* GET logout page. Redirects to homepage if not signed in. */
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
		res.location('records');
		res.redirect('records');
	}
	
});

/* GET results page */
router.get('/records', function(req, res) {
	//if not signed in, redirect to signup
	if (req.session.user == null) {
		res.render('signup', { title: 'Create an Account'});
	} else {
		//console.log(req.session.user); //temp to check sessions are working
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

/* GET about page*/
router.get('/about', function(req, res) {
	res.render('about', { title: 'Information Retrieval Evaluation Tool'});
});

/* GET details form page*/
router.get('/details', function(req, res) {
	res.render('details', { title: 'Add Details'});
});

/* GET graph page*/
router.get('/graph', function(req, res) {
	res.render('graph', { title: 'View Results as Chart'});
});

/* GET multiple-display page (for demonstration)*/
router.get('/display', function(req, res) {
	res.render('display', { title: 'View Multiple Results as Chart'});
});

/*TEMP GET selcom page (more advanced multiple display: kept here until finalised) */
router.get('/selcom', function(req, res) {
	res.render('selcom', {title: 'Display Results'});
});

/* POST to graph page (to allow it to know which run to display)*/
router.post('/records',function(req, res) {
	req.session.currentrecord = req.body.run;
	//res.location("graph");
	//res.redirect("graph");
	res.render('graph', { title: req.body.run});
});

/* POST to accountmanager (new user)*/
router.post('/adduser', function(req, res) {
	AM.accountManage("create", req.body.username, req.body.password, function(err, output) {
		if (err) {
			console.log(err);
			res.send("An error occurred while creating your account. Please try again.");
		} else {
			res.location("records");
			res.redirect("records");	
		}
	});
});

/* POST to accountmanager (log in) */
router.post('/login', function(req, res) {
	AM.accountManage("login", req.body.username, req.body.password, function(err, output) {
		if (!output) {
			console.log(err); //temp: print more informatively to page?
			res.send("Your username or password was incorrect. Please try again"); //temp: should get to display on login page?
		} else {
			req.session.user = output;
			res.location("records"); 
			res.redirect("records");
		}
	});
});

/* POST logout form, return to index with cleared user session data. */
router.post('/logout', function(req, res) {
	req.session.user = null;
	res.redirect('/');
})

/* POST to uploads folder: file upload itself */ //will later be replaced with upload for qrels etc?
router.post('/upload', function(req, res) {
	var fstream;
	req.pipe(req.busboy);
	req.busboy.on('file', function(fieldname, file, filename) {
		req.session.user.currentfile = filename
		console.log("Uploading: "+filename);
		fstream = fs.createWriteStream('./uploads/'+filename);
		file.pipe(fstream);
		fstream.on('close', function () {
	        res.location('details');
            res.redirect('details');
        });
	});
});

/* POST to uploadmanager: file details and file to parse. */
router.post('/details', function(req, res) {
	//operation, username, file, task, run, any comments, callback
	UM.uploadManage('upload', req.session.user.name, './uploads/'+req.session.user.currentfile, req.body.taskname, req.body.runname, req.body.comments, function(err, output) {
		if (err) {
			console.log(err);
			res.send("An error occurred while uploading your file. Please try again.");
	    } else {
	    	res.location('records');
	    	res.redirect('records');
	    }
	});
});

//to make these accessible to other functions:
module.exports = router;
