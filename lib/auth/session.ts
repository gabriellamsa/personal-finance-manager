import "server-only";

import { type JWTPayload, SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { prisma } from "@/lib/db/prisma";
import { getEnv } from "@/lib/env";
import {
  AUTH_ROUTES,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from "@/lib/constants/auth";

type SessionPayload = JWTPayload & {
  email: string;
  name: string;
};

type SessionUser = {
  email: string;
  id: string;
  name: string;
};

function getSessionSecret() {
  return new TextEncoder().encode(getEnv().JWT_SECRET);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .setSubject(user.id)
    .sign(getSessionSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });

    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: getEnv().NODE_ENV === "production",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export const getCurrentSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifySessionToken(token);

  if (!payload?.sub) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.sub,
    },
    select: {
      currencyCode: true,
      email: true,
      id: true,
      name: true,
      timezone: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    user,
  };
});

export async function requireCurrentUser() {
  const session = await getCurrentSession();

  if (!session) {
    redirect(AUTH_ROUTES.signIn);
  }

  return session.user;
}

export async function redirectIfAuthenticated() {
  const session = await getCurrentSession();

  if (session) {
    redirect(AUTH_ROUTES.dashboard);
  }
}
