/**
 * Configuración tipada de la aplicación. Se carga en el ConfigModule y expone
 * los valores del entorno de forma estructurada y con tipos.
 */
export interface AppConfig {
  readonly env: string;
  readonly port: number;
  readonly apiPrefix: string;
  readonly corsOrigins: string[];
}

export interface DatabaseConfig {
  readonly host: string;
  readonly port: number;
  readonly username: string;
  readonly password: string;
  readonly database: string;
  readonly synchronize: boolean;
  readonly logging: boolean;
}

export interface JwtConfig {
  readonly secret: string;
  readonly expiresIn: string;
  readonly issuer: string;
  readonly audience: string;
  /** Vigencia del refresh token, en días. */
  readonly refreshTtlDias: number;
}

export interface SecurityConfig {
  readonly bcryptSaltRounds: number;
}

export interface RolesConfig {
  /** Id del rol `Paciente` en el catálogo `Roles`. */
  readonly pacienteId: number;
}

export interface Configuration {
  readonly app: AppConfig;
  readonly database: DatabaseConfig;
  readonly jwt: JwtConfig;
  readonly security: SecurityConfig;
  readonly roles: RolesConfig;
}

export default (): Configuration => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api',
    corsOrigins: (process.env.CORS_ORIGINS ?? '*')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'DailyFood',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    issuer: process.env.JWT_ISSUER ?? 'daily-food-api',
    audience: process.env.JWT_AUDIENCE ?? 'daily-food-app',
    refreshTtlDias: parseInt(process.env.JWT_REFRESH_TTL_DAYS ?? '7', 10),
  },
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10),
  },
  roles: {
    pacienteId: parseInt(process.env.ROL_PACIENTE_ID ?? '3', 10),
  },
});
