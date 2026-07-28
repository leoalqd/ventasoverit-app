import { supabase } from './supabaseClient';

// Trae categorías y arma el árbol (categorías raíz con sus subcategorías adentro).
export async function fetchCategoryTree() {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  const roots = data.filter((c) => !c.parent_id);
  return roots.map((r) => ({ ...r, subcategories: data.filter((c) => c.parent_id === r.id) }));
}

export async function fetchCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function createCategory(name, parentId = null) {
  const { data, error } = await supabase.from('categories').insert({ name, parent_id: parentId }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchBrands() {
  const { data, error } = await supabase.from('brands').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function createBrand(name) {
  const { data, error } = await supabase.from('brands').insert({ name }).select().single();
  if (error) throw error;
  return data;
}
