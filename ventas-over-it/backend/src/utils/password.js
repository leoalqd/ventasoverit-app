// Manejo centralizado de hashing de contraseñas con bcrypt.
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

/**
 * Genera el hash de una contraseña en texto plano.
 * @param {string} plainPassword
 * @returns {Promise<string>}
 */
async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compara una contraseña en texto plano contra su hash almacenado.
 * @param {string} plainPassword
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

module.exports = { hashPassword, comparePassword };
