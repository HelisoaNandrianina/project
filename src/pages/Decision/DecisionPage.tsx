import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Brain, TrendingUp, TrendingDown, Minus, Star, AlertTriangle, CheckCircle,
  MapPin, Lightbulb, ArrowUpRight, AlertCircle,
} from 'lucide-react';
import {
  getZoneRankingApi, getRecommendationsApi, generateAnalysisApi,
} from '../../services/decision';
import type { ZoneRankingItem, RecommendationOut } from '../../services/decision';
import { listNotificationsApi } from '../../services/notifications';

type ScoreBucket = 'high' | 'medium' | 'low';

// ⚠️ Pas de bucket fourni par le serveur (seuils déjà utilisés ailleurs dans le projet).
function scoreBucket(score: number): ScoreBucket {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

const trendOrder: Record<string, number> = { hausse: 2, stable: 1, baisse: 0 };

const ANALYSIS_POLL_INTERVAL_MS = 3000;
const ANALYSIS_POLL_TIMEOUT_MS = 60000;

function TrendIndicator({ trend }: { trend: string }) {
  if (trend === 'hausse') {
    return <span className="text-xs font-semibold flex items-center gap-0.5 justify-end text-success"><TrendingUp size={11} />En hausse</span>;
  }
  if (trend === 'baisse') {
    return <span className="text-xs font-semibold flex items-center gap-0.5 justify-end text-danger"><TrendingDown size={11} />En baisse</span>;
  }
  return <span className="text-xs font-semibold flex items-center gap-0.5 justify-end text-neutral-400 dark:text-dark-muted"><Minus size={11} />Stable</span>;
}

const ScoreGauge = ({ value, size = 80 }: { value: number; size?: number }) => {
  const color = value >= 80 ? '#10B981' : value >= 60 ? '#F59E0B' : '#EF4444';
  const angle = (value / 100) * 180;
  const r = 30;
  const cx = size / 2;
  const cy = size * 0.65;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(180));
  const y1 = cy + r * Math.sin(toRad(180));
  const x2 = cx + r * Math.cos(toRad(0));
  const y2 = cy + r * Math.sin(toRad(0));
  const ox = cx + r * Math.cos(toRad(180 - angle));
  const oy = cy + r * Math.sin(toRad(180 - angle));

  return (
    <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`} fill="none" stroke="#E5E7EB" strokeWidth="6" strokeLinecap="round" className="dark:stroke-neutral-700" />
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${ox} ${oy}`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
      <text x={cx} y={cy - 2} textAnchor="middle" style={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 700, fill: color }}>{value}</text>
    </svg>
  );
};

export default function DecisionPage() {
  const [sortBy, setSortBy] = useState<'score' | 'revenue' | 'trend'>('score');

  const [ranking, setRanking] = useState<ZoneRankingItem[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingError, setRankingError] = useState('');

  const [recommendations, setRecommendations] = useState<RecommendationOut[]>([]);
  const [recoLoading, setRecoLoading] = useState(false);
  const [recoError, setRecoError] = useState('');

  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState('');
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [highlightedZone, setHighlightedZone] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const loadRanking = useCallback(() => {
    setRankingLoading(true);
    setRankingError('');
    return getZoneRankingApi()
      .then(setRanking)
      .catch(err => setRankingError(err instanceof Error ? err.message : 'Erreur serveur'))
      .finally(() => setRankingLoading(false));
  }, []);

  const loadRecommendations = useCallback(() => {
    setRecoLoading(true);
    setRecoError('');
    return getRecommendationsApi()
      .then(setRecommendations)
      .catch(err => setRecoError(err instanceof Error ? err.message : 'Erreur serveur'))
      .finally(() => setRecoLoading(false));
  }, []);

  useEffect(() => {
    loadRanking();
    loadRecommendations();
    return () => {
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, [loadRanking, loadRecommendations]);

  async function handleGenerateAnalysis() {
    setAnalysisRunning(true);
    setAnalysisMessage('');
    try {
      await generateAnalysisApi();
    } catch (err) {
      setAnalysisMessage(err instanceof Error ? err.message : 'Erreur serveur');
      setAnalysisRunning(false);
      return;
    }

    const startedAt = Date.now();

    // ⚠️ Pas d'endpoint de statut de job : on détecte la fin de l'analyse en
    // pollant les notifications récentes jusqu'à ce qu'une notification
    // type==="analysis" postérieure au déclenchement apparaisse, ou jusqu'au
    // timeout de 60s.
    const poll = async () => {
      if (Date.now() - startedAt > ANALYSIS_POLL_TIMEOUT_MS) {
        setAnalysisMessage('Toujours en cours, actualisez dans quelques instants.');
        setAnalysisRunning(false);
        return;
      }
      try {
        const notifs = await listNotificationsApi({ limit: 5 });
        const done = notifs.some(n => n.type === 'analysis' && new Date(n.timestamp).getTime() >= startedAt);
        if (done) {
          setAnalysisRunning(false);
          loadRanking();
          loadRecommendations();
          return;
        }
      } catch {
        // Erreur transitoire de poll : on retente jusqu'au timeout plutôt que d'abandonner.
      }
      pollTimeoutRef.current = setTimeout(poll, ANALYSIS_POLL_INTERVAL_MS);
    };
    pollTimeoutRef.current = setTimeout(poll, ANALYSIS_POLL_INTERVAL_MS);
  }

  function handleViewZone(zone: string) {
    setHighlightedZone(zone);
    rowRefs.current[zone]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setHighlightedZone(prev => (prev === zone ? null : prev)), 2000);
  }

  const sorted = [...ranking].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'revenue') return b.revenue - a.revenue;
    return (trendOrder[b.trend] ?? 1) - (trendOrder[a.trend] ?? 1);
  });

  const performantZones = ranking.filter(z => scoreBucket(z.score) === 'high');
  const mediumZones = ranking.filter(z => scoreBucket(z.score) === 'medium');
  const criticalZones = ranking.filter(z => scoreBucket(z.score) === 'low');

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Aide à la Décision</h1>
          <p className="text-sm text-neutral-500 dark:text-dark-muted mt-0.5">Scoring des zones, recommandations stratégiques et ranking</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-blue"><Brain size={11} />IA</span>
          <button
            onClick={handleGenerateAnalysis}
            disabled={analysisRunning}
            className="btn-primary flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {analysisRunning ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Analyse en cours…</>
            ) : (
              <><Lightbulb size={14} />Générer analyse</>
            )}
          </button>
        </div>
      </div>

      {analysisMessage && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{analysisMessage}</span>
        </div>
      )}
      {(rankingError || recoError) && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{rankingError || recoError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-success" />
            <span className="text-sm font-semibold text-neutral-700 dark:text-dark-text">Zones Performantes</span>
          </div>
          <p className="text-3xl font-bold text-success">{rankingLoading ? '…' : performantZones.length}</p>
          <p className="text-xs text-neutral-400 dark:text-dark-muted mt-1">
            Score &ge; 80{performantZones.length > 0 ? ` • ${performantZones.map(z => z.zone).join(', ')}` : ''}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-warning" />
            <span className="text-sm font-semibold text-neutral-700 dark:text-dark-text">Zones Moyennes</span>
          </div>
          <p className="text-3xl font-bold text-warning">{rankingLoading ? '…' : mediumZones.length}</p>
          <p className="text-xs text-neutral-400 dark:text-dark-muted mt-1">
            Score 60-79{mediumZones.length > 0 ? ` • ${mediumZones.map(z => z.zone).join(', ')}` : ''}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-danger" />
            <span className="text-sm font-semibold text-neutral-700 dark:text-dark-text">Zones Critiques</span>
          </div>
          <p className="text-3xl font-bold text-danger">{rankingLoading ? '…' : criticalZones.length}</p>
          <p className="text-xs text-neutral-400 dark:text-dark-muted mt-1">
            Score &lt; 60{criticalZones.length > 0 ? ` • ${criticalZones.map(z => z.zone).join(', ')}` : ''}
          </p>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-warning" />
            <h3 className="section-title">Ranking des Zones</h3>
          </div>
          <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-dark-bg rounded-lg border border-neutral-200 dark:border-dark-border">
            {[['score', 'Score'], ['revenue', 'Revenu'], ['trend', 'Tendance']].map(([k, l]) => (
              <button key={k} onClick={() => setSortBy(k as typeof sortBy)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${sortBy === k ? 'bg-white dark:bg-dark-border text-neutral-900 dark:text-dark-text shadow-sm' : 'text-neutral-500 dark:text-dark-muted'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {rankingLoading ? (
          <div className="text-center text-sm text-neutral-400 dark:text-dark-muted py-8">Chargement…</div>
        ) : (
          <div className="space-y-3">
            {sorted.map((z, i) => {
              const bucket = scoreBucket(z.score);
              return (
                <div key={z.zone}
                  ref={el => { rowRefs.current[z.zone] = el; }}
                  className={`flex items-center gap-4 p-4 bg-neutral-50 dark:bg-dark-bg rounded-xl hover:bg-neutral-100 dark:hover:bg-dark-border transition-colors ${highlightedZone === z.zone ? 'ring-2 ring-primary-500' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
                    ${i === 0 ? 'bg-yellow-100 text-yellow-600' : i === 1 ? 'bg-neutral-100 text-neutral-600' : i === 2 ? 'bg-orange-50 text-orange-500' : 'bg-neutral-50 dark:bg-dark-border text-neutral-400 dark:text-dark-muted'}`}>
                    #{i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-dark-text">{z.zone}</span>
                      <span className={bucket === 'high' ? 'badge-success' : bucket === 'medium' ? 'badge-warning' : 'badge-danger'}>
                        {bucket === 'high' ? 'Élevé' : bucket === 'medium' ? 'Moyen' : 'Critique'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-neutral-200 dark:bg-dark-border rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${z.score}%`, backgroundColor: bucket === 'high' ? '#10B981' : bucket === 'medium' ? '#F59E0B' : '#EF4444' }} />
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 hidden sm:block">
                    <ScoreGauge value={z.score} />
                  </div>

                  <div className="shrink-0 text-right space-y-1">
                    <div className="text-sm font-bold text-neutral-900 dark:text-dark-text">{(z.revenue / 1000).toFixed(0)}KMGA</div>
                    <TrendIndicator trend={z.trend} />
                    <div className="text-xs text-neutral-400 dark:text-dark-muted">{z.points_count} pts</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={16} className="text-warning" />
          <h3 className="section-title">Recommandations Stratégiques</h3>
        </div>
        {recoLoading ? (
          <div className="text-center text-sm text-neutral-400 dark:text-dark-muted py-8">Chargement…</div>
        ) : recommendations.length === 0 ? (
          <div className="text-center text-sm text-neutral-400 dark:text-dark-muted py-8">Aucune recommandation pour le moment</div>
        ) : (
          <div className="space-y-3">
            {recommendations.map(r => {
              const urgent = r.urgency === 'high';
              return (
                <div key={r.id} className={`border rounded-xl p-4 transition-all hover:shadow-card ${urgent ? 'border-red-200 dark:border-red-800/40 bg-red-50/30 dark:bg-red-900/10' : 'border-green-200 dark:border-green-800/40 bg-green-50/30 dark:bg-green-900/10'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${urgent ? 'bg-danger' : 'bg-success'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-neutral-900 dark:text-dark-text">{r.title}</span>
                            <span className={urgent ? 'badge-danger' : 'badge-success'}>
                              {urgent ? 'Urgent' : 'Opportunité'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-dark-muted mb-1">
                            <MapPin size={10} />{r.zone}
                          </div>
                        </div>
                        <span className="badge-blue text-xs">Potentiel : {r.potential} pts</span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-dark-muted leading-relaxed mb-3">{r.message}</p>
                      <button onClick={() => handleViewZone(r.zone)} className="flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors">
                        Voir la zone {r.zone}<ArrowUpRight size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
