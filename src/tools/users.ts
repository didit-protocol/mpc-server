import { DIDIT_API_BASE_URL, getHeaders } from "../config";

export async function listUsers(params?: Record<string, string>): Promise<any> {
  const url = new URL(`${DIDIT_API_BASE_URL}/users/`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: getHeaders() });
  return res.json();
}

export async function getUser(vendorData: string): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/users/${vendorData}/`, {
    headers: getHeaders(),
  });
  return res.json();
}

export async function updateUser(vendorData: string, data: Record<string, any>): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/users/${vendorData}/`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteUsers(vendorDataList?: string[], deleteAll = false): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/users/delete/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ vendor_data_list: vendorDataList, delete_all: deleteAll }),
  });
  if (res.status === 204) return { success: true };
  return res.json();
}
