import React, { useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import Barcode from './Barcode';

// Inserta un <style> con el tamaño de página exacto (50mm x 25mm) mientras
// este modal está abierto, para que "Imprimir" saque justo el tamaño de
// etiqueta esperado en impresoras térmicas o de etiquetas autoadhesivas.
function usePageSize(mmWidth, mmHeight) {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'print-page-size';
    style.innerHTML = `@media print { @page { size: ${mmWidth}mm ${mmHeight}mm; margin: 0; } body * { visibility: hidden; } #printable-label, #printable-label * { visibility: visible; } #printable-label { position: fixed; top: 0; left: 0; } }`;
    document.head.appendChild(style);
    return () => style.remove();
  }, [mmWidth, mmHeight]);
}

export default function ProductLabelModal({ variant, product, onClose }) {
  usePageSize(50, 25);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-5 flex flex-col items-center gap-3">
        <div id="printable-label" className="bg-white flex flex-col items-center justify-center gap-0.5"
          style={{ width: '189px', height: '94px' /* 50mm x 25mm a 96dpi */ }}>
          <span className="text-black text-[9px] font-semibold leading-tight text-center px-1">{product.name}</span>
          <span className="text-black text-[8px] leading-tight">{[variant.color, variant.size].filter(Boolean).join(' / ')}</span>
          <Barcode value={variant.barcode} width={1.1} height={22} />
          <span className="text-black text-[10px] font-bold">${Number(product.sale_price).toLocaleString('es-AR')}</span>
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
