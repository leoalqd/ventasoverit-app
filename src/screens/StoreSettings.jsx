import React, { useEffect, useState } from 'react';
import { fetchStoreSettings, saveStoreSettings } from '../lib/settings';

export default function StoreSettings() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchStoreSettings().then((s) => setForm({
      senderName: s.sender_name || '',
      senderAddress: s.sender_address || '',
      senderCity: s.sender_city || '',
      senderProvince: s.sender_province || '',
      senderPhone: s.sender_phone || '',
      whatsappNumber: s.whatsapp_number || '',
    }));
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await saveStoreSettings(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!form) return <div className="p-8"><p className="text-[#8A8A8F] text-sm">Cargando...</p></div>;

  return (
    <div className="p-8 max-w-lg">
      <h1 className="font-display text-3xl md:text-4xl text-[#F2F1ED] mb-6">Configuración</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <span className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8F] font-mono block mb-2">WhatsApp del negocio</span>
          <input value={form.whatsappNumber} onChange={set('whatsappNumber')} placeholder="Ej: 5493883116194 (con codigo de pais, sin espacios ni signos)"
            className="w-full bg-[#17171A] border border-[#2A2A2E] rounded px-3 py-2.5 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <p className="text-xs text-[#8A8A8F] mt-1">Este número es el que se usa en el botón flotante de WhatsApp de la tienda.</p>
        </div>

        <div className="border-t border-[#2A2A2E] pt-4">
          <span className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8F] font-mono block mb-2">Datos de remitente (para etiquetas de envío)</span>
          <div className="flex flex-col gap-3">
            <input value={form.senderName} onChange={set('senderName')} placeholder="Nombre / razón social"
              className="bg-[#17171A] border border-[#2A2A2E] rounded px-3 py-2.5 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
            <input value={form.senderAddress} onChange={set('senderAddress')} placeholder="Dirección"
              className="bg-[#17171A] border border-[#2A2A2E] rounded px-3 py-2.5 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
            <div className="flex gap-3">
              <input value={form.senderCity} onChange={set('senderCity')} placeholder="Ciudad"
                className="flex-1 bg-[#17171A] border border-[#2A2A2E] rounded px-3 py-2.5 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
              <input value={form.senderProvince} onChange={set('senderProvince')} placeholder="Provincia"
                className="flex-1 bg-[#17171A] border border-[#2A2A2E] rounded px-3 py-2.5 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
            </div>
            <input value={form.senderPhone} onChange={set('senderPhone')} placeholder="Teléfono"
              className="bg-[#17171A] border border-[#2A2A2E] rounded px-3 py-2.5 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="bg-[#E8FF4D] text-[#0B0B0C] font-semibold text-sm rounded py-2.5 disabled:opacity-50">
          {saving ? 'Guardando...' : saved ? '✅ Guardado' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
