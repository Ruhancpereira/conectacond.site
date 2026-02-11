import { Home, FileText, MessageSquare, FolderOpen, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const residentNavItems = [
  { icon: Home, label: 'Início', path: '/dashboard' },
  { icon: MessageSquare, label: 'Chamados', path: '/tickets' },
  { icon: FileText, label: 'Boletos', path: '/bills' },
  { icon: FolderOpen, label: 'Documentos', path: '/documents' },
  { icon: User, label: 'Perfil', path: '/profile' },
];

const adminNavItems = [
  { icon: Home, label: 'Início', path: '/admin' },
  { icon: MessageSquare, label: 'Chamados', path: '/admin/tickets' },
  { icon: FolderOpen, label: 'Documentos', path: '/admin/documents' },
  { icon: User, label: 'Perfil', path: '/profile' },
];

export function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = user?.role === 'admin' ? adminNavItems : residentNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[64px]",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
