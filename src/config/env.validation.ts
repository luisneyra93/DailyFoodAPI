import * as Joi from 'joi';

/**
 * Esquema de validación de variables de entorno. La app NO arranca si el .env
 * no cumple este contrato: falla rápido y con un mensaje claro (fail-fast).
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('api'),
  CORS_ORIGINS: Joi.string().default('*'),

  // Base de datos
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().default(3306),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').default(''),
  DB_DATABASE: Joi.string().required(),
  // La tabla `Usuarios` ya existe: el esquema se gestiona con migraciones.
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),

  // Autenticación
  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_SECRET debe tener al menos 32 caracteres.',
  }),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  JWT_ISSUER: Joi.string().default('daily-food-api'),
  JWT_AUDIENCE: Joi.string().default('daily-food-app'),
  JWT_REFRESH_TTL_DAYS: Joi.number().integer().min(1).max(365).default(7),
  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),

  // Catálogo de roles
  ROL_PACIENTE_ID: Joi.number().integer().min(1).default(3),

  // Rate limiting
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(100),
});
