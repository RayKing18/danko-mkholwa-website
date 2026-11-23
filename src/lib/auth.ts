import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSettings } from "./queries";

const COOKIE_NAME = "danko_owner_session";
const SESSION_SECONDS = 60 * 60 * 12; // 12 hours

// ---- Password hashing (scrypt, built into Node — no extra packages) --
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length && timingSafeEqual(candidate, expected)
  );
}

// ---- Signed session tokens -----------------------------------------
function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function createToken(secret: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Date.now() + SESSION_SECONDS * 1000,
      nonce: randomBytes(8).toString("hex"),
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

function verifyToken(token: string | undefined, secret: string): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

// ---- Helpers used by pages and server actions ----------------------
export async function isAdminAuthenticated(): Promise<boolean> {
  const current = await getSettings();
  if (!current.adminPasswordHash) return false;
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE_NAME)?.value, current.sessionSecret);
}

/** Call at the top of every admin page / action. Redirects if not logged in. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
}

export async function startAdminSession(): Promise<void> {
  const current = await getSettings();
  const jar = await cookies();
  const requestHeaders = await headers();
  const isHttps = requestHeaders.get("x-forwarded-proto") === "https";
  jar.set(COOKIE_NAME, createToken(current.sessionSecret), {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function endAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

// ---- Simple login rate limit (per server process) ------------------
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

export async function loginRateLimited(): Promise<boolean> {
  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export function clearLoginAttempts(ip = "local") {
  attempts.delete(ip);
}
