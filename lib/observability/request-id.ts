const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

export function isValidRequestId(
  value: string | null | undefined,
): value is string {
  return typeof value === "string" && REQUEST_ID_PATTERN.test(value);
}

export function resolveRequestId(value: string | null | undefined) {
  return isValidRequestId(value) ? value : crypto.randomUUID();
}
