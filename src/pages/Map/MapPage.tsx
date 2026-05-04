import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import {
  Layers, Filter, Search, ZoomIn, ZoomOut, Maximize2, MapPin,
  X, TrendingUp, TrendingDown, Users, DollarSign, ChevronDown,
} from 'lucide-react';
import { mockDataPoints } from '../../data/mockData';
import type { DataPoint } from '../../types';

// Contrôle zoom 
function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-[1000]">
      {[
        { icon: <ZoomIn size={14} />, action: () => map.zoomIn() },
        { icon: <ZoomOut size={14} />, action: () => map.zoomOut() },
        { icon: <Maximize2 size={14} />, action: () => map.setView([48.856, 2.352], 10) },
      ].map((btn, i) => (
        <button key={i} onClick={btn.action}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all">
          {btn.icon}
        </button>
      ))}
    </div>
  );
}

const TYPE_COLORS: Record<string, string> = {
  client: '#3B82F6',
  partner: '#10B981',
  prospect: '#F59E0B',
};

export default function MapPage() {
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterZone, setFilterZone] = useState('all');
  const [filterScore, setFilterScore] = useState(0);
  const [search, setSearch] = useState('');

  const filtered = mockDataPoints.filter(d =>
    (filterType === 'all' || d.type === filterType) &&
    (filterZone === 'all' || d.zone === filterZone) &&
    d.score >= filterScore &&
    (search === '' || d.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar  */}
      <div className="w-64 shrink-0 border-r border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-neutral-200 dark:border-dark-border">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={15} className="text-primary-500" />
            <span className="text-sm font-semibold text-neutral-900 dark:text-dark-text">Filtres</span>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input type="text" placeholder="Chercher un point..."
              className="input pl-8 text-xs h-8"
              value={search} onChange={e => setSearch(e.target.value)} />
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
            <label className="label">Score Min : {filterScore}</label>
            <input type="range" min={0} max={100} value={filterScore}
              onChange={e => setFilterScore(+e.target.value)}
              className="w-full accent-primary-500" />
          </div>
        </div>

        <div className="p-4 flex-1">
          <label className="label mb-2">Légende</label>
          {[
            { c: '#3B82F6', l: 'Clients' },
            { c: '#10B981', l: 'Partenaires' },
            { c: '#F59E0B', l: 'Prospects' },
          ].map((leg, i) => (
            <div key={i} className="flex items-center gap-2 mb-1.5">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: leg.c }} />
              <span className="text-xs text-neutral-500 dark:text-dark-muted">{leg.l}</span>
            </div>
          ))}
          <div className="mt-4">
            <label className="label mb-1">Points affichés</label>
            <div className="text-2xl font-bold text-neutral-900 dark:text-dark-text">{filtered.length}</div>
            <div className="text-xs text-neutral-400 dark:text-dark-muted">sur {mockDataPoints.length} au total</div>
          </div>
        </div>
      </div>

      {/* Carte  */}
      <div className="flex-1 relative overflow-hidden">
        <MapContainer
          center={[48.856, 2.352]}
          zoom={10}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filtered.map(point => (
            <CircleMarker
              key={point.id}
              center={[point.lat, point.lng]}
              radius={8}
              pathOptions={{
                color: 'white',
                weight: 1.5,
                fillColor: TYPE_COLORS[point.type] ?? '#6B7280',
                fillOpacity: 0.9,
              }}
              eventHandlers={{ click: () => setSelectedPoint(point) }}
            >
              <Popup>
                <strong>{point.name}</strong><br />
                Score : {point.score}/100
              </Popup>
            </CircleMarker>
          ))}

          <ZoomControls />
        </MapContainer>
      </div>

      {/* Panneau détail */}
      {selectedPoint && (
        <div className="w-72 shrink-0 border-l border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-y-auto">
          <div className="p-4 border-b border-neutral-200 dark:border-dark-border flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-900 dark:text-dark-text">Détail du Point</span>
            <button onClick={() => setSelectedPoint(null)}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-dark-border rounded-lg text-neutral-400 transition-colors">
              <X size={14} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selectedPoint.type === 'client' ? 'bg-blue-100' :
                selectedPoint.type === 'partner' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <MapPin size={18} className={
                  selectedPoint.type === 'client' ? 'text-primary-500' :
                  selectedPoint.type === 'partner' ? 'text-success' : 'text-warning'} />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-dark-text">{selectedPoint.name}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{selectedPoint.id}</p>
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-dark-bg rounded-xl p-3">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-neutral-500 font-medium">Score</span>
                <span className={`text-base font-bold ${
                  selectedPoint.score >= 80 ? 'text-success' :
                  selectedPoint.score >= 60 ? 'text-warning' : 'text-danger'}`}>
                  {selectedPoint.score}/100
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${selectedPoint.score}%`,
                    backgroundColor: selectedPoint.score >= 80 ? '#10B981' :
                      selectedPoint.score >= 60 ? '#F59E0B' : '#EF4444'
                  }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <MapPin size={12} />, label: 'Zone', value: selectedPoint.zone },
                { icon: <Users size={12} />, label: 'Statut', value: selectedPoint.status },
                { icon: <DollarSign size={12} />, label: 'Revenu', value: selectedPoint.revenue > 0 ? `${(selectedPoint.revenue / 1000).toFixed(0)}K MGA` : '—' },
                { icon: <TrendingUp size={12} />, label: 'Type', value: selectedPoint.type },
              ].map((item, i) => (
                <div key={i} className="bg-neutral-50 dark:bg-dark-bg rounded-lg p-2.5">
                  <div className="flex items-center gap-1 text-neutral-400 mb-1">
                    {item.icon}
                    <span className="text-[10px] uppercase tracking-wide">{item.label}</span>
                  </div>
                  <p className="text-xs font-semibold text-neutral-800 dark:text-dark-text capitalize">{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <label className="label">Coordonnées</label>
              <div className="bg-neutral-50 dark:bg-dark-bg rounded-lg p-2.5 font-mono text-xs text-neutral-600">
                {selectedPoint.lat}°N, {selectedPoint.lng}°E
              </div>
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