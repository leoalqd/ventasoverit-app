import { supabase } from './supabaseClient';

export async function fetchStoreSettings() {
  const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).single();
  if (error) throw error;
  return data;
}

export async function saveStoreSettings(settings) {
  const { error } = await supabase
    .from('store_settings')
    .update({
      sender_name: settings.senderName,
      sender_address: settings.senderAddress,
      sender_city: settings.senderCity,
      sender_province: settings.senderProvince,
      sender_phone: settings.senderPhone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);
  if (error) throw error;
}

// True si todavía falta cargar algún dato del remitente.
export function isSettingsIncomplete(settings) {
  if (!settings) return true;
  return !settings.sender_name || !settings.sender_address || !settings.sender_city || !settings.sender_province || !settings.sender_phone;
}
