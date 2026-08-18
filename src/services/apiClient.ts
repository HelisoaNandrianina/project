const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// Routes qui ne portent jamais de token (login/register créent la session,
// ils n'en dépendent pas).
const PUBLIC_PATHS = ["/auth/login", "/auth/register"];

const TOKEN_KEY = "geo_token";

interface AuthHandlers {
  onTokenRefreshed: (newToken: string) => void;
  onAuthExpired: () => void;
}

let authHandlers: AuthHandlers | null = null;

/**
 * Injecté par AuthContext au montage, pour que ce fichier utilitaire n'importe
 * jamais React/le contexte directement (pas de dépendance circulaire, testable seul).
 */
export function registerAuthHandlers(handlers: AuthHandlers): void {
  authHandlers = handlers;
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

async function parseErrorDetail(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return body.detail || fallback;
  } catch {
    return fallback;
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(oldToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${oldToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token as string;
  } catch {
    return null;
  }
}

// Plusieurs requêtes peuvent recevoir un 401 en même temps pour le même token
// expiré : on partage une seule promesse de refresh entre elles au lieu de
// déclencher un /auth/refresh par requête en échec.
function refreshTokenOnce(oldToken: string): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh(oldToken).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * fetch applicatif : préfixe l'API, injecte le Bearer token, et retente une
 * seule fois derrière un /auth/refresh en cas de 401 (au-delà d'une tentative,
 * le token est considéré définitivement invalide — inutile de boucler).
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));
  const token = getToken();

  const headers = new Headers(options.headers);
  if (!isPublic && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status !== 401 || isPublic || !token) {
    return res;
  }

  const newToken = await refreshTokenOnce(token);
  if (!newToken) {
    authHandlers?.onAuthExpired();
    return res;
  }

  authHandlers?.onTokenRefreshed(newToken);
  const retryHeaders = new Headers(options.headers);
  retryHeaders.set("Authorization", `Bearer ${newToken}`);
  return fetch(`${API_URL}${path}`, { ...options, headers: retryHeaders });
}

export async function apiFetchJson<T>(
  path: string,
  options: RequestInit = {},
  fallbackError = "Erreur serveur"
): Promise<T> {
  const res = await apiFetch(path, options);
  if (!res.ok) throw new Error(await parseErrorDetail(res, fallbackError));
  return res.json();
}
