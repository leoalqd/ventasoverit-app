const { z } = require('zod');
const productService = require('./product.service');
const { renderBarcodePng } = require('../../utils/barcode');

const variantSchema = z.object({
  color: z.string().optional(),
  size: z.string().optional(),
  stock: z.number().int().nonnegative().optional(),
  minStock: z.number().int().nonnegative().optional(),
});

const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  internalCode: z.string().min(1),
  purchasePrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  categoryId: z.number().int().optional(),
  brandId: z.number().int().optional(),
  images: z.array(z.string().url()).optional(),
  variants: z.array(variantSchema).min(1, 'El producto debe tener al menos una variante.'),
});

const updateProductSchema = createProductSchema.partial().omit({ variants: true });

async function list(req, res, next) {
  try {
    const { search, categoryId, brandId, status } = req.query;
    const products = await productService.listProducts({ search, categoryId, brandId, status });
    res.json(products);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = createProductSchema.parse(req.body);
    const product = await productService.createProduct(data);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = updateProductSchema.parse(req.body);
    const product = await productService.updateProduct(req.params.id, data);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ message: 'Producto desactivado correctamente.' });
  } catch (err) {
    next(err);
  }
}

async function addVariant(req, res, next) {
  try {
    const data = variantSchema.parse(req.body);
    const variant = await productService.addVariant(req.params.id, data);
    res.status(201).json(variant);
  } catch (err) {
    next(err);
  }
}

async function updateVariant(req, res, next) {
  try {
    const data = variantSchema.partial().parse(req.body);
    const variant = await productService.updateVariant(req.params.variantId, data);
    res.json(variant);
  } catch (err) {
    next(err);
  }
}

async function removeVariant(req, res, next) {
  try {
    await productService.deleteVariant(req.params.variantId);
    res.json({ message: 'Variante eliminada correctamente.' });
  } catch (err) {
    next(err);
  }
}

async function findByBarcode(req, res, next) {
  try {
    const variant = await productService.findVariantByBarcode(req.params.barcode);
    res.json(variant);
  } catch (err) {
    next(err);
  }
}

async function lowStock(req, res, next) {
  try {
    const variants = await productService.listLowStockVariants();
    res.json(variants);
  } catch (err) {
    next(err);
  }
}

// Devuelve la imagen PNG del código de barras de una variante, lista para imprimir.
async function barcodeImage(req, res, next) {
  try {
    const variant = await productService.findVariantByBarcode(req.params.barcode);
    const png = await renderBarcodePng(variant.barcode, variant.product.name);
    res.set('Content-Type', 'image/png');
    res.send(png);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  addVariant,
  updateVariant,
  removeVariant,
  findByBarcode,
  lowStock,
  barcodeImage,
};
