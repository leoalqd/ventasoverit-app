// Instancia única de PrismaClient reutilizada en toda la app.
// Evita abrir múltiples conexiones a la base de datos.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
