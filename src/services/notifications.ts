import { apiFetchJson } from "./apiClient";

// ⚠️ type/priority sont des strings libres côté serveur (pas d'enum fermé) : le
// serveur n'émet aujourd'hui que type ∈ {"analysis","report"} et priority="normal".
export interface NotificationOut {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  read: boolean;
  timestamp: string;
}

export interface ListNotificationsParams {
  type?: string;
  priority?: string;
  read?: boolean;
  limit?: number;
}

export async function listNotificationsApi(params: ListNotificationsParams = {}): Promise<NotificationOut[]> {
  const search = new URLSearchParams();
  if (params.type) search.set("type", params.type);
  if (params.priority) search.set("priority", params.priority);
  if (params.read !== undefined) search.set("read", String(params.read));
  if (params.limit !== undefined) search.set("limit", String(params.limit));

  const qs = search.toString();
  return apiFetchJson<NotificationOut[]>(
    `/api/notifications${qs ? `?${qs}` : ""}`,
    { method: "GET" },
    "Impossible de récupérer les notifications"
  );
}

export async function markNotificationReadApi(id: string): Promise<NotificationOut> {
  return apiFetchJson<NotificationOut>(
    `/api/notifications/${id}/read`,
    { method: "PATCH" },
    "Impossible de marquer cette notification comme lue"
  );
}

export async function markAllNotificationsReadApi(): Promise<void> {
  await apiFetchJson<{ message: string }>(
    "/api/notifications/mark-all-read",
    { method: "POST" },
    "Impossible de marquer toutes les notifications comme lues"
  );
}

export async function deleteNotificationApi(id: string): Promise<void> {
  await apiFetchJson<{ message: string }>(
    `/api/notifications/${id}`,
    { method: "DELETE" },
    "Impossible de supprimer cette notification"
  );
}
