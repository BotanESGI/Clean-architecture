export function decodeClientId(token: string | null): string | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload?.clientId ?? null;
  } catch {
    return null;
  }
}

