import React, { useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import Barcode from './Barcode';
import logo from '../assets/logo.png';

function usePageSize(mmWidth, mmHeight, styleId) {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `@media print { @page { size: ${mmWidth}mm ${mmHeight}mm; margin: 0; } body * { visibility: hidden; } #printable-label, #printable-label * { visibility: visible; } #printable-label { position: fixed; top: 0; left: 0; } }`;
    document.head.appendChild(style);
    return () => style.remove();
  }, [mmWidth, mmHeight, styleId]);
}

export default function ProductLabelModal({ variant, product, onClose }) {
  usePageSize(50, 25, 'print-page-size-product');
  const attrs = [variant.color, variant.size].filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-5 flex flex-col items-center gap-3">
        <div
          id="printable-label"
          className="bg-white border border-black rounded-[10px] flex flex-col justify-between overflow-hidden"
          style={{ width: '189px', height: '94px', padding: '6px 8px' }}
        >
          <div className="flex items-stretch gap-2" style={{ height: '52px' }}>
            <div className="flex items-center justify-center shrink-0" style={{ width: '54px' }}>
              <img src={logo} alt="Over It" className="w-full object-contain" />
            </div>
            <div className="w-px bg-black" />
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <div className="text-black text-[8px] font-extrabold leading-tight uppercase truncate">{product.name}</div>
                <div className="h-px bg-black mt-0.5" />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-black text-[5.5px] uppercase tracking-wide leading-none">Talle</div>
                  <div className="text-black text-[8px] font-semibold leading-tight border-b border-black truncate">{attrs.join(' ') || '-'}</div>
                </div>
                <div className="w-px self-stretch bg-black" />
                <div className="text-right shrink-0">
                  <div className="text-black text-[5.5px] uppercase tracking-wide leading-none">Precio</div>
                  <div className="text-black text-[10px] font-extrabold leading-tight">${Number(product.sale_price).toLocaleString('es-AR')}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Barcode value={variant.barcode} width={1} height={16} />
          </div>
        </div>

        <div className="flex gap-2 print:hidden">
          <button onClick={() => window.print()} className="bg-[#0B0B0C] text-white text-xs rounded px-3 py-1.5 flex items-center gap-1">
            <Printer size={12} /> Imprimir (50x25mm)
          </button>
          <button onClick={onClose} className="bg-gray-200 text-black text-xs rounded px-3 py-1.5 flex items-center gap-1">
            <X size={12} /> Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
