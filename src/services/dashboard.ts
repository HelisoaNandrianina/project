import { apiFetchJson } from "./apiClient";

export interface DashboardKpis {
  active_points: number;
  zones_count: number;
  avg_score: number;
  active_alerts: number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface SegmentationItem {
  type: string;
  count: number;
}

export interface ActivityItem {
  type: "sync" | "point_created";
  message: string;
  timestamp: string;
}

export async function getKpisApi(): Promise<DashboardKpis> {
  return apiFetchJson<DashboardKpis>(
    "/api/dashboard/kpis",
    { method: "GET" },
    "Impossible de récupérer les indicateurs"
  );
}

export async function getRevenueEvolutionApi(months = 7): Promise<RevenuePoint[]> {
  return apiFetchJson<RevenuePoint[]>(
    `/api/dashboard/revenue-evolution?months=${months}`,
    { method: "GET" },
    "Impossible de récupérer l'évolution du revenu"
  );
}

export async function getSegmentationApi(): Promise<SegmentationItem[]> {
  return apiFetchJson<SegmentationItem[]>(
    "/api/dashboard/segmentation",
    { method: "GET" },
    "Impossible de récupérer la segmentation"
  );
}

export async function getActivityApi(limit = 10): Promise<ActivityItem[]> {
  return apiFetchJson<ActivityItem[]>(
    `/api/dashboard/activity?limit=${limit}`,
    { method: "GET" },
    "Impossible de récupérer l'activité récente"
  );
}
