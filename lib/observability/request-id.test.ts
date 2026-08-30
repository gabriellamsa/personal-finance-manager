import { describe, expect, it } from "vitest";

import {
  isValidRequestId,
  resolveRequestId,
} from "@/lib/observability/request-id";

describe("request-id", () => {
  it("preserves valid request identifiers", () => {
    expect(resolveRequestId("support.case_01:api-ready")).toBe(
      "support.case_01:api-ready",
    );
  });

  it("generates a UUID when the identifier is absent", () => {
    expect(resolveRequestId(null)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("rejects control characters and header injection", () => {
    expect(isValidRequestId("safe-id\r\nx-injected: true")).toBe(false);
    expect(resolveRequestId("unsafe\nvalue")).not.toBe("unsafe\nvalue");
  });

  it("rejects identifiers longer than 128 characters", () => {
    expect(isValidRequestId("a".repeat(129))).toBe(false);
  });
});
