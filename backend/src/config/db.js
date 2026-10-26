const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar conexión
pool.getConnection()
    .then(conn => {
        console.log('✅ Conectado a la base de datos MySQL');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Error conectando a MySQL:', err.message);
    });

module.exports = pool;