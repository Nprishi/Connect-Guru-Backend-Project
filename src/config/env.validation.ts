import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(5000),

  // eslint-disable-next-line prettier/prettier
  MONGODB_URI: Joi.string().optional().default('mongodb://127.0.0.1:27017/connect-guru'),

  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_PASSWORD: Joi.string().allow('').optional(),

  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),

  RESEND_API_KEY: Joi.string().optional().default('dev_resend_key_replace_me'),
  RESEND_FROM_EMAIL: Joi.string().optional().default('onboarding@resend.dev'),
  FRONTEND_URL: Joi.string().optional(),
});
