// Lógica de negocio de autenticación, separada del controlador HTTP.
const prisma = require('../../config/db');
const { comparePassword } = require('../../utils/password');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../../utils/jwt');

class AuthError extends Error {
  constructor(message, statusCode = 401) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function login(username, password) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: { role: true },
  });

  if (!user || !user.isActive) {
    throw new AuthError('Usuario o contraseña incorrectos.');
  }

  const validPassword = await comparePassword(password, user.passwordHash);
  if (!validPassword) {
    throw new AuthError('Usuario o contraseña incorrectos.');
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  // Guardamos el refresh token en base para poder revocarlo (logout, seguridad).
  const decoded = verifyRefreshToken(refreshToken);
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(decoded.exp * 1000),
    },
  });

  await prisma.activityLog.create({
    data: { userId: user.id, action: 'LOGIN' },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role.name,
    },
  };
}

async function refresh(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthError('Refresh token inválido o expirado.');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AuthError('Refresh token inválido o revocado.');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { role: true },
  });

  if (!user || !user.isActive) {
    throw new AuthError('Usuario no encontrado o inactivo.');
  }

  const newAccessToken = signAccessToken(user);
  return { accessToken: newAccessToken };
}

async function logout(refreshToken) {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revoked: true },
  });
}

module.exports = { login, refresh, logout, AuthError };
