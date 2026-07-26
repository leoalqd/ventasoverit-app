// Capa HTTP del módulo de autenticación: valida la entrada y delega al servicio.
const { z } = require('zod');
const authService = require('./auth.service');

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

async function login(req, res, next) {
  try {
    const { username, password } = loginSchema.parse(req.body);
    const result = await authService.login(username, password);

    // El refresh token se envía como cookie httpOnly para mayor seguridad.
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: result.accessToken, user: result.user });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) return res.status(401).json({ error: 'Refresh token no proporcionado.' });

    const result = await authService.refresh(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (token) await authService.logout(token);
    res.clearCookie('refreshToken');
    res.json({ message: 'Sesión cerrada correctamente.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, refresh, logout };
