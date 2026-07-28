import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Instagram, Phone, MapPin, Pencil, X, Plus } from 'lucide-react';
import { fetchContact, saveContact, fetchContactImages, addContactImage, deleteContactImage } from '../lib/contact';
import { uploadProductImage } from '../lib/products';
import { useAuth } from '../lib/AuthContext';

function EditContactModal({ contact, onClose, onSaved }) {
  const [form, setForm] = useState({
    businessName: contact.business_name || '',
    address: contact.address || '',
    instagram: contact.instagram || '',
    phone: contact.phone || '',
    description: contact.description || '',
    streetviewEmbedHtml: contact.streetview_embed_html || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await saveContact({
      business_name: form.businessName,
      address: form.address,
      instagram: form.instagram,
      phone: form.phone,
      description: form.description,
      streetview_embed_html: form.streetviewEmbedHtml,
    });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-[#F2F1ED]">Editar contacto</h3>
          <button onClick={onClose} className="text-[#8A8A8F] hover:text-[#F2F1ED]"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input value={form.businessName} onChange={set('businessName')} placeholder="Nombre del negocio"
            className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input value={form.address} onChange={set('address')} placeholder="Dirección"
            className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input value={form.instagram} onChange={set('instagram')} placeholder="Instagram (sin @)"
            className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input value={form.phone} onChange={set('phone')} placeholder="Teléfono"
            className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <textarea value={form.description} onChange={set('description')} placeholder="Descripción / texto libre (opcional)" rows={3}
            className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D] resize-none" />
          <label className="flex flex-col gap-1">
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8F] font-mono">HTML de Street View (opcional)</span>
            <textarea value={form.streetviewEmbedHtml} onChange={set('streetviewEmbedHtml')} rows={3}
              placeholder='Pegá acá el <iframe> que te da Google Maps al compartir/insertar el mapa'
              className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-xs font-mono text-[#F2F1ED] outline-none focus:border-[#E8FF4D] resize-none" />
          </label>

          <button type="submit" disabled={saving}
            className="mt-2 bg-[#E8FF4D] text-[#0B0B0C] font-semibold text-sm rounded py-2.5 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const { session } = useAuth();
  const [contact, setContact] = useState(null);
  const [images, setImages] = useState([]);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    fetchContact().then(setContact).catch(console.error);
    fetchContactImages().then(setImages).catch(console.error);
  };
  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      await addContactImage(url);
      load();
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = async (id) => {
    await deleteContactImage(id);
    load();
  };

  if (!contact) return null;

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F2F1ED]">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[#8A8A8F] hover:text-[#F2F1ED] mb-6">
          <ArrowLeft size={15} /> Volver a la tienda
        </Link>

        <div className="flex items-start justify-between mb-2">
          <h1 className="font-display text-3xl">{contact.business_name}</h1>
          {session && (
            <button onClick={() => setEditing(true)} className="text-[#8A8A8F] hover:text-[#E8FF4D] flex items-center gap-1 text-xs border border-[#2A2A2E] rounded px-2 py-1">
              <Pencil size={12} /> Editar
            </button>
          )}
        </div>

        {contact.description && <p className="text-sm text-[#8A8A8F] mb-6">{contact.description}</p>}

        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={16} className="text-[#E8FF4D] shrink-0" />
            <span>Estamos en {contact.address}</span>
          </div>
          {contact.instagram && (
            <a href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-[#E8FF4D]">
              <Instagram size={16} className="text-[#E8FF4D] shrink-0" />
              <span>IG: {contact.instagram}</span>
            </a>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone size={16} className="text-[#E8FF4D] shrink-0" />
              <span>{contact.phone}</span>
            </div>
          )}
        </div>

        {contact.streetview_embed_html && (
          <div className="mb-8 rounded-lg overflow-hidden border border-[#2A2A2E]" dangerouslySetInnerHTML={{ __html: contact.streetview_embed_html }} />
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8F] font-mono">Fotos</span>
            {session && (
              <label className="text-xs text-[#E8FF4D] flex items-center gap-1 cursor-pointer">
                <Plus size={12} /> {uploading ? 'Subiendo...' : 'Agregar foto'}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-[#2A2A2E]">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {session && (
                  <button onClick={() => handleRemoveImage(img.id)} className="absolute top-1 right-1 bg-black/70 text-[#FF6B57] rounded-full p-1">
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
            {images.length === 0 && <p className="text-xs text-[#8A8A8F] col-span-full">Todavía no hay fotos cargadas.</p>}
          </div>
        </div>
      </div>

      {editing && <EditContactModal contact={contact} onClose={() => setEditing(false)} onSaved={load} />}
    </div>
  );
}
