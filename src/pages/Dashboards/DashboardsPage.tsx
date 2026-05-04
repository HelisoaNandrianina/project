import { useState } from 'react';
import { Calendar, TrendingUp, BarChart2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, BarChart, DonutChart } from '../../components/UI/Charts';
import { mockZones, segmentData } from '../../data/mockData';

const PERIODS = ['7j', '30j', '3m', '6m', '1an'];

const monthly = [
  { month: 'Oct', nord: 210, est: 155, ouest: 95, sud: 60, centre: 120 },
  { month: 'Nov', nord: 225, est: 162, ouest: 102, sud: 55, centre: 135 },
  { month: 'Déc', nord: 198, est: 148, ouest: 88, sud: 48, centre: 128 },
  { month: 'Jan', nord: 245, est: 175, ouest: 108, sud: 42, centre: 142 },
  { month: 'Fév', nord: 268, est: 192, ouest: 118, sud: 38, centre: 158 },
  { month: 'Mar', nord: 252, est: 185, ouest: 112, sud: 44, centre: 155 },
  { month: 'Avr', nord: 285, est: 205, ouest: 125, sud: 40, centre: 162 },
];

const ScatterDot = ({ x, y, r, color }: { x: number; y: number; r: number; color: string }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={color} opacity="0.7" />
    <circle cx={x} cy={y} r={r / 2} fill={color} />
  </g>
);

const ScatterChart = () => (
  <svg viewBox="0 0 200 130" className="w-full" style={{ height: 130 }}>
    <line x1="20" y1="0" x2="20" y2="110" stroke="#E5E7EB" strokeWidth="0.5" className="dark:stroke-neutral-700" />
    <line x1="20" y1="110" x2="200" y2="110" stroke="#E5E7EB" strokeWidth="0.5" className="dark:stroke-neutral-700" />
    {[0, 25, 50, 75, 100].map(v => (
      <g key={v}>
        <line x1="20" y1={110 - v * 1.1} x2="200" y2={110 - v * 1.1} stroke="#E5E7EB" strokeWidth="0.3" strokeDasharray="3 3" className="dark:stroke-neutral-700" />
        <text x="15" y={113 - v * 1.1} textAnchor="end" style={{ fontSize: 6, fill: '#9CA3AF', fontFamily: 'Inter' }}>{v}</text>
      </g>
    ))}
    <ScatterDot x={60} y={20} r={8} color="#10B981" />
    <ScatterDot x={110} y={35} r={7} color="#10B981" />
    <ScatterDot x={145} y={58} r={6} color="#F59E0B" />
    <ScatterDot x={85} y={48} r={6} color="#F59E0B" />
    <ScatterDot x={165} y={78} r={5} color="#EF4444" />
    <text x={60} y={12} textAnchor="middle" style={{ fontSize: 6, fill: '#9CA3AF', fontFamily: 'Inter' }}>Nord</text>
    <text x={110} y={27} textAnchor="middle" style={{ fontSize: 6, fill: '#9CA3AF', fontFamily: 'Inter' }}>Est</text>
    <text x={145} y={50} textAnchor="middle" style={{ fontSize: 6, fill: '#9CA3AF', fontFamily: 'Inter' }}>Centre</text>
    <text x={85} y={40} textAnchor="middle" style={{ fontSize: 6, fill: '#9CA3AF', fontFamily: 'Inter' }}>Ouest</text>
    <text x={165} y={70} textAnchor="middle" style={{ fontSize: 6, fill: '#9CA3AF', fontFamily: 'Inter' }}>Sud</text>
  </svg>
);

const AreaCompareChart = () => {
  const zones = [
    { key: 'nord', color: '#3B82F6', label: 'Nord' },
    { key: 'est', color: '#10B981', label: 'Est' },
    { key: 'centre', color: '#F59E0B', label: 'Centre' },
  ] as const;

  return (
    <div>
      <svg viewBox="0 0 300 120" className="w-full" style={{ height: 120 }}>
        {zones.map(({ key, color }) => {
          const values = monthly.map(m => m[key]);
          const max = Math.max(...monthly.flatMap(m => [m.nord, m.est, m.ouest, m.sud, m.centre]));
          const step = 300 / (monthly.length - 1);
          const h = 100;
          const pts = values.map((v, i) => ({ x: i * step, y: h - (v / max) * h }));
          const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
          const area = `${line} L ${pts[pts.length - 1].x} ${h} L 0 ${h} Z`;
          return (
            <g key={key}>
              <path d={area} fill={color} opacity="0.08" />
              <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}
        {monthly.map((m, i) => (
          <text key={i} x={i * (300 / (monthly.length - 1))} y="115" textAnchor="middle" style={{ fontSize: 7, fill: '#9CA3AF', fontFamily: 'Inter' }}>
            {m.month}
          </text>
        ))}
      </svg>
      <div className="flex gap-4 mt-2">
        {zones.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-neutral-500 dark:text-dark-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DashboardsPage() {
  const [period, setPeriod] = useState('30j');

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Dashboards Avancés</h1>
          <p className="text-sm text-neutral-500 dark:text-dark-muted mt-0.5">Analyse comparative, évolution temporelle et graphiques multi-dimensionnels</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 p-1 bg-neutral-100 dark:bg-dark-card border border-neutral-200 dark:border-dark-border rounded-lg">
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${period === p ? 'bg-white dark:bg-dark-border text-neutral-900 dark:text-dark-text shadow-sm' : 'text-neutral-500 dark:text-dark-muted hover:text-neutral-700'}`}>
                {p}
              </button>
            ))}
          </div>
          <button className="btn-secondary h-8 flex items-center gap-1.5 text-xs">
            <Calendar size={13} />Plage custom
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { l: 'CA Total', v: '2.63M MGA', d: '+14.7%', pos: true },
          { l: 'Nouveaux pts', v: '+247', d: '+8.3%', pos: true },
          { l: 'Score Global', v: '68/100', d: '+3.1%', pos: true },
          { l: 'Taux Conversion', v: '23.4%', d: '-1.2%', pos: false },
        ].map((s, i) => (
          <div key={i} className="card p-4">
            <p className="text-xs text-neutral-500 dark:text-dark-muted mb-1">{s.l}</p>
            <p className="text-xl font-bold text-neutral-900 dark:text-dark-text">{s.v}</p>
            <div className={`flex items-center gap-0.5 text-xs font-semibold mt-1 ${s.pos ? 'text-success' : 'text-danger'}`}>
              {s.pos ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {s.d} vs période préc.
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="section-title">Évolution Comparative des Zones</h3>
          </div>
          <p className="text-xs text-neutral-400 dark:text-dark-muted mb-3">Points actifs par zone sur 7 mois</p>
          <AreaCompareChart />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="section-title">Score vs Revenu (Scatter)</h3>
          </div>
          <p className="text-xs text-neutral-400 dark:text-dark-muted mb-3">Corrélation score/revenu par zone</p>
          <ScatterChart />
          <div className="mt-2 flex gap-3">
            {[{ c: '#10B981', l: 'Élevé' }, { c: '#F59E0B', l: 'Moyen' }, { c: '#EF4444', l: 'Faible' }].map((l, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.c }} />
                <span className="text-xs text-neutral-500 dark:text-dark-muted">{l.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <h3 className="section-title mb-3">Score par Zone</h3>
          <BarChart data={mockZones.map(z => ({
            label: z.name.replace('Zone ', ''),
            value: z.scoreValue,
            color: z.score === 'high' ? '#10B981' : z.score === 'medium' ? '#F59E0B' : '#EF4444',
          }))} height={110} />
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-3">Mix Portefeuille</h3>
          <DonutChart data={segmentData} size={100} />
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-3">Top Performances</h3>
          <div className="space-y-3">
            {mockZones.sort((a, b) => b.scoreValue - a.scoreValue).map((z, i) => (
              <div key={z.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-neutral-400 dark:text-dark-muted w-4">#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-neutral-700 dark:text-dark-text">{z.name}</span>
                    <span className="text-xs font-bold" style={{ color: z.score === 'high' ? '#10B981' : z.score === 'medium' ? '#F59E0B' : '#EF4444' }}>{z.scoreValue}</span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-dark-bg rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${z.scoreValue}%`, backgroundColor: z.score === 'high' ? '#10B981' : z.score === 'medium' ? '#F59E0B' : '#EF4444' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-500" />
            <h3 className="section-title">Comparaison Multi-Zones</h3>
          </div>
          <div className="flex gap-2">
            {['Revenu', 'Points', 'Score', 'Couverture'].map(m => (
              <button key={m} className="text-xs px-2.5 py-1 bg-neutral-100 dark:bg-dark-bg hover:bg-primary-50 dark:hover:bg-blue-900/20 hover:text-primary-600 text-neutral-500 dark:text-dark-muted rounded-lg transition-all">{m}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Zone', 'Score', 'Points', 'Couverture', 'Revenu', 'Tendance', 'vs Moy.'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockZones.map(z => {
                const avgScore = 68;
                const diff = z.scoreValue - avgScore;
                return (
                  <tr key={z.id} className="hover:bg-neutral-50 dark:hover:bg-dark-bg/50 transition-colors">
                    <td className="table-td font-medium flex items-center gap-2">
                      <BarChart2 size={13} className="text-neutral-400 shrink-0" />
                      {z.name}
                    </td>
                    <td className="table-td">
                      <span className={`font-bold text-sm ${z.score === 'high' ? 'text-success' : z.score === 'medium' ? 'text-warning' : 'text-danger'}`}>
                        {z.scoreValue}
                      </span>
                    </td>
                    <td className="table-td">{z.pointCount}</td>
                    <td className="table-td">{z.coverage}%</td>
                    <td className="table-td font-medium">{(z.revenue / 1000).toFixed(0)}K MGA</td>
                    <td className="table-td">
                      <span className={`text-xs font-bold ${z.trend >= 0 ? 'text-success' : 'text-danger'}`}>
                        {z.trend >= 0 ? '+' : ''}{z.trend}%
                      </span>
                    </td>
                    <td className="table-td">
                      <span className={`text-xs font-semibold ${diff >= 0 ? 'text-success' : 'text-danger'}`}>
                        {diff >= 0 ? '+' : ''}{diff} pts
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
