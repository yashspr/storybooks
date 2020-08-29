function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated()) {
		next();
	} else {
		req.flash('error_msg', 'Please Login to continue');
		res.redirect('/');
	}
}

function ensureGuest(req, res, next) {
	if(req.isAuthenticated()) {
		res.redirect('/dashboard');
	} else {
		next();
	}
}

module.exports.ensureAuthenticated = ensureAuthenticated;
module.exports.ensureGuest = ensureGuest;