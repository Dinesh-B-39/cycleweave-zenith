import { cn } from '@/lib/utils';
import { NavLink } from '@/components/NavLink';
import { useLCA } from '@/context/LCAContext';
import {
  Pickaxe,
  Zap,
  Flame,
  Truck,
  Recycle,
  ScanLine,
  Stethoscope,
  FileText,
  Home,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: ScanLine, label: 'Scan Scrap', path: '/scanner' },
  { icon: Stethoscope, label: 'AI Doctor', path: '/doctor' },
  { icon: FileText, label: 'Passport', path: '/passport' },
];

const tabItems = [
  { icon: Pickaxe, label: '01 Extraction', id: 'extraction' },
  { icon: Zap, label: '02 Energy', id: 'energy' },
  { icon: Flame, label: '03 Smelting', id: 'smelting' },
  { icon: Truck, label: '04 Logistics', id: 'logistics' },
  { icon: Recycle, label: '05 Circularity', id: 'circularity' },
];

interface AppSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { lcaData } = useLCA();

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Recycle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-gradient-teal">CycleWeave</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        <div className="mb-4">
          {!collapsed && (
            <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation
            </span>
          )}
          <div className="mt-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground transition-all',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  collapsed && 'justify-center'
                )}
                activeClassName="bg-primary/10 text-primary neon-border-teal"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Tab Navigation (only on dashboard) */}
        {onTabChange && (
          <div>
            {!collapsed && (
              <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                LCA Modules
              </span>
            )}
            <div className="mt-2 space-y-1">
              {tabItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground transition-all',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    activeTab === item.id && 'bg-primary/10 text-primary',
                    collapsed && 'justify-center'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Metal Type Indicator */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
          {!collapsed && (
            <div>
              <p className="text-xs text-muted-foreground">Active Metal</p>
              <p className="text-sm font-semibold text-foreground">{lcaData.metalType}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
