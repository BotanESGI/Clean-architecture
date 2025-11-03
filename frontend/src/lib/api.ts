const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type HttpMethod = "GET" | "POST";

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
};

export default api;


