import React, { useMemo, useState } from 'react';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductCard({ product, onAddToCart }) {
  const variants = product.variants || [];
  const inStock = variants.filter((v) => v.stock > 0);
  const sizes = useMemo(() => [...new Set(inStock.map((v) => v.size).filter(Boolean))], [inStock]);
  const hasSizes = sizes.length > 0;

  const [selectedSize, setSelectedSize] = useState('');
  const [photoIndex, setPhotoIndex] = useState(0);

  const colorsForSize = useMemo(() => {
    if (!hasSizes) return inStock;
    if (!selectedSize) return [];
    return inStock.filter((v) => v.size === selectedSize);
  }, [inStock, hasSizes, selectedSize]);

  const photos = product.images?.length > 0 ? product.images : (product.image_url ? [{ url: product.image_url }] : []);
  const cover = photos[photoIndex]?.url;

  return (
    <div className="bg-[#17171A] border border-[#2A2A2E] rounded-lg overflow-hidden">
      <div className="relative aspect-square bg-[#0B0B0C] flex items-center justify-center group">
        {cover ? (
          <img src={cover} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Package size={32} className="text-[#2A2A2E]" />
        )}
        {photos.length > 1 && (
          <>
            <button onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={14} />
            </button>
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_, i) => (
                <span key={i} className={`w-1 h-1 rounded-full ${i === photoIndex ? 'bg-[#E8FF4D]' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-4">
        <div className="text-[#F2F1ED] font-medium">{product.name}</div>
        {product.brand?.name && <div className="text-xs text-[#8A8A8F] mb-1">{product.brand.name}</div>}
        {product.description && <p className="text-xs text-[#8A8A8F] mb-2 line-clamp-2">{product.description}</p>}
        <div className="font-mono text-[#E8FF4D] mb-3">${Number(product.sale_price).toLocaleString('es-AR')}</div>

        {inStock.length === 0 ? (
          <span className="text-xs text-[#FF6B57]">Sin stock por ahora</span>
        ) : hasSizes ? (
          <div className="flex flex-col gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-[#8A8A8F] mb-1">Talle</div>
              <div className="flex flex-wrap gap-1.5">
                {sizes.map((s) => (
                  <button key={s} onClick={() => setSelectedSize(s === selectedSize ? '' : s)}
                    className={`text-xs rounded px-2 py-1 border ${selectedSize === s ? 'bg-[#E8FF4D] text-[#0B0B0C] border-[#E8FF4D] font-semibold' : 'bg-[#0B0B0C] border-[#2A2A2E] text-[#F2F1ED] hover:border-[#E8FF4D]'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {selectedSize && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-[#8A8A8F] mb-1">Color disponible</div>
                <div className="flex flex-col gap-1.5">
                  {colorsForSize.map((v) => (
                    <button key={v.id} onClick={() => onAddToCart(product, v)}
                      className="flex items-center justify-between text-xs bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2.5 py-1.5 hover:border-[#E8FF4D]">
                      <span className="text-[#F2F1ED]">{v.color || 'Único'}</span>
                      <span className="text-[#7CFF9E] font-medium">Disponible</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {inStock.map((v) => (
              <button key={v.id} onClick={() => onAddToCart(product, v)}
                className="flex items-center justify-between text-xs bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2.5 py-1.5 hover:border-[#E8FF4D]">
                <span className="text-[#F2F1ED]">{v.color || product.name}</span>
                <span className="text-[#7CFF9E] font-medium">Disponible</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
