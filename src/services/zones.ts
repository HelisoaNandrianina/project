import { apiFetchJson } from "./apiClient";
import type { Zone, ZoneScore } from "../types";

export interface ZoneApiOut {
  id: string;
  name: string;
  score: ZoneScore;
  score_value: number;
  coverage: number;
  point_count: number;
  revenue: number;
  trend: number;
  boundary: object | null;
}

export function toZone(api: ZoneApiOut): Zone {
  return {
    id: api.id,
    name: api.name,
    score: api.score,
    scoreValue: api.score_value,
    coverage: api.coverage,
    pointCount: api.point_count,
    revenue: api.revenue,
    trend: api.trend,
  };
}

export async function listZonesApi(): Promise<Zone[]> {
  const res = await apiFetchJson<ZoneApiOut[]>("/api/zones", { method: "GET" }, "Impossible de récupérer les zones");
  return res.map(toZone);
}

export async function getZoneApi(id: string): Promise<Zone> {
  const res = await apiFetchJson<ZoneApiOut>(
    `/api/zones/${id}`,
    { method: "GET" },
    "Impossible de récupérer cette zone"
  );
  return toZone(res);
}

export interface CreateZonePayload {
  name: string;
  boundary?: object | null;
}

export interface UpdateZonePayload {
  name?: string;
  boundary?: object | null;
}

export async function createZoneApi(payload: CreateZonePayload): Promise<Zone> {
  const res = await apiFetchJson<ZoneApiOut>(
    "/api/zones",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Impossible de créer cette zone"
  );
  return toZone(res);
}

export async function updateZoneApi(id: string, payload: UpdateZonePayload): Promise<Zone> {
  const res = await apiFetchJson<ZoneApiOut>(
    `/api/zones/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Impossible de modifier cette zone"
  );
  return toZone(res);
}

export async function deleteZoneApi(id: string): Promise<void> {
  await apiFetchJson<{ message: string }>(
    `/api/zones/${id}`,
    { method: "DELETE" },
    "Impossible de supprimer cette zone"
  );
}
