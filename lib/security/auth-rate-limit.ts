import "server-only";

import { TooManyRequestsError } from "@/lib/http/errors";

type RateLimitAction = "change-password" | "login" | "register";

type RateLimitPolicy = {
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

const rateLimitPolicies: Record<RateLimitAction, RateLimitPolicy> = {
  "change-password": {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  },
  login: {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  },
  register: {
    limit: 4,
    windowMs: 30 * 60 * 1000,
  },
};

function getRateLimitKey(action: RateLimitAction, key: string) {
  return `${action}:${key}`;
}

function cleanupExpiredEntry(rateLimitKey: string) {
  const entry = rateLimitStore.get(rateLimitKey);

  if (entry && entry.resetAt <= Date.now()) {
    rateLimitStore.delete(rateLimitKey);
  }
}

function getRetryAfterSeconds(resetAt: number) {
  return Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
}

export function consumeAuthRateLimit(action: RateLimitAction, key: string) {
  const policy = rateLimitPolicies[action];
  const rateLimitKey = getRateLimitKey(action, key);

  cleanupExpiredEntry(rateLimitKey);

  const existingEntry = rateLimitStore.get(rateLimitKey);

  if (!existingEntry) {
    rateLimitStore.set(rateLimitKey, {
      count: 1,
      resetAt: Date.now() + policy.windowMs,
    });
    return;
  }

  if (existingEntry.count >= policy.limit) {
    throw new TooManyRequestsError(
      "Too many attempts were detected. Please wait a few minutes and try again.",
      getRetryAfterSeconds(existingEntry.resetAt),
    );
  }

  rateLimitStore.set(rateLimitKey, {
    ...existingEntry,
    count: existingEntry.count + 1,
  });
}

export function resetAuthRateLimit(action: RateLimitAction, key: string) {
  rateLimitStore.delete(getRateLimitKey(action, key));
}

export function clearAuthRateLimitStore() {
  rateLimitStore.clear();
}
