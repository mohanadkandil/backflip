import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/env";

let _redis: Redis | null = null;
function getRedis() {
  if (!_redis) {
    _redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _redis;
}

function makeLimiter(
  tokens: number,
  window: `${number} ${"s" | "m" | "h"}`,
  prefix: string,
) {
  let inst: Ratelimit | null = null;
  return {
    limit(id: string) {
      if (!inst) {
        inst = new Ratelimit({
          redis: getRedis(),
          limiter: Ratelimit.slidingWindow(tokens, window),
          prefix,
          analytics: false,
        });
      }
      return inst.limit(id);
    },
  };
}

export const uploadLimiter = makeLimiter(20, "1 h", "ratelimit:upload");
export const processLimiter = makeLimiter(30, "1 h", "ratelimit:process");
