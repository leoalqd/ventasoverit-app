import { supabase } from './supabaseClient';

// Trae solo productos activos con stock visible, para el catálogo público.
export async function fetchPublicCatalog() {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, name, parent_id), brand:brands(name), variants:product_variants(*, images:variant_images(*)), images:product_images(*), featured')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

function generateReferenceCode() {
  return 'OIT-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

/**
 * Crea el pedido pendiente de la tienda: ficha de cliente + pedido + items.
 * No hay pago online: el pedido queda en estado PENDING para que el
 * administrador se comunique y coordine transferencia o link de pago.
 */
export async function createOrder(customerData, cart) {
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({
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
    .select()
    .single();
  if (customerError) throw customerError;

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const referenceCode = generateReferenceCode();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: customer.id,
      reference_code: referenceCode,
      subtotal,
      total: subtotal,
    })
    .select()
    .single();
  if (orderError) throw orderError;

  const items = cart.map((i) => ({
    order_id: order.id,
    variant_id: i.id,
    quantity: i.qty,
    unit_price: i.price,
  }));
  const { error: itemsError } = await supabase.from('order_items').insert(items);
  if (itemsError) throw itemsError;

  return order;
}
