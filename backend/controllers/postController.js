const path = require('path')
const fs = require('fs')

const asyncHandler = require('express-async-handler')

const Post = require('../models/Post')
const Comment = require('../models/Comment')
const validation = require('../validation')
const cloudinary = require('../utils/cloudinary')

exports.create = asyncHandler(async (req, res) => {
	/**
	 * 1. Image validation
	 * 2. Request body validation
	 * 3. Upload image to Cloudinary
	 * 4. Create new post
	 * 5. Respond to client
	 * 6. Delete image from our server
	 */

	if (!req.file) {
		return res.status(400).send({ message: 'You must provide an image for the post.' })
	} // 1

	const { error } = validation.validateCreatePost(req.body)
	if (error) {
		return res.status(400).send({ message: error.details[0].message })
	} // 2

	const imagePath = path.join(__dirname, `../uploads/images/${req.file.filename}`)
	const result = await cloudinary.uploadImage(imagePath) // 3

	const post = await Post.create({
		title: req.body.title,
		body: req.body.body,
		category: req.body.category,
		author: req.user._id,
		image: {
			url: result.secure_url,
			publicId: result.public_id
		}
	}) // 4: Alternative syntax

	res.status(201).json(post) // 5

	fs.unlinkSync(imagePath)
})

exports.postsList = asyncHandler(async (req, res) => {
	const postsPerPage = 3
	const { pageNum, category } = req.query // Like: ?category=wordpress || ?pgNum=2
	let posts

	if (pageNum) {
		posts = await Post.find()
			.skip((pageNum - 1) * postsPerPage)
			.limit(postsPerPage)
			.populate('author', ['-password'])
	} else if (category) {
		posts = await Post.find({ category }).populate('author', ['-password'])
	} else {
		posts = await Post.find().sort({ createdAt: -1 }).populate('author', ['-password'])
	}

	res.status(200).json(posts)
})

exports.postsCount = asyncHandler(async (req, res) => {
	const count = await Post.count()

	if (count === 0) {
		return res.status(200).send({ message: `Not posts yet! Create your first post.` })
	} else if (count === 1) {
		return res.status(200).send({ message: `1 post in your database.` })
	} else {
		return res.status(200).send({ message: `${count} posts in your database.` })
	}
})

exports.findById = asyncHandler(async (req, res) => {
	const post = await Post.findById(req.params.id).populate('author', ['-password']).populate('comments')
	if (!post) {
		return res.status(404).send({ message: '404! Post not found.' })
	}

	res.status(200).json(post)
})

exports.update = asyncHandler(async (req, res) => {
	const { error } = validation.validateUpdatePost(req.body)
	if (error) {
		return res.status(400).send({ message: error.details[0].message })
	}

	const post = await Post.findById(req.params.id)
	if (!post) {
		return res.status(404).send({ message: '404! Post not found.' })
	}

	if (req.user._id !== post.author.toString()) {
		return res.status(403).send({ message: 'Forbidden! You are not allowed to perform this operation.' })
	}

	const updatedPost = await Post.findByIdAndUpdate(
		req.params.id,
		{
			$set: {
				title: req.body.title,
				body: req.body.body,
				category: req.body.category
			}
		},
		{
			new: true
		}
	).populate('comments')

	res.status(200).json(updatedPost)
})

exports.updateImage = asyncHandler(async (req, res) => {
	if (!req.file) {
		return res.status(400).send({ message: 'You must provide an image for the post.' })
	}

	const post = await Post.findById(req.params.id)
	if (!post) {
		return res.status(404).send({ message: '404! Post not found.' })
	}

	if (req.user._id !== post.author.toString()) {
		return res.status(403).send({ message: 'Forbidden! You are not allowed to perform this operation.' })
	}

	await cloudinary.removeImage(post.image.publicId)
	const imagePath = path.join(__dirname, `../uploads/images/${req.file.filename}`)
	const result = await cloudinary.uploadImage(imagePath)

	const updatedPost = await Post.findByIdAndUpdate(
		req.params.id,
		{
			$set: {
				image: {
					url: result.secure_url,
					publicId: result.public_id
				}
			}
		},
		{
			new: true
		}
	)

	res.status(200).json(updatedPost)

	fs.unlinkSync(imagePath)
})

exports.delete = asyncHandler(async (req, res) => {
	const post = await Post.findById(req.params.id)
	if (!post) {
		return res.status(404).send({ message: '404! Post not found!' })
	}

	/**
	 * You can't use auth.mustBeOwnerOrAnAdmin middleware! Because we want the ID of the post NOT the ID of the user.
	 * Creating a separate middleware for this specific case might not be necessary, as the logic is relatively straightforward and contained within the controller.
	 * Using a middleware in this case would only add an extra layer of abstraction, and since the logic is not reusable for other parts of the application, it might not provide significant benefits.
	 */
	if (!(req.user.isAdmin || req.user._id === post.author.toString())) {
		return res.status(403).send({ message: "Access denied! You aren't allowed to perform this operation." })
	}

	await Post.findByIdAndDelete(req.params.id)
	await cloudinary.removeImage(post.image.publicId)
	await Comment.deleteMany({ postId: post._id })

	res.status(200).send({ message: 'Post has been deleted successfully.', postId: post._id })
})

exports.toggleLike = asyncHandler(async (req, res) => {
	const loggedInUser = req.user._id
	const { id: postId } = req.params // JS syntax, rename the id to be postId

	let post = await Post.findById(postId)
	if (!post) {
		return res.status(404).send({ message: '404! Post not found.' })
	}

	// Every like is a user id
	const isPostAlreadyLiked = post.likes.find(user => user.toString() === loggedInUser)

	if (isPostAlreadyLiked) {
		post = await Post.findByIdAndUpdate(
			postId,
			{
				// Push the like to the post.likes array
				$pull: { likes: loggedInUser }
			},
			{ new: true }
		)
	} else {
		post = await Post.findByIdAndUpdate(
			postId,
			{
				// Push the like to the post.likes array
				$push: { likes: loggedInUser }
			},
			{ new: true }
		)
	}

	res.status(200).json(post)
})
