export const SESSION_COOKIE_NAME = "pfm_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export const AUTH_ROUTES = {
  dashboard: "/dashboard",
  settings: "/settings",
  signIn: "/sign-in",
  signUp: "/sign-up",
} as const;
