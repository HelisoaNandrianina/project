import { useState } from 'react';
import { Search, Upload, Plus, Filter, Download, CreditCard as Edit2, Trash2, FileSpreadsheet, ChevronLeft, ChevronRight, MapPin, X, Check } from 'lucide-react';
import { mockDataPoints } from '../../data/mockData';
import type { DataPoint } from '../../types';

const ITEMS_PER_PAGE = 6;

export default function DataPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const filtered = mockDataPoints.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || d.type === filterType;
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(paged.length === selected.length ? [] : paged.map(d => d.id));

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

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Gestion des Données</h1>
          <p className="text-sm text-neutral-500 dark:text-dark-muted mt-0.5">
            {filtered.length} points &bull; Import, édition et gestion des entités géographiques
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(true)} className="btn-secondary flex items-center gap-1.5">
            <Upload size={14} />Import CSV/Excel
          </button>
          <button className="btn-secondary flex items-center gap-1.5">
            <Download size={14} />Export
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5">
            <Plus size={14} />Ajouter un point
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: 'Total Points', v: '416', c: 'text-primary-500' },
          { l: 'Actifs', v: '287', c: 'text-success' },
          { l: 'Inactifs', v: '89', c: 'text-danger' },
          { l: 'En attente', v: '40', c: 'text-warning' },
        ].map((s, i) => (
          <div key={i} className="card p-4">
            <p className={`text-xl font-bold ${s.c}`}>{s.v}</p>
            <p className="text-xs text-neutral-500 dark:text-dark-muted mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-dark-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input type="text" placeholder="Rechercher par nom, ID..." className="input pl-8 h-8 text-xs"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input h-8 text-xs w-36" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
            <option value="all">Tous types</option>
            <option value="client">Clients</option>
            <option value="prospect">Prospects</option>
            <option value="partner">Partenaires</option>
          </select>
          <select className="input h-8 text-xs w-36" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
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
              <button className="text-xs text-danger hover:text-red-600 flex items-center gap-1">
                <Trash2 size={12} />Supprimer
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th w-10">
                  <input type="checkbox" className="rounded border-neutral-300"
                    checked={selected.length === paged.length && paged.length > 0}
                    onChange={toggleAll} />
                </th>
                {['ID', 'Nom', 'Type', 'Zone', 'Coordonnées', 'Score', 'Revenu', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(d => (
                <tr key={d.id} className={`hover:bg-neutral-50 dark:hover:bg-dark-bg/50 transition-colors ${selected.includes(d.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                  <td className="table-td">
                    <input type="checkbox" className="rounded border-neutral-300"
                      checked={selected.includes(d.id)} onChange={() => toggleSelect(d.id)} />
                  </td>
                  <td className="table-td font-mono text-xs text-neutral-400 dark:text-dark-muted">{d.id}</td>
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
                  <td className="table-td font-medium">{d.revenue > 0 ? `${(d.revenue / 1000).toFixed(0)}K€` : '—'}</td>
                  <td className="table-td">{statusBadge(d.status)}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-neutral-100 dark:hover:bg-dark-border rounded-lg text-neutral-400 hover:text-primary-500 transition-colors">
                        <Edit2 size={13} />
                      </button>
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

        <div className="p-4 border-t border-neutral-200 dark:border-dark-border flex items-center justify-between">
          <span className="text-xs text-neutral-500 dark:text-dark-muted">
            Page {page} / {totalPages} &bull; {filtered.length} résultats
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowImport(false)}>
          <div className="card w-full max-w-md p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Importer des données</h3>
              <button onClick={() => setShowImport(false)} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-dark-border rounded-lg text-neutral-400">
                <X size={15} />
              </button>
            </div>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragOver ? 'border-primary-500 bg-primary-50 dark:bg-blue-900/20' : 'border-neutral-200 dark:border-dark-border'}`}
            >
              <FileSpreadsheet size={36} className="text-neutral-300 dark:text-dark-muted mx-auto mb-3" />
              <p className="text-sm font-medium text-neutral-700 dark:text-dark-text">Glissez votre fichier ici</p>
              <p className="text-xs text-neutral-400 dark:text-dark-muted mt-1">CSV, XLSX — Max 50 MB</p>
              <button className="btn-secondary mt-4 text-xs">Parcourir les fichiers</button>
            </div>
            <div className="mt-4 space-y-2">
              <label className="label">Correspondance des colonnes</label>
              {[['Nom', 'name'], ['Latitude', 'lat'], ['Longitude', 'lng'], ['Zone', 'zone']].map(([f, v]) => (
                <div key={f} className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 dark:text-dark-muted w-20">{f}</span>
                  <select className="input h-7 text-xs flex-1"><option>{v}</option></select>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowImport(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={() => setShowImport(false)} className="btn-primary flex-1 flex items-center justify-center gap-1">
                <Check size={13} />Importer
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <div className="card w-full max-w-md p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Nouveau point</h3>
              <button onClick={() => setShowAdd(false)} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-dark-border rounded-lg text-neutral-400">
                <X size={15} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { l: 'Nom', t: 'text', p: 'Ex: Client Entreprise XYZ' },
                { l: 'Latitude', t: 'number', p: '48.8566' },
                { l: 'Longitude', t: 'number', p: '2.3522' },
              ].map(f => (
                <div key={f.l}>
                  <label className="label">{f.l}</label>
                  <input type={f.t} placeholder={f.p} className="input" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Type</label>
                  <select className="input">
                    <option>client</option>
                    <option>prospect</option>
                    <option>partner</option>
                  </select>
                </div>
                <div>
                  <label className="label">Zone</label>
                  <select className="input">
                    <option>Zone Nord</option>
                    <option>Zone Est</option>
                    <option>Zone Ouest</option>
                    <option>Zone Sud</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={() => setShowAdd(false)} className="btn-primary flex-1 flex items-center justify-center gap-1">
                <Plus size={13} />Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
