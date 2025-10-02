import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Configuración optimizada para evitar connection leaks
const supabaseOptions = {
  auth: {
    persistSession: false, // No mantener sesiones persistentes
    autoRefreshToken: false, // No refrescar tokens automáticamente
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'lectana-backend',
    },
  },
};

export const supabase = createClient(url, anon, supabaseOptions);
export const supabaseAdmin = createClient(url, serviceRole, supabaseOptions);
