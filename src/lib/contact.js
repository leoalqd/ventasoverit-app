import { supabase } from './supabaseClient';

export async function fetchContact() {
  const { data, error } = await supabase.from('store_contact').select('*').eq('id', 1).single();
  if (error) throw error;
  return data;
}

export async function saveContact(fields) {
  const { error } = await supabase.from('store_contact').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', 1);
  if (error) throw error;
}

export async function fetchContactImages() {
  const { data, error } = await supabase.from('contact_images').select('*').order('order_index');
  if (error) throw error;
  return data;
}

export async function addContactImage(url) {
  const { error } = await supabase.from('contact_images').insert({ url });
  if (error) throw error;
}

export async function deleteContactImage(id) {
  const { error } = await supabase.from('contact_images').delete().eq('id', id);
  if (error) throw error;
}
