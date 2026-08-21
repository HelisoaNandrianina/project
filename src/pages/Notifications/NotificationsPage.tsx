import { useState, useEffect, useMemo } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, Brain, FileText, X, Check, Filter, BellOff, AlertCircle } from 'lucide-react';
import {
  listNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi, deleteNotificationApi,
} from '../../services/notifications';
import type { NotificationOut } from '../../services/notifications';

const typeIcon = (type: string) => {
  const cls = 'shrink-0';
  if (type === 'alert') return <AlertTriangle size={16} className={`text-danger ${cls}`} />;
  if (type === 'warning') return <AlertTriangle size={16} className={`text-warning ${cls}`} />;
  if (type === 'success') return <CheckCircle size={16} className={`text-success ${cls}`} />;
  if (type === 'analysis') return <Brain size={16} className={`text-primary-500 ${cls}`} />;
  if (type === 'report') return <FileText size={16} className={`text-primary-500 ${cls}`} />;
  return <Info size={16} className={`text-primary-500 ${cls}`} />; // fallback : tout type inconnu
};

const typeBg = (type: string) => {
  if (type === 'alert') return 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30';
  if (type === 'warning') return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-800/30';
  if (type === 'success') return 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30';
  return 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30'; // analysis/report/inconnu
};

// ⚠️ Le serveur n'émet aujourd'hui que priority="normal" (+ "high" en théorie) —
// pas de niveau "medium"/"low" fermé, donc tout ce qui n'est pas "high" tombe
// dans un badge neutre plutôt que de forcer un mapping inventé.
const priorityBadge = (priority: string) => {
  if (priority === 'high') return <span className="badge-danger">Haute</span>;
  return <span className="badge-gray">{priority === 'normal' ? 'Normale' : priority}</span>;
};

const priorityLabel = (p: string) => (p === 'all' ? 'Toute priorité' : p === 'high' ? 'Haute' : p === 'normal' ? 'Normale' : p);

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');

  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    setLoadError('');
    listNotificationsApi({ limit: 200 })
      .then(setNotifications)
      .catch(err => setLoadError(err instanceof Error ? err.message : 'Erreur serveur'))
      .finally(() => setLoading(false));
  }, []);

  // Filtres dynamiques : uniquement les valeurs réellement présentes dans les
  // notifications reçues, sinon les types serveur ("analysis","report")
  // n'apparaîtraient jamais.
  const types = useMemo(() => ['all', ...Array.from(new Set(notifications.map(n => n.type)))], [notifications]);
  const priorities = useMemo(() => ['all', ...Array.from(new Set(notifications.map(n => n.priority)))], [notifications]);

  const filtered = notifications.filter(n => {
    const matchType = filterType === 'all' || n.type === filterType;
    const matchPriority = filterPriority === 'all' || n.priority === filterPriority;
    const matchRead = !showUnreadOnly || !n.read;
    return matchType && matchPriority && matchRead;
  });

  const unread = notifications.filter(n => !n.read).length;

  async function markRead(id: string) {
    const prev = notifications;
    setNotifications(ns => ns.map(n => (n.id === id ? { ...n, read: true } : n)));
    try {
      await markNotificationReadApi(id);
    } catch (err) {
      setNotifications(prev);
      setActionError(err instanceof Error ? err.message : 'Erreur serveur');
    }
  }

  async function markAllRead() {
    const prev = notifications;
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
    try {
      await markAllNotificationsReadApi();
    } catch (err) {
      setNotifications(prev);
      setActionError(err instanceof Error ? err.message : 'Erreur serveur');
    }
  }

  async function dismiss(id: string) {
    const prev = notifications;
    setNotifications(ns => ns.filter(n => n.id !== id));
    try {
      await deleteNotificationApi(id);
    } catch (err) {
      setNotifications(prev);
      setActionError(err instanceof Error ? err.message : 'Erreur serveur');
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-sm text-neutral-500 dark:text-dark-muted mt-0.5">
            {unread > 0 ? `${unread} notification(s) non lue(s)` : 'Toutes les notifications sont lues'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button onClick={markAllRead} className="btn-secondary flex items-center gap-1.5 text-xs">
              <Check size={13} />Tout marquer lu
            </button>
          )}
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
          { l: 'Non lues', v: String(unread), c: 'text-primary-500' },
          { l: 'Critiques', v: String(notifications.filter(n => n.priority === 'high').length), c: 'text-danger' },
          { l: 'Analyses', v: String(notifications.filter(n => n.type === 'analysis').length), c: 'text-primary-500' },
          { l: 'Total', v: String(notifications.length), c: 'text-neutral-500 dark:text-dark-muted' },
        ].map((s, i) => (
          <div key={i} className="card p-4">
            <p className={`text-xl font-bold ${s.c}`}>{loading ? '…' : s.v}</p>
            <p className="text-xs text-neutral-500 dark:text-dark-muted mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-0.5 p-1 bg-neutral-100 dark:bg-dark-card border border-neutral-200 dark:border-dark-border rounded-lg">
          {types.map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all capitalize ${filterType === t ? 'bg-white dark:bg-dark-border text-neutral-900 dark:text-dark-text shadow-sm' : 'text-neutral-500 dark:text-dark-muted'}`}>
              {t === 'all' ? 'Tous' : t}
            </button>
          ))}
        </div>

        <div className="flex gap-0.5 p-1 bg-neutral-100 dark:bg-dark-card border border-neutral-200 dark:border-dark-border rounded-lg">
          {priorities.map(p => (
            <button key={p} onClick={() => setFilterPriority(p)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${filterPriority === p ? 'bg-white dark:bg-dark-border text-neutral-900 dark:text-dark-text shadow-sm' : 'text-neutral-500 dark:text-dark-muted'}`}>
              {priorityLabel(p)}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer ml-1">
          <div className={`relative w-8 h-4 rounded-full transition-colors ${showUnreadOnly ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-dark-border'}`}
            onClick={() => setShowUnreadOnly(p => !p)}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform shadow-sm ${showUnreadOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-xs text-neutral-600 dark:text-dark-text">Non lues seulement</span>
        </label>

        <span className="ml-auto text-xs text-neutral-400 dark:text-dark-muted flex items-center gap-1">
          <Filter size={11} />{filtered.length} résultat(s)
        </span>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="card p-12 text-center text-sm text-neutral-400 dark:text-dark-muted">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <BellOff size={36} className="text-neutral-300 dark:text-dark-muted mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-500 dark:text-dark-muted">Aucune notification</p>
            <p className="text-xs text-neutral-400 dark:text-dark-muted mt-1">Modifiez vos filtres pour voir plus de résultats</p>
          </div>
        ) : filtered.map(n => (
          <div key={n.id}
            className={`border rounded-xl p-4 transition-all hover:shadow-card animate-fade-in ${typeBg(n.type)} ${!n.read ? 'ring-1 ring-primary-500/20' : ''}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{typeIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-dark-text">{n.title}</span>
                    {!n.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                    )}
                    {priorityBadge(n.priority)}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read && (
                      <button onClick={() => markRead(n.id)} title="Marquer comme lu"
                        className="p-1.5 hover:bg-white/50 dark:hover:bg-white/10 rounded-lg text-neutral-400 hover:text-success transition-colors">
                        <Check size={13} />
                      </button>
                    )}
                    <button onClick={() => dismiss(n.id)} title="Supprimer"
                      className="p-1.5 hover:bg-white/50 dark:hover:bg-white/10 rounded-lg text-neutral-400 hover:text-danger transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-neutral-600 dark:text-dark-muted mt-1 leading-relaxed">{n.message}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Bell size={10} className="text-neutral-400" />
                  <span className="text-xs text-neutral-400 dark:text-dark-muted">
                    {new Date(n.timestamp).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                  {n.read && <span className="text-xs text-neutral-300 dark:text-dark-muted ml-1">&bull; Lu</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
