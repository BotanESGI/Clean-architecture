/**
 * Utilitaires pour le cache API avec Next.js
 * Utilise le cache natif de fetch() avec revalidate
 */

// Pour Docker : côté serveur utilise le nom du service, côté client utilise localhost
const getApiBaseUrl = () => {
  // Si on est côté serveur (SSR) dans Docker, utiliser le nom du service
  if (typeof window === 'undefined') {
    return process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || "http://backend:4000";
  }
  // Sinon, côté client (navigateur), utiliser localhost
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
};

const API_BASE_URL = getApiBaseUrl();

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

