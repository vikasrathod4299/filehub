import {z} from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  AUTH_SERVICE_URL: z.string().default('http://localhost:3001'),
  UPLOAD_SERVICE_URL: z.string().default('http://localhost:3002'),

  JWT_SECRET: z.string().default('your_jwt_secret'),
  

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100), // 100 requests per window

  HEALTH_CHECK_INTERVAL_MS: z.coerce.number().default(30000), // 30 seconds
  SERVER_TIMEOUT_MS: z.coerce.number().default(5000), // 5 seconds


  CIRCIT_BREAKER_FAILURE_THRESHOLD: z.coerce.number().default(5), // 5 failures
  CIRCIT_BREAKER_RESET_TIMEOUT_MS: z.coerce.number().default(30000), // 30 seconds

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

});

export const config = configSchema.parse(process.env);
export type Config = z.infer<typeof configSchema>;
