require('dotenv').config();
if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET) < 32) {
    throw new Error('JWT_SECRET debe contener al menos 32 bytes.');
}
const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 3000;

db.query('SELECT 1').then(() => {
    const server = app.listen(PORT, () => {
        console.log(`Servidor backend en puerto ${server.address().port}`);
    });
}).catch(async () => {
    console.error('No se pudo iniciar: comprueba la configuración de MySQL.');
    await db.end();
    process.exitCode = 1;
});
