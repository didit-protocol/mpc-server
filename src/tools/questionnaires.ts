import { DIDIT_API_BASE_URL, getHeaders } from "../config";

export async function listQuestionnaires(): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/questionnaires/`, { headers: getHeaders() });
  return res.json();
}

export async function createQuestionnaire(data: Record<string, any>): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/questionnaires/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getQuestionnaire(uuid: string): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/questionnaires/${uuid}/`, {
    headers: getHeaders(),
  });
  return res.json();
}

export async function updateQuestionnaire(uuid: string, data: Record<string, any>): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/questionnaires/${uuid}/`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteQuestionnaire(uuid: string): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/questionnaires/${uuid}/`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (res.status === 204) return { success: true };
  return res.json();
}
