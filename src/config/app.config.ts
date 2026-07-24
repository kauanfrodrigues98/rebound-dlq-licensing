import { Env, envSchema } from './env.schema';
import { loadEnvFile } from './load-env-file';

export interface DatabaseConfig {
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
  ssl: boolean;
  synchronize: boolean;
}

export interface AppConfig {
  env: Env['NODE_ENV'];
  port: number;
  licenseSigningSecret: string;
  licenseTokenHashSecret: string;
  adminApiKey: string;
  database: DatabaseConfig;
}

export const appConfig = (): AppConfig => ({
  env: env.NODE_ENV,
  port: env.PORT,
  licenseSigningSecret: env.LICENSE_SIGNING_SECRET,
  licenseTokenHashSecret: env.LICENSE_TOKEN_HASH_SECRET,
  adminApiKey: env.ADMIN_API_KEY,
  database: {
    enabled: env.DATABASE_ENABLED,
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    name: env.DB_NAME,
    ssl: env.DB_SSL,
    synchronize: env.DB_SYNCHRONIZE,
  },
});

loadEnvFile();

const env = envSchema.parse(process.env);
