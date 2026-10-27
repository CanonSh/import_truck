require("dotenv").config({ override: false });
const bcrypt = require("bcryptjs");
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const adminEmail = process.env.ADMIN_EMAIL?.trim();
const adminPassword = process.env.ADMIN_PASSWORD;
const passwordLength = adminPassword ? [...adminPassword].length : 0;
const passwordByteLength = adminPassword
  ? Buffer.byteLength(adminPassword, "utf8")
  : 0;

if (!adminEmail || !adminPassword) {
  console.error("Define ADMIN_EMAIL y ADMIN_PASSWORD en el entorno local.");
  process.exitCode = 1;
} else if (adminEmail.length > 100 || !EMAIL_PATTERN.test(adminEmail)) {
  console.error(
    "ADMIN_EMAIL debe ser un correo válido de hasta 100 caracteres.",
  );
  process.exitCode = 1;
} else if (passwordLength < 12 || passwordByteLength > 72) {
  console.error(
    "ADMIN_PASSWORD debe tener al menos 12 caracteres y no superar 72 bytes UTF-8.",
  );
  process.exitCode = 1;
} else {
  const createAdmin = async () => {
    const db = require("./src/config/db.js");
    let connection;

    try {
      connection = await db.getConnection();
      const [existingUsers] = await connection.execute(
        "SELECT id_usuario FROM Usuarios WHERE correo = ?",
        [adminEmail],
      );

      if (existingUsers.length > 0) {
        console.error(
          "Ya existe una cuenta con ese correo; no se realizaron cambios.",
        );
        process.exitCode = 1;
        return;
      }

      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await connection.execute(
        "INSERT INTO Usuarios (nombre, correo, password_hash, rol) VALUES (?, ?, ?, ?)",
        ["Administrador", adminEmail, passwordHash, "admin"],
      );
      console.log("Cuenta administrativa creada.");
    } catch {
      console.error("No se pudo aprovisionar la cuenta administrativa.");
      process.exitCode = 1;
    } finally {
      if (connection) connection.release();
      try {
        await db.end();
      } catch {
        process.exitCode = 1;
      }
    }
  };

  createAdmin();
}
