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
  role: number,
  photo?: File | null  
): Promise<TokenOut> {
  
  const formData = new FormData();
  formData.append("name", name);
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