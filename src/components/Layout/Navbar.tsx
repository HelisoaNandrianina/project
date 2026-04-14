import { Search, Sun, Moon, Bell, RefreshCw } from 'lucide-react';
import type { Theme, PageId } from '../../types';

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

interface NavbarProps {
  activePage: PageId;
  theme: Theme;
  onThemeToggle: () => void;
  unreadCount: number;
  onNavigate: (page: PageId) => void;
}

export default function Navbar({ activePage, theme, onThemeToggle, unreadCount, onNavigate }: NavbarProps) {
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

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
          SM
        </div>
      </div>
    </header>
  );
}
