import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Image, Check, Clock, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/PageHeader';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TicketMessage } from '@/types';
import { cn } from '@/lib/utils';

const mockTicket = {
  id: '1',
  title: 'Vazamento no teto da garagem',
  description: 'Há um vazamento constante no teto da garagem próximo à vaga 15. A água está acumulando e pode causar acidentes. Já tentei falar com o porteiro mas ele disse que precisa ser reportado pelo app.',
  status: 'open',
  priority: 'high',
  category: 'maintenance',
  photos: [],
  createdAt: new Date('2026-01-30T10:00:00'),
  userName: 'João Silva',
  userUnit: 'Apt 101',
  messages: [
    {
      id: '1',
      content: 'Bom dia! Estou reportando esse problema pois está afetando várias vagas.',
      senderId: 'user1',
      senderName: 'João Silva',
      senderRole: 'resident' as const,
      createdAt: new Date('2026-01-30T10:00:00'),
    },
  ],
};

const statusConfig = {
  open: { label: 'Aberto', class: 'bg-warning/10 text-warning', icon: Clock },
  in_progress: { label: 'Em andamento', class: 'bg-primary/10 text-primary', icon: Clock },
  resolved: { label: 'Resolvido', class: 'bg-success/10 text-success', icon: Check },
  closed: { label: 'Fechado', class: 'bg-muted text-muted-foreground', icon: XCircle },
};

const priorityConfig = {
  low: { label: 'Baixa', class: 'text-muted-foreground' },
  medium: { label: 'Média', class: 'text-warning' },
  high: { label: 'Alta', class: 'text-destructive' },
};

export default function AdminTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(mockTicket.status);
  const [messages, setMessages] = useState<TicketMessage[]>(mockTicket.messages);

  const ticket = mockTicket;
  const currentStatus = statusConfig[status as keyof typeof statusConfig];
  const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig];

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: TicketMessage = {
      id: Date.now().toString(),
      content: message,
      senderId: user?.id || 'admin1',
      senderName: user?.name || 'Síndico',
      senderRole: 'admin',
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    toast({
      title: 'Status atualizado',
      description: `O chamado agora está "${statusConfig[newStatus as keyof typeof statusConfig].label}"`,
    });
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <AppLayout>
      <PageHeader title="Detalhes do Chamado" showBack />

      <div className="flex flex-col h-[calc(100vh-140px)]">
        {}
        <div className="px-5 py-4 border-b border-border space-y-4">
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 className="font-semibold font-display text-lg">{ticket.title}</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{ticket.userName}</span>
              <span>•</span>
              <span>{ticket.userUnit}</span>
              <span>•</span>
              <span className={priority.class}>{priority.label}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{ticket.description}</p>

          <p className="text-xs text-muted-foreground">
            Criado em {formatDate(ticket.createdAt)}
          </p>

          {}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Status:</span>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">🟡 Aberto</SelectItem>
                <SelectItem value="in_progress">🔵 Em andamento</SelectItem>
                <SelectItem value="resolved">🟢 Resolvido</SelectItem>
                <SelectItem value="closed">⚫ Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg) => {
            const isAdmin = msg.senderRole === 'admin';

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[85%]",
                  isAdmin ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <span className="text-xs text-muted-foreground mb-1">
                  {msg.senderName} {isAdmin && '(Síndico)'}
                </span>
                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl",
                    isAdmin
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            );
          })}
        </div>

        {}
        <div className="px-5 py-3 border-t border-border bg-card">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <Image className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Responder ao morador..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!message.trim()}
              className="flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
