const prisma = require('../../config/db');
const { generateSku, generateBarcodeValue } = require('../../utils/barcode');

const variantInclude = { variants: true, images: true, category: true, brand: true };

async function listProducts({ search, categoryId, brandId, status } = {}) {
  return prisma.product.findMany({
    where: {
      status: status || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      brandId: brandId ? Number(brandId) : undefined,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { internalCode: { contains: search, mode: 'insensitive' } },
            { variants: { some: { barcode: { contains: search } } } },
          ]
        : undefined,
    },
    include: variantInclude,
    orderBy: { createdAt: 'desc' },
  });
}

async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: variantInclude,
  });
  if (!product) {
    const err = new Error('Producto no encontrado.');
    err.statusCode = 404;
    throw err;
  }
  return product;
}

/**
 * Crea un producto junto con sus variantes iniciales (color/talle/stock).
 * Cada variante recibe automáticamente un SKU y un código de barras únicos.
 */
async function createProduct({
  name,
  description,
  internalCode,
  purchasePrice,
  salePrice,
  categoryId,
  brandId,
  images = [],
  variants = [],
}) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name,
        description,
        internalCode,
        purchasePrice,
        salePrice,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        images: { create: images.map((url, idx) => ({ url, isPrimary: idx === 0 })) },
      },
    });

    for (const v of variants) {
      await tx.productVariant.create({
        data: {
          productId: product.id,
          color: v.color,
          size: v.size,
          stock: v.stock ?? 0,
          minStock: v.minStock ?? 0,
          sku: generateSku(internalCode, v.color, v.size),
          barcode: generateBarcodeValue(),
        },
      });
    }

    return tx.product.findUnique({ where: { id: product.id }, include: variantInclude });
  });
}

async function updateProduct(id, data) {
  const { images, variants, ...productData } = data;
  return prisma.product.update({
    where: { id: Number(id) },
    data: productData,
    include: variantInclude,
  });
}

async function deleteProduct(id) {
  // Baja lógica: se marca inactivo para no perder historial de ventas asociado.
  return prisma.product.update({
    where: { id: Number(id) },
    data: { status: 'INACTIVE' },
  });
}

/**
 * Agrega una nueva variante (ej: nuevo color/talle) a un producto existente.
 */
async function addVariant(productId, { color, size, stock = 0, minStock = 0 }) {
  const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
  if (!product) {
    const err = new Error('Producto no encontrado.');
    err.statusCode = 404;
    throw err;
  }

  return prisma.productVariant.create({
    data: {
      productId: product.id,
      color,
      size,
      stock,
      minStock,
      sku: generateSku(product.internalCode, color, size),
      barcode: generateBarcodeValue(),
    },
  });
}

async function updateVariant(variantId, data) {
  return prisma.productVariant.update({
    where: { id: Number(variantId) },
    data,
  });
}

async function deleteVariant(variantId) {
  return prisma.productVariant.delete({ where: { id: Number(variantId) } });
}

async function findVariantByBarcode(barcode) {
  const variant = await prisma.productVariant.findUnique({
    where: { barcode },
    include: { product: true },
  });
  if (!variant) {
    const err = new Error('No se encontró ninguna variante con ese código de barras.');
    err.statusCode = 404;
    throw err;
  }
  return variant;
}

async function listLowStockVariants() {
  // Trae variantes cuyo stock actual es menor o igual al mínimo configurado.
  const variants = await prisma.productVariant.findMany({
    include: { product: true },
  });
  return variants.filter((v) => v.stock <= v.minStock);
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  findVariantByBarcode,
  listLowStockVariants,
};
