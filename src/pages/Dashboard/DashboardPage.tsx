import { useRef, useCallback, useState, useEffect } from 'react';
import { MapPin, Users, TrendingUp, AlertTriangle, Activity, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import KPICard from '../../components/UI/KPICard';
import { BarChart, LineChart, DonutChart } from '../../components/UI/Charts';
import { listPointsApi } from '../../services/datapoints';
import { listZonesApi } from '../../services/zones';
import { getKpisApi, getRevenueEvolutionApi, getSegmentationApi, getActivityApi } from '../../services/dashboard';
import type { DashboardKpis, RevenuePoint, SegmentationItem, ActivityItem } from '../../services/dashboard';
import type { DataPoint, PageId, Zone } from '../../types';

interface Props { onNavigate: (page: PageId) => void; }

// ─── Couleurs par type (identique à MapPage) ─────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  client:   '#3B82F6',
  partner:  '#10B981',
  prospect: '#F59E0B',
};

const TYPE_LABELS: Record<string, string> = {
  client:   'Clients',
  partner:  'Partenaires',
  prospect: 'Prospects',
};

// ─── Style carte gratuit sans clé API ────────────────────────────────────────
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

// ─── Mini carte MapLibre ─────────────────────────────────────────────────────
function MiniMap({ points, onNavigate }: { points: DataPoint[]; onNavigate: (page: PageId) => void }) {
  const mapRef = useRef<MapRef>(null);

  const miniMapGeojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: points.map(d => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [d.lng, d.lat] }, // ⚠️ lng avant lat
      properties: { color: TYPE_COLORS[d.type] ?? '#6B7280' },
    })),
  };

  // Clic sur la carte → navigation vers la page carte complète
  const handleClick = useCallback((_e: MapLayerMouseEvent) => {
    onNavigate('map');
  }, [onNavigate]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden relative cursor-pointer" onClick={() => onNavigate('map')}>
      <Map
        ref={mapRef}
        initialViewState={{ longitude: 47.537, latitude: -18.910, zoom: 11 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        interactive={false}          // Pas de drag/zoom sur la mini-carte
        attributionControl={false}   // Masque l'attribution pour économiser la place
      >
        <Source id="mini-points" type="geojson" data={miniMapGeojson}>
          {/* Halo blanc */}
          <Layer
            id="mini-halo"
            type="circle"
            paint={{
              'circle-radius': 7,
              'circle-color': 'white',
              'circle-opacity': 0.95,
            }}
          />
          {/* Point coloré */}
          <Layer
            id="mini-points-layer"
            type="circle"
            paint={{
              'circle-radius': 5,
              'circle-color': ['get', 'color'],
              'circle-opacity': 0.9,
            }}
          />
        </Source>
      </Map>

      {/* Légende superposée */}
      <div className="absolute top-2 left-2 flex gap-1 z-10 pointer-events-none">
        {[
          { c: '#3B82F6', l: 'Clients' },
          { c: '#10B981', l: 'Partenaires' },
          { c: '#F59E0B', l: 'Prospects' },
        ].map((leg, i) => (
          <div key={i} className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded text-[9px] text-white backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: leg.c }} />
            {leg.l}
          </div>
        ))}
      </div>

      {/* Overlay hover pour indiquer que c'est cliquable */}
      <div className="absolute inset-0 bg-primary-500/0 hover:bg-primary-500/5 transition-colors duration-200 z-10" />
    </div>
  );
}

// ─── Page Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage({ onNavigate }: Props) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [zonesError, setZonesError] = useState('');

  const [miniMapPoints, setMiniMapPoints] = useState<DataPoint[]>([]);
  const [miniMapError, setMiniMapError] = useState('');

  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [kpisLoading, setKpisLoading] = useState(false);
  const [kpisError, setKpisError] = useState('');

  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState('');

  const [segmentation, setSegmentation] = useState<SegmentationItem[]>([]);
  const [segLoading, setSegLoading] = useState(false);
  const [segError, setSegError] = useState('');

  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState('');

  useEffect(() => {
    setZonesLoading(true);
    setZonesError('');
    listZonesApi()
      .then(setZones)
      .catch(err => setZonesError(err instanceof Error ? err.message : 'Erreur serveur'))
      .finally(() => setZonesLoading(false));

    // ⚠️ page_size est plafonné à 100 côté backend : au-delà de ce volume, il
    // faudra une vraie pagination ou un endpoint dédié "tous les points visibles".
    listPointsApi({ page_size: 100 })
      .then(res => setMiniMapPoints(res.items))
      .catch(err => setMiniMapError(err instanceof Error ? err.message : 'Erreur serveur'));

    setKpisLoading(true);
    setKpisError('');
    getKpisApi()
      .then(setKpis)
      .catch(err => setKpisError(err instanceof Error ? err.message : 'Erreur serveur'))
      .finally(() => setKpisLoading(false));

    setRevenueLoading(true);
    setRevenueError('');
    getRevenueEvolutionApi(7)
      .then(setRevenue)
      .catch(err => setRevenueError(err instanceof Error ? err.message : 'Erreur serveur'))
      .finally(() => setRevenueLoading(false));

    setSegLoading(true);
    setSegError('');
    getSegmentationApi()
      .then(setSegmentation)
      .catch(err => setSegError(err instanceof Error ? err.message : 'Erreur serveur'))
      .finally(() => setSegLoading(false));

    setActivityLoading(true);
    setActivityError('');
    getActivityApi(4)
      .then(setActivity)
      .catch(err => setActivityError(err instanceof Error ? err.message : 'Erreur serveur'))
      .finally(() => setActivityLoading(false));
  }, []);

  const zoneBarData = zones.map(z => ({ zone: z.name, value: z.scoreValue }));

  const lastRevenuePoint = revenue.length > 0 ? revenue[revenue.length - 1] : null;
  const prevRevenuePoint = revenue.length > 1 ? revenue[revenue.length - 2] : null;
  const momGrowth =
    lastRevenuePoint && prevRevenuePoint && prevRevenuePoint.revenue !== 0
      ? ((lastRevenuePoint.revenue - prevRevenuePoint.revenue) / prevRevenuePoint.revenue) * 100
      : null;

  const segmentTotal = segmentation.reduce((sum, s) => sum + s.count, 0);
  const segmentationDonutData = segmentation.map(s => ({
    label: TYPE_LABELS[s.type] ?? s.type,
    value: segmentTotal > 0 ? Math.round((s.count / segmentTotal) * 100) : 0,
    color: TYPE_COLORS[s.type] ?? '#6B7280',
  }));

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

      {kpisError && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{kpisError}</span>
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="Points Actifs"
          value={kpisLoading ? '…' : String(kpis?.active_points ?? '—')}
          icon={<MapPin size={18} />}
          color="blue"
        />
        <KPICard
          label="Zones Couvertes"
          value={kpisLoading ? '…' : `${kpis?.zones_count ?? '—'} / ${kpis?.zones_count ?? '—'}`}
          icon={<TrendingUp size={18} />}
          color="green"
        />
        <KPICard
          label="Score Moyen"
          value={kpisLoading ? '…' : `${kpis?.avg_score ?? '—'} / 100`}
          icon={<Users size={18} />}
          color="yellow"
        />
        <KPICard
          label="Alertes Actives"
          value={kpisLoading ? '…' : String(kpis?.active_alerts ?? 0)}
          icon={<AlertTriangle size={18} />}
          color="red"
          title="Module Notifications à venir"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title">Évolution du Revenu</h3>
              <p className="text-xs text-neutral-400 dark:text-dark-muted mt-0.5">{revenue.length || 7} derniers mois (en MGA)</p>
            </div>
            <button onClick={() => onNavigate('dashboards')} className="text-xs text-primary-500 font-medium hover:text-primary-600 flex items-center gap-1">
              Voir plus <ArrowUpRight size={12} />
            </button>
          </div>

          {revenueError ? (
            <div className="h-[140px] flex items-center justify-center gap-1.5 text-xs text-red-500 dark:text-red-400">
              <AlertCircle size={12} />{revenueError}
            </div>
          ) : revenueLoading ? (
            <div className="h-[140px] flex items-center justify-center text-xs text-neutral-400 dark:text-dark-muted">Chargement…</div>
          ) : revenue.length > 0 ? (
            <LineChart data={revenue.map(r => ({ label: r.month, value: r.revenue }))} height={140} color="#2563EB" />
          ) : (
            <div className="h-[140px] flex items-center justify-center text-xs text-neutral-400 dark:text-dark-muted">Aucune donnée</div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              {
                l: lastRevenuePoint ? `Total ${formatMonthLabel(lastRevenuePoint.month)}` : 'Total',
                v: lastRevenuePoint ? `${Math.round(lastRevenuePoint.revenue / 1000)} K MGA` : '—',
                c: 'text-neutral-900 dark:text-dark-text',
              },
              {
                l: 'Croissance MoM',
                v: momGrowth !== null ? `${momGrowth >= 0 ? '+' : ''}${momGrowth.toFixed(1)}%` : '—',
                c: momGrowth === null ? 'text-neutral-400 dark:text-dark-muted' : momGrowth >= 0 ? 'text-success' : 'text-danger',
              },
            ].map((s, i) => (
              <div key={i} className="bg-neutral-50 dark:bg-dark-bg rounded-lg p-3 text-center">
                <p className={`text-base font-bold ${s.c}`}>{s.v}</p>
                <p className="text-xs text-neutral-400 dark:text-dark-muted mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Carte Rapide — maintenant MapLibre réel ── */}
        <div className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Carte Rapide</h3>
            <button onClick={() => onNavigate('map')} className="text-xs text-primary-500 font-medium hover:text-primary-600 flex items-center gap-1">
              Explorer <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="flex-1 min-h-[160px]">
            <MiniMap points={miniMapPoints} onNavigate={onNavigate} />
          </div>
          {miniMapError ? (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-red-500 dark:text-red-400">
              <AlertCircle size={12} />{miniMapError}
            </div>
          ) : (
            <div className="mt-3 text-xs text-neutral-400 dark:text-dark-muted text-center">
              {miniMapPoints.length} marqueurs &bull; Cliquer pour explorer
            </div>
          )}
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
          {segError ? (
            <div className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
              <AlertCircle size={12} />{segError}
            </div>
          ) : segLoading ? (
            <div className="text-xs text-neutral-400 dark:text-dark-muted">Chargement…</div>
          ) : segmentationDonutData.length > 0 ? (
            <DonutChart data={segmentationDonutData} size={100} />
          ) : (
            <div className="text-xs text-neutral-400 dark:text-dark-muted">Aucune donnée</div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title">Activité Récente</h3>
          </div>
          {activityError ? (
            <div className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
              <AlertCircle size={12} />{activityError}
            </div>
          ) : activityLoading ? (
            <div className="text-xs text-neutral-400 dark:text-dark-muted">Chargement…</div>
          ) : (
            <div className="space-y-3">
              {activity.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${item.type === 'sync' ? 'bg-primary-500' : 'bg-success'}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-800 dark:text-dark-text truncate">{item.message}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={10} className="text-neutral-400 shrink-0" />
                      <span className="text-xs text-neutral-400 dark:text-dark-muted">
                        {new Date(item.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
        {zonesError && (
          <div className="mb-3 flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{zonesError}</span>
          </div>
        )}
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
              {zonesLoading ? (
                <tr><td colSpan={6} className="table-td text-center text-neutral-400 dark:text-dark-muted py-6">Chargement…</td></tr>
              ) : zones.map(z => (
                <tr key={z.id} className="hover:bg-neutral-50 dark:hover:bg-dark-bg/50 transition-colors">
                  <td className="table-td font-medium">{z.name}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-neutral-100 dark:bg-dark-bg rounded-full h-1.5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${z.scoreValue}%`,
                            backgroundColor: z.score === 'high' ? '#10B981' : z.score === 'medium' ? '#F59E0B' : '#EF4444'
                          }} />
                      </div>
                      <span className={`text-xs font-semibold ${z.score === 'high' ? 'text-success' : z.score === 'medium' ? 'text-warning' : 'text-danger'}`}>
                        {z.scoreValue}
                      </span>
                    </div>
                  </td>
                  <td className="table-td">{z.coverage}%</td>
                  <td className="table-td">{z.pointCount}</td>
                  <td className="table-td font-medium">{(z.revenue / 1000).toFixed(0)} KMGA</td>
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
