const Joi = require('joi')

exports.validateRegisterUser = reqInputs => {
	const schema = Joi.object({
		email: Joi.string().required().trim().min(2).max(50).email(),
		username: Joi.string().required().trim().min(2).max(50),
		password: Joi.string().required().min(8).max(100)
	})

	return schema.validate(reqInputs)
}

exports.validateLoginUser = reqInputs => {
	const schema = Joi.object({
		email: Joi.required(),
		password: Joi.required()
	})

	return schema.validate(reqInputs)
}

exports.validateUpdateUser = reqInputs => {
	const schema = Joi.object({
		username: Joi.string().trim().min(2).max(50),
		password: Joi.string().min(8).max(100),
		bio: Joi.string().trim()
	})

	return schema.validate(reqInputs)
}

exports.validateCreatePost = reqInputs => {
	const schema = Joi.object({
		title: Joi.string().required().trim().min(2).max(200),
		body: Joi.string().required().trim().min(10),
		category: Joi.string().required().trim().min(2)
	})

	return schema.validate(reqInputs)
}

exports.validateUpdatePost = reqInputs => {
	const schema = Joi.object({
		title: Joi.string().trim().min(2).max(200),
		body: Joi.string().trim().min(10),
		category: Joi.string().trim().min(2)
	})

	return schema.validate(reqInputs)
}

exports.validateCreateComment = reqInputs => {
	const schema = Joi.object({
		postId: Joi.string().required().label('Post ID'),
		text: Joi.string().required().trim().min(2).label('Text')
	})

	return schema.validate(reqInputs)
}

exports.validateUpdateComment = reqInputs => {
	const schema = Joi.object({
		text: Joi.string().required().trim().min(2).label('Text')
	})

	return schema.validate(reqInputs)
}

exports.validateCreateCategory = reqInputs => {
	const schema = Joi.object({
		name: Joi.string().required().trim()
	})

	return schema.validate(reqInputs)
}
