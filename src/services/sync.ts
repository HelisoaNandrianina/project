import { apiFetchJson } from "./apiClient";

export interface SyncJobOut {
  id: string;
  status: string;
  records_imported: number;
  started_at: string;
  finished_at: string | null;
}

export interface TriggerSyncResponse {
  job_id: string;
  status: string;
}

export async function getSyncStatusApi(): Promise<SyncJobOut> {
  return apiFetchJson<SyncJobOut>(
    "/api/sync/status",
    { method: "GET" },
    "Impossible de récupérer le statut de synchronisation"
  );
}

export async function triggerSyncApi(): Promise<TriggerSyncResponse> {
  return apiFetchJson<TriggerSyncResponse>(
    "/api/sync/trigger",
    { method: "POST" },
    "Impossible de déclencher la synchronisation"
  );
}
