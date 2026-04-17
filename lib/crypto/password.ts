import "server-only";

import argon2 from "argon2";

const HASH_OPTIONS = {
  memoryCost: 65_536,
  parallelism: 1,
  timeCost: 3,
  type: argon2.argon2id,
} as const;

export async function hashPassword(password: string) {
  return argon2.hash(password, HASH_OPTIONS);
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}
