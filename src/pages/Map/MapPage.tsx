import { useState } from 'react';
import {
  Layers, Filter, Search, ZoomIn, ZoomOut, Maximize2, MapPin, Navigation,
  X, TrendingUp, TrendingDown, Users, DollarSign, ChevronDown,
} from 'lucide-react';
import { mockDataPoints } from '../../data/mockData';
import type { DataPoint } from '../../types';

const MAP_POINTS = [
  { id: 'DP001', cx: 210, cy: 85, color: '#3B82F6', type: 'client', score: 92, cluster: false },
  { id: 'DP002', cx: 245, cy: 68, color: '#F59E0B', type: 'prospect', score: 67, cluster: false },
  { id: 'DP003', cx: 290, cy: 100, color: '#10B981', type: 'partner', score: 85, cluster: false },
  { id: 'DP004', cx: 175, cy: 135, color: '#EF4444', type: 'client', score: 41, cluster: false },
  { id: 'DP005', cx: 315, cy: 90, color: '#3B82F6', type: 'client', score: 78, cluster: false },
  { id: 'DP006', cx: 140, cy: 72, color: '#F59E0B', type: 'prospect', score: 55, cluster: false },
  { id: 'DP007', cx: 198, cy: 158, color: '#3B82F6', type: 'client', score: 88, cluster: false },
  { id: 'DP008', cx: 340, cy: 78, color: '#10B981', type: 'partner', score: 72, cluster: false },
  { id: 'DP009', cx: 255, cy: 52, color: '#3B82F6', type: 'client', score: 94, cluster: false },
  { id: 'DP010', cx: 220, cy: 170, color: '#F59E0B', type: 'prospect', score: 48, cluster: false },
  { id: 'C1', cx: 110, cy: 110, color: '#3B82F6', type: 'cluster', count: 8, cluster: true },
  { id: 'C2', cx: 370, cy: 130, color: '#10B981', type: 'cluster', count: 5, cluster: true },
];

const HEATMAP_ZONES = [
  { cx: 210, cy: 95, r: 65, color: '#EF4444', opacity: 0.12 },
  { cx: 290, cy: 88, r: 55, color: '#F59E0B', opacity: 0.15 },
  { cx: 175, cy: 148, r: 45, color: '#EF4444', opacity: 0.10 },
  { cx: 255, cy: 70, r: 40, color: '#10B981', opacity: 0.14 },
  { cx: 110, cy: 108, r: 70, color: '#3B82F6', opacity: 0.10 },
];

const ZONE_POLYGONS = [
  { points: '80,40 200,40 220,130 180,170 60,160 50,80', label: 'Zone Nord', color: '#3B82F6', score: 89 },
  { points: '200,40 380,30 400,160 320,170 220,130', label: 'Zone Est', color: '#10B981', score: 81 },
  { points: '50,80 180,170 200,200 40,200', label: 'Zone Sud', color: '#EF4444', score: 38 },
];

type LayerMode = 'markers' | 'clusters' | 'heatmap' | 'zones';

export default function MapPage() {
  const [activeLayers, setActiveLayers] = useState<LayerMode[]>(['markers', 'zones']);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [filterScore, setFilterScore] = useState<[number, number]>([0, 100]);
  const [zoom, setZoom] = useState(1);

  const toggleLayer = (l: LayerMode) => {
    setActiveLayers(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  };

  const handleMarkerClick = (id: string) => {
    const pt = mockDataPoints.find(d => d.id === id);
    if (pt) setSelectedPoint(pt);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-64 shrink-0 border-r border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-neutral-200 dark:border-dark-border">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={15} className="text-primary-500" />
            <span className="text-sm font-semibold text-neutral-900 dark:text-dark-text">Filtres</span>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input type="text" placeholder="Chercher un point..." className="input pl-8 text-xs h-8" />
          </div>
        </div>

        <div className="p-4 border-b border-neutral-200 dark:border-dark-border space-y-3">
          <div>
            <label className="label">Type</label>
            <select className="input text-xs h-8" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">Tous les types</option>
              <option value="client">Clients</option>
              <option value="prospect">Prospects</option>
              <option value="partner">Partenaires</option>
            </select>
          </div>
          <div>
            <label className="label">Zone</label>
            <select className="input text-xs h-8" value={filterZone} onChange={e => setFilterZone(e.target.value)}>
              <option value="all">Toutes les zones</option>
              <option value="Zone Nord">Zone Nord</option>
              <option value="Zone Est">Zone Est</option>
              <option value="Zone Ouest">Zone Ouest</option>
              <option value="Zone Sud">Zone Sud</option>
            </select>
          </div>
          <div>
            <label className="label">Score Min : {filterScore[0]}</label>
            <input type="range" min={0} max={100} value={filterScore[0]}
              onChange={e => setFilterScore([+e.target.value, filterScore[1]])}
              className="w-full accent-primary-500" />
          </div>
        </div>

        <div className="p-4 border-b border-neutral-200 dark:border-dark-border">
          <label className="label mb-2">Couches</label>
          <div className="space-y-1.5">
            {([
              { id: 'markers', label: 'Marqueurs', color: 'bg-primary-500' },
              { id: 'clusters', label: 'Clusters', color: 'bg-blue-400' },
              { id: 'heatmap', label: 'Heatmap', color: 'bg-red-400' },
              { id: 'zones', label: 'Zones', color: 'bg-green-400' },
            ] as { id: LayerMode; label: string; color: string }[]).map(l => (
              <label key={l.id} className="flex items-center gap-2 cursor-pointer">
                <div className={`relative w-8 h-4 rounded-full transition-colors ${activeLayers.includes(l.id) ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-dark-border'}`}
                  onClick={() => toggleLayer(l.id)}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform shadow-sm ${activeLayers.includes(l.id) ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <div className={`w-2 h-2 rounded-full ${l.color}`} />
                <span className="text-xs text-neutral-700 dark:text-dark-text">{l.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-4 flex-1">
          <label className="label mb-2">Légende Score</label>
          <div className="space-y-1.5">
            {[
              { l: 'Élevé (80-100)', color: '#10B981' },
              { l: 'Moyen (60-79)', color: '#F59E0B' },
              { l: 'Faible (< 60)', color: '#EF4444' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-neutral-500 dark:text-dark-muted">{s.l}</span>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="label mb-2">Points affichés</label>
            <div className="text-2xl font-bold text-neutral-900 dark:text-dark-text">10</div>
            <div className="text-xs text-neutral-400 dark:text-dark-muted">sur 416 au total</div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden map-container">
        <svg viewBox="0 0 440 210" className="w-full h-full" style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}>
          <rect width="440" height="210" fill="#1a2744" />
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 18} x2="440" y2={i * 18} stroke="#1e2e55" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 25 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 18} y1="0" x2={i * 18} y2="210" stroke="#1e2e55" strokeWidth="0.5" />
          ))}

          <path d="M 80 95 Q 150 80 220 100 Q 280 115 360 90 Q 400 80 440 85" fill="none" stroke="#2a3f70" strokeWidth="12" strokeLinecap="round" />
          <path d="M 0 140 Q 80 128 160 138 Q 230 148 310 130 Q 370 118 440 125" fill="none" stroke="#2a3f70" strokeWidth="6" strokeLinecap="round" />
          <rect x="160" y="70" width="12" height="8" rx="1" fill="#2a3f70" />
          <rect x="175" y="68" width="8" height="10" rx="1" fill="#2a3f70" />
          <rect x="270" y="75" width="10" height="7" rx="1" fill="#2a3f70" />
          <rect x="285" y="73" width="7" height="9" rx="1" fill="#2a3f70" />
          <rect x="320" y="65" width="15" height="11" rx="1" fill="#2a3f70" />

          {activeLayers.includes('zones') && ZONE_POLYGONS.map((z, i) => (
            <g key={i}>
              <polygon points={z.points} fill={z.color} opacity="0.06" stroke={z.color} strokeWidth="1" strokeOpacity="0.25" strokeDasharray="4 3" />
              <text x={z.points.split(' ').map(p => +p.split(',')[0]).reduce((a, b) => a + b, 0) / 6}
                y={z.points.split(' ').map(p => +p.split(',')[1]).reduce((a, b) => a + b, 0) / 6}
                textAnchor="middle" style={{ fontSize: 8, fontFamily: 'Inter', fill: z.color, fontWeight: 600, opacity: 0.8 }}>
                {z.label} ({z.score})
              </text>
            </g>
          ))}

          {activeLayers.includes('heatmap') && HEATMAP_ZONES.map((h, i) => (
            <g key={i}>
              <radialGradient id={`hg${i}`}>
                <stop offset="0%" stopColor={h.color} stopOpacity={h.opacity * 4} />
                <stop offset="100%" stopColor={h.color} stopOpacity="0" />
              </radialGradient>
              <circle cx={h.cx} cy={h.cy} r={h.r} fill={`url(#hg${i})`} />
            </g>
          ))}

          {activeLayers.includes('clusters') && MAP_POINTS.filter(p => p.cluster).map(p => (
            <g key={p.id} className="cursor-pointer">
              <circle cx={(p as { cx: number }).cx} cy={(p as { cy: number }).cy} r="18" fill="#2563EB" opacity="0.15" />
              <circle cx={(p as { cx: number }).cx} cy={(p as { cy: number }).cy} r="12" fill="#2563EB" opacity="0.85" />
              <text x={(p as { cx: number }).cx} y={(p as { cy: number }).cy + 3} textAnchor="middle"
                style={{ fontSize: 7, fontFamily: 'Inter', fill: 'white', fontWeight: 700 }}>
                {(p as { count?: number }).count}
              </text>
            </g>
          ))}

          {activeLayers.includes('markers') && MAP_POINTS.filter(p => !p.cluster).map(p => (
            <g key={p.id} className="cursor-pointer" onClick={() => handleMarkerClick(p.id)}>
              <circle cx={(p as { cx: number }).cx} cy={(p as { cy: number }).cy} r="9" fill={p.color} opacity="0.2" />
              <circle cx={(p as { cx: number }).cx} cy={(p as { cy: number }).cy} r="5" fill={p.color} opacity="0.95"
                stroke="white" strokeWidth="1" />
              <circle cx={(p as { cx: number }).cx} cy={(p as { cy: number }).cy} r="5" fill="none" stroke={p.color} strokeWidth="1"
                opacity="0.4" className="animate-ping" />
            </g>
          ))}
        </svg>

        <div className="absolute top-3 left-3 flex gap-1.5">
          {([
            { id: 'markers', label: 'Marqueurs' },
            { id: 'clusters', label: 'Clusters' },
            { id: 'heatmap', label: 'Heatmap' },
            { id: 'zones', label: 'Zones' },
          ] as { id: LayerMode; label: string }[]).map(l => (
            <button key={l.id} onClick={() => toggleLayer(l.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium backdrop-blur-sm transition-all ${activeLayers.includes(l.id) ? 'bg-primary-500 text-white' : 'bg-black/50 text-white/70 hover:bg-black/70'}`}>
              {l.label}
            </button>
          ))}
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {[
            { icon: <ZoomIn size={14} />, action: () => setZoom(z => Math.min(z + 0.2, 2.5)) },
            { icon: <ZoomOut size={14} />, action: () => setZoom(z => Math.max(z - 0.2, 0.5)) },
            { icon: <Maximize2 size={14} />, action: () => setZoom(1) },
            { icon: <Navigation size={14} />, action: () => {} },
            { icon: <Layers size={14} />, action: () => {} },
          ].map((btn, i) => (
            <button key={i} onClick={btn.action}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all">
              {btn.icon}
            </button>
          ))}
        </div>

        <div className="absolute bottom-3 left-3 flex gap-2">
          {[
            { c: '#3B82F6', l: 'Clients' },
            { c: '#10B981', l: 'Partenaires' },
            { c: '#F59E0B', l: 'Prospects' },
            { c: '#EF4444', l: 'Critique' },
          ].map((leg, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: leg.c }} />
              {leg.l}
            </div>
          ))}
        </div>

        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <MapPin size={10} />48.856°N, 2.352°E &nbsp;|&nbsp; Zoom {Math.round(zoom * 100)}%
        </div>
      </div>

      {selectedPoint && (
        <div className="w-72 shrink-0 border-l border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-y-auto animate-slide-in">
          <div className="p-4 border-b border-neutral-200 dark:border-dark-border flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-900 dark:text-dark-text">Détail du Point</span>
            <button onClick={() => setSelectedPoint(null)} className="p-1 hover:bg-neutral-100 dark:hover:bg-dark-border rounded-lg text-neutral-400 transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedPoint.type === 'client' ? 'bg-blue-100 dark:bg-blue-900/20' : selectedPoint.type === 'partner' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'}`}>
                <MapPin size={18} className={selectedPoint.type === 'client' ? 'text-primary-500' : selectedPoint.type === 'partner' ? 'text-success' : 'text-warning'} />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-dark-text">{selectedPoint.name}</p>
                <p className="text-xs text-neutral-400 dark:text-dark-muted mt-0.5">{selectedPoint.id}</p>
                <span className={selectedPoint.type === 'client' ? 'badge-blue' : selectedPoint.type === 'partner' ? 'badge-success' : 'badge-warning'}>
                  {selectedPoint.type === 'client' ? 'Client' : selectedPoint.type === 'partner' ? 'Partenaire' : 'Prospect'}
                </span>
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-dark-bg rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500 dark:text-dark-muted font-medium">Score</span>
                <span className={`text-base font-bold ${selectedPoint.score >= 80 ? 'text-success' : selectedPoint.score >= 60 ? 'text-warning' : 'text-danger'}`}>
                  {selectedPoint.score}/100
                </span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-dark-border rounded-full h-2">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${selectedPoint.score}%`, backgroundColor: selectedPoint.score >= 80 ? '#10B981' : selectedPoint.score >= 60 ? '#F59E0B' : '#EF4444' }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <MapPin size={12} />, label: 'Zone', value: selectedPoint.zone },
                { icon: <Users size={12} />, label: 'Statut', value: selectedPoint.status },
                { icon: <DollarSign size={12} />, label: 'Revenu', value: selectedPoint.revenue > 0 ? `${(selectedPoint.revenue / 1000).toFixed(0)}K€` : '—' },
                { icon: <TrendingUp size={12} />, label: 'Type', value: selectedPoint.type },
              ].map((item, i) => (
                <div key={i} className="bg-neutral-50 dark:bg-dark-bg rounded-lg p-2.5">
                  <div className="flex items-center gap-1 text-neutral-400 dark:text-dark-muted mb-1">
                    {item.icon}
                    <span className="text-[10px] uppercase tracking-wide">{item.label}</span>
                  </div>
                  <p className="text-xs font-semibold text-neutral-800 dark:text-dark-text capitalize">{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <label className="label">Coordonnées</label>
              <div className="bg-neutral-50 dark:bg-dark-bg rounded-lg p-2.5 font-mono text-xs text-neutral-600 dark:text-dark-muted">
                {selectedPoint.lat}°N, {selectedPoint.lng}°E
              </div>
            </div>

            <div>
              <label className="label">Créé le</label>
              <p className="text-xs text-neutral-600 dark:text-dark-text">{selectedPoint.createdAt}</p>
            </div>

            <div className="flex gap-2">
              <button className="btn-primary flex-1 text-xs py-1.5 flex items-center justify-center gap-1">
                <ChevronDown size={12} />Analyser
              </button>
              <button className="btn-secondary flex-1 text-xs py-1.5 flex items-center justify-center gap-1">
                <TrendingDown size={12} />Historique
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
