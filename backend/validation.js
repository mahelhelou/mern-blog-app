const Joi = require('joi')

exports.validateRegisterUser = reqInputs => {
	const schema = Joi.object({
		email: Joi.string().trim().min(2).max(50).required().email(),
		username: Joi.string().trim().min(2).max(50).required(),
		password: Joi.string().min(8).max(100).required()
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
		bio: Joi.string()
	})

	return schema.validate(reqInputs)
}
