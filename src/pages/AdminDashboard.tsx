import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, FileText, Bell, ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';

const stats = [
  { label: 'Chamados Abertos', value: 3, icon: AlertCircle, color: 'text-warning' },
  { label: 'Em Andamento', value: 5, icon: Clock, color: 'text-primary' },
  { label: 'Resolvidos (mês)', value: 12, icon: CheckCircle, color: 'text-success' },
];

const recentTickets = [
  {
    id: '1',
    title: 'Vazamento no teto da garagem',
    userName: 'João Silva',
    userUnit: 'Apt 101',
    status: 'open',
    priority: 'high',
    date: '2 horas atrás',
  },
  {
    id: '2',
    title: 'Barulho excessivo no apt 305',
    userName: 'Ana Costa',
    userUnit: 'Apt 204',
    status: 'open',
    priority: 'medium',
    date: '5 horas atrás',
  },
  {
    id: '3',
    title: 'Lâmpada queimada corredor 3º andar',
    userName: 'Pedro Santos',
    userUnit: 'Apt 302',
    status: 'in_progress',
    priority: 'low',
    date: '1 dia atrás',
  },
];

const statusConfig = {
  open: { label: 'Aberto', class: 'bg-warning/10 text-warning' },
  in_progress: { label: 'Em andamento', class: 'bg-primary/10 text-primary' },
  resolved: { label: 'Resolvido', class: 'bg-success/10 text-success' },
  closed: { label: 'Fechado', class: 'bg-muted text-muted-foreground' },
};

const priorityConfig = {
  low: { class: 'border-l-muted-foreground' },
  medium: { class: 'border-l-warning' },
  high: { class: 'border-l-destructive' },
};

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <AppLayout>
      {}
      <div className="gradient-hero px-5 pt-14 pb-8 text-primary-foreground safe-area-top">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 text-sm">Olá,</p>
            <h1 className="text-xl font-display font-bold">{user?.name || 'Síndico'}</h1>
          </div>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-destructive" />
          </Button>
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-6">
        {}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card">
              <CardContent className="p-3 text-center">
                <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold font-display">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {}
        <section>
          <h2 className="text-base font-semibold font-display mb-3">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/tickets">
              <Card variant="interactive">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium text-sm">Chamados</span>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/residents">
              <Card variant="interactive">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <span className="font-medium text-sm">Condôminos</span>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/documents">
              <Card variant="interactive">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-success" />
                  </div>
                  <span className="font-medium text-sm">Documentos</span>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/notifications">
              <Card variant="interactive">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-warning" />
                  </div>
                  <span className="font-medium text-sm">Avisos</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold font-display">Chamados Recentes</h2>
            <Link to="/admin/tickets" className="text-sm text-primary font-medium flex items-center gap-1">
              Ver todos
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentTickets.map((ticket) => {
              const status = statusConfig[ticket.status as keyof typeof statusConfig];
              const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig];

              return (
                <Link key={ticket.id} to={`/admin/tickets/${ticket.id}`}>
                  <Card variant="interactive" className={`border-l-4 ${priority.class}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-medium line-clamp-1 flex-1">{ticket.title}</h3>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${status.class}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{ticket.userName} • {ticket.userUnit}</span>
                        <span>{ticket.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
