import { useState } from 'react';
import { Download, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { AppLayout } from '@/components/layout/AppLayout';
import { Bill } from '@/types';
import { cn } from '@/lib/utils';

const mockBills: Bill[] = [
  {
    id: '1',
    month: 'Fevereiro',
    year: 2026,
    amount: 850.0,
    dueDate: new Date('2026-02-10'),
    status: 'pending',
  },
  {
    id: '2',
    month: 'Janeiro',
    year: 2026,
    amount: 850.0,
    dueDate: new Date('2026-01-10'),
    status: 'paid',
  },
  {
    id: '3',
    month: 'Dezembro',
    year: 2025,
    amount: 850.0,
    dueDate: new Date('2025-12-10'),
    status: 'paid',
  },
  {
    id: '4',
    month: 'Novembro',
    year: 2025,
    amount: 850.0,
    dueDate: new Date('2025-11-10'),
    status: 'paid',
  },
];

const statusConfig = {
  pending: {
    label: 'A vencer',
    icon: Clock,
    class: 'bg-warning/10 text-warning',
    iconClass: 'text-warning',
  },
  paid: {
    label: 'Pago',
    icon: CheckCircle,
    class: 'bg-success/10 text-success',
    iconClass: 'text-success',
  },
  overdue: {
    label: 'Vencido',
    icon: AlertCircle,
    class: 'bg-destructive/10 text-destructive',
    iconClass: 'text-destructive',
  },
};

export default function Bills() {
  const [bills] = useState(mockBills);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <AppLayout>
      <PageHeader title="Boletos" subtitle="Acompanhe seus pagamentos" />

      <div className="px-5 py-4 space-y-4">
        {}
        <Card className="gradient-primary text-primary-foreground border-0">
          <CardContent className="p-5">
            <p className="text-primary-foreground/70 text-sm mb-1">Próximo vencimento</p>
            <p className="text-2xl font-bold font-display mb-2">
              {formatCurrency(bills[0]?.amount || 0)}
            </p>
            <p className="text-sm text-primary-foreground/80">
              Vencimento: {formatDate(bills[0]?.dueDate || new Date())}
            </p>
          </CardContent>
        </Card>

        {}
        <div className="space-y-3">
          <h2 className="text-base font-semibold font-display">Histórico</h2>

          {bills.map((bill) => {
            const status = statusConfig[bill.status];
            const StatusIcon = status.icon;

            return (
              <Card key={bill.id} variant="default">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", status.class)}>
                      <FileText className={cn("h-6 w-6", status.iconClass)} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">
                          {bill.month} {bill.year}
                        </h3>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", status.class)}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Venc: {formatDate(bill.dueDate)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(bill.amount)}</p>
                      <Button variant="ghost" size="sm" className="mt-1 h-8 px-2">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground pt-4">
          Os boletos são sincronizados com a administradora do condomínio
        </p>
      </div>
    </AppLayout>
  );
}
