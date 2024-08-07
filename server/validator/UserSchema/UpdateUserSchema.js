const Joi = require("joi");

const UpdateUserSchema = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  role: Joi.string().optional(),
});

module.exports = { UpdateUserSchema };
