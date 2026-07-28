import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function QrCode({ value, size = 90 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, { width: size, margin: 1 }, (err) => {
        if (err) console.error('Error generando QR:', err);
      });
    }
  }, [value, size]);

  return <canvas ref={canvasRef} />;
}
