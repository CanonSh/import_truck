const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares globales
app.use(cors()); // Permite peticiones desde React
app.use(express.json()); // Permite leer JSON en el body
app.use(express.urlencoded({ extended: true }));

// Servir la carpeta de imágenes estáticamente
// Ejemplo: http://localhost:3000/uploads/123456.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Importar Rutas
const authRoutes = require('./routes/auth.routes');
const vehiculoRoutes = require('./routes/vehiculo.routes');
const publicRoutes = require('./routes/public.routes');
const adminRoutes = require('./routes/admin.routes');

// Usar Rutas
app.use('/api/auth', authRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores (DEBE tener 4 parámetros: err, req, res, next)
app.use((err, req, res, next) => {
    console.error('💥 Error:', err.message);
    if (err.message === 'El archivo debe ser una imagen') {
        return res.status(400).json({ error: err.message });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Archivo demasiado grande (máx 5MB)' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;