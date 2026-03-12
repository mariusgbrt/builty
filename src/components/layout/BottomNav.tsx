import { Home, FileText, HardHat, MessageSquare, Settings } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Accueil', icon: Home, path: '/dashboard' },
  { id: 'sales', label: 'Ventes', icon: FileText, path: '/sales' },
  { id: 'projects', label: 'Chantiers', icon: HardHat, path: '/projects' },
  { id: 'messaging', label: 'Messages', icon: MessageSquare, path: '/messaging' },
  { id: 'settings', label: 'Paramètres', icon: Settings, path: '/settings' },
];

interface BottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  previewMode?: boolean;
}

export function BottomNav({ currentPath, onNavigate, previewMode = false }: BottomNavProps) {
  const isNavItemDisabled = (itemId: string) => {
    if (!previewMode) return false;
    return ['sales', 'projects', 'messaging', 'settings'].includes(itemId);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-50 shadow-lg">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath.startsWith(item.path);
          const isDisabled = isNavItemDisabled(item.id);

          return (
            <button
              key={item.id}
              onClick={() => {
                if (isDisabled) return;
                onNavigate(item.path);
              }}
              disabled={isDisabled}
              className={`relative flex flex-col items-center justify-center flex-1 py-3 px-2 rounded-xl transition-all duration-200 ${
                isDisabled
                  ? 'text-gray-400 cursor-not-allowed opacity-50'
                  : isActive
                  ? 'text-builty-blue bg-builty-blue/10'
                  : 'text-builty-gray-light hover:text-builty-blue'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-builty-blue rounded-full"></div>
              )}
              <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-xs mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
