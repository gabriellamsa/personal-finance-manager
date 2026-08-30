const EXPECTED_CLIENT_DISCONNECT_MESSAGES = new Set([
  "The destination stream closed early.",
]);

const EXPECTED_CLIENT_DISCONNECT_CODES = new Set([
  "ERR_STREAM_PREMATURE_CLOSE",
]);

export function isExpectedClientDisconnect(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const errorWithCode = error as Error & { code?: unknown };

  return (
    EXPECTED_CLIENT_DISCONNECT_MESSAGES.has(error.message) ||
    (typeof errorWithCode.code === "string" &&
      EXPECTED_CLIENT_DISCONNECT_CODES.has(errorWithCode.code))
  );
}
