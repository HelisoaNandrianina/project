import { apiFetchJson } from "./apiClient";

// ⚠️ `system` est dérivé des variables d'environnement côté serveur — lecture
// seule, jamais modifiable via PUT /api/settings.
export interface SystemSettings {
  sync_interval_minutes: number;
  map_default_lat: number;
  map_default_lng: number;
  map_default_zoom: number;
}

export interface AlertSettings {
  score_threshold: number;
  revenue_drop_percent: number;
}

export interface SecuritySettings {
  session_timeout_minutes: number;
  require_strong_password: boolean;
}

// ⚠️ auto_sync_enabled n'est aujourd'hui qu'une valeur stockée : le
// planificateur (services/scheduler.py) tourne sur un intervalle fixe et ne
// lit pas encore ce flag.
export interface DataSettings {
  auto_sync_enabled: boolean;
  retention_days: number;
}

export interface SettingsOut {
  system: SystemSettings;
  alerts: AlertSettings;
  security: SecuritySettings;
  data: DataSettings;
  updated_at: string;
}

export interface UpdateSettingsPayload {
  alerts?: Partial<AlertSettings>;
  security?: Partial<SecuritySettings>;
  data?: Partial<DataSettings>;
}

export async function getSettingsApi(): Promise<SettingsOut> {
  return apiFetchJson<SettingsOut>("/api/settings", { method: "GET" }, "Impossible de récupérer les paramètres");
}

export async function updateSettingsApi(payload: UpdateSettingsPayload): Promise<SettingsOut> {
  return apiFetchJson<SettingsOut>(
    "/api/settings",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Impossible de mettre à jour les paramètres"
  );
}
