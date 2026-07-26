const express = require('express');
const productController = require('./product.controller');
const labelController = require('./label.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const requirePermission = require('../../middleware/permission.middleware');

const router = express.Router();

router.use(authMiddleware);

// Productos
router.get('/', requirePermission('products.read'), productController.list);
router.get('/low-stock', requirePermission('products.read'), productController.lowStock);
router.get('/barcode/:barcode', requirePermission('products.read'), productController.findByBarcode);
router.get('/barcode/:barcode/image', requirePermission('products.read'), productController.barcodeImage);
router.get('/:id', requirePermission('products.read'), productController.getById);
router.post('/', requirePermission('products.create'), productController.create);
router.put('/:id', requirePermission('products.update'), productController.update);
router.delete('/:id', requirePermission('products.delete'), productController.remove);

// Variantes
router.post('/:id/variants', requirePermission('products.update'), productController.addVariant);
router.put('/variants/:variantId', requirePermission('products.update'), productController.updateVariant);
router.delete('/variants/:variantId', requirePermission('products.delete'), productController.removeVariant);

// Etiquetas en PDF (una o varias variantes a la vez)
router.post('/labels/pdf', requirePermission('products.read'), labelController.generateLabelsPdf);

module.exports = router;
