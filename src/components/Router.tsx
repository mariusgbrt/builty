import { useState, useEffect } from 'react';
import { AppLayout } from './layout/AppLayout';
import { Dashboard } from '../pages/Dashboard';
import { Quotes } from '../pages/sales/Quotes';
import { Invoices } from '../pages/sales/Invoices';
import { Clients } from '../pages/sales/Clients';
import { Projects } from '../pages/Projects';
import { Planning } from '../pages/Planning';
import { Messaging } from '../pages/Messaging';
import { Settings } from '../pages/Settings';
import { useSubscription } from '../hooks/useSubscription';

export function Router() {
  const [currentPath, setCurrentPath] = useState('/dashboard');
  const { subscription, loading } = useSubscription();

  const isActiveSubscription = subscription?.subscription_status === 'active';

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || '/dashboard');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!loading && !isActiveSubscription && currentPath !== '/dashboard') {
      window.location.hash = '/dashboard';
    }
  }, [currentPath, isActiveSubscription, loading]);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  const renderPage = () => {
    if (!isActiveSubscription && currentPath !== '/dashboard') {
      return <Dashboard />;
    }

    if (currentPath === '/dashboard') return <Dashboard />;
    if (currentPath === '/sales/quotes') return <Quotes />;
    if (currentPath === '/sales/invoices') return <Invoices />;
    if (currentPath === '/sales/clients') return <Clients />;
    if (currentPath.startsWith('/sales')) return <Quotes />;
    if (currentPath === '/projects') return <Projects />;
    if (currentPath === '/planning') return <Planning />;
    if (currentPath === '/messaging') return <Messaging />;
    if (currentPath === '/settings') return <Settings />;
    return <Dashboard />;
  };

  return <AppLayout>{renderPage()}</AppLayout>;
}
