import { apiFetchJson } from "./apiClient";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export interface UserOut {
  id: number;
  first_name: string;
  last_name: string;
  name: string | null;
  email: string;
  role: number;
  status: string;
  photo_url?: string | null;
}

export interface TokenOut {
  access_token: string;
  token_type: string;
  user: UserOut;
}

export interface MessageOut {
  message: string;
}

export async function loginApi(email: string, password: string): Promise<TokenOut> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Erreur de connexion");
  return res.json();
}

export async function registerApi(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role: number,
  photo?: File | null
): Promise<TokenOut> {
  const formData = new FormData();
  formData.append("first_name", firstName);
  formData.append("last_name", lastName);
  formData.append("name", `${firstName} ${lastName}`);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("role", String(role));
  if (photo) {
    formData.append("photo", photo);
  }

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Erreur d'inscription");
  return res.json();
}

export async function meApi(): Promise<UserOut> {
  return apiFetchJson<UserOut>("/auth/me", { method: "GET" }, "Impossible de récupérer l'utilisateur");
}

export async function refreshApi(token: string): Promise<TokenOut> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Session expirée");
  return res.json();
}

export async function logoutApi(): Promise<MessageOut> {
  return apiFetchJson<MessageOut>("/auth/logout", { method: "POST" }, "Erreur de déconnexion");
}

export async function forgotPasswordApi(email: string): Promise<MessageOut> {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Erreur lors de la demande");
  return res.json();
}

export async function resetPasswordApi(token: string, newPassword: string): Promise<MessageOut> {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Erreur de réinitialisation");
  return res.json();
}