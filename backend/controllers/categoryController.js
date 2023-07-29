const asyncHandler = require('express-async-handler')

const Category = require('../models/Category')
const validation = require('../validation')

exports.create = asyncHandler(async (req, res) => {
	const { error } = validation.validateCreateCategory(req.body)
	if (error) {
		return res.status(400).json({ message: error.details[0].message })
	}

	const category = await Category.create({
		name: req.body.name,
		author: req.user._id
	})

	res.status(201).json(category)
})

exports.categoriesList = asyncHandler(async (req, res) => {
	const categories = await Category.find()

	res.status(200).json(categories)
})

exports.delete = asyncHandler(async (req, res) => {
	const category = await Category.findById(req.params.id)
	if (!category) {
		return res.status(404).json({ message: 'category not found' })
	}

	await Category.findByIdAndDelete(req.params.id)

	res.status(200).send({
		message: 'Category has been deleted successfully.',
		categoryId: category._id
	})
})
