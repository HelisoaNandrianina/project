import { useState } from 'react';
import { Users, Sliders, Bell, Shield, Database, Plus, CreditCard as Edit2, Trash2, Check } from 'lucide-react';
import { mockUsers } from '../../data/mockData';

type SettingsTab = 'users' | 'system' | 'notifications' | 'security' | 'data';

const tabs: { id: SettingsTab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'system', label: 'Système', icon: Sliders },
  { id: 'notifications', label: 'Alertes', icon: Bell },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'data', label: 'Données', icon: Database },
];

const roleLabel: Record<string, string> = { admin: 'Admin', analyst: 'Analyste', 'decision-maker': 'Décideur' };
const roleBadge = (r: string) => {
  if (r === 'admin') return <span className="badge-danger">Admin</span>;
  if (r === 'analyst') return <span className="badge-blue">Analyste</span>;
  return <span className="badge-success">Décideur</span>;
};

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <div className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${checked ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-dark-border'}`} onClick={onChange}>
    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
  </div>
);

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('users');
  const [saved, setSaved] = useState(false);

  const [notifSettings, setNotifSettings] = useState({
    criticalAlerts: true, zoneWarnings: true, dataImport: true,
    weeklyReport: false, scoreChanges: true, newProspects: false,
  });

  const [systemSettings, setSystemSettings] = useState({
    autoRefresh: true, darkMapDefault: false, clusteringEnabled: true,
    heatmapDefault: false, autoBackup: true, publicAPI: false,
  });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Paramètres</h1>
          <p className="text-sm text-neutral-500 dark:text-dark-muted mt-0.5">Configuration système, utilisateurs et préférences</p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center gap-1.5">
          {saved ? <><Check size={14} />Sauvegardé !</> : 'Sauvegarder'}
        </button>
      </div>

      <div className="flex gap-1 overflow-x-auto p-1 bg-neutral-100 dark:bg-dark-card border border-neutral-200 dark:border-dark-border rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === id ? 'bg-white dark:bg-dark-border text-neutral-900 dark:text-dark-text shadow-sm' : 'text-neutral-500 dark:text-dark-muted hover:text-neutral-700'}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="card overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-neutral-200 dark:border-dark-border flex items-center justify-between">
            <h3 className="section-title">Gestion des Utilisateurs</h3>
            <button className="btn-primary flex items-center gap-1.5 text-xs">
              <Plus size={13} />Inviter un utilisateur
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Utilisateur', 'Email', 'Rôle', 'Statut', 'Dernière connexion', 'Actions'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockUsers.map(u => (
                  <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-dark-bg/50 transition-colors">
                    <td className="table-td">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-neutral-800 dark:text-dark-text">{u.name}</span>
                      </div>
                    </td>
                    <td className="table-td text-neutral-500 dark:text-dark-muted text-xs">{u.email}</td>
                    <td className="table-td">{roleBadge(u.role)}</td>
                    <td className="table-td">
                      {u.status === 'active'
                        ? <span className="badge-success">Actif</span>
                        : <span className="badge-gray">Inactif</span>}
                    </td>
                    <td className="table-td text-xs text-neutral-400 dark:text-dark-muted">{u.lastLogin}</td>
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
        </div>
      )}

      {tab === 'system' && (
        <div className="card p-5 animate-fade-in space-y-1">
          <h3 className="section-title mb-4">Configuration Système</h3>
          {[
            { key: 'autoRefresh', label: 'Actualisation automatique', desc: 'Rafraîchir les données toutes les 5 minutes' },
            { key: 'darkMapDefault', label: 'Carte sombre par défaut', desc: 'Utiliser le thème sombre pour la carte' },
            { key: 'clusteringEnabled', label: 'Clustering activé', desc: 'Regrouper les marqueurs proches en clusters' },
            { key: 'heatmapDefault', label: 'Heatmap par défaut', desc: 'Afficher la heatmap au chargement de la carte' },
            { key: 'autoBackup', label: 'Sauvegarde automatique', desc: 'Backup quotidien à 2h00 (UTC)' },
            { key: 'publicAPI', label: 'API publique', desc: 'Activer l\'accès à l\'API REST publique' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-dark-border last:border-0">
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-dark-text">{label}</p>
                <p className="text-xs text-neutral-400 dark:text-dark-muted mt-0.5">{desc}</p>
              </div>
              <Toggle
                checked={systemSettings[key as keyof typeof systemSettings]}
                onChange={() => setSystemSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof systemSettings] }))}
              />
            </div>
          ))}
          <div className="pt-4 grid grid-cols-2 gap-4">
            {[
              { l: 'Fuseau horaire', v: 'Europe/Paris (UTC+2)' },
              { l: 'Langue', v: 'Français' },
              { l: 'Unité distance', v: 'Kilomètres' },
              { l: 'Format date', v: 'JJ/MM/AAAA' },
            ].map((s, i) => (
              <div key={i}>
                <label className="label">{s.l}</label>
                <select className="input text-sm"><option>{s.v}</option></select>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="card p-5 animate-fade-in space-y-1">
          <h3 className="section-title mb-4">Paramètres des Alertes</h3>
          {[
            { key: 'criticalAlerts', label: 'Alertes critiques', desc: 'Notifier si un score de zone passe en dessous de 40' },
            { key: 'zoneWarnings', label: 'Avertissements de zone', desc: 'Score en baisse de plus de 5 points' },
            { key: 'dataImport', label: 'Import de données', desc: 'Confirmer les imports réussis ou échoués' },
            { key: 'weeklyReport', label: 'Rapport hebdomadaire', desc: 'Envoi automatique chaque lundi matin' },
            { key: 'scoreChanges', label: 'Changements de score', desc: 'Tout changement de score significatif' },
            { key: 'newProspects', label: 'Nouveaux prospects', desc: 'Notification pour chaque prospect qualifié' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-dark-border last:border-0">
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-dark-text">{label}</p>
                <p className="text-xs text-neutral-400 dark:text-dark-muted mt-0.5">{desc}</p>
              </div>
              <Toggle
                checked={notifSettings[key as keyof typeof notifSettings]}
                onChange={() => setNotifSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof notifSettings] }))}
              />
            </div>
          ))}
        </div>
      )}

      {tab === 'security' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5 space-y-4">
            <h3 className="section-title">Authentification</h3>
            <div>
              <label className="label">Durée session</label>
              <select className="input max-w-xs">
                <option>8 heures</option>
                <option>24 heures</option>
                <option>7 jours</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-neutral-100 dark:border-dark-border">
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-dark-text">Authentification 2FA</p>
                <p className="text-xs text-neutral-400 dark:text-dark-muted">Requiert un code OTP à chaque connexion</p>
              </div>
              <Toggle checked={true} onChange={() => {}} />
            </div>
          </div>
          <div className="card p-5 space-y-3">
            <h3 className="section-title">Journal d'accès</h3>
            <div className="space-y-2">
              {[
                { u: 'Sophie Martin', a: 'Connexion', t: 'Aujourd\'hui 09:32', ip: '192.168.1.42' },
                { u: 'Lucas Bernard', a: 'Export rapport', t: 'Aujourd\'hui 08:15', ip: '10.0.0.88' },
                { u: 'Emma Dubois', a: 'Connexion', t: 'Hier 17:44', ip: '172.16.0.5' },
              ].map((e, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-dark-border last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-50 dark:bg-blue-900/20 text-primary-500 flex items-center justify-center text-xs font-bold">
                      {e.u.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-800 dark:text-dark-text">{e.u}</p>
                      <p className="text-xs text-neutral-400 dark:text-dark-muted">{e.a}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500 dark:text-dark-muted">{e.t}</p>
                    <p className="text-xs font-mono text-neutral-400 dark:text-dark-muted">{e.ip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'data' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5">
            <h3 className="section-title mb-4">Gestion des Données</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { l: 'Volume total', v: '416 points', sub: '3.2 MB' },
                { l: 'Dernière sauvegarde', v: 'Auj. 03:00', sub: 'Succès' },
                { l: 'Rétention', v: '24 mois', sub: 'Politique active' },
              ].map((m, i) => (
                <div key={i} className="bg-neutral-50 dark:bg-dark-bg rounded-xl p-4 text-center">
                  <p className="text-base font-bold text-neutral-900 dark:text-dark-text">{m.v}</p>
                  <p className="text-xs text-neutral-500 dark:text-dark-muted mt-0.5">{m.l}</p>
                  <span className="badge-success text-xs mt-1">{m.sub}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="section-title mb-3">Sources de données</h3>
            <div className="space-y-2">
              {[
                { name: 'Import CSV Manuel', status: 'active', last: 'Il y a 2h' },
                { name: 'API REST GeoData', status: 'active', last: 'Il y a 5 min' },
                { name: 'Sync CRM Salesforce', status: 'inactive', last: 'Il y a 3j' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-dark-bg rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${s.status === 'active' ? 'bg-success' : 'bg-neutral-300 dark:bg-dark-muted'}`} />
                    <span className="text-sm font-medium text-neutral-800 dark:text-dark-text">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400 dark:text-dark-muted">{s.last}</span>
                    <span className={s.status === 'active' ? 'badge-success' : 'badge-gray'}>
                      {s.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
