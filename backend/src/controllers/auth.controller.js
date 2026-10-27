const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dummyHash = bcrypt.hashSync('unavailable-account', 10);

exports.login = async (req, res) => {
    const { correo, password } = req.body;

    try {
        const [rows] = await db.execute('SELECT * FROM Usuarios WHERE correo = ?', [correo]);
        const usuario = rows[0];
        
        // Comparar contraseña encriptada
        // También comparar cuando no existe el correo para no revelar cuentas por tiempo.
        const passwordValida = await bcrypt.compare(password, usuario?.password_hash || dummyHash);
        if (!usuario || !passwordValida) return res.status(401).json({ error: 'Credenciales incorrectas' });

        // Generar Token (válido por 8 horas)
        const token = jwt.sign(
            { id: usuario.id_usuario, rol: usuario.rol, nombre: usuario.nombre }, 
            process.env.JWT_SECRET, 
            { expiresIn: '8h', algorithm: 'HS256' }
        );

        res.json({ mensaje: 'Login exitoso', token, usuario: { nombre: usuario.nombre, rol: usuario.rol } });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};
