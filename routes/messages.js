const express = require('express');
const ExpressError = require('../expressError');
const Message = require('../models/Message');
const { ensureLoggedIn } = require('../middleware/auth');

const router = new express.Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', ensureLoggedIn, async function (req, res, next) {
	try {
		// checks the user token
		let user = req.user.username;
		// gets the message using the ID passed in
		let msg = await Message.get(req.params.id);

		// if the username does not match with either the to_user or from_user, throw an error
		if (
			msg.to_user.username !== username &&
			msg.from_user.username !== username
		) {
			throw new ExpressError(`You're not authorized to see this message.`, 401);
		}
		return res.json({ message: msg });
	} catch (e) {
		return next(e);
	}
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async function (req, res, next) {
	try {
		// take the inputs and pass them into the create method
		let msg = await Message.create({
			from_username: req.user.username,
			to_username: req.body.to_username,
			body: req.body.body,
		});
		return res.json({ message: msg });
	} catch (e) {
		return next(e);
	}
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async function (req, res, next) {
	try {
		// checks the user token
		let user = req.user.username;
		// gets the message using the ID passed in
		let msg = await Message.get(req.params.id);

		// to_user is the recipient of this message
		// if it does not equal to the passed in username, throw error.
		if (msg.to_user.username !== username) {
			throw new ExpressError(`Can't mark as read`, 401);
		}
		// If it matches the recipient, mark the message as read.
		let readMessage = await Message.markRead(req.params.id);
		return res.json({ readMessage });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
