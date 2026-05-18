import {
  LayoutDashboard, Map, Database, BarChart3, Brain, TrendingUp,
  FileText, Bell, Settings, ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';
import type { PageId } from '../../types';
import type { UserOut } from '../../services/auth';
import { Avatar } from './Avatar';

const ROLE_LABELS: Record<number, string> = {
  1: 'Administrateur',
  2: 'Analyste',
};

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  collapsed: boolean;
  onToggle: () => void;
  unreadCount: number;
  user: UserOut | null;
  onLogout: () => void;
}

const navItems: { id: PageId; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'map', label: 'Carte Interactive', icon: Map },
  { id: 'data', label: 'Données', icon: Database },
  { id: 'analysis', label: 'Analyse Géo', icon: BarChart3 },
  { id: 'decision', label: 'Aide Décision', icon: Brain },
  { id: 'dashboards', label: 'Dashboards', icon: TrendingUp },
  { id: 'reporting', label: 'Reporting', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export default function Sidebar({ activePage, onNavigate, collapsed, onToggle, unreadCount, user, onLogout }: SidebarProps) {
  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Utilisateur';
  const roleLabel   = user ? (ROLE_LABELS[user.role] ?? `Rôle ${user.role}`) : '';

  return (
    <aside
      className={`
        relative flex flex-col bg-white dark:bg-dark-card border-r border-neutral-200 dark:border-dark-border
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-neutral-200 dark:border-dark-border transition-all duration-300 ${collapsed ? 'justify-center px-2 py-4' : 'px-3 py-3'}`}>
        {collapsed ? (
          /* Sidebar réduite → logo vertical / icône carré GeoPulse */
          <img
            src="/logos/geoPulse-vertical.png"
            alt="GeoPulse"
            className="w-9 h-9 object-contain"
            title="GeoPulse"
          />
        ) : (
          /* Sidebar étendue → logo horizontal GeoPulse + séparateur + logo ISPM */
          <div className="flex items-center justify-between w-full gap-2">
            <img
              src="/logos/geoPulse-horizontal.png"
              alt="GeoPulse"
              className="h-8 object-contain flex-shrink-0"
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-px h-6 bg-neutral-200 dark:bg-dark-border" />
              <img
                src="/logos/ispm-logo.png"
                alt="ISPM"
                className="h-7 object-contain"
                title="ISPM"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              title={collapsed ? label : undefined}
              className={`sidebar-link w-full ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'} ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <div className="relative shrink-0">
                <Icon size={18} />
                {id === 'notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-danger rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User profile + controls */}
      <div className={`p-2 border-t border-neutral-200 dark:border-dark-border ${collapsed ? 'flex flex-col items-center gap-1' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1">
            <Avatar user={user} size={8} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-neutral-900 dark:text-dark-text truncate">{displayName}</p>
              <p className="text-xs text-neutral-400 dark:text-dark-muted truncate">{roleLabel}</p>
            </div>
            <button
              onClick={onLogout}
              title="Se déconnecter"
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-colors"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <>
            <div title={displayName}>
              <Avatar user={user} size={8} />
            </div>
            <button
              onClick={onLogout}
              title="Se déconnecter"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </>
        )}

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-border text-neutral-500 dark:text-dark-muted transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="ml-2 text-xs">Réduire</span>}
        </button>
      </div>
    </aside>
  );
}
