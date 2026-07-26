import { supabase } from './supabaseClient';

export async function fetchBanners(section) {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('section', section)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Sube una imagen al storage de Supabase y devuelve su URL pública.
 */
export async function uploadBannerImage(file) {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
  const { error: uploadError } = await supabase.storage.from('banners').upload(path, file);
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from('banners').getPublicUrl(path);
  return data.publicUrl;
}

export async function createBanner(section, imageUrl, linkUrl = '') {
  const { error } = await supabase.from('banners').insert({
    section,
    image_url: imageUrl,
    link_url: linkUrl || null,
  });
  if (error) throw error;
}

export async function deleteBanner(id) {
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) throw error;
}
