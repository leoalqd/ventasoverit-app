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

  useEffect(() => {
    fetchProducts().then((products) => {
      const variants = products.flatMap((p) =>
        (p.variants || []).map((v) => ({ ...v, productName: p.name, price: Number(p.sale_price) }))
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
      await confirmSale(cart, session?.user?.id);
      setCart([]);
      setMessage('✅ Venta confirmada y stock actualizado.');
      fetchProducts().then((products) => {
        const variants = products.flatMap((p) =>
          (p.variants || []).map((v) => ({ ...v, productName: p.name, price: Number(p.sale_price) }))
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
                className="text-left bg-[#17171A] border border-[#2A2A2E] rounded-lg p-4 hover:border-[#E8FF4D]">
                <div className="text-[#F2F1ED] text-sm font-medium">{v.productName}</div>
                <div className="text-xs text-[#8A8A8F] font-mono mb-2">{v.color} · {v.size}</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-[#E8FF4D]">${v.price.toLocaleString('es-AR')}</span>
                  <span className="text-[10px] font-mono text-[#8A8A8F] flex items-center gap-1"><ScanLine size={10} /> stock {v.stock}</span>
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
          <div className="border-t border-[#2A2A2E] pt-3 flex flex-col gap-1.5 mb-4">
            <div className="flex justify-between text-[#F2F1ED] font-medium">
              <span>Total</span>
              <span className="font-mono">${subtotal.toLocaleString('es-AR')}</span>
            </div>
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
