import { describe, expect, it } from "vitest";

import { isExpectedClientDisconnect } from "@/lib/observability/error-classification";

describe("observability error classification", () => {
  it("recognizes framework stream closures caused by client navigation", () => {
    expect(
      isExpectedClientDisconnect(
        new Error("The destination stream closed early."),
      ),
    ).toBe(true);

    const prematureClose = Object.assign(new Error("stream closed"), {
      code: "ERR_STREAM_PREMATURE_CLOSE",
    });

    expect(isExpectedClientDisconnect(prematureClose)).toBe(true);
  });

  it("keeps unexpected application errors observable", () => {
    expect(isExpectedClientDisconnect(new Error("Database failed"))).toBe(
      false,
    );
    expect(isExpectedClientDisconnect("not an error")).toBe(false);
  });
});
