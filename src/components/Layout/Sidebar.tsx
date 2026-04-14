import {
  LayoutDashboard, Map, Database, BarChart3, Brain, TrendingUp,
  FileText, Bell, Settings, Globe, ChevronLeft, ChevronRight,
} from 'lucide-react';
import type { PageId } from '../../types';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  collapsed: boolean;
  onToggle: () => void;
  unreadCount: number;
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

export default function Sidebar({ activePage, onNavigate, collapsed, onToggle, unreadCount }: SidebarProps) {
  return (
    <aside
      className={`
        relative flex flex-col bg-white dark:bg-dark-card border-r border-neutral-200 dark:border-dark-border
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      <div className={`flex items-center gap-2.5 px-4 py-4 border-b border-neutral-200 dark:border-dark-border ${collapsed ? 'justify-center px-0' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shrink-0">
          <Globe size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-neutral-900 dark:text-dark-text leading-none">GeoPulse</p>
            <p className="text-xs text-neutral-400 dark:text-dark-muted leading-none mt-0.5">Data Platform</p>
          </div>
        )}
      </div>

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

      <div className={`p-2 border-t border-neutral-200 dark:border-dark-border ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              SM
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-neutral-900 dark:text-dark-text truncate">Sophie Martin</p>
              <p className="text-xs text-neutral-400 dark:text-dark-muted truncate">Admin</p>
            </div>
          </div>
        )}
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
