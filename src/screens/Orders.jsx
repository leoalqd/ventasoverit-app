import React, { useEffect, useState } from 'react';
import { Truck, Pencil, Minus, Plus, Trash2, X } from 'lucide-react';
import {
  fetchOrders, updateOrderStatus, updateOrderCustomer, updateOrderItemQuantity,
  deleteOrderItem, recomputeOrderTotal,
} from '../lib/adminOrders';
import ShippingLabelModal from '../components/ShippingLabelModal';

const STATUS_LABELS = { PENDING: 'Pendiente', CONTACTED: 'Contactado', CONFIRMED: 'Confirmado', CANCELLED: 'Cancelado' };
const STATUS_COLORS = { PENDING: 'text-[#E8FF4D]', CONTACTED: 'text-[#8AB4FF]', CONFIRMED: 'text-[#7CFF9E]', CANCELLED: 'text-[#FF6B57]' };

function EditOrderModal({ order, onClose, onSaved }) {
  const [form, setForm] = useState({
    firstName: order.customer.first_name, lastName: order.customer.last_name, dni: order.customer.dni,
    address: order.customer.address, city: order.customer.city, province: order.customer.province,
    postalCode: order.customer.postal_code || '', phone: order.customer.phone, email: order.customer.email,
  });
  const [items, setItems] = useState(order.items || []);
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const changeQty = (itemId, delta) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)));
  };
  const removeItem = async (itemId) => {
    if (!confirm('¿Quitar este producto del pedido?')) return;
    await deleteOrderItem(itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateOrderCustomer(order.id, order.customer.id, form);
    for (const item of items) {
      await updateOrderItemQuantity(item.id, item.quantity);
    }
    await recomputeOrderTotal(order.id);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-[#F2F1ED]">Editar pedido {order.reference_code}</h3>
          <button onClick={onClose} className="text-[#8A8A8F] hover:text-[#F2F1ED]"><X size={18} /></button>
        </div>

        <div className="mb-4">
          <span className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8F] font-mono block mb-2">Productos</span>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2">
                <div className="flex-1 min-w-0 text-sm text-[#F2F1ED] truncate">
                  {item.variant?.product?.name} <span className="text-[#8A8A8F]">({item.variant?.color} · {item.variant?.size})</span>
                </div>
                <button type="button" onClick={() => changeQty(item.id, -1)} className="text-[#8A8A8F] hover:text-[#F2F1ED]"><Minus size={13} /></button>
                <span className="font-mono text-sm text-[#F2F1ED] w-4 text-center">{item.quantity}</span>
                <button type="button" onClick={() => changeQty(item.id, 1)} className="text-[#8A8A8F] hover:text-[#F2F1ED]"><Plus size={13} /></button>
                <button type="button" onClick={() => removeItem(item.id)} className="text-[#8A8A8F] hover:text-[#FF6B57] ml-1"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <input placeholder="Nombre" value={form.firstName} onChange={set('firstName')}
            className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input placeholder="Apellido" value={form.lastName} onChange={set('lastName')}
            className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input placeholder="DNI" value={form.dni} onChange={set('dni')}
            className="col-span-2 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input placeholder="Dirección" value={form.address} onChange={set('address')}
            className="col-span-2 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input placeholder="Ciudad" value={form.city} onChange={set('city')}
            className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input placeholder="Provincia" value={form.province} onChange={set('province')}
            className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input placeholder="Código Postal" value={form.postalCode} onChange={set('postalCode')}
            className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input placeholder="Teléfono" value={form.phone} onChange={set('phone')}
            className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input placeholder="Email" value={form.email} onChange={set('email')}
            className="col-span-2 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />

          <button type="submit" disabled={saving}
            className="col-span-2 mt-2 bg-[#E8FF4D] text-[#0B0B0C] font-semibold text-sm rounded py-2.5 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [labelOrder, setLabelOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  const load = () => fetchOrders().then(setOrders).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleStatusChange = async (orderId, status) => {
    await updateOrderStatus(orderId, status);
    load();
  };

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="font-display text-3xl md:text-4xl text-[#F2F1ED] mb-6">Pedidos</h1>

      {loading ? (
        <p className="text-[#8A8A8F] text-sm">Cargando pedidos...</p>
      ) : orders.length === 0 ? (
        <p className="text-[#8A8A8F] text-sm">Todavía no hay pedidos de la tienda online.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <div key={o.id} className="bg-[#17171A] border border-[#2A2A2E] rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-[#F2F1ED]">{o.reference_code}</span>
                    <span className={`text-xs font-medium ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                  </div>
                  <div className="text-sm text-[#F2F1ED] mt-1">{o.customer?.first_name} {o.customer?.last_name}</div>
                  <div className="text-xs text-[#8A8A8F]">{o.customer?.city}, {o.customer?.province} · {o.customer?.phone}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-sm text-[#F2F1ED]">${Number(o.total).toLocaleString('es-AR')}</div>
                  <div className="text-xs text-[#8A8A8F]">{new Date(o.created_at).toLocaleDateString('es-AR')}</div>
                </div>
                <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2 py-1.5 text-xs text-[#F2F1ED] outline-none shrink-0">
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <button onClick={() => setEditingOrder(o)}
                  className="bg-[#0B0B0C] border border-[#2A2A2E] text-[#F2F1ED] rounded px-2.5 py-1.5 text-xs flex items-center gap-1 shrink-0" title="Editar pedido">
                  <Pencil size={13} />
                </button>
                <button onClick={() => setLabelOrder(o)}
                  className="bg-[#E8FF4D] text-[#0B0B0C] rounded px-3 py-1.5 text-xs font-semibold flex items-center gap-1 shrink-0">
                  <Truck size={13} /> Etiqueta
                </button>
              </div>

              <div className="border-t border-[#2A2A2E] mt-3 pt-2 flex flex-col gap-1">
                {(o.items || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span className="text-[#F2F1ED]">
                      {item.variant?.product?.name} <span className="text-[#8A8A8F]">({item.variant?.color} · {item.variant?.size})</span>
                    </span>
                    <span className="font-mono text-[#8A8A8F]">{item.quantity} x ${Number(item.unit_price).toLocaleString('es-AR')}</span>
                  </div>
                ))}
                {(!o.items || o.items.length === 0) && <span className="text-xs text-[#8A8A8F]">Sin detalle de productos.</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {labelOrder && <ShippingLabelModal order={labelOrder} onClose={() => setLabelOrder(null)} />}
      {editingOrder && <EditOrderModal order={editingOrder} onClose={() => setEditingOrder(null)} onSaved={load} />}
    </div>
  );
}
