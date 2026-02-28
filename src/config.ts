export const DIDIT_AUTH_BASE_URL = process.env.DIDIT_AUTH_BASE_URL || "https://apx.didit.me/auth/v2";
export const DIDIT_API_BASE_URL = process.env.DIDIT_API_BASE_URL || "https://apx.didit.me/v3";
export const DIDIT_API_KEY = process.env.DIDIT_API_KEY || "";

export function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (DIDIT_API_KEY) {
    headers["x-api-key"] = DIDIT_API_KEY;
  }
  return headers;
}

export function getAuthHeaders(accessToken: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}
