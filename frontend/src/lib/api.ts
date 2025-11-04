const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type HttpMethod = "GET" | "POST" | "DELETE" | "PATCH";

async function request<T>(path: string, method: HttpMethod, body?: unknown, token?: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    let message = "Erreur réseau";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }
  const contentType = res.headers.get("content-type") || "";
  const hasBody = res.status !== 204 && contentType.includes("application/json");
  if (!hasBody) {
    // @ts-expect-error allow empty body
    return {};
  }
  return res.json();
}

export const api = {
  register: (payload: { firstname: string; lastname: string; email: string; password: string; }) =>
    request<{ message: string; client: unknown }>("/clients/register", "POST", payload),

  login: (payload: { email: string; password: string }) =>
    request<{ message: string; token: string }>("/clients/login", "POST", payload),

  confirm: (token: string) =>
    request<{ message: string; account: unknown }>(`/clients/confirm/${token}`, "GET"),

  getBalance: (clientId: string) =>
    request<{ accountId: string; balance: number }>(`/accounts/${clientId}/balance`, "GET"),

  getIban: (clientId: string) =>
    request<{ accountId: string; iban: string; name: string }>(`/accounts/${clientId}/iban`, "GET"),

  getClient: (id: string) =>
    request<{ id: string; firstname: string; lastname: string; email: string; verified: boolean }>(`/clients/${id}`, "GET"),

  listAccounts: (clientId: string) =>
    request<Array<{ id: string; clientId: string; iban: string; name: string; balance: number; createdAt?: string }>>(`/accounts?clientId=${clientId}`, "GET"),

  createAccount: (clientId: string, name?: string, type?: "checking" | "savings") =>
    request<{ id: string; clientId: string; iban: string; name: string; balance: number; createdAt?: string }>(`/accounts`, "POST", { clientId, name, type }),

  deleteAccount: (accountId: string) =>
    request<{ success: boolean }>(`/accounts/${accountId}`, "DELETE"),

  listTransactions: (accountIds: string[]) =>
    request<Array<{ id: string; accountId: string; type: string; amount: number; label: string; relatedAccountId?: string; relatedClientName?: string; createdAt: string }>>(`/transactions?accountIds=${accountIds.join(",")}`, "GET"),

  transfer: (fromIban: string, toIban: string, amount: number) =>
    request<{ success: boolean; fromBalance: number; toBalance: number }>("/transfers", "POST", { fromIban, toIban, amount }),

  verifyBeneficiary: (iban: string, firstName?: string, lastName?: string) =>
    request<{ exists: boolean; verified?: boolean; firstName?: string; lastName?: string; accountName?: string; message?: string }>("/beneficiaries/verify", "POST", { iban, firstName, lastName }),
};

export default api;


