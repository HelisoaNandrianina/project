import { apiFetchJson } from "./apiClient";

export interface PointRef {
  point_id?: string;
  lat?: number;
  lng?: number;
}

export interface DistanceResult {
  distance_km: number;
  duration_min: number;
  is_straight_line: true;
}

export async function computeDistanceApi(
  origin: PointRef,
  destination: PointRef,
  avgSpeedKmh = 40
): Promise<DistanceResult> {
  return apiFetchJson<DistanceResult>(
    "/api/analysis/distance",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destination, avg_speed_kmh: avgSpeedKmh }),
    },
    "Impossible de calculer la distance"
  );
}

export interface DensityPoint {
  lat: number;
  lng: number;
  weight: number;
}

export interface DensityParams {
  zone?: string;
  type?: string;
  status?: string;
  limit?: number;
}

export async function getDensityApi(params: DensityParams = {}): Promise<DensityPoint[]> {
  const search = new URLSearchParams();
  if (params.zone) search.set("zone", params.zone);
  if (params.type) search.set("type", params.type);
  if (params.status) search.set("status", params.status);
  if (params.limit !== undefined) search.set("limit", String(params.limit));

  const qs = search.toString();
  return apiFetchJson<DensityPoint[]>(
    `/api/analysis/density${qs ? `?${qs}` : ""}`,
    { method: "GET" },
    "Impossible de récupérer la densité"
  );
}
