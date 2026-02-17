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

export const isSupabaseConfiguredForLogin = isSupabaseConfigured;
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
