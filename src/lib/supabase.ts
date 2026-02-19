import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured = !!(supabaseUrl?.trim() && supabaseAnonKey?.trim());

if (!isSupabaseConfigured) {
  console.error(
    '⚠️ SUPABASE NÃO CONFIGURADO: Edite Portal/.env (local) ou variáveis de ambiente no Vercel: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.\n' +
    'Valores em: Supabase Dashboard → Settings → API'
  );
}

/** Fetch com timeout longo (90s) para auth — evita falha quando Supabase free está “acordando”. */
const AUTH_FETCH_TIMEOUT_MS = 90000;
function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), AUTH_FETCH_TIMEOUT_MS);
  const outerSignal = init?.signal;
  if (outerSignal) {
    outerSignal.addEventListener('abort', () => ctrl.abort(), { once: true });
  }
  return fetch(input, {
    ...init,
    signal: ctrl.signal,
  }).finally(() => clearTimeout(id));
}

export const isSupabaseConfiguredForLogin = isSupabaseConfigured;
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  global: {
    fetch: fetchWithTimeout,
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** Testa se o Supabase responde (força uma requisição ao servidor). */
export async function checkSupabaseConnection(timeoutMs = 15000): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Supabase não configurado (faltam VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY).' };
  }
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), timeoutMs)
  );
  try {
    // Chamada que realmente atinge o servidor (getSession pode vir do cache)
    const p = fetch(`${supabaseUrl!.replace(/\/$/, '')}/auth/v1/health`, {
      headers: { apikey: supabaseAnonKey!, Authorization: `Bearer ${supabaseAnonKey}` },
    }).then((r) => (r.ok ? undefined : Promise.reject(new Error(`HTTP ${r.status}`))));
    await Promise.race([p, timeoutPromise]);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === 'timeout') {
      return {
        ok: false,
        error:
          'O servidor não respondeu a tempo. Se o projeto Supabase estiver no plano free e pausado, abra o Dashboard (app.supabase.com) e reative o projeto. Depois tente o login novamente.',
      };
    }
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      return {
        ok: false,
        error: 'Não foi possível alcançar o Supabase (rede ou URL incorreta). Confira VITE_SUPABASE_URL no Vercel.',
      };
    }
    return { ok: false, error: msg || 'Erro ao conectar no Supabase.' };
  }
}
