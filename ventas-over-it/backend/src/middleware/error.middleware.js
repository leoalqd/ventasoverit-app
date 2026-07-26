// Manejador de errores centralizado. Cualquier error pasado con next(err)
// llega acá, evitando duplicar try/catch de respuesta en cada controlador.
function errorMiddleware(err, req, res, next) {
  console.error(err);

  // Errores de validación de Zod
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Datos inválidos.',
      details: err.errors,
    });
  }

  // Violación de restricción única de Prisma (ej: username duplicado)
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: `Ya existe un registro con ese valor en: ${err.meta?.target}`,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor.';

  res.status(statusCode).json({ error: message });
}

module.exports = errorMiddleware;
