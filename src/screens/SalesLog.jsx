import React, { useEffect, useState } from 'react';
import { fetchSalesLog } from '../lib/salesLog';

export default function SalesLog() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesLog().then(setSales).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="font-display text-3xl md:text-4xl text-[#F2F1ED] mb-6">Ventas</h1>

      {loading ? (
        <p className="text-[#8A8A8F] text-sm">Cargando...</p>
      ) : sales.length === 0 ? (
        <p className="text-[#8A8A8F] text-sm">Todavía no se registró ninguna venta desde el Punto de Venta.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sales.map((s) => (
            <div key={s.id} className="bg-[#17171A] border border-[#2A2A2E] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-[#F2F1ED]">
                  {new Date(s.created_at).toLocaleDateString('es-AR')} · {new Date(s.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-right">
                  {s.discount > 0 && (
                    <div className="text-[10px] text-[#FF6B57]">
                      Desc. {s.discount_type === 'PERCENT' ? `${(s.discount / s.subtotal * 100).toFixed(0)}%` : `$${Number(s.discount).toLocaleString('es-AR')}`}
                    </div>
                  )}
                  <div className="font-mono text-sm text-[#E8FF4D] font-semibold">${Number(s.total).toLocaleString('es-AR')}</div>
                </div>
              </div>

              {s.payment_method && (
                <div className="text-xs text-[#8A8A8F] mb-1">
                  Pago: {{ EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' }[s.payment_method]}
                </div>
              )}

              {(s.customer_name || s.customer_dni || s.customer_phone) && (
                <div className="text-xs text-[#8A8A8F] mb-2">
                  Cliente: {s.customer_name || 'Sin nombre'} {s.customer_dni && `· DNI ${s.customer_dni}`} {s.customer_phone && `· WhatsApp ${s.customer_phone}`}
                </div>
              )}

              <div className="flex flex-col gap-1 border-t border-[#2A2A2E] pt-2 mt-2">
                {s.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span className="text-[#F2F1ED]">
                      {item.variant?.product?.name} <span className="text-[#8A8A8F]">({item.variant?.color} · {item.variant?.size})</span>
                    </span>
                    <span className="font-mono text-[#8A8A8F]">{item.quantity} x ${Number(item.unit_price).toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
