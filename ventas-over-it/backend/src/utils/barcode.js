// Generación de SKU único y renderizado de código de barras Code128.
const bwipjs = require('bwip-js');
const crypto = require('crypto');

/**
 * Genera un SKU único y legible para una variante, a partir del código
 * interno del producto y los atributos de la variante.
 * Ej: REM-NIKE-001-NEG-M
 */
function generateSku(productInternalCode, color, size) {
  const parts = [productInternalCode];
  if (color) parts.push(color.slice(0, 3).toUpperCase());
  if (size) parts.push(size.toUpperCase());
  // Sufijo corto aleatorio para garantizar unicidad aunque se repita color/talle.
  parts.push(crypto.randomBytes(2).toString('hex').toUpperCase());
  return parts.join('-');
}

/**
 * El código de barras Code128 puede codificar directamente el SKU,
 * pero como los SKU llevan guiones y letras, generamos además un
 * código puramente numérico de 12 dígitos para máxima compatibilidad
 * con lectores físicos y de cámara.
 */
function generateBarcodeValue() {
  // 12 dígitos numéricos aleatorios (no es EAN con checksum real,
  // es un identificador interno propio de la tienda).
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

/**
 * Renderiza un código de barras Code128 como PNG (buffer) para
 * mostrarlo en pantalla o incrustarlo en una etiqueta/PDF.
 * @param {string} value - Valor a codificar (ej: variant.barcode)
 * @param {string} [label] - Texto adicional a mostrar debajo del código
 * @returns {Promise<Buffer>}
 */
function renderBarcodePng(value, label) {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: 'code128',
        text: value,
        scale: 3,
        height: 12,
        includetext: true,
        textxalign: 'center',
        alttext: label || undefined,
      },
      (err, png) => {
        if (err) return reject(err);
        resolve(png);
      }
    );
  });
}

module.exports = { generateSku, generateBarcodeValue, renderBarcodePng };
