import { beforeEach, describe, expect, it } from "vitest";

import { TooManyRequestsError } from "@/lib/http/errors";
import {
  clearAuthRateLimitStore,
  consumeAuthRateLimit,
  resetAuthRateLimit,
} from "@/lib/security/auth-rate-limit";

describe("auth-rate-limit", () => {
  beforeEach(() => {
    clearAuthRateLimitStore();
  });

  it("blocks repeated login attempts beyond the configured limit", () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      consumeAuthRateLimit("login", "127.0.0.1:jane@example.com");
    }

    expect(() =>
      consumeAuthRateLimit("login", "127.0.0.1:jane@example.com"),
    ).toThrow(TooManyRequestsError);
  });

  it("allows attempts again after the rate limit key is reset", () => {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      consumeAuthRateLimit("register", "127.0.0.1:jane@example.com");
    }

    resetAuthRateLimit("register", "127.0.0.1:jane@example.com");

    expect(() =>
      consumeAuthRateLimit("register", "127.0.0.1:jane@example.com"),
    ).not.toThrow();
  });
});
