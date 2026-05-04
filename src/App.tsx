import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './context/AuthContext';
import type { PageId } from './types';

import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';

import AuthPage from './pages/Auth/AuthPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import MapPage from './pages/Map/MapPage';
import DataPage from './pages/Data/DataPage';
import AnalysisPage from './pages/Analysis/AnalysisPage';
import DecisionPage from './pages/Decision/DecisionPage';
import DashboardsPage from './pages/Dashboards/DashboardsPage';
import ReportingPage from './pages/Reporting/ReportingPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import SettingsPage from './pages/Settings/SettingsPage';

import { mockNotifications } from './data/mockData';

export default function App() {
  const { theme, toggle } = useTheme();
  const { isAuthenticated, user, login, logout } = useAuth();
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const unreadCount = mockNotifications.filter(n => !n.read).length;

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