import { LogOut, User, Bell, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: User, label: 'Meus Dados', path: '/profile/edit' },
  { icon: Bell, label: 'Notificações', path: '/profile/notifications' },
  { icon: Shield, label: 'Segurança', path: '/profile/security' },
  { icon: HelpCircle, label: 'Ajuda', path: '/help' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppLayout>
      <PageHeader title="Perfil" />

      <div className="px-5 py-6 space-y-6">
        {}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-xl">
            {getInitials(user?.name || 'U')}
          </div>
          <div>
            <h2 className="text-lg font-semibold font-display">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {user?.unit && (
              <p className="text-sm text-muted-foreground">{user.unit}</p>
            )}
          </div>
        </div>

        {}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-4 hover:bg-muted/50 transition-colors",
                  index !== menuItems.length - 1 && "border-b border-border"
                )}
              >
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>

        {}
        <Button
          variant="outline"
          size="lg"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sair da conta
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          CondoGest v1.0.0
        </p>
      </div>
    </AppLayout>
  );
}
