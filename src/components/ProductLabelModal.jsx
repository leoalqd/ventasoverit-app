import React from 'react';
import { Printer, X } from 'lucide-react';
import Barcode from './Barcode';
import PrintFrame from './PrintFrame';
import logo from '../assets/logo.png';

function LabelContent({ variant, product }) {
  const attrs = [variant.color, variant.size].filter(Boolean);
  return (
    <div
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
  );
}

export default function ProductLabelModal({ variant, product, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-5 flex flex-col items-center gap-3">
        {/* Vista previa en pantalla */}
        <LabelContent variant={variant} product={product} />

        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-[#0B0B0C] text-white text-xs rounded px-3 py-1.5 flex items-center gap-1">
            <Printer size={12} /> Imprimir (50x25mm)
          </button>
          <button onClick={onClose} className="bg-gray-200 text-black text-xs rounded px-3 py-1.5 flex items-center gap-1">
            <X size={12} /> Cerrar
          </button>
        </div>
        <p className="text-[10px] text-gray-500 text-center max-w-[220px]">
          Si en la hoja aparece una fecha o dirección web arriba/abajo: en el cuadro de impresión, abrí "Más ajustes" y destildá "Encabezados y pies de página".
        </p>
      </div>

      {/* Lo único que se manda a imprimir: la etiqueta, tamaño real 50x25mm */}
      <PrintFrame mmWidth={50} mmHeight={25}>
        <LabelContent variant={variant} product={product} />
      </PrintFrame>
    </div>
  );
}
