import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { fetchProductById } from '../lib/products';
import { useCart } from '../lib/CartContext';
import StoreHeader from '../components/StoreHeader';
import CartDrawer from '../components/CartDrawer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProductById(id).then(setProduct).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const variants = product?.variants || [];
  const inStock = variants.filter((v) => v.stock > 0);
  const sizes = useMemo(() => [...new Set(inStock.map((v) => v.size).filter(Boolean))], [inStock]);
  const hasSizes = sizes.length > 0;

  const colorsForSize = useMemo(() => {
    if (!hasSizes) return inStock;
    if (!selectedSize) return [];
    return inStock.filter((v) => v.size === selectedSize);
  }, [inStock, hasSizes, selectedSize]);

  const photos = product?.images?.length > 0 ? product.images : (product?.image_url ? [{ url: product.image_url }] : []);

  const handleAdd = (variant) => {
    addToCart(product, variant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C]">
        <StoreHeader />
        <p className="text-[#8A8A8F] text-sm p-8">Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0B0B0C]">
        <StoreHeader />
        <div className="p-8">
          <p className="text-[#8A8A8F] text-sm mb-3">No encontramos este producto.</p>
          <Link to="/" className="text-[#E8FF4D] text-sm">Volver a la tienda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      <StoreHeader />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[#8A8A8F] hover:text-[#F2F1ED] mb-6">
          <ArrowLeft size={15} /> Volver a la tienda
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square bg-[#17171A] border border-[#2A2A2E] rounded-lg overflow-hidden flex items-center justify-center mb-3">
              {photos[photoIndex]?.url ? (
                <img src={photos[photoIndex].url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <Package size={48} className="text-[#2A2A2E]" />
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2">
                {photos.map((p, i) => (
                  <button key={i} onClick={() => setPhotoIndex(i)}
                    className={`w-16 h-16 rounded overflow-hidden border-2 ${i === photoIndex ? 'border-[#E8FF4D]' : 'border-[#2A2A2E]'}`}>
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="font-display text-3xl text-[#F2F1ED] mb-1">{product.name}</h1>
            {product.brand?.name && <div className="text-sm text-[#8A8A8F] mb-3">{product.brand.name}</div>}
            <div className="font-mono text-2xl text-[#E8FF4D] mb-4">${Number(product.sale_price).toLocaleString('es-AR')}</div>
            {product.description && <p className="text-sm text-[#8A8A8F] mb-6 whitespace-pre-line">{product.description}</p>}

            {inStock.length === 0 ? (
              <span className="text-sm text-[#FF6B57]">Sin stock por ahora</span>
            ) : hasSizes ? (
              <div className="flex flex-col gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-[#8A8A8F] mb-2">Talle</div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button key={s} onClick={() => setSelectedSize(s === selectedSize ? '' : s)}
                        className={`text-sm rounded px-3 py-1.5 border ${selectedSize === s ? 'bg-[#E8FF4D] text-[#0B0B0C] border-[#E8FF4D] font-semibold' : 'bg-[#17171A] border-[#2A2A2E] text-[#F2F1ED] hover:border-[#E8FF4D]'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedSize && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-[#8A8A8F] mb-2">Color disponible</div>
                    <div className="flex flex-col gap-2">
                      {colorsForSize.map((v) => (
                        <button key={v.id} onClick={() => handleAdd(v)}
                          className="flex items-center justify-between text-sm bg-[#17171A] border border-[#2A2A2E] rounded px-3 py-2 hover:border-[#E8FF4D]">
                          <span className="text-[#F2F1ED]">{v.color || 'Único'}</span>
                          <span className="text-[#7CFF9E] font-medium">Agregar al carrito</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {inStock.map((v) => (
                  <button key={v.id} onClick={() => handleAdd(v)}
                    className="flex items-center justify-between text-sm bg-[#17171A] border border-[#2A2A2E] rounded px-3 py-2 hover:border-[#E8FF4D]">
                    <span className="text-[#F2F1ED]">{v.color || product.name}</span>
                    <span className="text-[#7CFF9E] font-medium">Agregar al carrito</span>
                  </button>
                ))}
              </div>
            )}

            {added && <p className="text-xs text-[#E8FF4D] mt-3">✅ Agregado al carrito</p>}
          </div>
        </div>
      </main>

      <CartDrawer />
      <FloatingWhatsApp />
    </div>
  );
}
