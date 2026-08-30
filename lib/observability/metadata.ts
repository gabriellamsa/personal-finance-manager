import "server-only";

import packageMetadata from "@/package.json";

const SAFE_RELEASE_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

function resolveRelease() {
  const candidate = process.env.RELEASE_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA;

  if (!candidate || !SAFE_RELEASE_PATTERN.test(candidate)) {
    return "local";
  }

  return candidate.slice(0, 12);
}

export type PublicServiceMetadata = {
  name: string;
  release: string;
  version: string;
};

export type OperationalMetadata = PublicServiceMetadata & {
  environment: "development" | "production" | "test" | "unknown";
};

export function getPublicServiceMetadata(): PublicServiceMetadata {
  return {
    name: packageMetadata.name,
    release: resolveRelease(),
    version: packageMetadata.version,
  };
}

export function getOperationalMetadata(): OperationalMetadata {
  const environment = process.env.NODE_ENV;

  return {
    ...getPublicServiceMetadata(),
    environment:
      environment === "development" ||
      environment === "production" ||
      environment === "test"
        ? environment
        : "unknown",
  };
}
