const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = mongoose.model('user');

router.get('/google', passport.authenticate('google', {
		scope: ['profile', 'email']
	})
);

router.post('/login', 
	passport.authenticate('local', { 
		failureFlash: true, 
		failureRedirect:'/',
		successRedirect: '/dashboard'
	}),
	(req, res) => {
		req.session.userType = 'local';
	}
);

router.post('/signup', (req, res) => {
	const fname = req.body.fname;
	const lname = req.body.lname;
	const email = req.body.email;
	const pwd = req.body.pwd;

	User.findOne({ email: email })
			.then((user) => {
				if(user) {
					req.flash('error_msg', 'A user with this email already exists');
					res.redirect('/');
				} else {
					bcrypt.genSalt(10, function (err, salt) {
						bcrypt.hash(pwd, salt, function (err, hash) {
							// Store hash in your password DB.
							const localUser = {
								firstName: fname,
								lastName: lname,
								email: email,
								password: hash
							};
							new User(localUser)
								.save()
								.then((u) => {
									console.log(u);
									req.login(u, (err) => {
										if (!err) {
											return res.redirect('/dashboard');
										} else {
											req.flash('success_msg', 'You can now login');
											return res.redirect('/');
										}
									});
								})
								.catch(err => {
									req.flash('error_msg', 'Unable to save the user. Try again');
									res.redirect('/');
								});
						});
					});	
				}
			})
			.catch(err => {
				console.log('find user error');
				console.log(err);
				req.flash('error_msg', 'Please try again');
				res.redirect('/');
			});
})

router.get('/google/callback', passport.authenticate('google', {
	failureRedirect: '/'
}), (req, res) => {
	req.session.userType = 'google';
	res.redirect('/dashboard');
});

router.get('/verify', (req, res) => {
	if(req.user) {
		res.end("User logged in");
	} else {
		res.end('User not authenticated');
	}
});

router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;