// seed-admin.js
require('dotenv').config({ override: true });
const bcrypt = require('bcryptjs');
const db = require('./src/config/db.js');

(async () => {
    try {
        const passwordPlano = 'admin123';
        const hashReal = await bcrypt.hash(passwordPlano, 10);
        
        console.log('🔑 Hash generado:', hashReal);

        // Actualizar el admin existente
        const [result] = await db.execute(
            'UPDATE Usuarios SET password_hash = ? WHERE correo = ?',
            [hashReal, 'admin@importtruck.com']
        );

        if (result.affectedRows === 0) {
            // Si no existe, lo insertamos
            await db.execute(
                'INSERT INTO Usuarios (nombre, correo, password_hash, rol) VALUES (?, ?, ?, ?)',
                ['Administrador Principal', 'admin@importtruck.com', hashReal, 'admin']
            );
            console.log('✅ Usuario admin creado.');
        } else {
            console.log('✅ Contraseña del admin actualizada.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
})();