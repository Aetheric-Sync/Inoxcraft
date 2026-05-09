import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "@/env";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Auth endpoints: max 5 attempts per 15 minutes per IP
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "inoxcraft:rl:auth",
});

// General API: max 100 requests per minute per IP
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "inoxcraft:rl:api",
});
