export function getClientErrorMessage(
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again.",
) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}
