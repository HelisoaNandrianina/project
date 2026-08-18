import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { UserOut } from '../services/auth';
import { meApi, logoutApi } from '../services/auth';
import { registerAuthHandlers } from '../services/apiClient';

// ─── Constants ───────────────────────────────────────────────────────────────

const TOKEN_KEY = 'geo_token';
const USER_KEY  = 'geo_user';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthState {
  token: string | null;
  user:  UserOut | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  login:  (token: string, user: UserOut) => void;
  logout: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Lecture initiale depuis localStorage.
 * Si les données sont corrompues ou absentes → état déconnecté.
 */
function loadSession(): AuthState {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw   = localStorage.getItem(USER_KEY);
    if (!token || !raw) return { token: null, user: null };
    const user = JSON.parse(raw) as UserOut;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

function persistSession(token: string, user: UserOut): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialisation depuis localStorage → évite un flash "déconnecté" pendant
  // la revalidation, mais reste provisoire tant que isLoading est vrai.
  const [auth, setAuth] = useState<AuthState>(loadSession);
  // Un token en localStorage n'est qu'une promesse : il peut avoir expiré ou
  // été blacklisté côté serveur. isLoading bloque l'affichage (App.tsx montre
  // un écran de chargement) jusqu'à ce que /auth/me confirme ou infirme la
  // session, pour ne jamais flasher le dashboard avant de l'éjecter.
  const [isLoading, setIsLoading] = useState(true);

  /** Appelé après login ou register réussi */
  const login = useCallback((token: string, user: UserOut) => {
    persistSession(token, user);
    setAuth({ token, user });
  }, []);

  /** Déconnexion : nettoie localStorage + état, best-effort côté serveur */
  const logout = useCallback(() => {
    // Ne jamais bloquer l'utilisateur sur la déconnexion : le nettoyage local
    // se fait immédiatement, l'appel serveur est un aparté qui peut échouer
    // silencieusement (token déjà expiré, serveur injoignable, etc.).
    logoutApi().catch(() => {});
    clearSession();
    setAuth({ token: null, user: null });
  }, []);

  // Branche apiClient sur ce contexte pour que le refresh automatique et
  // l'expiration de session (déclenchés depuis un fetch quelconque) mettent
  // à jour le même état React, sans que apiClient importe React.
  useEffect(() => {
    registerAuthHandlers({
      onTokenRefreshed: (newToken) => {
        localStorage.setItem(TOKEN_KEY, newToken);
        setAuth((prev) => ({ ...prev, token: newToken }));
      },
      onAuthExpired: () => {
        clearSession();
        setAuth({ token: null, user: null });
      },
    });
  }, []);

  useEffect(() => {
    const { token } = loadSession();
    if (!token) {
      setIsLoading(false);
      return;
    }
    meApi()
      .then((user) => {
        persistSession(token, user);
        setAuth({ token, user });
      })
      .catch(() => {
        clearSession();
        setAuth({ token: null, user: null });
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        isAuthenticated: !!auth.token && !!auth.user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
