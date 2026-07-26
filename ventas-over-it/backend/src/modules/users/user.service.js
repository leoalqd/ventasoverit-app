const prisma = require('../../config/db');
const { hashPassword } = require('../../utils/password');

async function listUsers() {
  return prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function createUser({ username, email, password, fullName, roleName }) {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    const err = new Error(`El rol "${roleName}" no existe.`);
    err.statusCode = 400;
    throw err;
  }

  const passwordHash = await hashPassword(password);

  return prisma.user.create({
    data: { username, email, passwordHash, fullName, roleId: role.id },
    include: { role: true },
  });
}

async function updateUser(id, data) {
  const updateData = { ...data };

  // Si viene una nueva contraseña, se hashea antes de guardar.
  if (data.password) {
    updateData.passwordHash = await hashPassword(data.password);
    delete updateData.password;
  }

  if (data.roleName) {
    const role = await prisma.role.findUnique({ where: { name: data.roleName } });
    if (!role) {
      const err = new Error(`El rol "${data.roleName}" no existe.`);
      err.statusCode = 400;
      throw err;
    }
    updateData.roleId = role.id;
    delete updateData.roleName;
  }

  return prisma.user.update({
    where: { id: Number(id) },
    data: updateData,
    include: { role: true },
  });
}

async function deleteUser(id) {
  // Baja lógica en vez de borrado físico, para no perder historial de ventas/logs asociados.
  return prisma.user.update({
    where: { id: Number(id) },
    data: { isActive: false },
  });
}

module.exports = { listUsers, createUser, updateUser, deleteUser };
