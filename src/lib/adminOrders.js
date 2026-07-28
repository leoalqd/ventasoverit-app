import { supabase } from './supabaseClient';

export async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, customer:customers(*), items:order_items(*, variant:product_variants(color, size, product:products(name)))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateOrderCustomer(orderId, customerId, customerData) {
  const { error } = await supabase
    .from('customers')
    .update({
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      dni: customerData.dni,
      address: customerData.address,
      city: customerData.city,
      province: customerData.province,
      postal_code: customerData.postalCode,
      phone: customerData.phone,
      email: customerData.email,
    })
    .eq('id', customerId);
  if (error) throw error;
}

export async function updateOrderItemQuantity(itemId, quantity) {
  const { error } = await supabase.from('order_items').update({ quantity }).eq('id', itemId);
  if (error) throw error;
}

export async function deleteOrderItem(itemId) {
  const { error } = await supabase.from('order_items').delete().eq('id', itemId);
  if (error) throw error;
}

export async function recomputeOrderTotal(orderId) {
  const { data: items, error } = await supabase.from('order_items').select('quantity, unit_price').eq('order_id', orderId);
  if (error) throw error;
  const total = items.reduce((sum, i) => sum + i.quantity * Number(i.unit_price), 0);
  await supabase.from('orders').update({ subtotal: total, total }).eq('id', orderId);
}

export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) throw error;
}
