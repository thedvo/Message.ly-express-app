const express = require('express');
const router = new express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { SECRET_KEY } = require('../config');
const ExpressError = require('../expressError');

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async function (req, res, next) {
	try {
		// take username/password from the response body
		const { username, password } = req.body;
		// pass them into the authenticate method from the User Class
		if (await User.authenticate(username, password)) {
			// if everything goes well with login, we will call jwt.sign to make a new token
			const token = jwt.sign({ username }, SECRET_KEY);
			User.updateLoginTimestamp(username);
			return res.json({ token });
		} else {
			throw new ExpressError('Invalid username/password', 400);
		}
	} catch (e) {
		return next(e);
	}
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async function (req, res, next) {
	try {
		let { username } = await User.register(req.body);
		let token = jwt.sign({ username }, SECRET_KEY);
		User.updateLoginTimestamp(username);
		return res.json({ token });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
