import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { canSubmit, canViewHistory } from "@/lib/roles";

const SESSION_COOKIE_NAME = "indicadores_session";
const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "dev-secret-change-this-in-production";

type SessionPayload = {
  userId: string;
  email: string;
  role: string;
  name: string;
  exp: number;
};

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, storedDigest] = storedHash.split(":");
  const digest = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedDigest, "hex");

  if (digest.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(digest, storedBuffer);
}

function encode(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function sign(encodedPayload: string) {
  return createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const encodedPayload = encode({
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  });

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function readSessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  if (sign(encodedPayload) !== signature) {
    return null;
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8"),
  ) as SessionPayload;

  if (payload.exp < Date.now()) {
    return null;
  }

  return payload;
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  return readSessionToken(token);
}

export { canSubmit, canViewHistory };

export function sessionCookieName() {
  return SESSION_COOKIE_NAME;
}
