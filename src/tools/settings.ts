import { DIDIT_API_BASE_URL, getHeaders } from "../config";

export async function listWorkflows(): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/workflows/`, { headers: getHeaders() });
  return res.json();
}

export async function getWorkflow(uuid: string): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/workflows/${uuid}/`, { headers: getHeaders() });
  return res.json();
}

export async function createWorkflow(data: Record<string, any>): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/workflows/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateWorkflow(uuid: string, data: Record<string, any>): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/workflows/${uuid}/`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}
