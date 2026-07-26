const express = require('express');
const userController = require('./user.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const requirePermission = require('../../middleware/permission.middleware');

const router = express.Router();

// Todas las rutas de usuarios requieren estar autenticado.
router.use(authMiddleware);

router.get('/', requirePermission('users.read'), userController.list);
router.post('/', requirePermission('users.create'), userController.create);
router.put('/:id', requirePermission('users.update'), userController.update);
router.delete('/:id', requirePermission('users.delete'), userController.remove);

module.exports = router;
