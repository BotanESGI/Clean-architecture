/**
 * Utilitaires pour le cache API avec Next.js
 * Utilise le cache natif de fetch() avec revalidate
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * Fetch avec cache configuré pour Next.js
 * @param url - URL relative ou absolue
 * @param options - Options fetch avec next.revalidate
 */
export async function cachedFetch<T>(
  url: string,
  options: RequestInit & { next?: { revalidate?: number } } = {}
): Promise<T> {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  
  const response = await fetch(fullUrl, {
    ...options,
    next: {
      revalidate: options.next?.revalidate ?? 3600, // Cache par défaut: 1 heure
      ...options.next,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch sans cache (pour les données dynamiques)
 */
export async function dynamicFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  
  const response = await fetch(fullUrl, {
    ...options,
    cache: "no-store", // Pas de cache
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

