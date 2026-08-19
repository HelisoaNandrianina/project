import { useState, useEffect, useCallback } from 'react';
import {
  Search, Upload, Plus, Filter, Download, CreditCard as Edit2, Trash2, FileSpreadsheet,
  ChevronLeft, ChevronRight, MapPin, X, Check, AlertCircle,
} from 'lucide-react';
import type { DataPoint } from '../../types';
import {
  listPointsApi, createPointApi, updatePointApi, deletePointApi,
  importPointsApi, downloadPointsExport,
} from '../../services/datapoints';
import type { CreatePointPayload, ImportReport } from '../../services/datapoints';
import { listZonesApi } from '../../services/zones';

const ITEMS_PER_PAGE = 6;

const statusBadge = (s: DataPoint['status']) => {
  if (s === 'active') return <span className="badge-success">Actif</span>;
  if (s === 'inactive') return <span className="badge-danger">Inactif</span>;
  return <span className="badge-warning">En attente</span>;
};

const typeBadge = (t: DataPoint['type']) => {
  if (t === 'client') return <span className="badge-blue">Client</span>;
  if (t === 'partner') return <span className="badge-success">Partenaire</span>;
  return <span className="badge-warning">Prospect</span>;
};

// ─── Modale Nouveau point / Modifier un point ───────────────────────────────

function PointFormModal({
  editingPoint, zoneOptions, onClose, onSuccess,
}: {
  editingPoint: DataPoint | null;
  zoneOptions: string[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(editingPoint?.name ?? '');
  const [lat, setLat] = useState(editingPoint ? String(editingPoint.lat) : '');
  const [lng, setLng] = useState(editingPoint ? String(editingPoint.lng) : '');
  const [type, setType] = useState<DataPoint['type']>(editingPoint?.type ?? 'client');
  const [zone, setZone] = useState(editingPoint?.zone ?? zoneOptions[0] ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!name.trim() || !zone || Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      setError('Veuillez remplir tous les champs correctement.');
      return;
    }

    setLoading(true);
    try {
      const payload: CreatePointPayload = { name, lat: latNum, lng: lngNum, zone, type };
      if (editingPoint) {
        await updatePointApi(editingPoint.id, payload);
      } else {
        await createPointApi(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">{editingPoint ? 'Modifier le point' : 'Nouveau point'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-dark-border rounded-lg text-neutral-400">
            <X size={15} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">Nom</label>
            <input type="text" placeholder="Ex: Client Entreprise XYZ" className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Latitude</label>
            <input type="number" placeholder="-18.8566" className="input" value={lat} onChange={e => setLat(e.target.value)} />
          </div>
          <div>
            <label className="label">Longitude</label>
            <input type="number" placeholder="47.5322" className="input" value={lng} onChange={e => setLng(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Type</label>
              <select className="input" value={type} onChange={e => setType(e.target.value as DataPoint['type'])}>
                <option value="client">client</option>
                <option value="prospect">prospect</option>
                <option value="partner">partner</option>
              </select>
            </div>
            <div>
              <label className="label">Zone</label>
              <select className="input" value={zone} onChange={e => setZone(e.target.value)}>
                {zoneOptions.length === 0 && <option value="">Aucune zone disponible</option>}
                {zoneOptions.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <>{editingPoint ? <Check size={13} /> : <Plus size={13} />}{editingPoint ? 'Enregistrer' : 'Ajouter'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modale Importer des données ────────────────────────────────────────────

function ImportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<ImportReport | null>(null);

  const handleImport = async () => {
    if (!file) {
      setError('Veuillez choisir un fichier CSV ou XLSX.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await importPointsApi(file);
      setReport(res);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Importer des données</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-dark-border rounded-lg text-neutral-400">
            <X size={15} />
          </button>
        </div>

        {report ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-50 dark:bg-dark-bg rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-success">{report.inserted}</p>
                <p className="text-xs text-neutral-500 dark:text-dark-muted">Importés</p>
              </div>
              <div className="bg-neutral-50 dark:bg-dark-bg rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-danger">{report.rejected}</p>
                <p className="text-xs text-neutral-500 dark:text-dark-muted">Rejetés</p>
              </div>
            </div>
            {report.errors.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1 bg-neutral-50 dark:bg-dark-bg rounded-lg p-2.5">
                {report.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600 dark:text-red-400">Ligne {e.line} : {e.reason}</p>
                ))}
              </div>
            )}
            <button onClick={onClose} className="btn-primary w-full">Fermer</button>
          </div>
        ) : (
          <>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) setFile(dropped);
              }}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragOver ? 'border-primary-500 bg-primary-50 dark:bg-blue-900/20' : 'border-neutral-200 dark:border-dark-border'}`}
            >
              <FileSpreadsheet size={36} className="text-neutral-300 dark:text-dark-muted mx-auto mb-3" />
              <p className="text-sm font-medium text-neutral-700 dark:text-dark-text">{file ? file.name : 'Glissez votre fichier ici'}</p>
              <p className="text-xs text-neutral-400 dark:text-dark-muted mt-1">CSV, XLSX</p>
              <label className="btn-secondary mt-4 text-xs inline-block cursor-pointer">
                Parcourir les fichiers
                <input type="file" accept=".csv,.xlsx" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>

            <div className="mt-4 space-y-1">
              <label className="label">En-têtes de colonnes attendus</label>
              <p className="text-xs text-neutral-500 dark:text-dark-muted font-mono">
                name, lat, lng, zone, type, status, score, revenue
              </p>
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
              <button
                onClick={handleImport}
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <><Check size={13} />Importer</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Modale de confirmation de suppression ──────────────────────────────────

function ConfirmDeleteModal({
  title, message, loading, onCancel, onConfirm,
}: {
  title: string;
  message: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-sm p-6 animate-fade-in space-y-4">
        <h3 className="section-title">{title}</h3>
        <p className="text-sm text-neutral-500 dark:text-dark-muted">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-secondary flex-1">Annuler</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-danger hover:bg-red-600 text-white rounded-lg text-sm font-medium py-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" /> : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DataPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);

  const [points, setPoints] = useState<DataPoint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [statsError, setStatsError] = useState('');

  const [zoneOptions, setZoneOptions] = useState<string[]>([]);
  const [zoneError, setZoneError] = useState('');

  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingPoint, setEditingPoint] = useState<DataPoint | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportError, setExportError] = useState('');

  const [selected, setSelected] = useState<string[]>([]);

  // Debounce simple sur la recherche pour éviter un appel API par frappe.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, filterType, filterStatus]);

  const fetchPoints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listPointsApi({
        q: debouncedSearch || undefined,
        type: filterType === 'all' ? undefined : filterType,
        status: filterStatus === 'all' ? undefined : filterStatus,
        page,
        page_size: ITEMS_PER_PAGE,
      });
      setPoints(res.items);
      setTotal(res.total);
      setSelected([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterType, filterStatus, page]);

  useEffect(() => { fetchPoints(); }, [fetchPoints]);

  // Pas d'endpoint d'agrégation dédié : ces 3 compteurs viennent de requêtes
  // légères filtrées par statut (page_size=1, seul `total` nous intéresse) ;
  // le total global de la carte "Total Points" vient lui de la requête principale.
  const fetchStats = useCallback(async () => {
    setStatsError('');
    try {
      const [active, inactive, pending] = await Promise.all([
        listPointsApi({ status: 'active', page_size: 1 }),
        listPointsApi({ status: 'inactive', page_size: 1 }),
        listPointsApi({ status: 'pending', page_size: 1 }),
      ]);
      setActiveCount(active.total);
      setInactiveCount(inactive.total);
      setPendingCount(pending.total);
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : 'Erreur serveur');
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    listZonesApi()
      .then(zones => setZoneOptions(zones.map(z => z.name)))
      .catch(err => setZoneError(err instanceof Error ? err.message : 'Erreur serveur'));
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(points.length === selected.length ? [] : points.map(d => d.id));

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    setError('');
    try {
      await deletePointApi(deleteId);
      setDeleteId(null);
      fetchPoints();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setDeleteLoading(true);
    setError('');
    try {
      await Promise.all(selected.map(id => deletePointApi(id)));
      setBulkDeleteConfirm(false);
      setSelected([]);
      fetchPoints();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = async () => {
    setExportError('');
    try {
      await downloadPointsExport({
        q: debouncedSearch || undefined,
        type: filterType === 'all' ? undefined : filterType,
        status: filterStatus === 'all' ? undefined : filterStatus,
        format: 'csv',
      });
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Erreur serveur');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Gestion des Données</h1>
          <p className="text-sm text-neutral-500 dark:text-dark-muted mt-0.5">
            {total} points &bull; Import, édition et gestion des entités géographiques
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowImport(true)} className="btn-secondary flex items-center gap-1.5">
              <Upload size={14} />Import CSV/Excel
            </button>
            <button onClick={handleExport} className="btn-secondary flex items-center gap-1.5">
              <Download size={14} />Export
            </button>
            <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5">
              <Plus size={14} />Ajouter un point
            </button>
          </div>
          {exportError && <span className="text-xs text-danger">{exportError}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: 'Total Points', v: total, c: 'text-primary-500' },
          { l: 'Actifs', v: activeCount, c: 'text-success' },
          { l: 'Inactifs', v: inactiveCount, c: 'text-danger' },
          { l: 'En attente', v: pendingCount, c: 'text-warning' },
        ].map((s, i) => (
          <div key={i} className="card p-4">
            <p className={`text-xl font-bold ${s.c}`}>{s.v}</p>
            <p className="text-xs text-neutral-500 dark:text-dark-muted mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>
      {statsError && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{statsError}</span>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-dark-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input type="text" placeholder="Rechercher par nom..." className="input pl-8 h-8 text-xs"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input h-8 text-xs w-36" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">Tous types</option>
            <option value="client">Clients</option>
            <option value="prospect">Prospects</option>
            <option value="partner">Partenaires</option>
          </select>
          <select className="input h-8 text-xs w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Tous statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="pending">En attente</option>
          </select>
          <button className="btn-ghost h-8 flex items-center gap-1.5">
            <Filter size={13} />Filtres avancés
          </button>
          {selected.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-neutral-500 dark:text-dark-muted">{selected.length} sélectionné(s)</span>
              <button onClick={() => setBulkDeleteConfirm(true)} className="text-xs text-danger hover:text-red-600 flex items-center gap-1">
                <Trash2 size={12} />Supprimer
              </button>
            </div>
          )}
        </div>

        {zoneError && (
          <div className="mx-4 mt-4 flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>Impossible de charger les zones : {zoneError}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th w-10">
                  <input type="checkbox" className="rounded border-neutral-300"
                    checked={selected.length === points.length && points.length > 0}
                    onChange={toggleAll} />
                </th>
                {['ID', 'Nom', 'Type', 'Zone', 'Coordonnées', 'Score', 'Revenu', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="table-td text-center text-neutral-400 dark:text-dark-muted py-8">Chargement…</td></tr>
              ) : error ? (
                <tr><td colSpan={10} className="table-td text-center text-danger py-8">{error}</td></tr>
              ) : points.length === 0 ? (
                <tr><td colSpan={10} className="table-td text-center text-neutral-400 dark:text-dark-muted py-8">Aucun point ne correspond à ces critères.</td></tr>
              ) : points.map(d => (
                <tr key={d.id} className={`hover:bg-neutral-50 dark:hover:bg-dark-bg/50 transition-colors ${selected.includes(d.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                  <td className="table-td">
                    <input type="checkbox" className="rounded border-neutral-300"
                      checked={selected.includes(d.id)} onChange={() => toggleSelect(d.id)} />
                  </td>
                  <td className="table-td font-mono text-xs text-neutral-400 dark:text-dark-muted">{d.id.slice(0, 8)}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-primary-500 shrink-0" />
                      <span className="font-medium text-neutral-800 dark:text-dark-text">{d.name}</span>
                    </div>
                  </td>
                  <td className="table-td">{typeBadge(d.type)}</td>
                  <td className="table-td text-neutral-500 dark:text-dark-muted">{d.zone}</td>
                  <td className="table-td font-mono text-xs">{d.lat}°, {d.lng}°</td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-neutral-100 dark:bg-dark-bg rounded-full h-1.5 overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${d.score}%`,
                          backgroundColor: d.score >= 80 ? '#10B981' : d.score >= 60 ? '#F59E0B' : '#EF4444'
                        }} />
                      </div>
                      <span className="text-xs font-semibold text-neutral-700 dark:text-dark-text">{d.score}</span>
                    </div>
                  </td>
                  <td className="table-td font-medium">{d.revenue > 0 ? `${(d.revenue / 1000).toFixed(0)}K MGA` : '—'}</td>
                  <td className="table-td">{statusBadge(d.status)}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditingPoint(d)} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-dark-border rounded-lg text-neutral-400 hover:text-primary-500 transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setDeleteId(d.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-neutral-400 hover:text-danger transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-neutral-200 dark:border-dark-border flex items-center justify-between">
          <span className="text-xs text-neutral-500 dark:text-dark-muted">
            Page {page} / {totalPages} &bull; {total} résultats
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-dark-border rounded-lg text-neutral-400 disabled:opacity-40 transition-colors">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-primary-500 text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-dark-border dark:text-dark-muted'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-dark-border rounded-lg text-neutral-400 disabled:opacity-40 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSuccess={() => { fetchPoints(); fetchStats(); }}
        />
      )}

      {showAdd && (
        <PointFormModal
          editingPoint={null}
          zoneOptions={zoneOptions}
          onClose={() => setShowAdd(false)}
          onSuccess={() => { fetchPoints(); fetchStats(); }}
        />
      )}

      {editingPoint && (
        <PointFormModal
          editingPoint={editingPoint}
          zoneOptions={zoneOptions}
          onClose={() => setEditingPoint(null)}
          onSuccess={() => { fetchPoints(); fetchStats(); }}
        />
      )}

      {deleteId !== null && (
        <ConfirmDeleteModal
          title="Supprimer ce point ?"
          message="Cette action est définitive et retirera le point de la base de données."
          loading={deleteLoading}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {bulkDeleteConfirm && (
        <ConfirmDeleteModal
          title={`Supprimer ${selected.length} point(s) ?`}
          message="Cette action est définitive et retirera ces points de la base de données."
          loading={deleteLoading}
          onCancel={() => setBulkDeleteConfirm(false)}
          onConfirm={handleBulkDelete}
        />
      )}
    </div>
  );
}
