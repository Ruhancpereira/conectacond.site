import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  unit?: string;
  condoName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_MARKER_KEY = 'conectacond_portal_session_at';

function markSessionActive() {
  try {
    sessionStorage.setItem(SESSION_MARKER_KEY, String(Date.now()));
  } catch {
    /**/
  }
}

function clearSessionMarker() {
  try {
    sessionStorage.removeItem(SESSION_MARKER_KEY);
  } catch {
    /**/
  }
}

function hadRecentSession(withinMs = 300000): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_MARKER_KEY);
    if (!raw) return false;
    const t = Number(raw);
    return !Number.isNaN(t) && Date.now() - t < withinMs;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<User | null> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) return null;

    const { data: authUser } = await supabase.auth.getUser();
    const email = authUser?.user?.email ?? profile.email;

    return {
      id: profile.id,
      name: profile.name || email?.split('@')[0] || 'Usuário',
      email,
      role: (profile.role as UserRole) || 'resident',
      unit: profile.unit ?? undefined,
      condoId: profile.condo_id ?? undefined,
      avatar: profile.avatar ?? undefined,
    };
  };

  const handleSessionChange = async (session: Session | null) => {
    try {
      if (session?.user) {
        markSessionActive();
        const profileUser = await fetchProfile(session.user.id);
        setUser(profileUser);
      } else {
        setUser(null);
        clearSessionMarker();
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    // Timeout de segurança: se Supabase não responder em 8s, mostra a tela de login
    const safetyTimeout = window.setTimeout(() => {
      if (cancelled) return;
      setIsLoading(false);
    }, 8000);

    async function tryRestoreSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        if (!cancelled) await handleSessionChange(session);
        return;
      }
      if (!cancelled && hadRecentSession(300000)) {
        await new Promise((r) => setTimeout(r, 1500));
        const { data: { session: retry } } = await supabase.auth.getSession();
        if (!cancelled && retry?.user) {
          await handleSessionChange(retry);
          return;
        }
      }
      if (!cancelled) handleSessionChange(null);
    }

    tryRestoreSession().catch(() => {
      if (!cancelled) {
        setUser(null);
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session) {
            markSessionActive();
            const profileUser = await fetchProfile(session.user.id);
            setUser(profileUser);
          }
          // Nunca limpar o user quando chega session=null (SIGNED_OUT do Supabase).
          // Evita derrubar por falha de refresh/lentidão. Só sai ao clicar em Sair ou ao recarregar a página.
        } catch {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Só restaura sessão quando há session; não limpa user quando getSession() retorna null
    // (evita derrubar o login por bug/race do cliente Supabase)
    const onVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!cancelled && session) handleSessionChange(session);
        });
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      // Só faz signOut se já houver sessão (evita atrasar o primeiro login e interferir na conclusão)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await supabase.auth.signOut();
      console.log('[ConectaCond] Login: 1/3 chamando Supabase auth...');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      if (!data.session?.user) throw new Error('Erro ao fazer login');
      console.log('[ConectaCond] Login: 2/3 auth ok, buscando perfil...');

      const profileUser = await fetchProfile(data.session.user.id);
      if (!profileUser) throw new Error('Perfil não encontrado');
      console.log('[ConectaCond] Login: 3/3 perfil ok.');

      if (role === 'superAdmin') {
        if (profileUser.role !== 'superAdmin') {
          await supabase.auth.signOut();
          throw new Error('Acesso negado. Apenas administradores do sistema podem acessar.');
        }
      }
    } catch (error: unknown) {
      const rawMessage = error instanceof Error ? error.message : String(error);
      let message = 'Erro ao fazer login';
      if (rawMessage.includes('Email not confirmed') || rawMessage.includes('email')) {
        message = 'E-mail não verificado. Verifique sua caixa de entrada e confirme o cadastro.';
      } else if (/invalid login credentials|invalid_credentials/i.test(rawMessage)) {
        message = 'E-mail ou senha incorretos. Tente novamente.';
      } else if (
        /failed to fetch|networkerror|load failed|network request failed/i.test(rawMessage)
      ) {
        message =
          'Erro de conexão com o servidor. Verifique no Vercel as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY e no Supabase: Authentication → URL Configuration (Site URL / Redirect URLs).';
      } else if (rawMessage) {
        message = rawMessage;
      }
      console.error('[ConectaCond Portal] Erro no login:', error);
      throw new Error(message);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
            unit: data.unit,
            condo_id: data.condoName || 'condo1',
          },
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar';
      console.error('Erro no registro:', error);
      throw new Error(message);
    }
  };

  const logout = async () => {
    clearSessionMarker();
    await supabase.auth.signOut();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const fallbackAuth: AuthContextType = {
  user: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    if (typeof window !== 'undefined' && import.meta.env?.DEV) {
      return fallbackAuth;
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
