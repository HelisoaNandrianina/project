import { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, X, Check, Filter, BellOff } from 'lucide-react';
import { mockNotifications } from '../../data/mockData';
import type { Notification } from '../../types';

type FilterType = 'all' | 'alert' | 'warning' | 'info' | 'success';
type FilterPriority = 'all' | 'high' | 'medium' | 'low';

const typeIcon = (type: Notification['type']) => {
  const cls = 'shrink-0';
  if (type === 'alert') return <AlertTriangle size={16} className={`text-danger ${cls}`} />;
  if (type === 'warning') return <AlertTriangle size={16} className={`text-warning ${cls}`} />;
  if (type === 'success') return <CheckCircle size={16} className={`text-success ${cls}`} />;
  return <Info size={16} className={`text-primary-500 ${cls}`} />;
};

const typeBg = (type: Notification['type']) => {
  if (type === 'alert') return 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30';
  if (type === 'warning') return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-800/30';
  if (type === 'success') return 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30';
  return 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30';
};

export default function NotificationsPage() {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const filtered = notifications.filter(n => {
    const matchType = filterType === 'all' || n.type === filterType;
    const matchPriority = filterPriority === 'all' || n.priority === filterPriority;
    const matchRead = !showUnreadOnly || !n.read;
    return matchType && matchPriority && matchRead;
  });

  const unread = notifications.filter(n => !n.read).length;

  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: 'Non lues', v: String(unread), c: 'text-primary-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { l: 'Critiques', v: String(notifications.filter(n => n.priority === 'high').length), c: 'text-danger', bg: 'bg-red-50 dark:bg-red-900/20' },
          { l: 'Avertissements', v: String(notifications.filter(n => n.type === 'warning').length), c: 'text-warning', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { l: 'Total', v: String(notifications.length), c: 'text-neutral-500 dark:text-dark-muted', bg: '' },
        ].map((s, i) => (
          <div key={i} className="card p-4">
            <p className={`text-xl font-bold ${s.c}`}>{s.v}</p>
            <p className="text-xs text-neutral-500 dark:text-dark-muted mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-0.5 p-1 bg-neutral-100 dark:bg-dark-card border border-neutral-200 dark:border-dark-border rounded-lg">
          {(['all', 'alert', 'warning', 'success', 'info'] as FilterType[]).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all capitalize ${filterType === t ? 'bg-white dark:bg-dark-border text-neutral-900 dark:text-dark-text shadow-sm' : 'text-neutral-500 dark:text-dark-muted'}`}>
              {t === 'all' ? 'Tous' : t}
            </button>
          ))}
        </div>

        <div className="flex gap-0.5 p-1 bg-neutral-100 dark:bg-dark-card border border-neutral-200 dark:border-dark-border rounded-lg">
          {(['all', 'high', 'medium', 'low'] as FilterPriority[]).map(p => (
            <button key={p} onClick={() => setFilterPriority(p)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${filterPriority === p ? 'bg-white dark:bg-dark-border text-neutral-900 dark:text-dark-text shadow-sm' : 'text-neutral-500 dark:text-dark-muted'}`}>
              {p === 'all' ? 'Toute priorité' : p === 'high' ? 'Haute' : p === 'medium' ? 'Moyenne' : 'Faible'}
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
        {filtered.length === 0 ? (
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
                    <span className={n.priority === 'high' ? 'badge-danger' : n.priority === 'medium' ? 'badge-warning' : 'badge-success'}>
                      {n.priority === 'high' ? 'Haute' : n.priority === 'medium' ? 'Moyenne' : 'Faible'}
                    </span>
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
                  <span className="text-xs text-neutral-400 dark:text-dark-muted">{n.timestamp}</span>
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
