import { supabase } from './supabaseClient';

export async function fetchSalesLog() {
  const { data, error } = await supabase
    .from('sales')
    .select('*, items:sale_items(*, variant:product_variants(color, size, product:products(name)))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
