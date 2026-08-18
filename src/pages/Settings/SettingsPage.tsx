import { useState, useEffect, useCallback } from 'react';
import {
  Users, Sliders, Bell, Shield, Database, Plus, CreditCard as Edit2, Trash2, Check,
  X, Search, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserOut } from '../../services/auth';
import {
  listUsersApi, inviteUserApi, updateUserApi, deactivateUserApi,
} from '../../services/users';
import type { InvitePayload, UpdateUserPayload } from '../../services/users';

type SettingsTab = 'users' | 'system' | 'notifications' | 'security' | 'data';

const tabs: { id: SettingsTab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'system', label: 'Système', icon: Sliders },
  { id: 'notifications', label: 'Alertes', icon: Bell },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'data', label: 'Données', icon: Database },
];

const PAGE_SIZE = 20;

const roleBadge = (role: number) =>
  role === 1 ? <span className="badge-danger">Admin</span> : <span className="badge-blue">Analyste</span>;

const statusBadge = (status: string) => {
  if (status === 'active') return <span className="badge-success">Actif</span>;
  if (status === 'pending') return <span className="badge-warning">En attente</span>;
  return <span className="badge-gray">Inactif</span>;
};

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <div className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${checked ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-dark-border'}`} onClick={onChange}>
    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
  </div>
);

// ─── Modales onglet Utilisateurs ────────────────────────────────────────────

function InviteUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (email: string) => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      const payload: InvitePayload = { first_name: firstName, last_name: lastName, email, role };
      await inviteUserApi(payload);
      onSuccess(email);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm card p-6 space-y-4 animate-fade-in">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-dark-text">Inviter un utilisateur</h2>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Prénom</label>
            <input type="text" className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="label">Nom</label>
            <input type="text" className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div>
          <label className="label">Rôle</label>
          <select className="input" value={role} onChange={(e) => setRole(Number(e.target.value))}>
            <option value={1}>Admin</option>
            <option value={2}>Analyste</option>
          </select>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Envoyer l\'invitation'}
        </button>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSuccess }: { user: UserOut; onClose: () => void; onSuccess: () => void }) {
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState(user.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const payload: UpdateUserPayload = { role, status };
      await updateUserApi(user.id, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm card p-6 space-y-4 animate-fade-in">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-dark-text">
            Modifier {user.name ?? `${user.first_name} ${user.last_name}`}
          </h2>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="label">Rôle</label>
          <select className="input" value={role} onChange={(e) => setRole(Number(e.target.value))}>
            <option value={1}>Admin</option>
            <option value={2}>Analyste</option>
          </select>
        </div>

        <div>
          <label className="label">Statut</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Actif</option>
            <option value="pending">En attente</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}

function DeactivateConfirmModal({ onClose, onConfirm, loading, error }: { onClose: () => void; onConfirm: () => void; loading: boolean; error: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm card p-6 space-y-4 animate-fade-in">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-dark-text">Désactiver ce compte ?</h2>
        <p className="text-sm text-neutral-500 dark:text-dark-muted">
          L'utilisateur ne pourra plus se connecter. Cette action peut être annulée plus tard en repassant son statut à "Actif".
        </p>

        {error && (
          <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-danger hover:bg-red-600 text-white rounded-lg text-sm font-medium py-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" /> : 'Désactiver'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 1;

  const [tab, setTab] = useState<SettingsTab>(isAdmin ? 'users' : 'system');
  const [saved, setSaved] = useState(false);

  // Onglet Utilisateurs — données API
  const [users, setUsers] = useState<UserOut[]>([]);
  const [total, setTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserOut | null>(null);
  const [deactivateId, setDeactivateId] = useState<number | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');

  const [notifSettings, setNotifSettings] = useState({
    criticalAlerts: true, zoneWarnings: true, dataImport: true,
    weeklyReport: false, scoreChanges: true, newProspects: false,
  });

  const [systemSettings, setSystemSettings] = useState({
    autoRefresh: true, darkMapDefault: false, clusteringEnabled: true,
    heatmapDefault: false, autoBackup: true, publicAPI: false,
  });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  // Debounce simple sur la recherche pour éviter un appel API par frappe.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, statusFilter]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const res = await listUsersApi({
        q: debouncedSearch || undefined,
        role: roleFilter === '' ? undefined : roleFilter,
        status: statusFilter || undefined,
        page,
        page_size: PAGE_SIZE,
      });
      setUsers(res.items);
      setTotal(res.total);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setUsersLoading(false);
    }
  }, [debouncedSearch, roleFilter, statusFilter, page]);

  useEffect(() => {
    if (tab === 'users' && isAdmin) fetchUsers();
  }, [tab, isAdmin, fetchUsers]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleConfirmDeactivate = async () => {
    if (deactivateId === null) return;
    setDeactivateLoading(true);
    setDeactivateError('');
    try {
      await deactivateUserApi(deactivateId);
      setDeactivateId(null);
      fetchUsers();
    } catch (err) {
      setDeactivateError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setDeactivateLoading(false);
    }
  };

  const visibleTabs = tabs.filter((t) => t.id !== 'users' || isAdmin);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
        {visibleTabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === id ? 'bg-white dark:bg-dark-border text-neutral-900 dark:text-dark-text shadow-sm' : 'text-neutral-500 dark:text-dark-muted hover:text-neutral-700'}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {tab === 'users' && isAdmin && (
        <div className="card overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-neutral-200 dark:border-dark-border flex items-center justify-between flex-wrap gap-2">
            <h3 className="section-title">Gestion des Utilisateurs</h3>
            <button onClick={() => setInviteOpen(true)} className="btn-primary flex items-center gap-1.5 text-xs">
              <Plus size={13} />Inviter un utilisateur
            </button>
          </div>

          <div className="p-4 border-b border-neutral-200 dark:border-dark-border flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher un nom ou un email"
                className="input pl-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input text-sm w-auto"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">Tous les rôles</option>
              <option value={1}>Admin</option>
              <option value={2}>Analyste</option>
            </select>
            <select
              className="input text-sm w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="pending">En attente</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>

          {successMessage && (
            <div className="mx-4 mt-4 flex items-start gap-2 text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
              <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {usersError && (
            <div className="mx-4 mt-4 flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{usersError}</span>
            </div>
          )}

          {usersLoading ? (
            <div className="p-8 text-center text-sm text-neutral-400 dark:text-dark-muted">Chargement…</div>
          ) : (
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
                  {users.map(u => {
                    const displayName = u.name ?? `${u.first_name} ${u.last_name}`;
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-dark-bg/50 transition-colors">
                        <td className="table-td">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {displayName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-medium text-neutral-800 dark:text-dark-text">{displayName}</span>
                          </div>
                        </td>
                        <td className="table-td text-neutral-500 dark:text-dark-muted text-xs">{u.email}</td>
                        <td className="table-td">{roleBadge(u.role)}</td>
                        <td className="table-td">{statusBadge(u.status)}</td>
                        {/* Le backend ne renvoie pas encore de date de dernière connexion */}
                        <td className="table-td text-xs text-neutral-400 dark:text-dark-muted">—</td>
                        <td className="table-td">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => !isSelf && setEditUser(u)}
                              disabled={isSelf}
                              title={isSelf ? 'Vous ne pouvez pas modifier votre propre compte ici' : undefined}
                              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-dark-border rounded-lg text-neutral-400 hover:text-primary-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-400"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => !isSelf && setDeactivateId(u.id)}
                              disabled={isSelf}
                              title={isSelf ? 'Vous ne pouvez pas modifier votre propre compte ici' : undefined}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-neutral-400 hover:text-danger transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-400"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="table-td text-center text-sm text-neutral-400 dark:text-dark-muted py-8">
                        Aucun utilisateur ne correspond à ces critères.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t border-neutral-200 dark:border-dark-border flex items-center justify-between text-xs text-neutral-500 dark:text-dark-muted">
            <span>{total} utilisateur{total > 1 ? 's' : ''}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-dark-border disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span>Page {page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-dark-border disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
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

      {inviteOpen && (
        <InviteUserModal
          onClose={() => setInviteOpen(false)}
          onSuccess={(email) => { fetchUsers(); showSuccess(`Invitation envoyée à ${email}`); }}
        />
      )}

      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSuccess={() => { fetchUsers(); showSuccess('Utilisateur mis à jour'); }}
        />
      )}

      {deactivateId !== null && (
        <DeactivateConfirmModal
          onClose={() => { setDeactivateId(null); setDeactivateError(''); }}
          onConfirm={handleConfirmDeactivate}
          loading={deactivateLoading}
          error={deactivateError}
        />
      )}
    </div>
  );
}
