import { ReactNode } from 'react';
import { MobileNav } from './MobileNav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="mobile-container bg-background min-h-screen pb-24">
      {children}
      <MobileNav />
    </div>
  );
}
