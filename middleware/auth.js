const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Middleware to check if the user is logged in and has a valid token
exports.mustBeLoggedIn = async (req, res, next) => {
	const authToken = req.headers.authorization
	if (!authToken) {
		return res.status(401).send({ message: 'No token provided! Access denied.' })
	}

	try {
		const token = authToken.split(' ')[1]
		const decodedPayload = await jwt.verify(token, process.env.JWT_SECRET_KEY)
		req.user = decodedPayload
		next()
	} catch (error) {
		return res.status(401).send({ message: 'Invalid token! Access denied.' })
	}
}

// Middleware to check if the user is an admin
exports.mustBeAnAdmin = (req, res, next) => {
	if (!req.user.isAdmin) {
		return res.status(401).send({ message: 'Only admins can view this page.' })
	}
	next()
}

// Check if the current user is the owner of an <object>
exports.mustBeOwner = (req, res, next) => {
	// req.user comes from mustBeLoggedIn
	if (req.user._id !== req.params.id) {
		return res.status(403).send({ message: 'Sorry! You are not allowed to perform this operation, you are not the owner.' })
	}

	next()
}
