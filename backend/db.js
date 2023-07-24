const mongoose = require('mongoose')
require('dotenv').config()

const start = async () => {
	try {
		await mongoose.connect(process.env.CONNECTION_STRING)

		const app = require('./app')
		app.listen(process.env.PORT)

		console.log(`Running.. Both DB and app are running on port ${process.env.PORT}, with ${process.env.NODE_ENV} mode.`)
	} catch (error) {
		console.log('Error! ', error)
	}
}

start()
