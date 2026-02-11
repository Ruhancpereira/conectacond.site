import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState<UserRole>('resident');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [unit, setUnit] = useState('');
  const [condoName, setCondoName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register({
        name,
        email,
        password,
        role,
        unit: role === 'resident' ? unit : undefined,
        condoName: role === 'admin' ? condoName : undefined,
      });
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-background pb-8">
      {}
      <div className="gradient-hero px-6 pt-12 pb-16 text-primary-foreground">
        <Link to="/" className="flex items-center gap-2 mb-8 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
          ← Voltar
        </Link>

        <h1 className="text-2xl font-display font-bold">
          Criar Conta
        </h1>
        <p className="text-primary-foreground/80 mt-1">
          Preencha seus dados para começar
        </p>
      </div>

      {}
      <div className="px-6 -mt-8">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          {}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('resident')}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                role === 'resident'
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <Users className={cn("h-6 w-6", role === 'resident' ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-sm font-medium", role === 'resident' ? "text-primary" : "text-muted-foreground")}>
                Condômino
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole('admin')}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                role === 'admin'
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <Building2 className={cn("h-6 w-6", role === 'admin' ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-sm font-medium", role === 'admin' ? "text-primary" : "text-muted-foreground")}>
                Síndico
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {role === 'resident' && (
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade/Apartamento</Label>
                <Input
                  id="unit"
                  type="text"
                  placeholder="Ex: Apt 101, Bloco A"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                />
              </div>
            )}

            {role === 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="condoName">Nome do Condomínio</Label>
                <Input
                  id="condoName"
                  type="text"
                  placeholder="Nome do seu condomínio"
                  value={condoName}
                  onChange={(e) => setCondoName(e.target.value)}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem conta?{' '}
          <Link to="/" className="text-primary font-medium">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
