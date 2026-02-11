import { useState } from 'react';
import { Download, FileText, BookOpen, Shield, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { AppLayout } from '@/components/layout/AppLayout';
import { Document } from '@/types';
import { cn } from '@/lib/utils';

const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Regimento Interno',
    description: 'Normas de convivência e uso das áreas comuns',
    category: 'regulation',
    fileUrl: '#',
    uploadedAt: new Date('2025-06-15'),
  },
  {
    id: '2',
    title: 'Convenção do Condomínio',
    description: 'Estatuto e regras gerais do condomínio',
    category: 'regulation',
    fileUrl: '#',
    uploadedAt: new Date('2025-06-15'),
  },
  {
    id: '3',
    title: 'Política de Segurança',
    description: 'Procedimentos de segurança e emergência',
    category: 'policy',
    fileUrl: '#',
    uploadedAt: new Date('2025-08-20'),
  },
  {
    id: '4',
    title: 'Ata da Assembleia - Janeiro 2026',
    description: 'Decisões tomadas na última assembleia',
    category: 'minutes',
    fileUrl: '#',
    uploadedAt: new Date('2026-01-20'),
  },
  {
    id: '5',
    title: 'Manual do Proprietário',
    description: 'Informações sobre manutenção da unidade',
    category: 'other',
    fileUrl: '#',
    uploadedAt: new Date('2025-03-10'),
  },
];

const categoryConfig = {
  regulation: {
    label: 'Regimento',
    icon: BookOpen,
    class: 'bg-primary/10 text-primary',
  },
  policy: {
    label: 'Política',
    icon: Shield,
    class: 'bg-accent/10 text-accent',
  },
  minutes: {
    label: 'Ata',
    icon: Users,
    class: 'bg-success/10 text-success',
  },
  other: {
    label: 'Outros',
    icon: FileText,
    class: 'bg-muted text-muted-foreground',
  },
};

export default function Documents() {
  const [documents] = useState(mockDocuments);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <AppLayout>
      <PageHeader title="Documentos" subtitle="Acesse os documentos do condomínio" />

      <div className="px-5 py-4 space-y-6">
        {Object.entries(groupedDocuments).map(([category, docs]) => {
          const config = categoryConfig[category as keyof typeof categoryConfig];
          const CategoryIcon = config.icon;

          return (
            <section key={category}>
              <div className="flex items-center gap-2 mb-3">
                <CategoryIcon className={cn("h-5 w-5", config.class.split(' ')[1])} />
                <h2 className="text-base font-semibold font-display">{config.label}</h2>
              </div>

              <div className="space-y-3">
                {docs.map((doc) => (
                  <Card key={doc.id} variant="default">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0", config.class)}>
                          <FileText className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{doc.title}</h3>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                              {doc.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Atualizado em {formatDate(doc.uploadedAt)}
                          </p>
                        </div>

                        <Button variant="soft" size="sm" className="flex-shrink-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </AppLayout>
  );
}
