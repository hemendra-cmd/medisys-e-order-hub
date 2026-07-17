import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
const supabaseServiceRoleKey =
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ??
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY ??
  '';

const activeKey = supabaseServiceRoleKey || supabaseAnonKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && activeKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, activeKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
