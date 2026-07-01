import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('UnityFund <noreply@unityfund.app>'),

  NOMBA_API_BASE_URL: z.string().default('https://api.nomba.com/v1'),
  NOMBA_ACCOUNT_ID: z.string().optional(),
  NOMBA_SUB_ACCOUNT_ID: z.string().optional(),
  NOMBA_CLIENT_ID: z.string().optional(),
  NOMBA_PRIVATE_KEY: z.string().optional(),
  NOMBA_WEBHOOK_SECRET: z.string().optional(),

  INVITATION_EXPIRES_HOURS: z.coerce.number().default(48),
  PASSWORD_RESET_EXPIRES_HOURS: z.coerce.number().default(1),

  APP_URL: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
