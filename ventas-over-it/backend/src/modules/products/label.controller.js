// Genera un PDF con una etiqueta por variante solicitada, cada una con su
// código de barras Code128, nombre del producto, color/talle y precio.
// Pensado para imprimirse en impresoras de etiquetas estándar o en A4.
const { z } = require('zod');
const PDFDocument = require('pdfkit');
const prisma = require('../../config/db');
const { renderBarcodePng } = require('../../utils/barcode');

const requestSchema = z.object({
  variantIds: z.array(z.number().int()).min(1, 'Especificá al menos una variante.'),
  copiesPerVariant: z.number().int().min(1).max(50).default(1),
});

const LABEL_WIDTH = 226; // ~8cm en puntos, tamaño típico de etiqueta térmica
const LABEL_HEIGHT = 113; // ~4cm

async function generateLabelsPdf(req, res, next) {
  try {
    const { variantIds, copiesPerVariant } = requestSchema.parse(req.body);

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    if (variants.length === 0) {
      return res.status(404).json({ error: 'No se encontraron variantes para esas IDs.' });
    }

    const doc = new PDFDocument({ size: [LABEL_WIDTH, LABEL_HEIGHT], margin: 8 });
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="etiquetas.pdf"');
    doc.pipe(res);

    let firstPage = true;
    for (const variant of variants) {
      const barcodePng = await renderBarcodePng(variant.barcode, variant.product.name);

      for (let i = 0; i < copiesPerVariant; i++) {
        if (!firstPage) doc.addPage({ size: [LABEL_WIDTH, LABEL_HEIGHT], margin: 8 });
        firstPage = false;

        doc.fontSize(9).text(variant.product.name, { align: 'center' });
        const attrs = [variant.color, variant.size].filter(Boolean).join(' / ');
        if (attrs) doc.fontSize(8).text(attrs, { align: 'center' });

        doc.image(barcodePng, { fit: [200, 60], align: 'center' });

        doc.fontSize(10).text(
          `$${Number(variant.product.salePrice).toFixed(2)}`,
          { align: 'center' }
        );
      }
    }

    doc.end();
  } catch (err) {
    next(err);
  }
}

module.exports = { generateLabelsPdf };
