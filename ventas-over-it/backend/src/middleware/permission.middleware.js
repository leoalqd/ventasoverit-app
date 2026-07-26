// Verifica que el rol del usuario autenticado tenga el permiso requerido.
// Los permisos se consultan en base de datos (tabla roles <-> permissions),
// por lo que son configurables sin tocar el código.
const prisma = require('../config/db');

function requirePermission(permissionKey) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado.' });
      }

      // El administrador tiene acceso total por definición.
      if (req.user.role === 'ADMIN') {
        return next();
      }

      const roleWithPermissions = await prisma.role.findUnique({
        where: { name: req.user.role },
        include: { permissions: true },
      });

      const hasPermission = roleWithPermissions?.permissions.some(
        (p) => p.key === permissionKey
      );

      if (!hasPermission) {
        return res.status(403).json({ error: 'No tenés permiso para realizar esta acción.' });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = requirePermission;
