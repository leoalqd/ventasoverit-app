import React, { useEffect, useState } from 'react';
import { Truck } from 'lucide-react';
import { fetchOrders, updateOrderStatus } from '../lib/adminOrders';
import ShippingLabelModal from '../components/ShippingLabelModal';

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  CONTACTED: 'Contactado',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
};

const STATUS_COLORS = {
  PENDING: 'text-[#E8FF4D]',
  CONTACTED: 'text-[#8AB4FF]',
  CONFIRMED: 'text-[#7CFF9E]',
  CANCELLED: 'text-[#FF6B57]',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [labelOrder, setLabelOrder] = useState(null);

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
            <div key={o.id} className="bg-[#17171A] border border-[#2A2A2E] rounded-lg p-4 flex items-center gap-4">
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
              <button onClick={() => setLabelOrder(o)}
                className="bg-[#E8FF4D] text-[#0B0B0C] rounded px-3 py-1.5 text-xs font-semibold flex items-center gap-1 shrink-0">
                <Truck size={13} /> Etiqueta
              </button>
            </div>
          ))}
        </div>
      )}

      {labelOrder && <ShippingLabelModal order={labelOrder} onClose={() => setLabelOrder(null)} />}
    </div>
  );
}
