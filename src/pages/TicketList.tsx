import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/PageHeader';
import { AppLayout } from '@/components/layout/AppLayout';
import { Ticket } from '@/types';

const mockTickets: Partial<Ticket>[] = [
  {
    id: '1',
    title: 'Vazamento no teto da garagem',
    description: 'Há um vazamento constante no teto da garagem próximo à vaga 15.',
    status: 'in_progress',
    priority: 'high',
    category: 'maintenance',
    createdAt: new Date('2026-01-28'),
    userName: 'João Silva',
    userUnit: 'Apt 101',
  },
  {
    id: '2',
    title: 'Lâmpada queimada no corredor',
    description: 'A lâmpada do corredor do 3º andar está queimada.',
    status: 'resolved',
    priority: 'low',
    category: 'maintenance',
    createdAt: new Date('2026-01-22'),
    userName: 'João Silva',
    userUnit: 'Apt 101',
  },
  {
    id: '3',
    title: 'Sugestão: academia no salão',
    description: 'Seria ótimo ter equipamentos de academia no salão de festas.',
    status: 'open',
    priority: 'low',
    category: 'suggestion',
    createdAt: new Date('2026-01-20'),
    userName: 'João Silva',
    userUnit: 'Apt 101',
  },
];

const statusConfig = {
  open: { label: 'Aberto', class: 'bg-warning/10 text-warning' },
  in_progress: { label: 'Em andamento', class: 'bg-primary/10 text-primary' },
  resolved: { label: 'Resolvido', class: 'bg-success/10 text-success' },
  closed: { label: 'Fechado', class: 'bg-muted text-muted-foreground' },
};

const priorityConfig = {
  low: { label: 'Baixa', class: 'text-muted-foreground' },
  medium: { label: 'Média', class: 'text-warning' },
  high: { label: 'Alta', class: 'text-destructive' },
};

export default function TicketList() {
  const [search, setSearch] = useState('');
  const [tickets] = useState(mockTickets);

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.title?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Meus Chamados"
        action={
          <Button variant="ghost" size="icon">
            <Filter className="h-5 w-5" />
          </Button>
        }
      />

      <div className="px-5 py-4 space-y-4">
        {}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar chamados..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>

        {}
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const status = statusConfig[ticket.status as keyof typeof statusConfig];
            const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig];

            return (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
                <Card variant="interactive">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-medium line-clamp-2 flex-1">{ticket.title}</h3>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${status.class}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {ticket.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Prioridade: <span className={priority.class}>{priority.label}</span></span>
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

      {}
      <Link to="/tickets/new" className="fixed right-5 bottom-24 z-50">
        <Button size="lg" className="h-14 w-14 rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </AppLayout>
  );
}
