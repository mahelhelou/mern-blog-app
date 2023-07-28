const mongoose = require('mongoose')

const postSchema = mongoose.Schema(
	{
		title: {
			type: String,
			require: true,
			trim: true,
			minlength: 2,
			maxlength: 200
		},
		body: {
			type: String,
			require: true,
			trim: true,
			minlength: 10
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			require: true,
			ref: 'User'
		},
		category: {
			type: String,
			require: true,
			trim: true,
			min: 2
		},
		image: {
			type: Object,
			default: {
				url: '',
				publicId: null
			}
		},
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User'
			}
		]
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
)

postSchema.virtual('comments', {
	ref: 'Comment',
	foreignField: 'postId',
	localField: '_id'
})

const Post = mongoose.model('Post', postSchema)

module.exports = Post
