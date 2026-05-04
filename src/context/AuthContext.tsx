import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserOut } from '../services/auth';

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

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialisation depuis localStorage → session survivra au F5
  const [auth, setAuth] = useState<AuthState>(loadSession);

  /** Appelé après login ou register réussi */
  const login = useCallback((token: string, user: UserOut) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setAuth({ token, user });
  }, []);

  /** Déconnexion : nettoie localStorage + état */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuth({ token: null, user: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        isAuthenticated: !!auth.token && !!auth.user,
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