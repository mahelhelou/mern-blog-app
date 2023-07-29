const express = require('express')
const router = express.Router()

const userController = require('./controllers/userController')
const postController = require('./controllers/postController')
const commentController = require('./controllers/commentController')
const categoryController = require('./controllers/categoryController')

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
router.delete('/profile/:id', dataValidator.isValidObjectId, auth.mustBeLoggedIn, auth.mustBeOwnerOrAnAdmin, userController.delete)

router.post('/profile/upload-avatar', auth.mustBeLoggedIn, uploader.photoUpload.single('image'), userController.uploadAvatar) // Postman -> Body -> form-data -> key: image -> file

// Post related routes
router.post('/posts/create-post', auth.mustBeLoggedIn, uploader.photoUpload.single('image'), postController.create)
router.get('/posts', postController.postsList)
router.get('/posts/count', postController.postsCount)
router.get('/posts/:id', dataValidator.isValidObjectId, postController.findById)
router.put('/posts/:id', dataValidator.isValidObjectId, auth.mustBeLoggedIn, postController.update)
router.put('/posts/:id/update-image', dataValidator.isValidObjectId, auth.mustBeLoggedIn, uploader.photoUpload.single('image'), postController.updateImage)
router.delete('/posts/:id', dataValidator.isValidObjectId, auth.mustBeLoggedIn, postController.delete)

router.put('/posts/:id/like', dataValidator.isValidObjectId, auth.mustBeLoggedIn, postController.toggleLike)

// Comment related routes
router.post('/comments', auth.mustBeLoggedIn, commentController.create)
router.get('/comments', auth.mustBeLoggedIn, auth.mustBeAnAdmin, commentController.commentsList)

router.put('/comments/:id', dataValidator.isValidObjectId, auth.mustBeLoggedIn, commentController.update)
router.delete('/comments/:id', dataValidator.isValidObjectId, auth.mustBeLoggedIn, commentController.delete)

// Category related routes
router.get('/categories', auth.mustBeLoggedIn, auth.mustBeAnAdmin, categoryController.categoriesList)
router.post('/categories', auth.mustBeLoggedIn, auth.mustBeAnAdmin, categoryController.create)
router.delete('/categories/:id', auth.mustBeLoggedIn, auth.mustBeAnAdmin, categoryController.delete)

module.exports = router
