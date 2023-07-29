exports.notFound = (req, res, next) => {
	const error = new Error(`404! Not found - ${req.originalUrl}`)
	res.status(404)
	next(error)
}

exports.error = (err, req, res, next) => {
	const statusCode = res.statusCode === 200 ? 500 : res.statusCode

	res.status(statusCode).send({
		message: err.message,
		stack: process.env.NODE_ENV === 'production' ? null : err.stack // Path to error file
	})
}
