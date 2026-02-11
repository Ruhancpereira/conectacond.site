import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Building2, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export default function Login() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = role === 'admin';
  const userRole: UserRole = isAdmin ? 'admin' : 'resident';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password, userRole);
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-background">
      {}
      <div className="gradient-hero px-6 pt-12 pb-16 text-primary-foreground">
        <Link to="/" className="flex items-center gap-2 mb-8 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
          ← Voltar
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
            {isAdmin ? (
              <Building2 className="h-8 w-8" />
            ) : (
              <Users className="h-8 w-8" />
            )}
          </div>
        </div>

        <h1 className="text-2xl font-display font-bold">
          {isAdmin ? 'Acesso Síndico' : 'Acesso Condômino'}
        </h1>
        <p className="text-primary-foreground/80 mt-1">
          Entre com seus dados para continuar
        </p>
      </div>

      {}
      <div className="px-6 -mt-8">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/forgot-password" className="text-sm text-primary">
              Esqueci minha senha
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Não tem conta?{' '}
          <Link to="/register" className="text-primary font-medium">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
