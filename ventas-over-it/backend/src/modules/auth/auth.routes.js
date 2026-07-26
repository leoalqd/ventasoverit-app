const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('./auth.controller');

const router = express.Router();

// Limita intentos de login para mitigar ataques de fuerza bruta.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: { error: 'Demasiados intentos de inicio de sesión. Intentá de nuevo más tarde.' },
});

router.post('/login', loginLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
