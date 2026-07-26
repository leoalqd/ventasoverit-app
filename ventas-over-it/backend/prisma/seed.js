// Script de inicialización. Crea roles, permisos base y el usuario
// administrador inicial usando SOLO variables de entorno (nunca valores
// hardcodeados en el código fuente).
//
// Uso:
//   1. Completar SEED_ADMIN_USERNAME / SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD en .env
//   2. Ejecutar: npm run seed
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const PERMISSIONS = [
  { key: 'products.read', label: 'Ver productos' },
  { key: 'products.create', label: 'Crear productos' },
  { key: 'products.update', label: 'Editar productos' },
  { key: 'products.delete', label: 'Eliminar productos' },
  { key: 'sales.create', label: 'Registrar ventas' },
  { key: 'sales.read', label: 'Ver historial de ventas' },
  { key: 'stock.adjust', label: 'Ajustar stock' },
  { key: 'users.read', label: 'Ver usuarios' },
  { key: 'users.create', label: 'Crear usuarios' },
  { key: 'users.update', label: 'Editar usuarios' },
  { key: 'users.delete', label: 'Eliminar usuarios' },
  { key: 'orders.manage', label: 'Gestionar pedidos de la tienda' },
  { key: 'reports.view', label: 'Ver reportes' },
];

async function main() {
  const { SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env;

  if (!SEED_ADMIN_USERNAME || !SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    throw new Error(
      'Faltan variables de entorno SEED_ADMIN_USERNAME / SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD. Completá el archivo .env antes de correr el seed.'
    );
  }

  // 1. Crear permisos (idempotente)
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: {},
      create: perm,
    });
  }

  const allPermissions = await prisma.permission.findMany();

  // 2. Crear rol ADMIN con todos los permisos
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: { permissions: { set: allPermissions.map((p) => ({ id: p.id })) } },
    create: {
      name: 'ADMIN',
      description: 'Administrador con acceso total al sistema',
      permissions: { connect: allPermissions.map((p) => ({ id: p.id })) },
    },
  });

  // 3. Crear rol EMPLOYEE con permisos operativos básicos (configurable luego desde el panel)
  const employeePermKeys = ['products.read', 'sales.create', 'sales.read', 'stock.adjust'];
  await prisma.role.upsert({
    where: { name: 'EMPLOYEE' },
    update: {},
    create: {
      name: 'EMPLOYEE',
      description: 'Empleado con permisos operativos configurables',
      permissions: {
        connect: allPermissions
          .filter((p) => employeePermKeys.includes(p.key))
          .map((p) => ({ id: p.id })),
      },
    },
  });

  // 4. Crear usuario administrador inicial (solo si no existe)
  const existingAdmin = await prisma.user.findUnique({ where: { username: SEED_ADMIN_USERNAME } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 12);
    await prisma.user.create({
      data: {
        username: SEED_ADMIN_USERNAME,
        email: SEED_ADMIN_EMAIL,
        passwordHash,
        fullName: 'Administrador',
        roleId: adminRole.id,
      },
    });
    console.log(`✅ Usuario administrador "${SEED_ADMIN_USERNAME}" creado correctamente.`);
  } else {
    console.log(`ℹ️ El usuario administrador "${SEED_ADMIN_USERNAME}" ya existe, no se modificó.`);
  }

  console.log('✅ Seed completado: roles y permisos inicializados.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
