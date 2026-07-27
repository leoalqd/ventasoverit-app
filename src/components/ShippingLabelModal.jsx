import React, { useEffect, useState } from 'react';
import { Printer, X } from 'lucide-react';
import { fetchStoreSettings, saveStoreSettings, isSettingsIncomplete } from '../lib/settings';

function usePageSize(mmWidth, mmHeight) {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'print-page-size-shipping';
    style.innerHTML = `@media print { @page { size: ${mmWidth}mm ${mmHeight}mm; margin: 0; } body * { visibility: hidden; } #printable-shipping-label, #printable-shipping-label * { visibility: visible; } #printable-shipping-label { position: fixed; top: 0; left: 0; } }`;
    document.head.appendChild(style);
    return () => style.remove();
  }, [mmWidth, mmHeight]);
}

function SenderDataForm({ initial, onSaved }) {
  const [form, setForm] = useState({
    senderName: initial?.sender_name || '',
    senderAddress: initial?.sender_address || '',
    senderCity: initial?.sender_city || '',
    senderProvince: initial?.sender_province || '',
    senderPhone: initial?.sender_phone || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await saveStoreSettings(form);
    setSaving(false);
    onSaved();
  };

  return (
    <div>
      <p className="text-sm text-[#F2F1ED] mb-3">
        Antes de imprimir la primera etiqueta, completá tus datos como remitente (se guardan y no te los vuelvo a pedir).
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input required placeholder="Nombre / razón social" value={form.senderName} onChange={set('senderName')}
          className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
        <input required placeholder="Dirección" value={form.senderAddress} onChange={set('senderAddress')}
          className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
        <div className="flex gap-3">
          <input required placeholder="Ciudad" value={form.senderCity} onChange={set('senderCity')}
            className="flex-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input required placeholder="Provincia" value={form.senderProvince} onChange={set('senderProvince')}
            className="flex-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
        </div>
        <input required placeholder="Teléfono" value={form.senderPhone} onChange={set('senderPhone')}
          className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
        <button type="submit" disabled={saving}
          className="bg-[#E8FF4D] text-[#0B0B0C] font-semibold text-sm rounded py-2.5 disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar y continuar'}
        </button>
      </form>
    </div>
  );
}

export default function ShippingLabelModal({ order, onClose }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  usePageSize(100, 150);

  useEffect(() => {
    fetchStoreSettings().then(setSettings).finally(() => setLoading(false));
  }, []);

  const needsSetup = !loading && isSettingsIncomplete(settings);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-lg p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-[#F2F1ED]">Etiqueta de envío</h3>
          <button onClick={onClose} className="text-[#8A8A8F] hover:text-[#F2F1ED]"><X size={16} /></button>
        </div>

        {loading ? (
          <p className="text-sm text-[#8A8A8F]">Cargando...</p>
        ) : needsSetup ? (
          <SenderDataForm initial={settings} onSaved={() => fetchStoreSettings().then(setSettings)} />
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div
                id="printable-shipping-label"
                className="bg-white text-black flex flex-col justify-between p-4"
                style={{ width: '378px', height: '567px' /* 100mm x 150mm a 96dpi */ }}
              >
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Remitente</div>
                  <div className="text-sm font-semibold">{settings.sender_name}</div>
                  <div className="text-xs">{settings.sender_address}</div>
                  <div className="text-xs">{settings.sender_city}, {settings.sender_province}</div>
                  <div className="text-xs">Tel: {settings.sender_phone}</div>
                </div>

                <div className="border-t-2 border-black py-4">
                  <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Destinatario</div>
                  <div className="text-lg font-bold leading-tight">{order.customer.first_name} {order.customer.last_name}</div>
                  <div className="text-sm mt-1">{order.customer.address}</div>
                  <div className="text-sm">{order.customer.city}, {order.customer.province}</div>
                  <div className="text-sm mt-1">Tel: {order.customer.phone}</div>
                  <div className="text-sm">DNI: {order.customer.dni}</div>
                </div>

                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-wide text-gray-500">Pedido</div>
                  <div className="font-mono text-xl font-bold">{order.reference_code}</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-center print:hidden">
              <button onClick={() => window.print()} className="bg-[#E8FF4D] text-[#0B0B0C] text-sm font-semibold rounded px-4 py-2 flex items-center gap-1.5">
                <Printer size={14} /> Imprimir (100x150mm)
              </button>
              <button onClick={onClose} className="bg-[#0B0B0C] border border-[#2A2A2E] text-[#F2F1ED] text-sm rounded px-4 py-2">
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
