import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { uploadProductImage } from '../lib/products';

/**
 * images: [{ id, url }]
 * onAdd(url): agrega una foto ya subida
 * onRemove(id): borra una foto
 */
export default function PhotoPicker({ images, onAdd, onRemove, max = 4 }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      await onAdd(url);
    } catch (err) {
      alert('No se pudo subir la foto.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {images.map((img) => (
        <div key={img.id} className="relative w-16 h-16 rounded overflow-hidden border border-[#2A2A2E]">
          <img src={img.url} alt="" className="w-full h-full object-cover" />
          <button type="button" onClick={() => onRemove(img.id)}
            className="absolute top-0.5 right-0.5 bg-black/70 text-[#FF6B57] rounded-full p-0.5">
            <X size={10} />
          </button>
        </div>
      ))}
      {images.length < max && (
        <label className="w-16 h-16 rounded border border-dashed border-[#2A2A2E] flex items-center justify-center cursor-pointer text-[#8A8A8F] hover:border-[#E8FF4D] hover:text-[#E8FF4D]">
          {uploading ? <span className="text-[9px]">Subiendo</span> : <Plus size={16} />}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </div>
  );
}
