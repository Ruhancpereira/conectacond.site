import { MessageSquare, FileText, FolderOpen, Plus, Bell, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';

const quickActions = [
  {
    icon: MessageSquare,
    label: 'Novo Chamado',
    description: 'Abra uma solicitação',
    path: '/tickets/new',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: FileText,
    label: 'Boletos',
    description: 'Visualize seus boletos',
    path: '/bills',
    color: 'bg-success/10 text-success',
  },
  {
    icon: FolderOpen,
    label: 'Documentos',
    description: 'Regimento e políticas',
    path: '/documents',
    color: 'bg-accent/10 text-accent',
  },
];

const recentTickets = [
  {
    id: '1',
    title: 'Vazamento no teto da garagem',
    status: 'in_progress',
    date: '2 dias atrás',
  },
  {
    id: '2',
    title: 'Lâmpada queimada no corredor',
    status: 'resolved',
    date: '1 semana atrás',
  },
];

const statusLabels = {
  open: { label: 'Aberto', class: 'bg-warning/10 text-warning' },
  in_progress: { label: 'Em andamento', class: 'bg-primary/10 text-primary' },
  resolved: { label: 'Resolvido', class: 'bg-success/10 text-success' },
  closed: { label: 'Fechado', class: 'bg-muted text-muted-foreground' },
};

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <AppLayout>
      {}
      <div className="gradient-hero px-5 pt-14 pb-8 text-primary-foreground safe-area-top">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 text-sm">Bem-vindo(a),</p>
            <h1 className="text-xl font-display font-bold">{user?.name || 'Condômino'}</h1>
          </div>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
            <Bell className="h-5 w-5" />
          </Button>
        </div>

        <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/70 text-sm">Unidade</p>
                <p className="text-lg font-semibold">{user?.unit || 'Apt 101'}</p>
              </div>
              <div className="text-right">
                <p className="text-primary-foreground/70 text-sm">Próximo vencimento</p>
                <p className="text-lg font-semibold">10/02/2026</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="px-5 -mt-4 space-y-6">
        {}
        <section>
          <h2 className="text-base font-semibold font-display mb-3">Acesso Rápido</h2>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Link key={action.path} to={action.path}>
                <Card variant="interactive" className="h-full">
                  <CardContent className="p-4 text-center">
                    <div className={`h-12 w-12 rounded-xl ${action.color} flex items-center justify-center mx-auto mb-3`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">{action.label}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold font-display">Meus Chamados</h2>
            <Link to="/tickets" className="text-sm text-primary font-medium flex items-center gap-1">
              Ver todos
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentTickets.map((ticket) => {
              const status = statusLabels[ticket.status as keyof typeof statusLabels];
              return (
                <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
                  <Card variant="interactive">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{ticket.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{ticket.date}</p>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${status.class}`}>
                          {status.label}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {}
        <Link to="/tickets/new" className="fixed right-5 bottom-24 z-50">
          <Button size="lg" className="h-14 w-14 rounded-full shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </AppLayout>
  );
}
