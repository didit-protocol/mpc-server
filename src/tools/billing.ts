import { DIDIT_API_BASE_URL, getHeaders } from "../config";

export async function getBalance(): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/billing/balance/`, { headers: getHeaders() });
  return res.json();
}

export async function topUp(amountInDollars: number, successUrl?: string, cancelUrl?: string): Promise<any> {
  const res = await fetch(`${DIDIT_API_BASE_URL}/billing/top-up/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      amount_in_dollars: amountInDollars,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });
  return res.json();
}
