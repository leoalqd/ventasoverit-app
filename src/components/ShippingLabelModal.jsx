import React, { useEffect, useState } from 'react';
import { Printer, X } from 'lucide-react';
import { fetchStoreSettings, saveStoreSettings, isSettingsIncomplete } from '../lib/settings';
import Barcode from './Barcode';
import QrCode from './QrCode';
import PrintFrame from './PrintFrame';
import logo from '../assets/logo.png';

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

function LabelContent({ order, settings }) {
  const fullName = `${order.customer.first_name} ${order.customer.last_name}`;
  return (
    <div className="bg-white text-black flex flex-col" style={{ width: '378px', height: '567px' }}>
      <div className="flex border-b-2 border-black">
        <div className="w-1/3 flex items-center justify-center p-3 border-r border-black">
          <img src={logo} alt="Over It" className="w-full object-contain" />
        </div>
        <div className="w-2/3 p-3 text-[10px] leading-tight">
          <div className="font-bold text-[11px]">Nombre de remitente {settings.sender_name}</div>
          <div className="font-semibold">#{order.reference_code} (Pedido)</div>
          <div className="mt-1">{settings.sender_address}</div>
          <div>{settings.sender_city}, {settings.sender_province}</div>
          <div className="mt-1"><span className="font-semibold">Envío</span> Genérico Postal</div>
          <div><span className="font-semibold">Fecha</span> {new Date(order.created_at || Date.now()).toLocaleDateString('es-AR')} / <span className="font-semibold">Cel</span> {settings.sender_phone}</div>
        </div>
      </div>

      <div className="bg-black text-white px-3 py-2 text-[13px] font-extrabold uppercase">
        Destinatario: {fullName}
      </div>

      <div className="flex-1 px-3 py-2 text-[12px] leading-relaxed">
        <div><span className="font-bold">Nombre:</span> {fullName}</div>
        <div><span className="font-bold">Localidad:</span> {order.customer.city}</div>
        <div><span className="font-bold">Provincia:</span> {order.customer.province}</div>
        <div><span className="font-bold">Dirección:</span> {order.customer.address}</div>
        <div><span className="font-bold">Código Postal:</span> {order.customer.postal_code || '-'}</div>
        <div><span className="font-bold">Mail:</span> {order.customer.email}</div>
        <div><span className="font-bold">Celular:</span> {order.customer.phone}</div>
        <div><span className="font-bold">DNI:</span> {order.customer.dni}</div>
      </div>

      <div className="flex justify-end px-3 py-1 border-t border-black text-[12px]">
        <span className="font-bold">CP:</span>&nbsp;{order.customer.postal_code || '-'}
      </div>

      <div className="px-3 py-2 border-t border-black">
        <div className="text-[13px] font-extrabold mb-1">Número de pedido: {order.reference_code}</div>
        <div className="flex justify-center">
          <Barcode value={order.reference_code} width={1.4} height={36} />
        </div>
      </div>

      <div className="flex justify-center items-center py-3 border-t border-black">
        <div className="flex flex-col items-center gap-1">
          <QrCode value={`PEDIDO-${order.reference_code}`} size={90} />
          <span className="text-[10px] font-semibold">PEDIDO {order.reference_code}</span>
        </div>
      </div>
    </div>
  );
}

export default function ShippingLabelModal({ order, onClose }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

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
              <LabelContent order={order} settings={settings} />
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => window.print()} className="bg-[#E8FF4D] text-[#0B0B0C] text-sm font-semibold rounded px-4 py-2 flex items-center gap-1.5">
                <Printer size={14} /> Imprimir (100x150mm)
              </button>
              <button onClick={onClose} className="bg-[#0B0B0C] border border-[#2A2A2E] text-[#F2F1ED] text-sm rounded px-4 py-2">
                Cerrar
              </button>
            </div>
            <p className="text-[10px] text-[#8A8A8F] text-center mt-3">
              Si en la hoja aparece una fecha o dirección web arriba/abajo: en el cuadro de impresión, abrí "Más ajustes" y destildá "Encabezados y pies de página".
            </p>

            <PrintFrame mmWidth={100} mmHeight={150}>
              <LabelContent order={order} settings={settings} />
            </PrintFrame>
          </>
        )}
      </div>
    </div>
  );
}
