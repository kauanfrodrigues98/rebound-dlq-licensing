import { z } from 'zod';

const booleanFromEnv = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    return value === 'true';
  });

const portFromEnv = z
  .union([z.number(), z.string()])
  .optional()
  .transform((value) => {
    if (typeof value === 'number') {
      return value;
    }

    return Number(value ?? 3000);
  })
  .pipe(z.number().int().min(1).max(65535));

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: portFromEnv,
    LICENSE_SIGNING_SECRET: z
      .string()
      .min(32)
      .default('local-development-license-signing-secret'),
    LICENSE_TOKEN_HASH_SECRET: z
      .string()
      .min(32)
      .default('local-development-license-token-hash-secret'),
    ADMIN_API_KEY: z
      .string()
      .min(32)
      .default('local-development-admin-api-key-secret'),
    DATABASE_ENABLED: booleanFromEnv,
    DB_HOST: z.string().min(1).default('localhost'),
    DB_PORT: portFromEnv.default(5432),
    DB_USERNAME: z.string().min(1).default('postgres'),
    DB_PASSWORD: z.string().default('postgres'),
    DB_NAME: z.string().min(1).default('rebound_dlq_licensing'),
    DB_SSL: booleanFromEnv.default(false),
    DB_SYNCHRONIZE: booleanFromEnv.default(false),
  })
  .transform((env) => ({
    ...env,
    DATABASE_ENABLED: env.DATABASE_ENABLED ?? env.NODE_ENV !== 'test',
  }));

export type Env = z.infer<typeof envSchema>;
