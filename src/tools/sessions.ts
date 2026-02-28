import { DIDIT_API_BASE_URL, getHeaders } from "../config";

export async function createSession(data: Record<string, any>): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/session/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function listSessions(params?: Record<string, string>): Promise<any> {
  const url = new URL(`${DIDIT_API_BASE_URL}/sessions/`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: getHeaders() });
  return res.json();
}

export async function getSessionDecision(sessionId: string): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/session/${sessionId}/decision/`, {
    headers: getHeaders(),
  });
  return res.json();
}

export async function updateSessionStatus(sessionId: string, status: string): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/session/${sessionId}/update-status/`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function deleteSession(sessionId: string): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/session/${sessionId}/delete/`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (res.status === 204) return { success: true };
  return res.json();
}

export async function batchDeleteSessions(sessionNumbers?: number[], deleteAll = false): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/sessions/delete/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ session_numbers: sessionNumbers, delete_all: deleteAll }),
  });
  if (res.status === 204) return { success: true };
  return res.json();
}

export async function generateSessionPdf(sessionId: string): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/session/${sessionId}/generate-pdf`, {
    headers: getHeaders(),
  });
  return res.json();
}

export async function listSessionReviews(sessionId: string): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/sessions/${sessionId}/reviews/`, {
    headers: getHeaders(),
  });
  return res.json();
}

export async function addSessionReview(sessionId: string, data: Record<string, any>): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/sessions/${sessionId}/reviews/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function shareSession(sessionId: string, data: Record<string, any>): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/session/${sessionId}/share/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function importSharedSession(data: Record<string, any>): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/session/import-shared/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}
