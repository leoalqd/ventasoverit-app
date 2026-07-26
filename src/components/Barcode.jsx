import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

// Renderiza un código de barras Code128 real (no un mockup visual).
export default function Barcode({ value, width = 1.6, height = 40 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        JsBarcode(canvasRef.current, value, {
          format: 'CODE128',
          width,
          height,
          displayValue: true,
          fontSize: 12,
          margin: 4,
        });
      } catch (err) {
        console.error('Error generando código de barras:', err);
      }
    }
  }, [value, width, height]);

  return <canvas ref={canvasRef} />;
}
