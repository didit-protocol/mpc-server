import { readFileSync } from "fs";
import { basename } from "path";
import { DIDIT_API_BASE_URL, getHeaders, getApiKeyHeaders } from "../config";

function createImageFormData(fields: Record<string, string>): FormData {
  const form = new FormData();
  for (const [key, filePath] of Object.entries(fields)) {
    if (!filePath) continue;
    const buffer = readFileSync(filePath);
    form.append(key, new Blob([buffer]), basename(filePath));
  }
  return form;
}

export async function idVerification(frontImagePath: string, backImagePath?: string): Promise<any> {
  const fields: Record<string, string> = { front_image: frontImagePath };
  if (backImagePath) fields.back_image = backImagePath;
  const form = createImageFormData(fields);
  const res = await fetch(`${DIDIT_API_BASE_URL}/id-verification/`, {
    method: "POST",
    headers: getApiKeyHeaders(),
    body: form,
  });
  return res.json();
}

export async function poaVerification(frontImagePath: string, backImagePath?: string): Promise<any> {
  const fields: Record<string, string> = { front_image: frontImagePath };
  if (backImagePath) fields.back_image = backImagePath;
  const form = createImageFormData(fields);
  const res = await fetch(`${DIDIT_API_BASE_URL}/poa/`, {
    method: "POST",
    headers: getApiKeyHeaders(),
    body: form,
  });
  return res.json();
}

export async function databaseValidation(data: Record<string, any>): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/database-validation/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function passiveLiveness(imagePath: string): Promise<any> {
  const form = createImageFormData({ image: imagePath });
  const res = await fetch(`${DIDIT_API_BASE_URL}/passive-liveness/`, {
    method: "POST",
    headers: getApiKeyHeaders(),
    body: form,
  });
  return res.json();
}

export async function faceMatch(image1Path: string, image2Path: string): Promise<any> {
  const form = createImageFormData({ image_1: image1Path, image_2: image2Path });
  const res = await fetch(`${DIDIT_API_BASE_URL}/face-match/`, {
    method: "POST",
    headers: getApiKeyHeaders(),
    body: form,
  });
  return res.json();
}

export async function faceSearch(imagePath: string): Promise<any> {
  const form = createImageFormData({ image: imagePath });
  const res = await fetch(`${DIDIT_API_BASE_URL}/face-search/`, {
    method: "POST",
    headers: getApiKeyHeaders(),
    body: form,
  });
  return res.json();
}

export async function ageEstimation(imagePath: string): Promise<any> {
  const form = createImageFormData({ image: imagePath });
  const res = await fetch(`${DIDIT_API_BASE_URL}/age-estimation/`, {
    method: "POST",
    headers: getApiKeyHeaders(),
    body: form,
  });
  return res.json();
}

export async function amlScreening(data: Record<string, any>): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/aml/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function emailSend(data: Record<string, any>): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/email/send/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function emailCheck(data: Record<string, any>): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/email/check/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function phoneSend(data: Record<string, any>): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/phone/send/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function phoneCheck(data: Record<string, any>): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/phone/check/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}
