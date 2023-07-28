const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
	{
		postId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Post'
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		text: {
			type: String,
			required: true,
			minlength: 2
		},
		username: {
			type: String,
			required: true
		}
	},
	{
		timestamps: true
	}
)

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
