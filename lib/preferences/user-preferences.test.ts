import { describe, expect, it } from "vitest";

import {
  getTimeZoneOptions,
  isSupportedTimeZone,
} from "@/lib/preferences/user-preferences";

describe("user preferences", () => {
  it("supports UTC even when the runtime omits the alias from supportedValuesOf", () => {
    expect(isSupportedTimeZone("UTC")).toBe(true);
    expect(getTimeZoneOptions()).toContainEqual({
      label: "UTC",
      value: "UTC",
    });
  });
});
