import { Redis } from "ioredis";
import { env } from "./env.js";

export const redisConnection = new Redis({
  host: env.REDIS.REDIS_HOST || "127.0.0.1",
  port: Number(env.REDIS.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});
