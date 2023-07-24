const mongoose = require('mongoose')

// Check if the request ID is a valid ID
exports.isValidObjectId = (req, res, next) => {
	const { id } = req.params

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({ message: 'Invalid ID.' })
	}

	next()
}
