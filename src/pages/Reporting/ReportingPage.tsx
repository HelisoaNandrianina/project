import { useState, useEffect, useCallback } from 'react';
import { FileText, Download, Plus, Trash2, Clock, Check, X, AlertCircle } from 'lucide-react';
import {
  listReportsApi, generateReportApi, downloadReportApi, deleteReportApi,
} from '../../services/reports';
import type { ReportOut } from '../../services/reports';
import { listZonesApi } from '../../services/zones';
import type { Zone } from '../../types';

const REPORTS_POLL_INTERVAL_MS = 4000;

// ⚠️ `type` doit être EXACTEMENT "Stratégique" (avec l'accent) pour que le
// backend génère la section Recommandations (comparaison de chaîne exacte).
const TEMPLATES = [
  { id: 'T1', name: 'Rapport Mensuel Standard', desc: 'KPIs, carte, évolution, zones', icon: '📊', apiType: 'Mensuel' },
  { id: 'T2', name: 'Export Données Brutes', desc: 'Export brut de tous les points', icon: '📋', apiType: 'Export' },
  { id: 'T3', name: 'Rapport Décisionnel', desc: 'Scoring, recommandations', icon: '🎯', apiType: 'Stratégique' },
  { id: 'T4', name: 'Analyse Géospatiale', desc: 'Densité, clusters, heatmap', icon: '🗺️', apiType: 'Analyse' },
];

function displayTitle(r: ReportOut): string {
  return `${r.type} — ${new Date(r.created_at).toLocaleDateString('fr-FR')}`;
}

function displayZones(zones: string[] | string): string {
  return Array.isArray(zones) ? (zones.length > 0 ? zones.join(', ') : 'Toutes') : zones;
}

export default function ReportingPage() {
  const [reports, setReports] = useState<ReportOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');

  const [zones, setZones] = useState<Zone[]>([]);

  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATES[0].id);
  const [selectedZoneName, setSelectedZoneName] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'xlsx'>('pdf');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadReports = useCallback(() => {
    setLoading(true);
    setLoadError('');
    return listReportsApi()
      .then(setReports)
      .catch(err => setLoadError(err instanceof Error ? err.message : 'Erreur serveur'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadReports();
    listZonesApi().then(setZones).catch(() => {});
  }, [loadReports]);

  // Poll auto-limité : tant qu'au moins un rapport est en génération, on
  // relance la liste ; s'arrête dès qu'aucun rapport n'est plus en génération.
  useEffect(() => {
    if (!reports.some(r => r.status === 'generating')) return;
    const t = setTimeout(loadReports, REPORTS_POLL_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [reports, loadReports]);

  async function handleGenerate() {
    const template = TEMPLATES.find(t => t.id === selectedTemplateId) ?? TEMPLATES[0];
    setGenerating(true);
    setGenerateError('');
    try {
      await generateReportApi({
        type: template.apiType,
        zones: selectedZoneName === 'all' ? 'all' : [selectedZoneName],
        format: selectedFormat,
      });
      setShowGenerate(false);
      loadReports();
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload(r: ReportOut) {
    setActionError('');
    try {
      await downloadReportApi(r.id, r.type, r.format);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur serveur');
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Supprimer ce rapport ?')) return;
    setDeletingId(id);
    setActionError('');
    try {
      await deleteReportApi(id);
      loadReports();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setDeletingId(null);
    }
  }

  const generatingCount = reports.filter(r => r.status === 'generating').length;
  const readyCount = reports.filter(r => r.status === 'ready').length;
  const now = new Date();
  const thisMonthCount = reports.filter(r => {
    const d = new Date(r.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Reporting</h1>
          <p className="text-sm text-neutral-500 dark:text-dark-muted mt-0.5">Génération, consultation et export de rapports géospatiaux</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowGenerate(true)} className="btn-primary flex items-center gap-1.5">
            <Plus size={14} />Générer rapport
          </button>
        </div>
      </div>

      {loadError && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{loadError}</span>
        </div>
      )}
      {actionError && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: 'Rapports Générés', v: reports.length, c: 'text-primary-500' },
          { l: 'Ce Mois', v: thisMonthCount, c: 'text-success' },
          { l: 'En Cours', v: generatingCount, c: 'text-warning' },
          { l: 'Prêts', v: readyCount, c: 'text-neutral-500 dark:text-dark-muted' },
        ].map((s, i) => (
          <div key={i} className="card p-4">
            <p className={`text-xl font-bold ${s.c}`}>{loading ? '…' : s.v}</p>
            <p className="text-xs text-neutral-500 dark:text-dark-muted mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-dark-border flex items-center justify-between gap-3">
          <h3 className="section-title">Historique des Rapports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Rapport', 'Zones', 'Format', 'Date', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="table-td text-center text-neutral-400 dark:text-dark-muted py-8">Chargement…</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={6} className="table-td text-center text-neutral-400 dark:text-dark-muted py-8">Aucun rapport pour le moment</td></tr>
              ) : reports.map(r => (
                <tr key={r.id} className="hover:bg-neutral-50 dark:hover:bg-dark-bg/50 transition-colors">
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-primary-500 shrink-0" />
                      <span className="font-medium text-neutral-800 dark:text-dark-text">{displayTitle(r)}</span>
                    </div>
                  </td>
                  <td className="table-td text-neutral-500 dark:text-dark-muted text-xs">{displayZones(r.zones)}</td>
                  <td className="table-td">
                    <span className={r.format === 'pdf' ? 'badge-danger' : 'badge-success'}>{r.format.toUpperCase()}</span>
                  </td>
                  <td className="table-td text-xs text-neutral-500 dark:text-dark-muted">{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="table-td">
                    {r.status === 'ready' ? (
                      <span className="badge-success"><Check size={10} />Prêt</span>
                    ) : r.status === 'generating' ? (
                      <span className="badge-warning flex items-center gap-1">
                        <div className="w-2 h-2 border border-warning border-t-transparent rounded-full animate-spin" />
                        Génération...
                      </span>
                    ) : (
                      <span className="badge-danger">{r.status}</span>
                    )}
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-1">
                      {r.status === 'ready' && (
                        <button onClick={() => handleDownload(r)} className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-neutral-400 hover:text-success transition-colors">
                          <Download size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-neutral-400 hover:text-danger transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showGenerate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowGenerate(false)}>
          <div className="card w-full max-w-lg p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="section-title">Générer un Rapport</h3>
              <button onClick={() => setShowGenerate(false)} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-dark-border rounded-lg text-neutral-400">
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Modèle</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => setSelectedTemplateId(t.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${selectedTemplateId === t.id ? 'border-primary-500 bg-primary-50 dark:bg-blue-900/20' : 'border-neutral-200 dark:border-dark-border hover:border-neutral-300'}`}>
                      <p className="text-xs font-semibold text-neutral-800 dark:text-dark-text">{t.name}</p>
                      <p className="text-xs text-neutral-400 dark:text-dark-muted mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Zone</label>
                  <select className="input" value={selectedZoneName} onChange={e => setSelectedZoneName(e.target.value)}>
                    <option value="all">Toutes les zones</option>
                    {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Format</label>
                  <select className="input" value={selectedFormat} onChange={e => setSelectedFormat(e.target.value as 'pdf' | 'xlsx')}>
                    <option value="pdf">PDF</option>
                    <option value="xlsx">Excel</option>
                  </select>
                </div>
              </div>

              {generateError && (
                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{generateError}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowGenerate(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleGenerate} disabled={generating}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {generating ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Génération...</>
                ) : (
                  <><Clock size={14} />Générer</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
