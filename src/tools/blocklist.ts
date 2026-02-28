import { DIDIT_API_BASE_URL, getHeaders } from "../config";

export async function listBlocklist(params?: Record<string, string>): Promise<any> {
  const url = new URL(`${DIDIT_API_BASE_URL}/blocklist/`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: getHeaders() });
  return res.json();
}

export async function addToBlocklist(data: Record<string, any>): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/blocklist/add/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function removeFromBlocklist(data: Record<string, any>): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/blocklist/remove/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}
