import { useState, useCallback, useRef } from 'react';
import Map, { Source, Layer, Popup, NavigationControl } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Filter, Search, ZoomIn, ZoomOut, Maximize2, MapPin,
  X, TrendingUp, TrendingDown, Users, DollarSign, ChevronDown,
} from 'lucide-react';
import { mockDataPoints } from '../../data/mockData';
import type { DataPoint } from '../../types';

// ─── Couleurs par type ────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  client:   '#3B82F6',
  partner:  '#10B981',
  prospect: '#F59E0B',
};

// ─── Style de carte OpenFreeMap (gratuit, sans clé API) ──────────────────────
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

export default function MapPage() {
  const mapRef = useRef<MapRef>(null);

  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [filterType,  setFilterType]  = useState('all');
  const [filterZone,  setFilterZone]  = useState('all');
  const [filterScore, setFilterScore] = useState(0);
  const [search,      setSearch]      = useState('');
  const [viewState,   setViewState]   = useState({
    longitude: 2.352,
    latitude:  48.856,
    zoom:      10,
  });

  // ─── Filtrage identique à l'original ───────────────────────────────────────
  const filtered = mockDataPoints.filter(d =>
    (filterType === 'all' || d.type === filterType) &&
    (filterZone === 'all' || d.zone === filterZone) &&
    d.score >= filterScore &&
    (search === '' || d.name.toLowerCase().includes(search.toLowerCase()))
  );

  // ─── Conversion en GeoJSON pour MapLibre ───────────────────────────────────
  // ⚠️ MapLibre : coordonnées en [longitude, latitude] (inversé vs Leaflet)
  const geojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: filtered.map(d => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [d.lng, d.lat], // ⚠️ lng AVANT lat
      },
      properties: {
        id:      d.id,
        name:    d.name,
        type:    d.type,
        score:   d.score,
        zone:    d.zone,
        status:  d.status,
        revenue: d.revenue,
        lat:     d.lat,
        lng:     d.lng,
        createdAt: (d as any).createdAt ?? '',
        color:   TYPE_COLORS[d.type] ?? '#6B7280',
      },
    })),
  };

  // ─── Clic sur un point ─────────────────────────────────────────────────────
  const handleClick = useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature) return;
    const p = feature.properties as any;
    setSelectedPoint({
      id:        p.id,
      name:      p.name,
      type:      p.type,
      score:     p.score,
      zone:      p.zone,
      status:    p.status,
      revenue:   p.revenue,
      lat:       p.lat,
      lng:       p.lng,
      createdAt: p.createdAt,
    });
  }, []);

  // ─── Curseur pointer sur les points ────────────────────────────────────────
  const onMouseEnter = useCallback(() => {
    if (mapRef.current) mapRef.current.getCanvas().style.cursor = 'pointer';
  }, []);
  const onMouseLeave = useCallback(() => {
    if (mapRef.current) mapRef.current.getCanvas().style.cursor = '';
  }, []);

  // ─── Reset vue ─────────────────────────────────────────────────────────────
  const resetView = () =>
    setViewState({ longitude: 2.352, latitude: 48.856, zoom: 10 });

  return (
    <div className="flex-1 flex overflow-hidden">

      {/* ── Sidebar filtres ──────────────────────────────────────────────── */}
      <div className="w-64 shrink-0 border-r border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-y-auto flex flex-col">

        <div className="p-4 border-b border-neutral-200 dark:border-dark-border">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={15} className="text-primary-500" />
            <span className="text-sm font-semibold text-neutral-900 dark:text-dark-text">Filtres</span>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Chercher un point..."
              className="input pl-8 text-xs h-8"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
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
            <input
              type="range" min={0} max={100} value={filterScore}
              onChange={e => setFilterScore(+e.target.value)}
              className="w-full accent-primary-500"
            />
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

      {/* ── Carte MapLibre ───────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={e => setViewState(e.viewState)}
          style={{ width: '100%', height: '100%' }}
          mapStyle={MAP_STYLE}
          interactiveLayerIds={['points-layer']}
          onClick={handleClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {/* Source GeoJSON + calques */}
          <Source id="points" type="geojson" data={geojson}>
            {/* Halo blanc autour de chaque point */}
            <Layer
              id="points-halo"
              type="circle"
              paint={{
                'circle-radius': 11,
                'circle-color': 'white',
                'circle-opacity': 0.95,
              }}
            />
            {/* Point coloré cliquable */}
            <Layer
              id="points-layer"
              type="circle"
              paint={{
                'circle-radius': 8,
                'circle-color': ['get', 'color'],
                'circle-opacity': 0.9,
                'circle-stroke-width': 0,
              }}
            />
          </Source>

          {/* Popup sur point sélectionné */}
          {selectedPoint && (
            <Popup
              longitude={selectedPoint.lng}
              latitude={selectedPoint.lat}
              onClose={() => setSelectedPoint(null)}
              closeButton={false}
              offset={14}
              className="maplibre-popup"
            >
              <div className="text-sm">
                <strong className="block text-neutral-900">{selectedPoint.name}</strong>
                <span className="text-neutral-500">Score : {selectedPoint.score}/100</span>
              </div>
            </Popup>
          )}
        </Map>

        {/* Boutons zoom custom (identiques à l'original) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {[
            { icon: <ZoomIn size={14} />,    action: () => setViewState(v => ({ ...v, zoom: Math.min(v.zoom + 1, 20) })) },
            { icon: <ZoomOut size={14} />,   action: () => setViewState(v => ({ ...v, zoom: Math.max(v.zoom - 1, 1) })) },
            { icon: <Maximize2 size={14} />, action: resetView },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── Panneau détail ───────────────────────────────────────────────── */}
      {selectedPoint && (
        <div className="w-72 shrink-0 border-l border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-y-auto">
          <div className="p-4 border-b border-neutral-200 dark:border-dark-border flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-900 dark:text-dark-text">Détail du Point</span>
            <button
              onClick={() => setSelectedPoint(null)}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-dark-border rounded-lg text-neutral-400 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selectedPoint.type === 'client'  ? 'bg-blue-100'   :
                selectedPoint.type === 'partner' ? 'bg-green-100'  : 'bg-yellow-100'}`}>
                <MapPin size={18} className={
                  selectedPoint.type === 'client'  ? 'text-primary-500' :
                  selectedPoint.type === 'partner' ? 'text-success'     : 'text-warning'} />
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
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${selectedPoint.score}%`,
                    backgroundColor:
                      selectedPoint.score >= 80 ? '#10B981' :
                      selectedPoint.score >= 60 ? '#F59E0B' : '#EF4444',
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <MapPin size={12} />,      label: 'Zone',   value: selectedPoint.zone },
                { icon: <Users size={12} />,       label: 'Statut', value: selectedPoint.status },
                {
                  icon: <DollarSign size={12} />,
                  label: 'Revenu',
                  value: selectedPoint.revenue > 0
                    ? `${(selectedPoint.revenue / 1000).toFixed(0)}K MGA`
                    : '—',
                },
                { icon: <TrendingUp size={12} />,  label: 'Type',   value: selectedPoint.type },
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