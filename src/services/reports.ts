import { apiFetch, apiFetchJson, downloadBlob } from "./apiClient";

// ⚠️ Aucun champ title/size côté serveur — le titre affiché et la taille de
// fichier doivent être dérivés côté frontend plutôt qu'inventés.
export interface ReportOut {
  id: string;
  type: string;
  zones: string[] | string;
  format: string;
  status: string;
  created_at: string;
  finished_at: string | null;
}

// ⚠️ `type` doit être EXACTEMENT "Stratégique" (avec l'accent) pour que le
// backend génère la section Recommandations (comparaison de chaîne exacte côté
// serveur). `format` n'accepte que "pdf"|"xlsx" en minuscules.
export interface GenerateReportPayload {
  type: string;
  zones: string[] | "all";
  format: "pdf" | "xlsx";
}

export interface GenerateReportResponse {
  report_id: string;
  status: string;
}

export async function listReportsApi(): Promise<ReportOut[]> {
  return apiFetchJson<ReportOut[]>("/api/reports", { method: "GET" }, "Impossible de récupérer les rapports");
}

export async function generateReportApi(payload: GenerateReportPayload): Promise<GenerateReportResponse> {
  return apiFetchJson<GenerateReportResponse>(
    "/api/reports/generate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Impossible de générer ce rapport"
  );
}

export async function downloadReportApi(id: string, type: string, format: string): Promise<void> {
  const res = await apiFetch(`/api/reports/${id}/download`);
  await downloadBlob(res, `rapport_${type}.${format}`);
}

export async function deleteReportApi(id: string): Promise<void> {
  await apiFetchJson<{ message: string }>(
    `/api/reports/${id}`,
    { method: "DELETE" },
    "Impossible de supprimer ce rapport"
  );
}
