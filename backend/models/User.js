const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			lowercase: true,
			required: true,
			trim: true,
			minlength: 2,
			maxlength: 50,
			unique: true
		},
		username: {
			type: String,
			lowercase: true,
			required: true,
			trim: true,
			minlength: 2,
			maxlength: 50
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
			maxlength: 100
		},
		avatar: {
			type: Object,
			default: {
				url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__480.png',
				publicId: null
			}
		},
		bio: {
			type: String
		},
		isAdmin: {
			type: Boolean,
			default: false
		},
		isAccountVerified: {
			type: Boolean,
			default: false
		}
	},
	{
		timestamps: true,
		// To allow virtual to work, include these props
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
)

// Get the posts of the current user
userSchema.virtual('posts', {
	ref: 'Post', // Model
	foreignField: 'author',
	localField: '_id' // user._id == post.author
})

// Generate token for logged in users
userSchema.methods.generateToken = function () {
	return jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, process.env.JWT_SECRET_KEY, {
		expiresIn: '30d'
	})
}

const User = mongoose.model('User', userSchema)

module.exports = User
