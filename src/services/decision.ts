import { apiFetchJson } from "./apiClient";

// ⚠️ Pas de bucket de score (high/medium/low) côté serveur : à calculer côté
// frontend (>=80 high, >=60 medium, sinon low). trend est catégoriel, pas un %.
export interface ZoneRankingItem {
  zone: string;
  score: number;
  revenue: number;
  points_count: number;
  trend: "hausse" | "baisse" | "stable";
}

// ⚠️ urgency n'a que 2 valeurs : "high" (urgent) et "normal" (opportunité), pas
// de niveau "moyen". Pas de champ action/CTA fourni par le serveur.
export interface RecommendationOut {
  id: string;
  zone: string;
  title: string;
  message: string;
  urgency: "high" | "normal";
  potential: number;
  created_at: string;
}

export interface GenerateAnalysisResponse {
  job_id: string;
  status: string;
}

export async function getZoneRankingApi(): Promise<ZoneRankingItem[]> {
  return apiFetchJson<ZoneRankingItem[]>(
    "/api/decision/ranking",
    { method: "GET" },
    "Impossible de récupérer le classement des zones"
  );
}

export async function getRecommendationsApi(): Promise<RecommendationOut[]> {
  return apiFetchJson<RecommendationOut[]>(
    "/api/decision/recommendations",
    { method: "GET" },
    "Impossible de récupérer les recommandations"
  );
}

export async function generateAnalysisApi(): Promise<GenerateAnalysisResponse> {
  return apiFetchJson<GenerateAnalysisResponse>(
    "/api/decision/generate-analysis",
    { method: "POST" },
    "Impossible de lancer l'analyse"
  );
}
