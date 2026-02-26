import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Key, BarChart3, Settings, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import conectacondLogo from '@/assets/conectacond-logo.png';

interface SystemLayoutProps {
  children: ReactNode;
}

export function SystemLayout({ children }: SystemLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/system/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    {
      title: 'Condomínios',
      href: '/system/condos',
      icon: Building2,
      active: location.pathname.startsWith('/system/condos'),
    },
    {
      title: 'Licenças',
      href: '/system/licenses',
      icon: Key,
      active: location.pathname.startsWith('/system/licenses'),
    },
    {
      title: 'Relatórios',
      href: '/system/reports',
      icon: BarChart3,
      active: location.pathname.startsWith('/system/reports'),
    },
    {
      title: 'Configurações',
      href: '/system/settings',
      icon: Settings,
      active: location.pathname.startsWith('/system/settings'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex">
      <aside className="w-64 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-700 flex flex-col fixed h-screen shadow-xl z-10">
        <div className="p-6 border-b border-slate-200/80 dark:border-slate-700 bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10">
          <Link to="/system/licenses" className="flex items-center gap-3 group">
            <img src={conectacondLogo} alt="ConectaCond" className="h-12 w-auto object-contain flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <div>
              <h1 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">ConectaCond</h1>
              <p className="text-xs text-muted-foreground dark:text-slate-400">Painel Administrativo</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.active;

            return (
              <Link 
                key={item.href} 
                to={item.href}
                className="block animate-in fade-in duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 transition-all duration-200 relative overflow-hidden group",
                    isActive 
                      ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-semibold shadow-md shadow-primary/10 border-l-4 border-primary" 
                      : "hover:bg-primary/5 hover:text-primary hover:translate-x-1"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50" />
                  )}
                  <Icon className={cn(
                    "h-5 w-5 relative z-10 transition-transform duration-200",
                    isActive && "scale-110"
                  )} />
                  <span className="relative z-10">{item.title}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/80 dark:border-slate-700 bg-gradient-to-t from-slate-50/50 to-transparent dark:from-slate-800/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-auto p-3 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 group rounded-xl"
              >
                <Avatar className="h-10 w-10 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-200">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold shadow-md">
                    {user ? getInitials(user.name) : 'AD'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {user?.name || 'Administrador'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || 'admin@conectacond.com'}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 shadow-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name || 'Administrador'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || 'admin@conectacond.com'}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-destructive cursor-pointer hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <div className="flex-1 ml-64">
        <main className="p-8 animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
