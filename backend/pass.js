// Provisionar un administrador explícitamente, sin contraseñas compartidas.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

(async () => {
  try {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = 'Administrador' } = process.env;
    if (!ADMIN_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_EMAIL) || ADMIN_EMAIL.length > 100 ||
        !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12 || Buffer.byteLength(ADMIN_PASSWORD) > 72 ||
        !ADMIN_NAME.trim() || ADMIN_NAME.length > 100) {
      throw new Error('Configura ADMIN_EMAIL, ADMIN_NAME y ADMIN_PASSWORD (12 caracteres mínimo, 72 bytes máximo).');
    }
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const [users] = await db.execute('SELECT id_usuario FROM Usuarios WHERE correo = ?', [ADMIN_EMAIL]);
    if (users.length) {
      if (process.env.ALLOW_ADMIN_RESET !== 'true') throw new Error('La cuenta existe; para restablecerla utiliza ALLOW_ADMIN_RESET=true.');
      await db.execute("UPDATE Usuarios SET password_hash = ?, rol = 'admin' WHERE correo = ?", [hash, ADMIN_EMAIL]);
    } else {
      await db.execute("INSERT INTO Usuarios (nombre, correo, password_hash, rol) VALUES (?, ?, ?, 'admin')", [ADMIN_NAME, ADMIN_EMAIL, hash]);
    }
    console.log('Administrador configurado.');
  } catch (error) {
    // No imprimir errores SQL: podrían incluir parámetros privados.
    console.error(error.code ? 'No se pudo configurar el administrador.' : error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();
