import { Building2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Welcome() {
  return (
    <div className="mobile-container min-h-screen bg-background">
      {}
      <div className="gradient-hero px-6 pt-16 pb-12 text-primary-foreground">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
            <Building2 className="h-7 w-7" />
          </div>
          <span className="text-xl font-display font-bold">CondoGest</span>
        </div>

        <h1 className="text-3xl font-display font-bold mb-3 text-balance">
          Gestão de condomínio simplificada
        </h1>
        <p className="text-primary-foreground/80 text-base">
          Comunique-se com o síndico, acesse boletos e documentos em um só lugar.
        </p>
      </div>

      {}
      <div className="px-6 -mt-6 space-y-4">
        <Card variant="interactive" className="animate-fade-in">
          <Link to="/login/resident">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold font-display text-foreground">
                    Sou Condômino
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Acesse seus boletos, abra chamados e veja documentos
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card variant="interactive" className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <Link to="/login/admin">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-7 w-7 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold font-display text-foreground">
                    Sou Síndico
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Gerencie chamados e administre o condomínio
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-sm text-muted-foreground">
          Não tem conta?{' '}
          <Link to="/register" className="text-primary font-medium">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
