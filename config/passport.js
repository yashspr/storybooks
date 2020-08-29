const GoogleStrategy = require('passport-google-oauth20');
const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = mongoose.model('user');

module.exports = function (passport) {
	passport.use(
		new GoogleStrategy({
			clientID: process.env.googleClientID,
			clientSecret: process.env.googleClientSecret,
			callbackURL: '/auth/google/callback',
			proxy: true
		}, (accessToken, refreshToken, profile, done) => {
			const image = profile.photos[0].value;
			const email = profile.emails[0].value;
			const id = profile.id;
			const firstname = profile.name.givenName;
			const lastname = profile.name.familyName;

			const newUser = {
				googleID: id,
				email: email,
				firstName: firstname,
				lastName: lastname,
				image: image
			};

			// Check for existing user
			User.findOne({
				googleID: id
			}).then((user) => {
				if (user) {
					// Return existing user
					done(null, user);
				} else {
					// Create a user
					new User(newUser)
						.save()
						.then(user => {
							done(null, user);
						})
						.catch((err) => {
							done(err);
						});
				}
			});
		})
	);

	passport.use(new LocalStrategy({
			usernameField: 'email',
			passwordField: 'pwd'
		},
		function (username, pwd, done) {
			User.findOne({
					email: username
				})
				.then((user) => {
					if (!user) {
						return done(null, false, { message: 'Invalid Email. Try Again.'});
					}
					bcrypt.compare(pwd, user.password, function (err, res) {
						if (res === true && !err) {
							return done(null, user);
						} else {
							return done(null, false, { message: 'Invalid Password. Try Again'});
						}
					});
				})
				.catch(err => {
					return done(err);
				})
		}
	));

	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		User.findById(id).then((user) => {
			done(null, user);
		});
	});
};