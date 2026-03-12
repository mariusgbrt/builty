import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useSubscription } from '../../hooks/useSubscription';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [currentPath, setCurrentPath] = useState('/dashboard');
  const { subscription } = useSubscription();

  const isPreviewMode = subscription?.subscription_status !== 'active';

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || '/dashboard');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (path: string) => {
    window.location.hash = path;
  };

  return (
    <div className="min-h-screen bg-builty-gray-lighter">
      <Sidebar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        previewMode={isPreviewMode}
      />

      <div className="md:pl-72 flex flex-col min-h-screen">
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      <BottomNav
        currentPath={currentPath}
        onNavigate={handleNavigate}
        previewMode={isPreviewMode}
      />
    </div>
  );
}
