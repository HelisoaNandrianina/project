import { useState } from 'react';
import { Brain, TrendingUp, TrendingDown, Star, AlertTriangle, CheckCircle, MapPin, Lightbulb, ArrowUpRight } from 'lucide-react';
import { mockZones } from '../../data/mockData';

const RECOMMENDATIONS = [
  {
    id: 'R1', priority: 'high', zone: 'Zone Sud',
    title: 'Intervention urgente requise',
    desc: 'Le score de Zone Sud est passé sous le seuil critique (38/100). Recommandation : déploiement de 3 nouveaux points stratégiques dans le secteur sud-est.',
    impact: 'Potentiel : +24 pts de score',
    action: 'Planifier une prospection',
  },
  {
    id: 'R2', priority: 'medium', zone: 'Zone Ouest',
    title: 'Optimisation de la couverture',
    desc: 'Zone Ouest présente une baisse de 2.1% du score. Renforcer la présence dans les zones à faible densité de couverture identifiées.',
    impact: 'Potentiel : +8 pts de score',
    action: 'Analyser les gaps',
  },
  {
    id: 'R3', priority: 'low', zone: 'Zone Nord',
    title: 'Capitaliser sur la performance',
    desc: 'Zone Nord affiche un excellent score (89/100). Reproduire le modèle organisationnel sur les zones moins performantes.',
    impact: 'Benchmark potentiel : +15%',
    action: 'Exporter le modèle',
  },
  {
    id: 'R4', priority: 'medium', zone: 'Zone Est',
    title: 'Opportunité de croissance',
    desc: 'Densité de prospects qualifiés élevée en Zone Est. Convertir les 8 prospects en attente représente ~320K€ de CA potentiel.',
    impact: 'CA potentiel : 320K€',
    action: 'Lancer la campagne',
  },
];

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

  const sorted = [...mockZones].sort((a, b) => {
    if (sortBy === 'score') return b.scoreValue - a.scoreValue;
    if (sortBy === 'revenue') return b.revenue - a.revenue;
    return b.trend - a.trend;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Aide à la Décision</h1>
          <p className="text-sm text-neutral-500 dark:text-dark-muted mt-0.5">Scoring des zones, recommandations stratégiques et ranking</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-blue"><Brain size={11} />IA v2.4</span>
          <button className="btn-primary flex items-center gap-1.5">
            <Lightbulb size={14} />Générer analyse
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-success" />
            <span className="text-sm font-semibold text-neutral-700 dark:text-dark-text">Zones Performantes</span>
          </div>
          <p className="text-3xl font-bold text-success">2</p>
          <p className="text-xs text-neutral-400 dark:text-dark-muted mt-1">Score ≥ 80 &bull; Nord, Est</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-warning" />
            <span className="text-sm font-semibold text-neutral-700 dark:text-dark-text">Zones Moyennes</span>
          </div>
          <p className="text-3xl font-bold text-warning">2</p>
          <p className="text-xs text-neutral-400 dark:text-dark-muted mt-1">Score 60-79 &bull; Centre, Ouest</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-danger" />
            <span className="text-sm font-semibold text-neutral-700 dark:text-dark-text">Zones Critiques</span>
          </div>
          <p className="text-3xl font-bold text-danger">1</p>
          <p className="text-xs text-neutral-400 dark:text-dark-muted mt-1">Score &lt; 60 &bull; Zone Sud</p>
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

        <div className="space-y-3">
          {sorted.map((z, i) => (
            <div key={z.id} className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-dark-bg rounded-xl hover:bg-neutral-100 dark:hover:bg-dark-border transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
                ${i === 0 ? 'bg-yellow-100 text-yellow-600' : i === 1 ? 'bg-neutral-100 text-neutral-600' : i === 2 ? 'bg-orange-50 text-orange-500' : 'bg-neutral-50 dark:bg-dark-border text-neutral-400 dark:text-dark-muted'}`}>
                #{i + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-dark-text">{z.name}</span>
                  <span className={z.score === 'high' ? 'badge-success' : z.score === 'medium' ? 'badge-warning' : 'badge-danger'}>
                    {z.score === 'high' ? 'Élevé' : z.score === 'medium' ? 'Moyen' : 'Critique'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-neutral-200 dark:bg-dark-border rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${z.scoreValue}%`, backgroundColor: z.score === 'high' ? '#10B981' : z.score === 'medium' ? '#F59E0B' : '#EF4444' }} />
                  </div>
                </div>
              </div>

              <div className="shrink-0 hidden sm:block">
                <ScoreGauge value={z.scoreValue} />
              </div>

              <div className="shrink-0 text-right space-y-1">
                <div className="text-sm font-bold text-neutral-900 dark:text-dark-text">{(z.revenue / 1000).toFixed(0)}K€</div>
                <div className={`text-xs font-semibold flex items-center gap-0.5 justify-end ${z.trend >= 0 ? 'text-success' : 'text-danger'}`}>
                  {z.trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {z.trend >= 0 ? '+' : ''}{z.trend}%
                </div>
                <div className="text-xs text-neutral-400 dark:text-dark-muted">{z.pointCount} pts</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={16} className="text-warning" />
          <h3 className="section-title">Recommandations Stratégiques</h3>
        </div>
        <div className="space-y-3">
          {RECOMMENDATIONS.map(r => (
            <div key={r.id} className={`border rounded-xl p-4 transition-all hover:shadow-card ${r.priority === 'high' ? 'border-red-200 dark:border-red-800/40 bg-red-50/30 dark:bg-red-900/10' : r.priority === 'medium' ? 'border-yellow-200 dark:border-yellow-800/40 bg-yellow-50/30 dark:bg-yellow-900/10' : 'border-green-200 dark:border-green-800/40 bg-green-50/30 dark:bg-green-900/10'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${r.priority === 'high' ? 'bg-danger' : r.priority === 'medium' ? 'bg-warning' : 'bg-success'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-dark-text">{r.title}</span>
                        <span className={r.priority === 'high' ? 'badge-danger' : r.priority === 'medium' ? 'badge-warning' : 'badge-success'}>
                          {r.priority === 'high' ? 'Urgent' : r.priority === 'medium' ? 'Moyen' : 'Faible'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-dark-muted mb-1">
                        <MapPin size={10} />{r.zone}
                      </div>
                    </div>
                    <span className="badge-blue text-xs">{r.impact}</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-dark-muted leading-relaxed mb-3">{r.desc}</p>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors">
                    {r.action}<ArrowUpRight size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
