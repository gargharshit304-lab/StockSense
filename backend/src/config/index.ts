import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('20m'),
  JWT_REFRESH_EXPIRY_DAYS: z.coerce.number().default(30),
  JWT_OTP_EXPIRY: z.string().default('5m'),
  BCRYPT_COST: z.coerce.number().default(12),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(5),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
    throw new Error(`Invalid environment variables:\n${messages}`);
  }
  throw error;
}

export default env;