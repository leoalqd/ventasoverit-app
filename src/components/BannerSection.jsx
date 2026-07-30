import React, { useEffect, useState } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, ImageIcon, Link2 } from 'lucide-react';
import { fetchBanners, uploadBannerImage, createBanner, deleteBanner, updateBannerLink } from '../lib/banners';
import { useAuth } from '../lib/AuthContext';

/**
 * section: 'hero_top' | 'hero_bottom' | 'carousel'
 * aspect: clase de Tailwind para la relación de aspecto (ej "aspect-[21/9]")
 */
export default function BannerSection({ section, aspect = 'aspect-[21/9]' }) {
  const { session } = useAuth();
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const load = () => fetchBanners(section).then(setBanners).catch(console.error);
  useEffect(() => { load(); }, [section]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadBannerImage(file);
      await createBanner(section, url);
      await load();
    } catch (err) {
      setError('No se pudo subir la imagen.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    await deleteBanner(id);
    setIndex(0);
    load();
  };

  const handleEditLink = async (banner) => {
    const url = prompt('¿A qué URL apunta esta imagen al hacer clic? (dejar vacío para quitarlo)', banner.link_url || '');
    if (url === null) return;
    await updateBannerLink(banner.id, url.trim());
    load();
  };

  const isEditing = !!session;

  if (banners.length === 0 && !isEditing) return null;

  return (
    <div className={`relative w-full ${aspect} bg-[#17171A] border-y border-[#2A2A2E] overflow-hidden group`}>
      {banners.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#4A4A4E]">
          <ImageIcon size={28} />
          <span className="text-xs">Sin imágenes todavía</span>
        </div>
      ) : (
        banners.map((b, i) => (
          <a
            key={b.id}
            href={b.link_url || undefined}
            target={b.link_url ? '_blank' : undefined}
            rel={b.link_url ? 'noopener noreferrer' : undefined}
            className={`absolute inset-0 overflow-hidden transition-opacity duration-500 ${i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${b.link_url ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={(e) => { if (!b.link_url) e.preventDefault(); }}
          >
            <img src={b.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-105 active:scale-95" />
          </a>
        ))
      )}

      {banners.length > 1 && (
        <>
          <button onClick={() => setIndex((i) => (i - 1 + banners.length) % banners.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setIndex((i) => (i + 1) % banners.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === index ? 'bg-[#E8FF4D]' : 'bg-white/40'}`} />
            ))}
          </div>
        </>
      )}

      {isEditing && (
        <div className="absolute top-2 right-2 flex items-center gap-2">
          {banners[index] && (
            <>
              <button onClick={() => handleEditLink(banners[index])}
                className="bg-black/70 text-[#F2F1ED] rounded p-1.5" title="Editar link de destino">
                <Link2 size={14} />
              </button>
              <button onClick={() => handleDelete(banners[index].id)}
                className="bg-black/70 text-[#FF6B57] rounded p-1.5" title="Eliminar esta imagen">
                <X size={14} />
              </button>
            </>
          )}
          <label className="bg-[#E8FF4D] text-[#0B0B0C] rounded p-1.5 cursor-pointer flex items-center gap-1 text-xs font-semibold px-2">
            <Plus size={14} /> {uploading ? 'Subiendo...' : 'Imagen'}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      )}
      {error && <div className="absolute bottom-2 right-2 text-xs text-[#FF6B57] bg-black/70 rounded px-2 py-1">{error}</div>}
    </div>
  );
}
