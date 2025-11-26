import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { LivePreview } from './LivePreview';

interface MainLayoutProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  showPreview?: boolean;
}

export function MainLayout({ children, activeTab, onTabChange, showPreview = true }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar activeTab={activeTab} onTabChange={onTabChange} />
      <main className="flex-1 overflow-hidden">{children}</main>
      {showPreview && <LivePreview />}
    </div>
  );
}
