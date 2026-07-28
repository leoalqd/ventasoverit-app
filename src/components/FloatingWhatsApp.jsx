import React, { useEffect, useState } from 'react';
import { fetchStoreSettings } from '../lib/settings';

// Ícono de WhatsApp (SVG simple, sin dependencias externas).
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" fill="white">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 2.837.744 5.5 2.05 7.805L0 32l8.4-2.02A15.9 15.9 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.09c-2.55 0-4.95-.7-7-1.92l-.5-.3-5.05 1.22 1.24-4.92-.33-.52A13.05 13.05 0 0 1 2.91 16C2.91 8.78 8.78 2.91 16 2.91S29.09 8.78 29.09 16 23.22 29.09 16 29.09zm7.2-9.8c-.39-.2-2.32-1.14-2.68-1.27-.36-.13-.62-.2-.88.2-.26.39-1.01 1.27-1.24 1.53-.23.26-.46.29-.85.1-.39-.2-1.63-.6-3.11-1.92-1.15-1.02-1.93-2.29-2.16-2.68-.23-.39-.02-.6.17-.79.18-.18.39-.46.59-.7.2-.23.26-.39.39-.66.13-.26.07-.49-.03-.69-.1-.2-.88-2.12-1.2-2.9-.32-.76-.64-.66-.88-.67h-.75c-.26 0-.69.1-1.05.49-.36.39-1.37 1.34-1.37 3.26s1.41 3.78 1.6 4.04c.2.26 2.77 4.23 6.72 5.93.94.4 1.67.65 2.24.83.94.3 1.8.26 2.48.16.76-.11 2.32-.95 2.65-1.86.33-.92.33-1.7.23-1.86-.1-.16-.36-.26-.75-.46z" />
    </svg>
  );
}

export default function FloatingWhatsApp() {
  const [number, setNumber] = useState('');

  useEffect(() => {
    fetchStoreSettings().then((s) => setNumber(s?.whatsapp_number || '')).catch(() => {});
  }, []);

  if (!number) return null;

  const cleanNumber = number.replace(/[^0-9]/g, '');

  return (
    <a
      href={`https://wa.me/${cleanNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      aria-label="Escribinos por WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  );
}
