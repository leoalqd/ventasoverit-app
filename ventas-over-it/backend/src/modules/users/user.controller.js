const { z } = require('zod');
const userService = require('./user.service');

const createUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  roleName: z.enum(['ADMIN', 'EMPLOYEE']),
});

const updateUserSchema = createUserSchema.partial();

async function list(req, res, next) {
  try {
    const users = await userService.listUsers();
    // Nunca devolvemos el hash de la contraseña al cliente.
    res.json(users.map(({ passwordHash, ...rest }) => rest));
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await userService.createUser(data);
    const { passwordHash, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = updateUserSchema.parse(req.body);
    const user = await userService.updateUser(req.params.id, data);
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: 'Usuario desactivado correctamente.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
