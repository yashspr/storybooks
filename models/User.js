const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	googleID: String,
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		default: "quickbrownfoxjumpedoverthelazydog"
	},
	firstName: String,
	lastName: String,
	image: {
		type: String,
		default: "/images/placeholder-face.png"
	}
});

UserSchema.virtual('fullName').get(function() {
	return `${this.firstName} ${this.lastName}`;
});

mongoose.model('user', UserSchema);