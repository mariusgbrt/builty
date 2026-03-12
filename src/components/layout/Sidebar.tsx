import { Home, FileText, HardHat, Calendar, MessageSquare, Settings, ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
  subItems?: { id: string; label: string; path: string }[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Accueil', icon: Home, path: '/dashboard' },
  {
    id: 'sales',
    label: 'Ventes',
    icon: FileText,
    path: '/sales',
    subItems: [
      { id: 'quotes', label: 'Devis', path: '/sales/quotes' },
      { id: 'invoices', label: 'Factures', path: '/sales/invoices' },
      { id: 'clients', label: 'Clients', path: '/sales/clients' },
    ],
  },
  { id: 'projects', label: 'Chantiers', icon: HardHat, path: '/projects' },
  { id: 'planning', label: 'Planning', icon: Calendar, path: '/planning' },
  { id: 'messaging', label: 'Messagerie', icon: MessageSquare, path: '/messaging' },
  { id: 'settings', label: 'Paramètres', icon: Settings, path: '/settings' },
];

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  previewMode?: boolean;
}

export function Sidebar({ currentPath, onNavigate, previewMode = false }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['sales']);
  const { profile, signOut } = useAuth();

  const isNavItemDisabled = (itemId: string) => {
    if (!previewMode) return false;
    return ['sales', 'projects', 'planning', 'messaging', 'settings'].includes(itemId);
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-72 bg-white border-r border-gray-100 shadow-sm">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 h-20 px-6 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-builty-blue to-builty-blue-light flex items-center justify-center">
            <img src="/logobuilty.png" alt="Builty" className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-builty-blue to-builty-blue-light bg-clip-text text-transparent">
            Builty
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedItems.includes(item.id);
            const isActive = currentPath.startsWith(item.path);

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (isNavItemDisabled(item.id)) return;
                    if (item.subItems) {
                      toggleExpanded(item.id);
                    } else {
                      onNavigate(item.path);
                    }
                  }}
                  disabled={isNavItemDisabled(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                    isNavItemDisabled(item.id)
                      ? 'text-gray-400 cursor-not-allowed opacity-50'
                      : isActive
                      ? 'bg-builty-blue text-white shadow-md'
                      : 'text-builty-gray hover:bg-builty-gray-lighter'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  {item.subItems && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                {item.subItems && isExpanded && (
                  <div className="mt-1 ml-3 pl-6 border-l-2 border-gray-200 space-y-1">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          if (isNavItemDisabled(item.id)) return;
                          onNavigate(subItem.path);
                        }}
                        disabled={isNavItemDisabled(item.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                          isNavItemDisabled(item.id)
                            ? 'text-gray-400 cursor-not-allowed opacity-50'
                            : currentPath === subItem.path
                            ? 'bg-builty-blue/10 text-builty-blue font-semibold'
                            : 'text-builty-gray-light hover:bg-gray-100'
                        }`}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 px-4 py-3 rounded-xl bg-builty-gray-lighter">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-builty-blue flex items-center justify-center text-white font-bold text-sm">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-builty-gray truncate">{profile?.full_name}</p>
                <p className="text-xs text-builty-gray-light truncate">{profile?.email}</p>
              </div>
            </div>
            <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-builty-blue/10 text-builty-blue text-xs font-bold">
              {profile?.role}
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-builty-gray hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
