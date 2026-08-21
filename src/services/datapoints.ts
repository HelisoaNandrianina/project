import { apiFetch, apiFetchJson, downloadBlob } from "./apiClient";
import type { DataPoint } from "../types";

export interface DataPointApiOut {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zone: string;
  score: number;
  status: string;
  type: string;
  revenue: number;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export function toDataPoint(api: DataPointApiOut): DataPoint {
  return {
    id: api.id,
    name: api.name,
    lat: api.lat,
    lng: api.lng,
    zone: api.zone,
    score: api.score,
    status: api.status as DataPoint["status"],
    type: api.type as DataPoint["type"],
    revenue: api.revenue,
    createdAt: api.created_at,
  };
}

export interface DataPointListResponse {
  items: DataPoint[];
  total: number;
  page: number;
  page_size: number;
}

export interface ListPointsParams {
  q?: string;
  type?: string;
  zone?: string;
  status?: string;
  score_min?: number;
  page?: number;
  page_size?: number;
}

function buildPointsSearch(params: ListPointsParams): URLSearchParams {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.type) search.set("type", params.type);
  if (params.zone) search.set("zone", params.zone);
  if (params.status) search.set("status", params.status);
  if (params.score_min !== undefined) search.set("score_min", String(params.score_min));
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.page_size !== undefined) search.set("page_size", String(params.page_size));
  return search;
}

export async function listPointsApi(params: ListPointsParams = {}): Promise<DataPointListResponse> {
  const qs = buildPointsSearch(params).toString();
  const res = await apiFetchJson<{ items: DataPointApiOut[]; total: number; page: number; page_size: number }>(
    `/api/points${qs ? `?${qs}` : ""}`,
    { method: "GET" },
    "Impossible de récupérer les points"
  );
  return { ...res, items: res.items.map(toDataPoint) };
}

export async function getPointApi(id: string): Promise<DataPoint> {
  const res = await apiFetchJson<DataPointApiOut>(
    `/api/points/${id}`,
    { method: "GET" },
    "Impossible de récupérer ce point"
  );
  return toDataPoint(res);
}

export interface CreatePointPayload {
  name: string;
  lat: number;
  lng: number;
  zone: string;
  type: string;
  status?: string;
  score?: number;
  revenue?: number;
}

export async function createPointApi(payload: CreatePointPayload): Promise<DataPoint> {
  const res = await apiFetchJson<DataPointApiOut>(
    "/api/points",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Impossible de créer ce point"
  );
  return toDataPoint(res);
}

export async function updatePointApi(id: string, payload: Partial<CreatePointPayload>): Promise<DataPoint> {
  const res = await apiFetchJson<DataPointApiOut>(
    `/api/points/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Impossible de modifier ce point"
  );
  return toDataPoint(res);
}

export async function deletePointApi(id: string): Promise<void> {
  await apiFetchJson<{ message: string }>(
    `/api/points/${id}`,
    { method: "DELETE" },
    "Impossible de supprimer ce point"
  );
}

export interface ImportReport {
  inserted: number;
  rejected: number;
  errors: { line: number; reason: string }[];
}

export async function importPointsApi(file: File): Promise<ImportReport> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetchJson<ImportReport>(
    "/api/points/import",
    { method: "POST", body: formData },
    "Impossible d'importer le fichier"
  );
}

export async function downloadPointsExport(
  params: ListPointsParams & { format?: "csv" | "xlsx" } = {}
): Promise<void> {
  const search = buildPointsSearch(params);
  search.set("format", params.format ?? "csv");

  const res = await apiFetch(`/api/points/export?${search.toString()}`);
  await downloadBlob(res, `datapoints_export.${params.format ?? "csv"}`);
}
