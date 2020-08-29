const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth');

const Story = mongoose.model('story');

function fixSummaries(stories) {
	for (let story of stories) {
		if (!story.summary) {
			story.summary = ""
		}
	}
}

router.get('/', (req, res) => {
	Story.find({ status: 'public' })
		.populate('user')
		.sort({ date: 'desc' })
		.then(stories => {
			fixSummaries(stories);
			res.render('stories/index', {
				stories,
				title: "Public Stories"
			});
		})
		.catch(err => {
			console.log(err);
			req.flash('error_msg', 'Something went wrong');
			res.redirect('/');
		})
});

// List stories from a user
router.get('/user/:userId', (req, res) => {
	Story.find({ user: req.params.userId, status: 'public' })
		.populate('user')
		.sort({ date: 'desc' })
		.then(stories => {
			fixSummaries(stories);
			let data = {
				stories: stories
			}
			if(stories.length > 0) {
				data.userName = stories[0].user.fullName; 
			}
			res.render('stories/index', {
				...data,
				title: "Stories By This User"
			});
		})
		.catch(err => {
			console.log(err);
			req.flash('error_msg', 'Unable to find the user');
			res.redirect('/');
		});
});

// Logged in user's stories
router.get('/my', (req, res) => {
	Story.find({ user: req.user.id })
		.populate('user')
		.sort({ date: 'desc' })
		.then(stories => {
			fixSummaries(stories);
			let data = {
				stories: stories
			}
			if (stories.length > 0) {
				data.userName = stories[0].user.fullName;
			}
			res.render('stories/index', {
				...data,
				title: "Your Stories"
			});
		})
		.catch(err => {
			console.log(err);
			req.flash('error_msg', 'Unable to find the user');
			res.redirect('/');
		});
});

// Add a story
router.get('/add', ensureAuthenticated, (req, res) => {
	res.render('stories/add', {
		title: "Add a New Story"
	});
});

router.post('/', ensureAuthenticated, (req, res) => {
	let story = {}
	if (req.body.allowComments) {
		story.allowComments = true;
	}
	story.title = req.body.title;
	story.body = req.body.body;
	story.status = req.body.status;
	story.summary = req.body.summary;
	story.user = req.user.id;

	new Story(story)
		.save()
		.then(story => {
			req.flash('success_msg', 'Story added successfully');
			res.redirect(`/stories/show/${story.id}`);
		})
		.catch(err => {
			console.log(err);
			req.flash('error_msg', 'Unable to save story. Please try again');
			res.redirect('/stories/add');
		})
});

// Edit story form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
	Story.findOne({ _id: req.params.id })
		.then(story => {
			if(story.user != req.user.id) {
				res.redirect('/stories');
			} else {
				res.render('stories/edit', {
					story: story,
					title: "Edit Story"
				});
			}
		})
		.catch(err => {
			req.flash('error_msg', "Something went wrong");
			res.redirect('/');
		})
});

// Edit story with PUT request
router.put('/:id', ensureAuthenticated, (req, res) => {
	Story.findOne({ _id: req.params.id })
		.then(story => {
			if (req.body.allowComments) {
				story.allowComments = true;
			}
			story.title = req.body.title;
			story.body = req.body.body;
			story.summary = req.body.summary;
			story.status = req.body.status;

			story.save()
				.then(story => {
					req.flash('success_msg', 'Story edited successfully');
					res.redirect(`/stories/show/${story.id}`);
				})
				.catch(err => {
					req.flash('error_msg', 'Unable to save story');
					res.redirect('/dashboard');
				});
		});
});

// Delete a story
router.delete('/:id', (req, res) => {
	Story.deleteOne({ _id: req.params.id })
		.then(() => {
			req.flash('success_msg', 'Story successfully deleted');
			res.redirect('/dashboard');
		})
		.catch(() => {
			req.flash('error_msg', 'Unable to delete story');
			res.redirect('/dashboard')
		})
})

// Show single story
router.get('/show/:id', (req, res) => {
	Story.findOne({ _id: req.params.id })
		.populate('user')
		.populate('comments.commentUser')
		.then(story => {
			req.user = req.user || {};
			if(story.user.id != req.user.id && story.status == 'private') {
				req.flash('error_msg', 'Private story. Unauthorized');
				res.redirect('/');
			} else {
				res.render('stories/show', {
					story: story,
					title: story.title
				});
			}

		});
});

// Add Comment
router.post('/comment/:id', (req, res) => {
	Story.findOne({ _id: req.params.id })
		.then(story => {
			const newComment = {
				commentBody: req.body.commentBody,
				commentUser: req.user.id
			}

			story.comments.unshift(newComment);

			story.save()
				.then(story => {
					req.flash('success_msg', 'Comment added');
					res.redirect(`/stories/show/${story.id}`);
				})
				.catch(err => {
					console.log(err);
					req.flash('error_msg', 'Unable to add comment');
					res.redirect(`/stories/show/${story.id}`);
				});
		});
});

module.exports = router;