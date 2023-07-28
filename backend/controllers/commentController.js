const asyncHandler = require('express-async-handler')

const Comment = require('../models/Comment')
const User = require('../models/User')
const validation = require('../validation')

exports.create = asyncHandler(async (req, res) => {
	const { error } = validation.validateCreateComment(req.body)
	if (error) {
		return res.status(400).json({ message: error.details[0].message })
	}

	const author = await User.findById(req.user._id)

	const comment = await Comment.create({
		postId: req.body.postId,
		text: req.body.text,
		author: req.user._id,
		username: author.username
	})

	res.status(201).json(comment)
})

exports.commentsList = asyncHandler(async (req, res) => {
	const comments = await Comment.find().populate('author', ['-password'])

	res.status(200).json(comments)
})

exports.update = asyncHandler(async (req, res) => {
	const { error } = validation.validateUpdateComment(req.body)
	if (error) {
		return res.status(400).json({ message: error.details[0].message })
	}

	const comment = await Comment.findById(req.params.id)
	if (!comment) {
		return res.status(404).json({ message: '404! Comment not found.' })
	}

	if (req.user._id !== comment.author.toString()) {
		return res.status(403).json({ message: 'Forbidden! You are not allowed to perform this operation.' })
	}

	const updatedComment = await Comment.findByIdAndUpdate(
		req.params.id,
		{
			$set: {
				text: req.body.text
			}
		},
		{ new: true }
	)

	res.status(200).json(updatedComment)
})

exports.delete = asyncHandler(async (req, res) => {
	const comment = await Comment.findById(req.params.id)
	if (!comment) {
		return res.status(404).json({ message: '404! Comment not found.' })
	}

	if (req.user.isAdmin || req.user._id === comment.author.toString()) {
		await Comment.findByIdAndDelete(req.params.id)
		res.status(200).json({ message: 'Comment has been deleted successfully.' })
	} else {
		res.status(403).json({ message: 'Forbidden! You are not allowed to perform this operation.' })
	}
})
