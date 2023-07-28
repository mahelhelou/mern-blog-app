const path = require('path')
const fs = require('fs')

const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const validation = require('../validation')
const cloudinary = require('../utils/cloudinary')

exports.register = asyncHandler(async (req, res) => {
	/**
	 * 1. Validate request inputs/props
	 * 2. Check if the user is already exist
	 * 3. Hash the password for the new user
	 * 4. Save the user into DB
	 */
	const { error } = validation.validateRegisterUser(req.body)
	if (error) {
		return res.status(400).send({ message: error.details[0].message })
	}

	let user = await User.findOne({ email: req.body.email })
	if (user) {
		return res.status(400).send({ message: 'User already exists! Login to your account.' })
	}

	const salt = await bcrypt.genSalt(10)
	const hashedPassword = await bcrypt.hash(req.body.password, salt)

	user = new User({
		email: req.body.email,
		username: req.body.username,
		password: hashedPassword
	})

	await user.save()

	// TODO: Verify email

	const { password, ...others } = user._doc
	res.status(201).send({ message: 'Successfully registered! Please login in to your account.', data: others })
})

exports.login = asyncHandler(async (req, res) => {
	/**
	 * 1. Validate request inputs/props
	 * 2. Check if the user exits
	 * 3. Check if entered password === DB saved password
	 * 4. Generate a token (jwt)
	 * 5. Respond to the user
	 */

	const { error } = validation.validateLoginUser(req.body) // 1
	if (error) {
		return res.status(400).send({ message: error.details[0].message })
	}

	let user = await User.findOne({ email: req.body.email }) // 2
	if (!user) {
		return res.status(400).send({ message: 'Invalid email or password.' })
	}

	const isPasswordMatch = await bcrypt.compare(req.body.password, user.password) // 3
	if (!isPasswordMatch) {
		return res.status(400).send({ message: 'Invalid email or password.' })
	}

	// TODO: If account NOT verified, send a verification email

	// 4
	const token = user.generateToken()
	res.status(201).json({
		_id: user._id,
		username: user.username,
		isAdmin: user.isAdmin,
		avatar: user.avatar,
		token
	}) // 5
})

exports.usersList = asyncHandler(async (req, res) => {
	// Get the token from Postman -> request headers (Bearer)
	// console.log(req.headers.authorization.split(' ')[1]) // UT
	const users = await User.find()

	// (req.user comes from payload, @see /middleware/verifyToken)
	// DRY: Moved to middlewares/tokens
	/* if (!req.user.isAdmin) {
		return res.status(401).send({ message: 'Only admins can view users.' })
	} */

	res.status(200).json(users)
})

exports.usersCount = asyncHandler(async (req, res) => {
	const count = await User.count()
	res.status(200).send({ message: `${count} users in the DB.` })
})

exports.findById = asyncHandler(async (req, res) => {
	const userId = req.params.id

	const user = await User.findById(userId).select('-password').populate('posts')
	if (!user) {
		return res.status(404).send({ message: '404! User not found.' })
	}

	return res.status(200).json(user)
})

exports.update = asyncHandler(async (req, res) => {
	const { error } = validation.validateUpdateUser(req.body)
	if (error) {
		return res.status(400).send({ message: error.details[0].message })
	}

	const user = await User.findById(req.params.id)
	if (!user) {
		return res.send(404).send({ message: '404! User not found.' })
	}

	if (req.body.password) {
		const salt = await bcrypt.genSalt(10)
		req.body.password = await bcrypt.hash(req.body.password, salt)
	}

	const updatedUser = await User.findByIdAndUpdate(
		req.params.id,
		{
			$set: {
				username: req.body.username,
				password: req.body.password,
				bio: req.body.bio
			}
		},
		{ new: true }
	).select('-password')

	return res.status(200).json(updatedUser)
})

exports.uploadAvatar = asyncHandler(async (req, res) => {
	console.log(req.file)
	/**
	 * 1. Validation
	 * 2. Get the image's path
	 * 3. Upload image to Cloudinary
	 * 4. Get the user's id from db
	 * 5. Delete the old profile image
	 * 6. Change the profile image field in db (Avatar)
	 * 7. Respond to user's request
	 * 8. Delete the image from our server
	 */
	// console.log(req.file) // UT: Print the user's uploaded file
	// 1. Validation
	if (!req.file) {
		return res.status(400).send({ message: 'No image provided! Try again.' })
	}

	// 2. Get the image's path
	const imagePath = path.join(__dirname, `../uploads/images/${req.file.filename}`)

	// 3. Upload image to Cloudinary
	const result = await cloudinary.uploadImage(imagePath)

	// 4. Get the user's id from db
	const user = await User.findById(req.user._id)

	// 5. Delete the old profile image
	if (user.avatar.publicId !== null) {
		await cloudinary.removeImage(user.avatar.publicId)
	}

	// 6. Change the profile image field in db (Avatar)
	user.avatar = {
		url: result.secure_url,
		publicId: result.public_id
	}

	await user.save()

	// 7. Respond to user
	res.status(201).send({
		message: 'Successfully uploaded the profile photo.',
		avatar: { url: result.secure_url, publicId: result.public_id }
	})

	// 8. Delete the image from our server
	fs.unlinkSync(imagePath)
	/* try {
		fs.unlinkSync(imagePath)
		console.log('Image deleted successfully.')
	} catch (error) {
		console.log(error)
	} */
})

exports.delete = asyncHandler(async (req, res) => {
	/**
	 * 1. Get the user from DB
	 * 2. Get user's posts from db
	 * 3. Get public ids from posts
	 * 4. Delete posts' images from the Cloudinary
	 * 5. Delete the user's avatar from the Cloudinary
	 * 6. Delete user's posts and comments
	 * 7. Delete the whole user object
	 * 8. Respond to user's request
	 */

	// 1
	const user = await User.findById(req.params.id)
	console.log(user)

	if (!user) return res.status(404).send({ message: '404! User not found.' })

	// TODO (2)
	// TODO (3)
	// TODO (4)

	// 5
	if (req.user.publicId) {
		await cloudinary.removeImage(user.avatar.publicId)
	}

	// TODO (6)

	// 7
	await User.findOneAndDelete(req.params.id)

	// 8
	res.status(200).send({ message: 'User has been deleted successfully.' })
})
