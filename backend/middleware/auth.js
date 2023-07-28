const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Middleware to check if the user is logged in and has a valid token
exports.mustBeLoggedIn = async (req, res, next) => {
	const authToken = req.headers.authorization
	if (!authToken) {
		return res.status(401).send({ message: 'Unauthorized! Please provide the required credentials (Token).' })
	}

	try {
		const token = authToken.split(' ')[1]
		const decodedPayload = await jwt.verify(token, process.env.JWT_SECRET_KEY)
		req.user = decodedPayload
		next()
	} catch (error) {
		return res.status(401).send({ message: 'Unauthorized! Invalid credentials (Token).' })
	}
}

// Middleware to check if the user is an admin
exports.mustBeAnAdmin = (req, res, next) => {
	if (!req.user.isAdmin) {
		return res.status(401).send({ message: 'Unauthorized! Only admins can view this page.' })
	}
	next()
}

// Check if the current user is the owner of an <object>
exports.mustBeOwner = (req, res, next) => {
	// req.user comes from mustBeLoggedIn
	if (req.user._id !== req.params.id) {
		return res.status(403).send({ message: 'Forbidden! You are not allowed to perform this operation.' })
	}

	next()
}

exports.mustBeOwnerOrAnAdmin = (req, res, next) => {
	if (!(req.user._id === req.params.id || req.user.isAdmin)) {
		return res.status(403).send({ message: 'Forbidden! You are not allowed to perform this operation.' })
	}

	next()
}
