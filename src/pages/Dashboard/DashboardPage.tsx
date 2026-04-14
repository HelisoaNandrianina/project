import { MapPin, Users, TrendingUp, AlertTriangle, Activity, ArrowUpRight, Clock } from 'lucide-react';
import KPICard from '../../components/UI/KPICard';
import { BarChart, LineChart, DonutChart } from '../../components/UI/Charts';
import { mockZones, revenueTimeline, zoneBarData, segmentData, mockNotifications } from '../../data/mockData';
import type { PageId } from '../../types';

interface Props { onNavigate: (page: PageId) => void; }

const MockMiniMap = () => (
  <div className="w-full h-full map-container rounded-lg overflow-hidden relative">
    <svg viewBox="0 0 400 200" className="w-full h-full opacity-60">
      <rect width="400" height="200" fill="#1a2744" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 18} x2="400" y2={i * 18} stroke="#243560" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 22 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="200" stroke="#243560" strokeWidth="0.5" />
      ))}
      <path d="M 60 80 Q 120 60 180 90 Q 220 110 280 80 Q 340 55 380 70" fill="none" stroke="#334177" strokeWidth="8" strokeLinecap="round" />
      <path d="M 20 130 Q 80 115 150 125 Q 200 135 260 120 Q 310 108 360 115" fill="none" stroke="#334177" strokeWidth="5" strokeLinecap="round" />
      {[
        { cx: 80, cy: 75, r: 30, fill: '#2563EB', opacity: 0.12 },
        { cx: 200, cy: 95, r: 45, fill: '#2563EB', opacity: 0.18 },
        { cx: 300, cy: 78, r: 25, fill: '#10B981', opacity: 0.12 },
        { cx: 160, cy: 130, r: 35, fill: '#F59E0B', opacity: 0.1 },
      ].map((c, i) => <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill} opacity={c.opacity} />)}
      {[
        { cx: 80, cy: 75, color: '#3B82F6' },
        { cx: 120, cy: 65, color: '#3B82F6' },
        { cx: 200, cy: 90, color: '#10B981' },
        { cx: 240, cy: 82, color: '#3B82F6' },
        { cx: 300, cy: 78, color: '#10B981' },
        { cx: 155, cy: 125, color: '#F59E0B' },
        { cx: 175, cy: 135, color: '#EF4444' },
        { cx: 330, cy: 68, color: '#3B82F6' },
        { cx: 60, cy: 145, color: '#F59E0B' },
      ].map((m, i) => (
        <g key={i}>
          <circle cx={m.cx} cy={m.cy} r="5" fill={m.color} opacity="0.9" />
          <circle cx={m.cx} cy={m.cy} r="9" fill={m.color} opacity="0.2" />
        </g>
      ))}
    </svg>
    <div className="absolute top-2 left-2 flex gap-1">
      {[{ c: '#3B82F6', l: 'Clients' }, { c: '#10B981', l: 'Partenaires' }, { c: '#F59E0B', l: 'Prospects' }].map((l, i) => (
        <div key={i} className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded text-[9px] text-white backdrop-blur-sm">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.c }} />
          {l.l}
        </div>
      ))}
    </div>
  </div>
);

export default function DashboardPage({ onNavigate }: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Tableau de Bord</h1>
          <p className="text-sm text-neutral-500 dark:text-dark-muted mt-0.5">Lundi 14 avril 2026 &mdash; Données actualisées il y a 5 min</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-success"><span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />Système actif</span>
          <button className="btn-primary flex items-center gap-1.5">
            <Activity size={14} />Actualiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard label="Points Actifs" value="416" change={8.3} icon={<MapPin size={18} />} color="blue" subtitle="sur 5 zones" />
        <KPICard label="Zones Couvertes" value="5 / 5" change={0} icon={<TrendingUp size={18} />} color="green" subtitle="Couverture 74%" />
        <KPICard label="Score Moyen" value="68 / 100" change={3.1} icon={<Users size={18} />} color="yellow" subtitle="+3.1 pts ce mois" />
        <KPICard label="Alertes Actives" value="2" change={-33.3} icon={<AlertTriangle size={18} />} color="red" subtitle="1 critique, 1 haute" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title">Évolution du Revenu</h3>
              <p className="text-xs text-neutral-400 dark:text-dark-muted mt-0.5">7 derniers mois (en €)</p>
            </div>
            <button onClick={() => onNavigate('dashboards')} className="text-xs text-primary-500 font-medium hover:text-primary-600 flex items-center gap-1">
              Voir plus <ArrowUpRight size={12} />
            </button>
          </div>
          <LineChart data={revenueTimeline.map(d => ({ label: d.month, value: d.value }))} height={140} color="#2563EB" />
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[
              { l: 'Total Avril', v: '571 K€', c: 'text-neutral-900 dark:text-dark-text' },
              { l: 'Croissance MoM', v: '+14.7%', c: 'text-success' },
              { l: 'Prévision Mai', v: '~610 K€', c: 'text-neutral-500 dark:text-dark-muted' },
            ].map((s, i) => (
              <div key={i} className="bg-neutral-50 dark:bg-dark-bg rounded-lg p-3 text-center">
                <p className={`text-base font-bold ${s.c}`}>{s.v}</p>
                <p className="text-xs text-neutral-400 dark:text-dark-muted mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Carte Rapide</h3>
            <button onClick={() => onNavigate('map')} className="text-xs text-primary-500 font-medium hover:text-primary-600 flex items-center gap-1">
              Explorer <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="flex-1 min-h-[140px]">
            <MockMiniMap />
          </div>
          <div className="mt-3 text-xs text-neutral-400 dark:text-dark-muted text-center">
            9 marqueurs • 3 clusters actifs
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Score par Zone</h3>
          </div>
          <BarChart data={zoneBarData.map(d => ({
            label: d.zone, value: d.value,
            color: d.value >= 80 ? '#10B981' : d.value >= 60 ? '#F59E0B' : '#EF4444'
          }))} height={130} />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Segmentation</h3>
          </div>
          <DonutChart data={segmentData} size={100} />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title">Activité Récente</h3>
          </div>
          <div className="space-y-3">
            {mockNotifications.slice(0, 4).map(n => (
              <div key={n.id} className="flex items-start gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.priority === 'high' ? 'bg-danger' : n.priority === 'medium' ? 'bg-warning' : 'bg-success'}`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-neutral-800 dark:text-dark-text truncate">{n.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={10} className="text-neutral-400 shrink-0" />
                    <span className="text-xs text-neutral-400 dark:text-dark-muted">{n.timestamp.split(' ')[1]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate('notifications')} className="mt-3 text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
            Toutes les notifications <ArrowUpRight size={12} />
          </button>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Zones &mdash; Vue d'ensemble</h3>
          <button onClick={() => onNavigate('decision')} className="text-xs text-primary-500 font-medium hover:text-primary-600 flex items-center gap-1">
            Aide décision <ArrowUpRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Zone', 'Score', 'Couverture', 'Points', 'Revenu', 'Tendance'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockZones.map(z => (
                <tr key={z.id} className="hover:bg-neutral-50 dark:hover:bg-dark-bg/50 transition-colors">
                  <td className="table-td font-medium">{z.name}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-neutral-100 dark:bg-dark-bg rounded-full h-1.5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${z.scoreValue}%`, backgroundColor: z.score === 'high' ? '#10B981' : z.score === 'medium' ? '#F59E0B' : '#EF4444' }} />
                      </div>
                      <span className={`text-xs font-semibold ${z.score === 'high' ? 'text-success' : z.score === 'medium' ? 'text-warning' : 'text-danger'}`}>
                        {z.scoreValue}
                      </span>
                    </div>
                  </td>
                  <td className="table-td">{z.coverage}%</td>
                  <td className="table-td">{z.pointCount}</td>
                  <td className="table-td font-medium">{(z.revenue / 1000).toFixed(0)} K€</td>
                  <td className="table-td">
                    <span className={`text-xs font-semibold ${z.trend >= 0 ? 'text-success' : 'text-danger'}`}>
                      {z.trend >= 0 ? '+' : ''}{z.trend}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
