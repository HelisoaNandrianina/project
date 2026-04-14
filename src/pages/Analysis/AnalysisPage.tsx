import { useState } from 'react';
import { BarChart3, Target, GitBranch, Radio } from 'lucide-react';
import { BarChart, LineChart, DonutChart } from '../../components/UI/Charts';
import { mockZones, segmentData } from '../../data/mockData';

type Tab = 'density' | 'segmentation' | 'distance' | 'coverage';

const HeatmapMockSVG = () => (
  <svg viewBox="0 0 300 160" className="w-full h-full">
    <rect width="300" height="160" fill="#1a2744" />
    {Array.from({ length: 9 }).map((_, i) => (
      <line key={`h${i}`} x1="0" y1={i * 18} x2="300" y2={i * 18} stroke="#1e2e55" strokeWidth="0.5" />
    ))}
    {Array.from({ length: 17 }).map((_, i) => (
      <line key={`v${i}`} x1={i * 18} y1="0" x2={i * 18} y2="160" stroke="#1e2e55" strokeWidth="0.5" />
    ))}
    {[
      { cx: 80, cy: 60, r: 55, c1: '#EF4444', c2: '#F59E0B' },
      { cx: 160, cy: 80, r: 65, c1: '#F59E0B', c2: '#10B981' },
      { cx: 240, cy: 55, r: 45, c1: '#10B981', c2: '#3B82F6' },
      { cx: 110, cy: 120, r: 40, c1: '#EF4444', c2: '#F59E0B' },
    ].map((h, i) => (
      <g key={i}>
        <defs>
          <radialGradient id={`hm${i}`}>
            <stop offset="0%" stopColor={h.c1} stopOpacity="0.55" />
            <stop offset="60%" stopColor={h.c2} stopOpacity="0.25" />
            <stop offset="100%" stopColor={h.c2} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={h.cx} cy={h.cy} r={h.r} fill={`url(#hm${i})`} />
      </g>
    ))}
    {[
      { cx: 80, cy: 60, label: 'Haute\n89pts', score: 92 },
      { cx: 165, cy: 80, label: 'Haute\n78pts', score: 85 },
      { cx: 240, cy: 55, label: 'Moy.\n52pts', score: 67 },
      { cx: 110, cy: 120, label: 'Faible\n31pts', score: 38 },
    ].map((m, i) => (
      <g key={i}>
        <circle cx={m.cx} cy={m.cy} r="4" fill="white" opacity="0.9" />
        <text x={m.cx} y={m.cy - 8} textAnchor="middle" style={{ fontSize: 7, fill: 'white', fontFamily: 'Inter', fontWeight: 600 }}>
          {m.score}
        </text>
      </g>
    ))}
  </svg>
);

const VoronoiMock = () => (
  <svg viewBox="0 0 300 160" className="w-full h-full">
    <rect width="300" height="160" fill="#0F172A" />
    <polygon points="0,0 150,0 100,80 0,90" fill="#3B82F6" opacity="0.15" stroke="#3B82F6" strokeWidth="0.8" strokeOpacity="0.5" />
    <polygon points="150,0 300,0 300,70 190,75 100,80" fill="#10B981" opacity="0.15" stroke="#10B981" strokeWidth="0.8" strokeOpacity="0.5" />
    <polygon points="0,90 100,80 190,75 200,160 0,160" fill="#F59E0B" opacity="0.15" stroke="#F59E0B" strokeWidth="0.8" strokeOpacity="0.5" />
    <polygon points="190,75 300,70 300,160 200,160" fill="#EF4444" opacity="0.15" stroke="#EF4444" strokeWidth="0.8" strokeOpacity="0.5" />
    {[
      { cx: 75, cy: 45, c: '#3B82F6', l: 'Zone Nord' },
      { cx: 220, cy: 35, c: '#10B981', l: 'Zone Est' },
      { cx: 100, cy: 120, c: '#F59E0B', l: 'Zone Ouest' },
      { cx: 250, cy: 115, c: '#EF4444', l: 'Zone Sud' },
    ].map((s, i) => (
      <g key={i}>
        <circle cx={s.cx} cy={s.cy} r="14" fill={s.c} opacity="0.2" />
        <circle cx={s.cx} cy={s.cy} r="5" fill={s.c} />
        <text x={s.cx} y={s.cy + 20} textAnchor="middle" style={{ fontSize: 7, fill: s.c, fontFamily: 'Inter', fontWeight: 600 }}>
          {s.l}
        </text>
      </g>
    ))}
    {[[75, 45, 220, 35], [75, 45, 100, 120], [220, 35, 250, 115], [100, 120, 250, 115]].map(([x1, y1, x2, y2], i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="4 3" />
    ))}
  </svg>
);

const CoverageRings = ({ zone, pct, color }: { zone: string; pct: number; color: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="relative w-16 h-16">
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        <circle cx="32" cy="32" r="26" fill="none" stroke="#E5E7EB" strokeWidth="6" className="dark:stroke-dark-border" />
        <circle cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${pct * 1.633} ${163.3}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-neutral-800 dark:text-dark-text">{pct}%</span>
      </div>
    </div>
    <span className="text-xs text-neutral-500 dark:text-dark-muted text-center">{zone}</span>
  </div>
);

const tabs: { id: Tab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'density', label: 'Densité', icon: Radio },
  { id: 'segmentation', label: 'Segmentation', icon: GitBranch },
  { id: 'distance', label: 'Distances', icon: Target },
  { id: 'coverage', label: 'Couverture', icon: BarChart3 },
];

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState<Tab>('density');

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Analyse Géospatiale</h1>
          <p className="text-sm text-neutral-500 dark:text-dark-muted mt-0.5">Exploration des patterns territoriaux et analytiques</p>
        </div>
        <div className="flex gap-2">
          <select className="input h-8 text-xs w-36">
            <option>Toutes les zones</option>
            {mockZones.map(z => <option key={z.id}>{z.name}</option>)}
          </select>
          <select className="input h-8 text-xs w-36">
            <option>Avr 2026</option>
            <option>Mar 2026</option>
            <option>Fév 2026</option>
          </select>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-dark-card border border-neutral-200 dark:border-dark-border rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === id ? 'bg-white dark:bg-dark-border text-neutral-900 dark:text-dark-text shadow-sm' : 'text-neutral-500 dark:text-dark-muted hover:text-neutral-700'}`}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'density' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 card p-5">
              <h3 className="section-title mb-1">Carte de Densité</h3>
              <p className="text-xs text-neutral-400 dark:text-dark-muted mb-3">Concentration des points par zone géographique</p>
              <div className="h-48 rounded-lg overflow-hidden">
                <HeatmapMockSVG />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full" style={{ background: 'linear-gradient(to right, #3B82F6, #10B981, #F59E0B, #EF4444)' }} />
                <div className="flex justify-between w-full text-xs text-neutral-400 dark:text-dark-muted absolute">
                </div>
                <span className="text-xs text-neutral-400 dark:text-dark-muted ml-2">Faible → Élevé</span>
              </div>
            </div>
            <div className="card p-5 space-y-3">
              <h3 className="section-title">Métriques Densité</h3>
              {[
                { l: 'Points / km²', v: '3.4', c: 'text-primary-500' },
                { l: 'Pic densité', v: 'Zone Nord', c: 'text-success' },
                { l: 'Zone la + creuse', v: 'Zone Sud', c: 'text-danger' },
                { l: 'Indice Gini', v: '0.42', c: 'text-warning' },
                { l: 'Clusters détectés', v: '7', c: 'text-primary-500' },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-dark-border last:border-0">
                  <span className="text-xs text-neutral-500 dark:text-dark-muted">{m.l}</span>
                  <span className={`text-sm font-bold ${m.c}`}>{m.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="section-title mb-4">Distribution par Zone</h3>
            <BarChart data={mockZones.map(z => ({
              label: z.name.replace('Zone ', ''),
              value: z.pointCount,
              color: z.score === 'high' ? '#10B981' : z.score === 'medium' ? '#F59E0B' : '#EF4444',
            }))} height={110} />
          </div>
        </div>
      )}

      {activeTab === 'segmentation' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="section-title mb-1">Segmentation Territoriale (Voronoï)</h3>
              <p className="text-xs text-neutral-400 dark:text-dark-muted mb-3">Délimitation automatique des zones d'influence</p>
              <div className="h-48 rounded-lg overflow-hidden">
                <VoronoiMock />
              </div>
            </div>
            <div className="card p-5">
              <h3 className="section-title mb-3">Répartition des segments</h3>
              <DonutChart data={segmentData} size={110} />
              <div className="mt-4 space-y-2">
                {mockZones.map(z => (
                  <div key={z.id} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: z.score === 'high' ? '#10B981' : z.score === 'medium' ? '#F59E0B' : '#EF4444' }} />
                    <span className="text-xs text-neutral-600 dark:text-dark-muted flex-1">{z.name}</span>
                    <span className="text-xs font-medium text-neutral-800 dark:text-dark-text">{z.pointCount} pts</span>
                    <div className="w-16 bg-neutral-100 dark:bg-dark-bg rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(z.pointCount / 124) * 100}%`, backgroundColor: z.score === 'high' ? '#10B981' : z.score === 'medium' ? '#F59E0B' : '#EF4444' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'distance' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { l: 'Distance Moyenne', v: '12.4 km', sub: 'entre points voisins', c: 'text-primary-500' },
              { l: 'Distance Max', v: '47.2 km', sub: 'étendue territoriale', c: 'text-warning' },
              { l: 'Proximité Médiane', v: '8.1 km', sub: 'P50 entre points', c: 'text-success' },
            ].map((m, i) => (
              <div key={i} className="card p-5 text-center">
                <p className={`text-2xl font-bold ${m.c}`}>{m.v}</p>
                <p className="text-sm font-medium text-neutral-700 dark:text-dark-text mt-1">{m.l}</p>
                <p className="text-xs text-neutral-400 dark:text-dark-muted mt-0.5">{m.sub}</p>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <h3 className="section-title mb-3">Matrice Distances Inter-Zones (km)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="table-th">Zone</th>
                    {mockZones.map(z => <th key={z.id} className="table-th">{z.name.replace('Zone ', '')}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {mockZones.map((z, i) => (
                    <tr key={z.id} className="hover:bg-neutral-50 dark:hover:bg-dark-bg/50">
                      <td className="table-td font-medium">{z.name}</td>
                      {mockZones.map((z2, j) => {
                        const d = i === j ? '—' : Math.abs((i + 1) * 7 - (j + 1) * 5 + 8) + 'km';
                        return (
                          <td key={z2.id} className={`table-td text-center ${i === j ? 'bg-neutral-50 dark:bg-dark-bg' : ''}`}>
                            {d}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'coverage' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5">
            <h3 className="section-title mb-4">Taux de Couverture par Zone</h3>
            <div className="flex flex-wrap gap-8 justify-around">
              {mockZones.map(z => (
                <CoverageRings key={z.id} zone={z.name.replace('Zone ', '')}
                  pct={z.coverage}
                  color={z.score === 'high' ? '#10B981' : z.score === 'medium' ? '#F59E0B' : '#EF4444'} />
              ))}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="section-title mb-3">Évolution de la Couverture</h3>
            <LineChart data={[
              { label: 'Oct', value: 62 }, { label: 'Nov', value: 66 }, { label: 'Déc', value: 68 },
              { label: 'Jan', value: 70 }, { label: 'Fév', value: 71 }, { label: 'Mar', value: 73 }, { label: 'Avr', value: 74 },
            ]} height={100} color="#10B981" />
          </div>
        </div>
      )}
    </div>
  );
}
