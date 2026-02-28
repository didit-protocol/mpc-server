import { DIDIT_AUTH_BASE_URL } from "../config";

export async function register(email: string, password: string): Promise<any> {
  const res = await fetch(`${DIDIT_AUTH_BASE_URL}/programmatic/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function verifyEmail(email: string, code: string): Promise<any> {
  const res = await fetch(`${DIDIT_AUTH_BASE_URL}/programmatic/verify-email/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  return res.json();
}

export async function login(email: string, password: string): Promise<any> {
  const res = await fetch(`${DIDIT_AUTH_BASE_URL}/programmatic/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}
