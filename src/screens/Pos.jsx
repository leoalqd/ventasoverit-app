import React, { useEffect, useRef, useState } from 'react';
import { Search, ScanLine, Plus, Minus, Trash2, Camera, X } from 'lucide-react';
import { fetchProducts } from '../lib/products';
import { confirmSale } from '../lib/sales';
import { useAuth } from '../lib/AuthContext';

// Escaneo de código de barras usando la cámara del celular, con la API
// nativa BarcodeDetector del navegador (disponible en Chrome/Android).
// Si el navegador no la soporta (ej: Safari/iPhone), se avisa y se puede
// seguir usando la búsqueda manual sin problema.
function ScannerModal({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!('BarcodeDetector' in window)) {
      setSupported(false);
      return;
    }

    let stream;
    let detector;
    let rafId;
    let stopped = false;

    async function start() {
      try {
        detector = new window.BarcodeDetector({ formats: ['code_128', 'ean_13', 'upc_a'] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const tick = async () => {
          if (stopped) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0) {
              onDetected(codes[0].rawValue);
              return;
            }
          } catch {
            // Frame no válido, seguimos intentando.
          }
          rafId = requestAnimationFrame(tick);
        };
        tick();
      } catch (err) {
        setError('No se pudo acceder a la cámara. Revisá los permisos del navegador.');
      }
    }

    start();
    return () => {
      stopped = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <button onClick={onClose} className="absolute top-4 right-4 text-white"><X size={24} /></button>
      {!supported ? (
        <p className="text-white text-sm text-center max-w-xs px-4">
          Tu navegador no soporta escaneo de cámara. Probá con Chrome en Android, o buscá el producto manualmente.
        </p>
      ) : error ? (
        <p className="text-[#FF6B57] text-sm text-center max-w-xs px-4">{error}</p>
      ) : (
        <>
          <video ref={videoRef} className="w-full max-w-md rounded-lg" muted playsInline />
          <p className="text-white/70 text-xs mt-3">Apuntá al código de barras...</p>
        </>
      )}
    </div>
  );
}

export default function Pos() {
  const { session } = useAuth();
  const [allVariants, setAllVariants] = useState([]);
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerDni, setCustomerDni] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountType, setDiscountType] = useState('PERCENT');
  const [discountValue, setDiscountValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');

  useEffect(() => {
    fetchProducts().then((products) => {
      const variants = products.flatMap((p) =>
        (p.variants || []).map((v) => ({ ...v, productName: p.name, price: Number(p.sale_price), productImage: p.images?.[0]?.url }))
      );
      setAllVariants(variants);
    });
  }, []);

  const filtered = allVariants.filter(
    (v) =>
      v.productName.toLowerCase().includes(query.toLowerCase()) ||
      v.barcode.includes(query)
  );

  const addToCart = (variant) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === variant.id);
      if (existing) return prev.map((i) => (i.id === variant.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...variant, qty: 1 }];
    });
  };

  const handleDetected = (barcode) => {
    setScanning(false);
    const variant = allVariants.find((v) => v.barcode === barcode);
    if (variant) {
      addToCart(variant);
      setMessage(`Agregado: ${variant.productName} (${variant.color}/${variant.size})`);
    } else {
      setMessage('No se encontró ningún producto con ese código.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const changeQty = (id, delta) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)));
  };
  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleConfirm = async () => {
    if (cart.length === 0) return;
    setConfirming(true);
    try {
      await confirmSale(
        cart,
        session?.user?.id,
        { name: customerName, dni: customerDni, phone: customerPhone },
        { discountType, discountValue, paymentMethod }
      );
      setCart([]);
      setCustomerName(''); setCustomerDni(''); setCustomerPhone('');
      setDiscountValue('');
      setMessage('✅ Venta confirmada y stock actualizado.');
      fetchProducts().then((products) => {
        const variants = products.flatMap((p) =>
          (p.variants || []).map((v) => ({ ...v, productName: p.name, price: Number(p.sale_price), productImage: p.images?.[0]?.url }))
        );
        setAllVariants(variants);
      });
    } catch (err) {
      setMessage('Error al confirmar la venta: ' + err.message);
    } finally {
      setConfirming(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="font-display text-3xl md:text-4xl text-[#F2F1ED] mb-6">Punto de venta</h1>

      {message && (
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded px-3 py-2 mb-4 text-sm text-[#F2F1ED]">{message}</div>
      )}

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 bg-[#17171A] border border-[#2A2A2E] rounded px-3 py-2.5">
              <Search size={15} className="text-[#8A8A8F]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar producto..."
                className="bg-transparent outline-none text-sm text-[#F2F1ED] w-full placeholder:text-[#4A4A4E]" />
            </div>
            <button onClick={() => setScanning(true)}
              className="bg-[#E8FF4D] text-[#0B0B0C] rounded px-3 py-2.5 flex items-center gap-1.5 text-sm font-semibold shrink-0">
              <Camera size={15} /> Escanear
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {filtered.map((v) => (
              <button key={v.id} onClick={() => addToCart(v)}
                className="text-left bg-[#17171A] border border-[#2A2A2E] rounded-lg overflow-hidden hover:border-[#E8FF4D] flex gap-3">
                <div className="w-16 h-16 bg-[#0B0B0C] shrink-0 flex items-center justify-center">
                  {(v.images?.[0]?.url || v.productImage) ? (
                    <img src={v.images?.[0]?.url || v.productImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ScanLine size={18} className="text-[#2A2A2E]" />
                  )}
                </div>
                <div className="py-3 pr-3 flex-1 min-w-0">
                  <div className="text-[#F2F1ED] text-sm font-medium truncate">{v.productName}</div>
                  <div className="text-xs text-[#8A8A8F] font-mono mb-2">{v.color} · {v.size}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-[#E8FF4D]">${v.price.toLocaleString('es-AR')}</span>
                    <span className="text-[10px] font-mono text-[#8A8A8F] flex items-center gap-1"><Tag size={10} /> stock {v.stock}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-lg p-5 h-fit sticky top-8">
          <h3 className="font-display text-lg text-[#F2F1ED] mb-4">Carrito</h3>
          <div className="flex flex-col gap-3 mb-4 max-h-72 overflow-y-auto">
            {cart.length === 0 && <p className="text-sm text-[#8A8A8F]">El carrito está vacío.</p>}
            {cart.map((i) => (
              <div key={i.id} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#F2F1ED] truncate">{i.productName}</div>
                  <div className="text-xs text-[#8A8A8F] font-mono">{i.color} · {i.size}</div>
                </div>
                <button onClick={() => changeQty(i.id, -1)} className="text-[#8A8A8F] hover:text-[#F2F1ED]"><Minus size={13} /></button>
                <span className="font-mono text-sm text-[#F2F1ED] w-4 text-center">{i.qty}</span>
                <button onClick={() => changeQty(i.id, 1)} className="text-[#8A8A8F] hover:text-[#F2F1ED]"><Plus size={13} /></button>
                <button onClick={() => removeItem(i.id)} className="text-[#8A8A8F] hover:text-[#FF6B57] ml-1"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
          <div className="border-t border-[#2A2A2E] pt-3 mb-3 flex flex-col gap-2">
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8F] font-mono">Descuento (opcional)</span>
            <div className="flex gap-2">
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}
                className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2 py-1.5 text-sm text-[#F2F1ED] outline-none">
                <option value="PERCENT">%</option>
                <option value="AMOUNT">$</option>
              </select>
              <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'PERCENT' ? 'Ej: 10' : 'Ej: 2000'}
                className="flex-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2.5 py-1.5 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D] placeholder:text-[#4A4A4E]" />
            </div>
          </div>

          <div className="mb-3 flex flex-col gap-2">
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8F] font-mono">Forma de pago</span>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
              className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2.5 py-1.5 text-sm text-[#F2F1ED] outline-none">
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>

          <div className="border-t border-[#2A2A2E] pt-3 mb-3 flex flex-col gap-2">
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8F] font-mono">Datos del cliente (opcional)</span>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nombre"
              className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2.5 py-1.5 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D] placeholder:text-[#4A4A4E]" />
            <div className="flex gap-2">
              <input value={customerDni} onChange={(e) => setCustomerDni(e.target.value)} placeholder="DNI"
                className="flex-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2.5 py-1.5 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D] placeholder:text-[#4A4A4E]" />
              <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="WhatsApp"
                className="flex-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2.5 py-1.5 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D] placeholder:text-[#4A4A4E]" />
            </div>
          </div>
          <div className="border-t border-[#2A2A2E] pt-3 flex flex-col gap-1.5 mb-4">
            {(() => {
              const discountAmount = discountType === 'PERCENT' ? subtotal * (Number(discountValue || 0) / 100) : Number(discountValue || 0);
              const total = Math.max(0, subtotal - discountAmount);
              return (
                <>
                  <div className="flex justify-between text-sm text-[#8A8A8F]">
                    <span>Subtotal</span>
                    <span className="font-mono">${subtotal.toLocaleString('es-AR')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-[#FF6B57]">
                      <span>Descuento</span>
                      <span className="font-mono">-${discountAmount.toLocaleString('es-AR')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#F2F1ED] font-medium">
                    <span>Total</span>
                    <span className="font-mono">${total.toLocaleString('es-AR')}</span>
                  </div>
                </>
              );
            })()}
          </div>
          <button onClick={handleConfirm} disabled={confirming || cart.length === 0}
            className="w-full bg-[#E8FF4D] text-[#0B0B0C] font-semibold text-sm rounded py-2.5 hover:bg-[#f2ff85] disabled:opacity-50">
            {confirming ? 'Confirmando...' : 'Confirmar venta'}
          </button>
        </div>
      </div>

      {scanning && <ScannerModal onDetected={handleDetected} onClose={() => setScanning(false)} />}
    </div>
  );
}
