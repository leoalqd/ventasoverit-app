import React, { useEffect, useState } from 'react';
import { DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { fetchTodaySalesTotal, fetchLowStockVariants } from '../lib/sales';

function StatCard({ icon: Icon, label, value, tone = 'default' }) {
  const toneClass = tone === 'alert' ? 'text-[#FF6B57]' : 'text-[#E8FF4D]';
  return (
    <div className="bg-[#17171A] border border-[#2A2A2E] rounded-lg p-5 flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8F] font-mono">{label}</span>
        <Icon size={16} className={toneClass} />
      </div>
      <span className="font-display text-3xl text-[#F2F1ED] truncate">{value}</span>
    </div>
  );
}

export default function Dashboard() {
  const [salesToday, setSalesToday] = useState(0);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchTodaySalesTotal(), fetchLowStockVariants()])
      .then(([total, variants]) => {
        setSalesToday(total);
        setLowStock(variants);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="font-display text-3xl md:text-4xl text-[#F2F1ED] mb-6">Dashboard</h1>

      {loading ? (
        <p className="text-[#8A8A8F] text-sm">Cargando...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <StatCard icon={DollarSign} label="Ventas hoy" value={`$${salesToday.toLocaleString('es-AR')}`} />
            <StatCard icon={AlertTriangle} label="Stock bajo" value={lowStock.length} tone="alert" />
            <StatCard icon={TrendingUp} label="Variantes activas" value={lowStock.length >= 0 ? '—' : '—'} />
          </div>

          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-lg p-5">
            <h3 className="font-display text-lg text-[#F2F1ED] mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#FF6B57]" /> Alertas de stock
            </h3>
            {lowStock.length === 0 ? (
              <p className="text-sm text-[#8A8A8F]">Sin alertas por ahora.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {lowStock.map((v) => (
                  <div key={v.id} className="flex items-center justify-between bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2">
                    <div>
                      <div className="text-sm text-[#F2F1ED]">{v.product?.name}</div>
                      <div className="text-xs text-[#8A8A8F] font-mono">{v.color} · {v.size}</div>
                    </div>
                    <span className="text-xs font-mono text-[#FF6B57] font-semibold">{v.stock} / min {v.min_stock}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
