// Cliente único de Supabase para toda la app.
// Las credenciales salen de variables de entorno (.env), nunca hardcodeadas.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Faltan las variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Revisá tu archivo .env.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
