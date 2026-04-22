const API_URL = "http://localhost:8000"; // adapte selon ton backend

export interface UserOut {
  id: number;
  name: string;
  email: string;
  role: number;
  status: string;
  last_login: string;
}

export interface TokenOut {
  access_token: string;
  token_type: string;
  user: UserOut;
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
  name: string,
  email: string,
  password: string,
  role: number
): Promise<TokenOut> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Erreur d'inscription");
  return res.json();
}