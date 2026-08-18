import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './context/AuthContext';
import type { PageId } from './types';

import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';

import AuthPage from './pages/Auth/AuthPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import MapPage from './pages/Map/MapPage';
import DataPage from './pages/Data/DataPage';
import AnalysisPage from './pages/Analysis/AnalysisPage';
import DecisionPage from './pages/Decision/DecisionPage';
import DashboardsPage from './pages/Dashboards/DashboardsPage';
import ReportingPage from './pages/Reporting/ReportingPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import ProfilePage from './pages/Profile/ProfilePage';

import { mockNotifications } from './data/mockData';

export default function App() {
  const { theme, toggle } = useTheme();
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Pas de router dans cette app : le token de reset voyage dans l'URL brute
  // (paramètre `token`, cf. le lien construit par Backend/app/services/email.py)
  // et doit s'afficher quel que soit l'état de connexion, donc vérifié avant
  // isLoading/isAuthenticated ci-dessous.
  const [resetToken, setResetToken] = useState<string | null>(
    () => new URLSearchParams(window.location.search).get('token')
  );

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const clearResetToken = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    url.pathname = '/';
    window.history.replaceState({}, '', url.toString());
    setResetToken(null);
  };

  if (resetToken) {
    return <ResetPasswordPage token={resetToken} onDone={clearResetToken} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-dark-bg">
        <span className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onLogin={login} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage onNavigate={setActivePage} />;
      case 'map': return <MapPage />;
      case 'data': return <DataPage />;
      case 'analysis': return <AnalysisPage />;
      case 'decision': return <DecisionPage />;
      case 'dashboards': return <DashboardsPage />;
      case 'reporting': return <ReportingPage />;
      case 'notifications': return <NotificationsPage />;
      case 'settings': return <SettingsPage />;
      case 'profile': return <ProfilePage />;
      default: return <DashboardPage onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-dark-bg">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        unreadCount={unreadCount}
        user={user}
        onLogout={logout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          activePage={activePage}
          theme={theme}
          onThemeToggle={toggle}
          unreadCount={unreadCount}
          onNavigate={setActivePage}
          user={user}
          onLogout={logout}
        />
        <main className="flex-1 overflow-hidden flex flex-col">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}