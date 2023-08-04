const express = require('express')
const router = require('./router')
const errorHandler = require('./middleware/errorHandler')

const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use('/api', router)

// Errors handler
app.use(errorHandler.notFound)
app.use(errorHandler.error) // Handle errors of routes ~ Tell server to return JSON even if there's an error

module.exports = app
