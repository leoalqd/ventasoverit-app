import { supabase } from './supabaseClient';
import { generateSku, generateBarcodeValue } from './barcode';

/**
 * Sube una foto al storage de Supabase (bucket "productos") y devuelve su URL pública.
 * Se usa tanto para fotos de producto como de variante.
 */
export async function uploadProductImage(file) {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
  const { error: uploadError } = await supabase.storage.from('productos').upload(path, file);
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from('productos').getPublicUrl(path);
  return data.publicUrl;
}

export async function fetchProducts(search = '') {
  let query = supabase
    .from('products')
    .select('*, category:categories(id, name, parent_id), brand:brands(name), variants:product_variants(*, images:variant_images(*)), images:product_images(*)')
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,internal_code.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createProduct({ name, description, internalCode, purchasePrice, salePrice, categoryId, variants }) {
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name,
      description: description || null,
      internal_code: internalCode,
      purchase_price: purchasePrice,
      sale_price: salePrice,
      category_id: categoryId || null,
    })
    .select()
    .single();
  if (error) throw error;

  const variantRows = variants.map((v) => ({
    product_id: product.id,
    color: v.color,
    size: v.size,
    stock: v.stock ?? 0,
    min_stock: v.minStock ?? 0,
    sku: generateSku(internalCode, v.color, v.size),
    barcode: generateBarcodeValue(),
  }));

  const { error: variantError } = await supabase.from('product_variants').insert(variantRows);
  if (variantError) throw variantError;

  return product;
}

export async function addVariant(productId, internalCode, { color, size, stock = 0, minStock = 0 }) {
  const { data, error } = await supabase
    .from('product_variants')
    .insert({
      product_id: productId,
      color,
      size,
      stock,
      min_stock: minStock,
      sku: generateSku(internalCode, color, size),
      barcode: generateBarcodeValue(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(productId, { name, description, internalCode, purchasePrice, salePrice, categoryId }) {
  const { error } = await supabase
    .from('products')
    .update({
      name,
      description: description || null,
      internal_code: internalCode,
      purchase_price: purchasePrice,
      sale_price: salePrice,
      category_id: categoryId || null,
    })
    .eq('id', productId);
  if (error) throw error;
}

export async function updateVariant(variantId, { color, size, stock, minStock }) {
  const { error } = await supabase
    .from('product_variants')
    .update({ color, size, stock, min_stock: minStock })
    .eq('id', variantId);
  if (error) throw error;
}

export async function deleteVariant(variantId) {
  const { error } = await supabase.from('product_variants').delete().eq('id', variantId);
  if (error) throw error;
}

export async function updateVariantStock(variantId, newStock, userId, reason = 'Ajuste manual') {
  const { error } = await supabase
    .from('product_variants')
    .update({ stock: newStock })
    .eq('id', variantId);
  if (error) throw error;

  await supabase.from('stock_movements').insert({
    variant_id: variantId,
    type: 'ADJUSTMENT',
    quantity: newStock,
    reason,
    user_id: userId,
  });
}

export async function findVariantByBarcode(barcode) {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*, product:products(*)')
    .eq('barcode', barcode)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteProduct(productId) {
  const { error } = await supabase.from('products').update({ status: 'INACTIVE' }).eq('id', productId);
  if (error) throw error;
}

// ---- Fotos de producto (hasta 4, opcionales) ----
export async function addProductImage(productId, url) {
  const { error } = await supabase.from('product_images').insert({ product_id: productId, url });
  if (error) throw error;
}

export async function deleteProductImage(imageId) {
  const { error } = await supabase.from('product_images').delete().eq('id', imageId);
  if (error) throw error;
}

// ---- Fotos de variante / color (hasta 4, opcionales) ----
export async function addVariantImage(variantId, url) {
  const { error } = await supabase.from('variant_images').insert({ variant_id: variantId, url });
  if (error) throw error;
}

export async function deleteVariantImage(imageId) {
  const { error } = await supabase.from('variant_images').delete().eq('id', imageId);
  if (error) throw error;
}
