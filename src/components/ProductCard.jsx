import React, { useMemo, useState } from 'react';
import { Package } from 'lucide-react';

export default function ProductCard({ product, onAddToCart }) {
  const variants = product.variants || [];
  const inStock = variants.filter((v) => v.stock > 0);
  const sizes = useMemo(() => [...new Set(inStock.map((v) => v.size).filter(Boolean))], [inStock]);
  const hasSizes = sizes.length > 0;

  const [selectedSize, setSelectedSize] = useState('');

  const colorsForSize = useMemo(() => {
    if (!hasSizes) return inStock;
    if (!selectedSize) return [];
    return inStock.filter((v) => v.size === selectedSize);
  }, [inStock, hasSizes, selectedSize]);

  const cover = product.images?.[0]?.url || product.image_url;

  return (
    <div className="bg-[#17171A] border border-[#2A2A2E] rounded-lg overflow-hidden">
      <div className="aspect-square bg-[#0B0B0C] flex items-center justify-center">
        {cover ? (
          <img src={cover} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Package size={32} className="text-[#2A2A2E]" />
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
                      <span className="text-[#8A8A8F] font-mono">stock {v.stock}</span>
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
                <span className="text-[#8A8A8F] font-mono">stock {v.stock}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
