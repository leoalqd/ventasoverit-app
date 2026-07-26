import { supabase } from './supabaseClient';
import { generateSku, generateBarcodeValue } from './barcode';

export async function fetchProducts(search = '') {
  let query = supabase
    .from('products')
    .select('*, category:categories(name), brand:brands(name), variants:product_variants(*)')
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,internal_code.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createProduct({ name, internalCode, purchasePrice, salePrice, variants }) {
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name,
      internal_code: internalCode,
      purchase_price: purchasePrice,
      sale_price: salePrice,
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
