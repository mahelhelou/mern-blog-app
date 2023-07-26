const express = require('express')
const router = express.Router()

const userController = require('./controllers/userController')
const auth = require('./middleware/auth')
const dataValidator = require('./middleware/dataValidator')
const uploader = require('./middleware/uploader')

// User related routes
router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/users', auth.mustBeLoggedIn, auth.mustBeAnAdmin, userController.usersList)
router.get('/users/count', auth.mustBeLoggedIn, auth.mustBeAnAdmin, userController.usersCount)
router.get('/profile/:id', dataValidator.isValidObjectId, userController.findById)
router.put('/profile/:id', dataValidator.isValidObjectId, auth.mustBeLoggedIn, auth.mustBeOwner, userController.update)
router.post('/profile/upload-avatar', auth.mustBeLoggedIn, uploader.photoUpload.single('image'), userController.uploadAvatar) // Postman -> Body -> form-data -> key: image -> file

// Post related routes

module.exports = router
