import { supabase } from './supabaseClient';

/**
 * Confirma una venta: crea el registro de venta (con los datos del cliente
 * si se cargaron), sus items, descuenta stock de cada variante y deja el
 * movimiento de stock registrado.
 */
export async function confirmSale(cart, userId, customerData = {}, paymentInfo = {}) {
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const { discountType, discountValue = 0, paymentMethod } = paymentInfo;
  const discountAmount = discountType === 'PERCENT' ? subtotal * (Number(discountValue) / 100) : Number(discountValue) || 0;
  const total = Math.max(0, subtotal - discountAmount);

  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      user_id: userId,
      subtotal,
      discount: discountAmount,
      discount_type: discountValue ? discountType : null,
      total,
      customer_name: customerData.name || null,
      customer_dni: customerData.dni || null,
      customer_phone: customerData.phone || null,
      payment_method: paymentMethod || null,
    })
    .select()
    .single();
  if (saleError) throw saleError;

  const items = cart.map((i) => ({
    sale_id: sale.id,
    variant_id: i.id,
    quantity: i.qty,
    unit_price: i.price,
  }));
  const { error: itemsError } = await supabase.from('sale_items').insert(items);
  if (itemsError) throw itemsError;

  // Descuenta stock y registra el movimiento por cada variante vendida.
  for (const item of cart) {
    const newStock = Math.max(0, item.stock - item.qty);
    await supabase.from('product_variants').update({ stock: newStock }).eq('id', item.id);
    await supabase.from('stock_movements').insert({
      variant_id: item.id,
      type: 'SALE',
      quantity: -item.qty,
      reason: `Venta #${sale.id}`,
      user_id: userId,
    });
  }

  return sale;
}

export async function fetchTodaySalesTotal() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('sales')
    .select('total')
    .gte('created_at', startOfDay.toISOString());
  if (error) throw error;

  return data.reduce((sum, s) => sum + Number(s.total), 0);
}

export async function fetchLowStockVariants() {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*, product:products(name)');
  if (error) throw error;
  return data.filter((v) => v.stock <= v.min_stock);
}
