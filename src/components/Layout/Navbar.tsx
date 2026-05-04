import { useState, useRef, useEffect } from 'react';
import { Search, Sun, Moon, Bell, RefreshCw, LogOut, User, ChevronDown } from 'lucide-react';
import type { Theme, PageId } from '../../types';
import type { UserOut } from '../../services/auth';
import { Avatar } from './Avatar';

const pageTitles: Record<PageId, string> = {
  auth: 'Authentification',
  dashboard: 'Dashboard',
  map: 'Carte Interactive',
  data: 'Gestion des Données',
  analysis: 'Analyse Géospatiale',
  decision: 'Aide à la Décision',
  dashboards: 'Dashboards Avancés',
  reporting: 'Reporting',
  notifications: 'Notifications',
  settings: 'Paramètres',
};

const pageSubs: Partial<Record<PageId, string>> = {
  dashboard: 'Vue d\'ensemble de vos données géospatiales',
  map: 'Visualisation et exploration cartographique',
  analysis: 'Densité, segmentation et couverture territoriale',
  decision: 'Scoring, recommandations et aide à l\'arbitrage',
};

const ROLE_LABELS: Record<number, string> = {
  1: 'Administrateur',
  2: 'Analyste',
};

interface NavbarProps {
  activePage: PageId;
  theme: Theme;
  onThemeToggle: () => void;
  unreadCount: number;
  onNavigate: (page: PageId) => void;
  user: UserOut | null;
  onLogout: () => void;
}

export default function Navbar({ activePage, theme, onThemeToggle, unreadCount, onNavigate, user, onLogout }: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Utilisateur';
  const roleLabel   = user ? (ROLE_LABELS[user.role] ?? `Rôle ${user.role}`) : '';

  return (
    <header className="h-14 bg-white dark:bg-dark-card border-b border-neutral-200 dark:border-dark-border flex items-center px-6 gap-4 shrink-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-neutral-900 dark:text-dark-text leading-none">{pageTitles[activePage]}</h1>
        {pageSubs[activePage] && (
          <p className="text-xs text-neutral-400 dark:text-dark-muted mt-0.5 leading-none">{pageSubs[activePage]}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="input pl-8 w-52 h-8 text-xs"
          />
        </div>

        <button
          onClick={onThemeToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-border text-neutral-500 dark:text-dark-muted transition-colors"
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        </button>

        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-border text-neutral-500 dark:text-dark-muted transition-colors">
          <RefreshCw size={14} />
        </button>

        <button
          onClick={() => onNavigate('notifications')}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-border text-neutral-500 dark:text-dark-muted transition-colors"
        >
          <Bell size={15} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
          )}
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 hover:bg-neutral-100 dark:hover:bg-dark-border transition-colors"
          >
            <Avatar user={user} size={8} />
            <span className="hidden md:block text-xs font-medium text-neutral-700 dark:text-dark-text max-w-[100px] truncate">
              {displayName}
            </span>
            <ChevronDown size={12} className="text-neutral-400 hidden md:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-dark-card border border-neutral-200 dark:border-dark-border rounded-xl shadow-lg z-50 overflow-hidden">
              {/* User info header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 dark:border-dark-border">
                <Avatar user={user} size={8} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-dark-text truncate">{displayName}</p>
                  <p className="text-xs text-neutral-400 dark:text-dark-muted truncate">{roleLabel}</p>
                  {user?.email && (
                    <p className="text-xs text-neutral-400 dark:text-dark-muted truncate">{user.email}</p>
                  )}
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1">
                <button
                  onClick={() => { setDropdownOpen(false); onNavigate('settings'); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-neutral-700 dark:text-dark-text hover:bg-neutral-50 dark:hover:bg-dark-border rounded-lg transition-colors"
                >
                  <User size={13} />
                  Mon profil
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); onLogout(); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut size={13} />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}