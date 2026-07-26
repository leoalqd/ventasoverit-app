// Genera SKU y valor de código de barras para una variante nueva.
// No requiere backend: se calcula en el navegador antes de guardar en Supabase.
export function generateSku(internalCode, color, size) {
  const parts = [internalCode];
  if (color) parts.push(color.slice(0, 3).toUpperCase());
  if (size) parts.push(size.toUpperCase());
  parts.push(Math.random().toString(16).slice(2, 6).toUpperCase());
  return parts.join('-');
}

export function generateBarcodeValue() {
  let code = '';
  for (let i = 0; i < 12; i++) code += Math.floor(Math.random() * 10);
  return code;
}
