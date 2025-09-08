import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente para operaciones públicas (solo lectura)
export const supabase = createClient(url, anon);

// Cliente admin (permite escribir cualquier cosa desde el backend)
export const supabaseAdmin = createClient(url, serviceRole);
