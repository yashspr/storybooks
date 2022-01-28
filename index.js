if(!process.env.NODE_ENV) {
	require('dotenv').config();
}
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const Handlebars = require('handlebars')
const exphbs = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const flash = require('connect-flash');
const methodOverride = require('method-override');
const cors = require('cors');
const multer = require('multer');

// Storage config for uploading images
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './assets/image_uploads');
	},
	filename: function (req, file, cb) {
		let filename = file.originalname.substring(0, file.originalname.lastIndexOf('.'));
		if (filename.length > 20) {
			filename = filename.substr(0, 20);
		}
		let ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
		cb(null, filename + '-' + Date.now() + ext);
	}
});
const upload = multer({ storage: storage });

// Load the Schemas
require('./models/User');
require('./models/Story');

require('./config/passport')(passport);

mongoose.connect(process.env.mongoURI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then(() => {
	console.log('MongoDB connected');
}).catch((err) => {
	console.log(err);
});

var app = express();

// hbs helpers
const { truncate, stripTags, formatDate, select, editIcon, checkStoryUserEqualsUser } = require('./helpers/hbs');

app.engine('handlebars', exphbs({
	handlebars: allowInsecurePrototypeAccess(Handlebars),
	helpers: {
		truncate,
		stripTags,
		formatDate,
		select,
		editIcon,
		checkStoryUserEqualsUser
	},
	defaultLayout: 'main',
}));

app.set('view engine', 'handlebars');

app.use(flash());
app.use(cors());
app.use(express.json());
app.use(express.static('assets'));
app.use(express.urlencoded({extended: true}));
if (app.get('env') === 'production') {
	app.set('trust proxy', 1) // trust first proxy
}
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Method Override middleware
app.use(methodOverride('_method'));

// Custom middleware
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg').concat(req.flash('error'));
	res.locals.user = req.user || null;
	next();
});

// Loading routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const storiesRouter = require('./routes/stories');

// Use routes
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/stories', storiesRouter);

const domain = process.env.DOMAIN || "localhost";
const port = process.env.PORT || 5000;

app.post('/upload_image', upload.single('img'), (req, res) => {
	res.json({
		link: `http://${domain}:${port}/image_uploads/${req.file.filename}`
	});
});

app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});

app.on('error', (err) => {
	console.log("Error occurred: ");
	console.log(err);
});