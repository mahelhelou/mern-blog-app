const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema(
	{
		author: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		name: {
			type: String,
			required: true,
			trim: true
		}
	},
	{
		timestamps: true
	}
)

const Category = mongoose.model('Category', categorySchema)

module.exports = Category
