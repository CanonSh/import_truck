const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { correo, password } = req.body;

    try {
        const [rows] = await db.execute('SELECT * FROM Usuarios WHERE correo = ?', [correo]);
        if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        const usuario = rows[0];
        
        // Comparar contraseña encriptada
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValida) return res.status(401).json({ error: 'Contraseña incorrecta' });

        // Generar Token (válido por 8 horas)
        const token = jwt.sign(
            { id: usuario.id_usuario, rol: usuario.rol, nombre: usuario.nombre }, 
            process.env.JWT_SECRET, 
            { expiresIn: '8h' }
        );

        res.json({ mensaje: 'Login exitoso', token, usuario: { nombre: usuario.nombre, rol: usuario.rol } });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};