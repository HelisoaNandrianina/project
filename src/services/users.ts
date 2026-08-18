import { apiFetchJson } from "./apiClient";
import type { UserOut } from "./auth";

export interface UserListResponse {
  items: UserOut[];
  total: number;
  page: number;
  page_size: number;
}

export interface InvitePayload {
  first_name: string;
  last_name: string;
  email: string;
  role: number;
}

export interface UpdateUserPayload {
  role?: number;
  status?: string;
}

export interface ListUsersParams {
  q?: string;
  role?: number;
  status?: string;
  page?: number;
  page_size?: number;
}

export async function listUsersApi(params: ListUsersParams = {}): Promise<UserListResponse> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.role !== undefined) search.set("role", String(params.role));
  if (params.status) search.set("status", params.status);
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.page_size !== undefined) search.set("page_size", String(params.page_size));

  const qs = search.toString();
  return apiFetchJson<UserListResponse>(
    `/api/users${qs ? `?${qs}` : ""}`,
    { method: "GET" },
    "Impossible de récupérer les utilisateurs"
  );
}

export async function inviteUserApi(payload: InvitePayload): Promise<UserOut> {
  return apiFetchJson<UserOut>(
    "/api/users/invite",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Impossible d'inviter cet utilisateur"
  );
}

export async function updateUserApi(id: number, payload: UpdateUserPayload): Promise<UserOut> {
  return apiFetchJson<UserOut>(
    `/api/users/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Impossible de modifier cet utilisateur"
  );
}

export async function deactivateUserApi(id: number): Promise<UserOut> {
  return apiFetchJson<UserOut>(
    `/api/users/${id}`,
    { method: "DELETE" },
    "Impossible de désactiver cet utilisateur"
  );
}
