// backend/config/env.js
const Joi = require('joi');

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development','test','production').default('development'),
  PORT: Joi.number().default(5000),

  DATABASE_URL: Joi.string().uri().required()
    .messages({ 'any.required': 'DATABASE_URL is required' }),

  OPENAI_API_KEY: Joi.string().min(20).required()
    .messages({ 'any.required': 'OPENAI_API_KEY is required' }),

  JWT_SECRET: Joi.string().min(24).required()
    .messages({ 'any.required': 'JWT_SECRET is required' }),

  CORS_ORIGIN: Joi.string().default('*')
}).unknown(true);

const { value: env, error } = schema.validate(process.env, { abortEarly: false });

if (error) {
  console.error('[ENV] Validation error(s):');
  for (const d of error.details) console.error(' -', d.message);
  process.exit(1);
}

module.exports = env;
