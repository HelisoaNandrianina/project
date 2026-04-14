import { useState } from 'react';
import { FileText, Download, Plus, Eye, Trash2, Clock, Check, X, Filter } from 'lucide-react';

const REPORTS = [
  { id: 'R01', title: 'Rapport Mensuel Mars 2026', type: 'Mensuel', zones: 'Toutes', status: 'ready', size: '2.4 MB', created: '2026-04-01', format: 'PDF' },
  { id: 'R02', title: 'Analyse Géospatiale Q1 2026', type: 'Trimestriel', zones: 'Toutes', status: 'ready', size: '5.1 MB', created: '2026-04-05', format: 'PDF' },
  { id: 'R03', title: 'Export Données Zone Nord', type: 'Export', zones: 'Zone Nord', status: 'ready', size: '1.2 MB', created: '2026-04-10', format: 'XLSX' },
  { id: 'R04', title: 'Rapport Décision Stratégique', type: 'Stratégique', zones: 'Toutes', status: 'generating', size: '—', created: '2026-04-14', format: 'PDF' },
  { id: 'R05', title: 'Analyse Densité Zone Sud', type: 'Analyse', zones: 'Zone Sud', status: 'ready', size: '0.8 MB', created: '2026-04-12', format: 'PDF' },
  { id: 'R06', title: 'Comparaison Zones Q4 2025', type: 'Comparatif', zones: 'Toutes', status: 'ready', size: '3.7 MB', created: '2026-01-15', format: 'PDF' },
];

const TEMPLATES = [
  { id: 'T1', name: 'Rapport Mensuel Standard', desc: 'KPIs, carte, évolution, zones', icon: '📊' },
  { id: 'T2', name: 'Export Données Brutes', desc: 'CSV/Excel de tous les points', icon: '📋' },
  { id: 'T3', name: 'Rapport Décisionnel', desc: 'Scoring, recommandations', icon: '🎯' },
  { id: 'T4', name: 'Analyse Géospatiale', desc: 'Densité, clusters, heatmap', icon: '🗺️' },
];

export default function ReportingPage() {
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('T1');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); setTimeout(() => { setGenerated(false); setShowGenerate(false); }, 1500); }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Reporting</h1>
          <p className="text-sm text-neutral-500 dark:text-dark-muted mt-0.5">Génération, consultation et export de rapports géospatiaux</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-1.5">
            <Download size={14} />Export Excel
          </button>
          <button onClick={() => setShowGenerate(true)} className="btn-primary flex items-center gap-1.5">
            <Plus size={14} />Générer rapport
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: 'Rapports Générés', v: '24', c: 'text-primary-500' },
          { l: 'Ce Mois', v: '6', c: 'text-success' },
          { l: 'En Cours', v: '1', c: 'text-warning' },
          { l: 'Total Exports', v: '47', c: 'text-neutral-500 dark:text-dark-muted' },
        ].map((s, i) => (
          <div key={i} className="card p-4">
            <p className={`text-xl font-bold ${s.c}`}>{s.v}</p>
            <p className="text-xs text-neutral-500 dark:text-dark-muted mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-dark-border flex items-center justify-between gap-3">
          <h3 className="section-title">Historique des Rapports</h3>
          <div className="flex items-center gap-2">
            <button className="btn-ghost h-8 flex items-center gap-1.5 text-xs">
              <Filter size={13} />Filtrer
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Rapport', 'Type', 'Zones', 'Format', 'Taille', 'Date', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REPORTS.map(r => (
                <tr key={r.id} className="hover:bg-neutral-50 dark:hover:bg-dark-bg/50 transition-colors">
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-primary-500 shrink-0" />
                      <span className="font-medium text-neutral-800 dark:text-dark-text">{r.title}</span>
                    </div>
                  </td>
                  <td className="table-td"><span className="badge-blue">{r.type}</span></td>
                  <td className="table-td text-neutral-500 dark:text-dark-muted text-xs">{r.zones}</td>
                  <td className="table-td">
                    <span className={r.format === 'PDF' ? 'badge-danger' : 'badge-success'}>{r.format}</span>
                  </td>
                  <td className="table-td text-xs font-mono text-neutral-400 dark:text-dark-muted">{r.size}</td>
                  <td className="table-td text-xs text-neutral-500 dark:text-dark-muted">{r.created}</td>
                  <td className="table-td">
                    {r.status === 'ready' ? (
                      <span className="badge-success"><Check size={10} />Prêt</span>
                    ) : (
                      <span className="badge-warning flex items-center gap-1">
                        <div className="w-2 h-2 border border-warning border-t-transparent rounded-full animate-spin" />
                        Génération...
                      </span>
                    )}
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-neutral-100 dark:hover:bg-dark-border rounded-lg text-neutral-400 hover:text-primary-500 transition-colors">
                        <Eye size={13} />
                      </button>
                      {r.status === 'ready' && (
                        <button className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-neutral-400 hover:text-success transition-colors">
                          <Download size={13} />
                        </button>
                      )}
                      <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-neutral-400 hover:text-danger transition-colors">
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
                    <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${selectedTemplate === t.id ? 'border-primary-500 bg-primary-50 dark:bg-blue-900/20' : 'border-neutral-200 dark:border-dark-border hover:border-neutral-300'}`}>
                      <p className="text-xs font-semibold text-neutral-800 dark:text-dark-text">{t.name}</p>
                      <p className="text-xs text-neutral-400 dark:text-dark-muted mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Titre du rapport</label>
                <input type="text" placeholder="Ex: Rapport Mensuel Avril 2026" className="input" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Zone</label>
                  <select className="input">
                    <option>Toutes les zones</option>
                    <option>Zone Nord</option>
                    <option>Zone Est</option>
                    <option>Zone Ouest</option>
                    <option>Zone Sud</option>
                  </select>
                </div>
                <div>
                  <label className="label">Format</label>
                  <select className="input">
                    <option>PDF</option>
                    <option>Excel</option>
                    <option>CSV</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date début</label>
                  <input type="date" className="input" defaultValue="2026-04-01" />
                </div>
                <div>
                  <label className="label">Date fin</label>
                  <input type="date" className="input" defaultValue="2026-04-14" />
                </div>
              </div>

              <div>
                <label className="label">Sections à inclure</label>
                <div className="grid grid-cols-2 gap-2">
                  {['KPIs', 'Carte', 'Analyse densité', 'Scoring zones', 'Recommandations', 'Données brutes'].map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-neutral-300 text-primary-500" />
                      <span className="text-xs text-neutral-600 dark:text-dark-text">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowGenerate(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleGenerate} disabled={generating || generated}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {generated ? (
                  <><Check size={14} />Généré !</>
                ) : generating ? (
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
