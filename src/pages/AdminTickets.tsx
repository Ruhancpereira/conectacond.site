import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/PageHeader';
import { AppLayout } from '@/components/layout/AppLayout';
import { Ticket } from '@/types';
import { cn } from '@/lib/utils';

const mockTickets: Partial<Ticket>[] = [
  {
    id: '1',
    title: 'Vazamento no teto da garagem',
    description: 'Há um vazamento constante no teto da garagem próximo à vaga 15.',
    status: 'open',
    priority: 'high',
    category: 'maintenance',
    createdAt: new Date('2026-01-30T10:00:00'),
    userName: 'João Silva',
    userUnit: 'Apt 101',
  },
  {
    id: '2',
    title: 'Barulho excessivo no apartamento 305',
    description: 'Música alta frequente após as 22h.',
    status: 'open',
    priority: 'medium',
    category: 'complaint',
    createdAt: new Date('2026-01-30T08:00:00'),
    userName: 'Ana Costa',
    userUnit: 'Apt 204',
  },
  {
    id: '3',
    title: 'Lâmpada queimada no corredor 3º andar',
    description: 'A lâmpada do corredor está queimada há 3 dias.',
    status: 'in_progress',
    priority: 'low',
    category: 'maintenance',
    createdAt: new Date('2026-01-29'),
    userName: 'Pedro Santos',
    userUnit: 'Apt 302',
  },
  {
    id: '4',
    title: 'Sugestão: Bicicletário coberto',
    description: 'Seria ótimo ter uma cobertura para o bicicletário.',
    status: 'open',
    priority: 'low',
    category: 'suggestion',
    createdAt: new Date('2026-01-28'),
    userName: 'Carla Mendes',
    userUnit: 'Apt 405',
  },
  {
    id: '5',
    title: 'Interfone não funciona',
    description: 'O interfone da minha unidade parou de funcionar.',
    status: 'resolved',
    priority: 'high',
    category: 'maintenance',
    createdAt: new Date('2026-01-25'),
    userName: 'Roberto Lima',
    userUnit: 'Apt 102',
  },
];

const statusConfig = {
  open: { label: 'Aberto', class: 'bg-warning/10 text-warning' },
  in_progress: { label: 'Em andamento', class: 'bg-primary/10 text-primary' },
  resolved: { label: 'Resolvido', class: 'bg-success/10 text-success' },
  closed: { label: 'Fechado', class: 'bg-muted text-muted-foreground' },
};

const priorityConfig = {
  low: { label: 'Baixa', class: 'border-l-muted-foreground' },
  medium: { label: 'Média', class: 'border-l-warning' },
  high: { label: 'Alta', class: 'border-l-destructive' },
};

const statusFilters = [
  { value: 'all', label: 'Todos' },
  { value: 'open', label: 'Abertos' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'resolved', label: 'Resolvidos' },
];

export default function AdminTickets() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tickets] = useState(mockTickets);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.userName?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.userUnit?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Agora';
    if (hours < 24) return `${hours}h atrás`;

    const days = Math.floor(hours / 24);
    if (days === 1) return '1 dia atrás';
    if (days < 7) return `${days} dias atrás`;

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Chamados"
        subtitle={`${filteredTickets.length} chamado${filteredTickets.length !== 1 ? 's' : ''}`}
        action={
          <Button variant="ghost" size="icon">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        }
      />

      <div className="px-5 py-4 space-y-4">
        {}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, morador ou unidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>

        {}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter.value)}
              className="flex-shrink-0"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {}
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const status = statusConfig[ticket.status as keyof typeof statusConfig];
            const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig];

            return (
              <Link key={ticket.id} to={`/admin/tickets/${ticket.id}`}>
                <Card variant="interactive" className={cn("border-l-4", priority.class)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-medium line-clamp-2 flex-1">{ticket.title}</h3>
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap", status.class)}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                      {ticket.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium">{ticket.userName} • {ticket.userUnit}</span>
                      <span>{formatDate(ticket.createdAt!)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum chamado encontrado</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
