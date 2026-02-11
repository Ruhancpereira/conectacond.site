import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Image } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/PageHeader';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { TicketMessage } from '@/types';
import { cn } from '@/lib/utils';

const mockTicket = {
  id: '1',
  title: 'Vazamento no teto da garagem',
  description: 'Há um vazamento constante no teto da garagem próximo à vaga 15. A água está acumulando e pode causar acidentes.',
  status: 'in_progress',
  priority: 'high',
  category: 'maintenance',
  photos: [],
  createdAt: new Date('2026-01-28'),
  userName: 'João Silva',
  userUnit: 'Apt 101',
  messages: [
    {
      id: '1',
      content: 'Olá! Recebemos seu chamado e já estamos verificando a situação.',
      senderId: 'admin1',
      senderName: 'Maria (Síndica)',
      senderRole: 'admin' as const,
      createdAt: new Date('2026-01-28T14:30:00'),
    },
    {
      id: '2',
      content: 'O encanador irá verificar amanhã às 9h. Pode confirmar se haverá alguém para acompanhar?',
      senderId: 'admin1',
      senderName: 'Maria (Síndica)',
      senderRole: 'admin' as const,
      createdAt: new Date('2026-01-28T14:35:00'),
    },
    {
      id: '3',
      content: 'Sim, estarei disponível. Obrigado pela rapidez!',
      senderId: 'user1',
      senderName: 'João Silva',
      senderRole: 'resident' as const,
      createdAt: new Date('2026-01-28T15:00:00'),
    },
  ],
};

const statusConfig = {
  open: { label: 'Aberto', class: 'bg-warning/10 text-warning' },
  in_progress: { label: 'Em andamento', class: 'bg-primary/10 text-primary' },
  resolved: { label: 'Resolvido', class: 'bg-success/10 text-success' },
  closed: { label: 'Fechado', class: 'bg-muted text-muted-foreground' },
};

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<TicketMessage[]>(mockTicket.messages);

  const ticket = mockTicket;
  const status = statusConfig[ticket.status as keyof typeof statusConfig];

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: TicketMessage = {
      id: Date.now().toString(),
      content: message,
      senderId: user?.id || 'user1',
      senderName: user?.name || 'Você',
      senderRole: user?.role || 'resident',
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <AppLayout>
      <PageHeader title="Detalhes do Chamado" showBack />

      <div className="flex flex-col h-[calc(100vh-140px)]">
        {}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="font-semibold font-display">{ticket.title}</h2>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${status.class}`}>
              {status.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{ticket.description}</p>
        </div>

        {}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg) => {
            const isOwn = msg.senderRole === (user?.role || 'resident');

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[85%]",
                  isOwn ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <span className="text-xs text-muted-foreground mb-1">
                  {msg.senderName}
                </span>
                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl",
                    isOwn
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
              placeholder="Digite sua mensagem..."
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
