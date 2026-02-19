import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2, Lock, Mail, AlertCircle, Wifi, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfiguredForLogin, checkSupabaseConnection } from '@/lib/supabase';

export default function SystemLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfiguredForLogin) return;
    let cancelled = false;
    setConnectionStatus('checking');
    checkSupabaseConnection(20000)
      .then(({ ok, error: err }) => {
        if (cancelled) return;
        setConnectionStatus(ok ? 'ok' : 'fail');
        setConnectionError(ok ? null : err ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setConnectionStatus('fail');
          setConnectionError('Erro ao verificar conexão.');
        }
      });
    return () => { cancelled = true; };
  }, []);

  const WARMUP_TIMEOUT_MS = 35000;  // 35s para /auth/v1/health (projeto pausado pode demorar)
  const LOGIN_TIMEOUT_MS = 90000;   // 90s para login (já temos fetch 90s no cliente; este é fallback)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1) Aquecer conexão: garante que o Supabase está acordado antes do login (evita timeout no free tier)
      if (connectionStatus !== 'ok') {
        const warm = await checkSupabaseConnection(WARMUP_TIMEOUT_MS);
        if (!warm.ok) {
          const retry = await checkSupabaseConnection(WARMUP_TIMEOUT_MS);
          if (!retry.ok) {
            setError(
              'O servidor não respondeu. Se o projeto Supabase (plano free) estiver pausado, abra app.supabase.com, abra o projeto e aguarde reativar. Depois clique em "Tentar novamente".'
            );
            return;
          }
        }
        setConnectionStatus('ok');
        setConnectionError(null);
      }

      // 2) Login com timeout de segurança (cliente Supabase já usa fetch 90s)
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), LOGIN_TIMEOUT_MS)
      );
      await Promise.race([login(email, password, 'superAdmin'), timeoutPromise]);
      navigate('/system/licenses');
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message === 'timeout') {
        setError(
          'O servidor demorou para responder (até 90s). Projeto Supabase no plano free pode estar pausado: acesse app.supabase.com, abra o projeto e aguarde reativar. Depois clique em "Tentar novamente".'
        );
      } else {
        setError(message || 'Credenciais inválidas');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary/20 to-slate-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,white,transparent)] animate-pulse" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-slate-700/50 bg-slate-800/80 backdrop-blur-xl animate-in zoom-in-95 duration-300 hover:shadow-3xl hover:-translate-y-1 transition-all">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-xl shadow-primary/40 animate-in zoom-in-95 duration-300 hover:scale-110 transition-transform duration-300">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-500">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-primary-foreground to-white bg-clip-text text-transparent">
              Painel Administrativo
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              Acesso exclusivo para desenvolvedores e comercializadores
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isSupabaseConfiguredForLogin && (
            <div className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Supabase não configurado</p>
                <p className="text-amber-300/90 mt-1">
                  No Vercel, defina as variáveis de ambiente: <strong>VITE_SUPABASE_URL</strong> e{' '}
                  <strong>VITE_SUPABASE_ANON_KEY</strong> (Settings → Environment Variables). Depois faça um novo deploy.
                </p>
              </div>
            </div>
          )}

          {isSupabaseConfiguredForLogin && connectionStatus === 'checking' && (
            <div className="text-sm text-slate-400 bg-slate-700/30 border border-slate-600 p-3 rounded-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
              Verificando conexão com o Supabase...
            </div>
          )}
          {isSupabaseConfiguredForLogin && connectionStatus === 'ok' && (
            <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              Conectado ao Supabase. Pode fazer login.
            </div>
          )}
          {isSupabaseConfiguredForLogin && connectionStatus === 'fail' && connectionError && (
            <div className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg flex items-start gap-2">
              <Wifi className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Problema de conexão</p>
                <p className="text-amber-300/90 mt-1">{connectionError}</p>
                <p className="text-amber-300/80 mt-2 text-xs">
                  No Vercel, confira VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. Se o projeto Supabase estiver pausado, abra o Dashboard (app.supabase.com) para reativar.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 border-amber-500/50 text-amber-300 hover:bg-amber-500/20"
                  onClick={() => {
                    setConnectionStatus('checking');
                    setConnectionError(null);
                    checkSupabaseConnection(20000).then(({ ok, error: err }) => {
                      setConnectionStatus(ok ? 'ok' : 'fail');
                      setConnectionError(ok ? null : err ?? null);
                    }).catch(() => {
                      setConnectionStatus('fail');
                      setConnectionError('Erro ao verificar conexão.');
                    });
                  }}
                >
                  Testar conexão novamente
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 animate-in fade-in duration-300" style={{ animationDelay: '200ms' }}>
              <Label htmlFor="email" className="text-slate-300 font-medium">E-mail</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors duration-200" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@conectacond.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200 hover:bg-slate-700/70"
                />
              </div>
            </div>

            <div className="space-y-2 animate-in fade-in duration-300" style={{ animationDelay: '300ms' }}>
              <Label htmlFor="password" className="text-slate-300 font-medium">Senha</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors duration-200" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200 hover:bg-slate-700/70"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg space-y-2 animate-in slide-in-from-top-2 duration-300 shadow-lg shadow-red-500/10">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                {(error.includes('demorou') || error.includes('não respondeu')) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-red-500/50 text-red-300 hover:bg-red-500/20"
                    onClick={() => { setError(''); handleSubmit({ preventDefault: () => {} } as React.FormEvent); }}
                  >
                    Tentar novamente
                  </Button>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary hover:to-primary/90 text-white font-semibold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] animate-in fade-in duration-300"
              style={{ animationDelay: '400ms' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Acessar Painel
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-700">
            <div className="text-center text-xs text-slate-400 space-y-1">
              <p className="font-medium">Sistema de Gestão de Licenças</p>
              <p>ConectaCond - Versão Administrativa</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
