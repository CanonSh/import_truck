const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mysql = require('mysql2/promise');
const { randomUUID } = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');
const sharp = require('sharp');

// El nombre se genera aquí: jamás reutilizar una base existente o DB_NAME del usuario.
const database = `import_truck_test_${randomUUID().replaceAll('-', '')}`;
let adminDB, db, server, base, token, employeeToken, vacancy, closedVacancy, service;
const createdFiles = new Set();
const uploadDir = path.resolve(__dirname, '../uploads');
const config = {
  host: process.env.TEST_DB_HOST,
  port: Number(process.env.TEST_DB_PORT || 3306),
  user: process.env.TEST_DB_USER,
  password: process.env.TEST_DB_PASSWORD || '',
};
before(async () => {
  assert.ok(config.host && config.user, 'Define TEST_DB_HOST y TEST_DB_USER explícitamente');
  adminDB = await mysql.createConnection(config);
  await adminDB.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  process.env.DB_HOST = config.host;
  process.env.DB_PORT = String(config.port);
  process.env.DB_USER = config.user;
  process.env.DB_PASSWORD = config.password;
  process.env.DB_NAME = database;
  process.env.JWT_SECRET = randomUUID() + randomUUID();
  db = require('../src/config/db');
  const sql = (await fs.readFile(path.resolve(__dirname, '../script_base_de_datos.sql'), 'utf8'))
    .replace(/^CREATE DATABASE[^\n]*\n|^USE [^\n]*\n/gm, '');
  // Ejecutar dos veces verifica que el esquema no duplique semillas ni falle por cuentas existentes.
  for (let run = 0; run < 2; run++) for (const statement of sql.replace(/--[^\n]*/g, '').split(';')) {
    if (statement.replace(/--[^\n]*/g, '').trim()) await db.query(statement);
  }
  const hash = await bcrypt.hash(randomUUID(), 10);
  // Contraseña efímera usada solo durante esta ejecución.
  const password = randomUUID();
  const adminHash = await bcrypt.hash(password, 10);
  await db.execute('INSERT INTO Usuarios (nombre,correo,password_hash,rol) VALUES (?,?,?,?),(?,?,?,?)',
    ['Admin', 'admin@example.test', adminHash, 'admin', 'Empleado', 'employee@example.test', adminHash, 'empleado']);
  await db.execute('INSERT INTO Usuarios (nombre,correo,password_hash) VALUES (?,?,?)', ['Least privilege','default@example.test',hash]);
  assert.equal((await db.query("SELECT rol FROM Usuarios WHERE correo = 'default@example.test'"))[0][0].rol, 'empleado');
  const [active] = await db.execute("INSERT INTO Vacantes (titulo_puesto,descripcion_puesto,fecha_publicacion) VALUES ('Conductor','Prueba',CURRENT_DATE)");
  vacancy = active.insertId;
  const [closed] = await db.execute("INSERT INTO Vacantes (titulo_puesto,descripcion_puesto,fecha_publicacion,estado_vacante) VALUES ('Cerrada','Prueba',CURRENT_DATE,'Cerrada')");
  closedVacancy = closed.insertId;
  const [s] = await db.execute("INSERT INTO Servicios (nombre_servicio,descripcion,tarifa_estimada) VALUES ('Transporte','Prueba',100)");
  service = s.insertId;
  const app = require('../src/app');
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  token = (await (await send('POST', '/api/auth/login', {correo:'admin@example.test', password})).json()).token;
  employeeToken = (await (await send('POST', '/api/auth/login', {correo:'employee@example.test', password})).json()).token;
  assert.ok(token && employeeToken);
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (db) await db.end();
  if (adminDB) {
    await adminDB.query(`DROP DATABASE IF EXISTS \`${database}\``);
    await adminDB.end();
  }
  for (const filename of createdFiles) await fs.unlink(path.join(uploadDir, filename)).catch(() => {});
});
function send(method, route, body, authToken) {
  const headers = authToken ? {authorization:`Bearer ${authToken}`} : {};
  if (body && !(body instanceof FormData)) headers['content-type'] = 'application/json';
  return fetch(base + route, {method, headers, body:body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body)});
}
const vehicle = {tipo_vehiculo:'Camión', marca:'Integration', modelo:'Prueba', anio:2020, precio:15000, estado:'Disponible'};
async function addVehicle(extra = {}) {
  const response = await send('POST', '/api/vehiculos', {...vehicle, ...extra}, token);
  assert.equal(response.status, 201, JSON.stringify(await response.clone().json()));
  return response.json();
}
const quote = {nombre_cliente:'Cliente', correo_cliente:'client@example.test', telefono_cliente:'+503 7777-7777', requerimiento:'Solicito transporte'};
const application = {nombre_candidato:'Candidato', correo_candidato:'candidate@example.test', telefono_candidato:'7777-7777', experiencia:'Experiencia de prueba'};
const waitRemoved = async (filename) => {
  for (let i = 0; i < 40; i++) {
    try { await fs.access(path.join(uploadDir, filename)); } catch { return; }
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  assert.fail(`No se limpió ${filename}`);
};

test('MySQL real: esquema InnoDB, autenticación y permisos de todas las rutas administrativas', async () => {
  const [tables] = await db.query('SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?', [database]);
  assert.equal(tables.length, 7);
  assert.ok(tables.every(table => table.ENGINE === 'InnoDB'));
  for (const route of ['/api/admin/cotizaciones','/api/admin/cotizaciones/1','/api/admin/mensajes','/api/admin/solicitudes']) {
    assert.equal((await send('GET', route)).status, 401);
    assert.equal((await send('GET', route, undefined, employeeToken)).status, 403);
    const response = await send('GET', route, undefined, token);
    assert.equal(response.status, route.endsWith('/1') ? 404 : 200);
  }
  for (const method of ['POST','PUT','DELETE']) {
    const route = method === 'POST' ? '/api/vehiculos' : '/api/vehiculos/1';
    assert.equal((await send(method, route, vehicle)).status, 401);
    assert.equal((await send(method, route, vehicle, employeeToken)).status, 403);
  }
});

test('MySQL real: inventario, filtros, CRUD y consulta inexistente', async () => {
  const {id} = await addVehicle();
  const details = await (await send('GET', `/api/vehiculos/${id}`)).json();
  assert.equal(details.marca, vehicle.marca);
  const rows = await (await send('GET', '/api/vehiculos?marca=Integration&anio=2020&busqueda=Prueba')).json();
  assert.ok(rows.some(row => row.id_vehiculo === id));
  const injection = await (await send('GET', `/api/vehiculos?marca=${encodeURIComponent("' OR 1=1 --")}`)).json();
  assert.deepEqual(injection, []);
  assert.equal((await send('PUT', `/api/vehiculos/${id}`, {...vehicle, precio:20000, estado:'Reservado'}, token)).status, 200);
  assert.equal(Number((await db.execute('SELECT precio FROM Vehiculos WHERE id_vehiculo = ?', [id]))[0][0].precio), 20000);
  assert.equal((await send('DELETE', `/api/vehiculos/${id}`, undefined, token)).status, 200);
  assert.equal((await send('GET', `/api/vehiculos/${id}`)).status, 404);
  assert.equal((await send('DELETE', `/api/vehiculos/${id}`, undefined, token)).status, 404);
  assert.equal((await send('PUT', `/api/vehiculos/${id}`, vehicle, token)).status, 404);
});

test('MySQL real: cotizaciones persistidas, recuperables y referencias válidas', async () => {
  const {id} = await addVehicle();
  for (const refs of [{id_vehiculo:id}, {id_servicio:service}, {}, {id_vehiculo:null}, {id_vehiculo:''}]) {
    assert.equal((await send('POST', '/api/public/cotizaciones', {...quote, ...refs})).status, 201);
  }
  for (const refs of [{id_vehiculo:2147483647}, {id_servicio:2147483647}]) {
    assert.equal((await send('POST', '/api/public/cotizaciones', {...quote, ...refs})).status, 404);
  }
  for (const bad of [0, false, [], {}, -1, '1foo']) {
    assert.equal((await send('POST', '/api/public/cotizaciones', {...quote, id_vehiculo:bad})).status, 400, String(bad));
  }
  const rows = await (await send('GET', '/api/admin/cotizaciones', undefined, token)).json();
  assert.equal(rows.length, 5);
  assert.equal(rows.find(row => row.id_vehiculo === id).marca, vehicle.marca);
  assert.equal((await db.query('SELECT COUNT(*) AS total FROM Cotizaciones'))[0][0].total, 5);
  const response = await send('GET', `/api/admin/cotizaciones/${rows[0].id_cotizacion}`, undefined, token);
  assert.equal((await response.json()).correo_cliente, quote.correo_cliente);
  assert.equal((await send('DELETE', `/api/vehiculos/${id}`, undefined, token)).status, 200);
  assert.equal((await db.query('SELECT COUNT(*) AS total FROM Cotizaciones'))[0][0].total, 5);
  assert.ok((await db.query('SELECT id_vehiculo FROM Cotizaciones'))[0].every(row => row.id_vehiculo === null));
});

test('MySQL real: contacto persistido y recuperable sin interpretar SQL del mensaje', async () => {
  const mensaje = "Mensaje de prueba '); DROP TABLE Usuarios; --";
  assert.equal((await send('POST', '/api/public/contacto', {nombre_remitente:'Cliente', correo_remitente:'client@example.test', asunto:'Consulta', mensaje})).status, 201);
  const rows = await (await send('GET', '/api/admin/mensajes', undefined, token)).json();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].mensaje, mensaje);
  assert.equal((await db.query('SELECT mensaje FROM Mensajes_Contacto'))[0][0].mensaje, mensaje);
  assert.equal((await send('POST', '/api/public/contacto', {mensaje})).status, 400);
});

test('MySQL real: vacantes activas, postulaciones y rechazo sin inserciones parciales', async () => {
  const active = await (await send('GET', '/api/public/vacantes')).json();
  assert.deepEqual(active.map(row => row.id_vacante), [vacancy]);
  const success = await send('POST', '/api/public/postular', {...application, id_vacante:vacancy});
  assert.equal(success.status, 201);
  const {id} = await success.json();
  assert.equal((await send('POST', '/api/public/postular', {...application, id_vacante:closedVacancy})).status, 409);
  assert.equal((await send('POST', '/api/public/postular', {...application, id_vacante:2147483647})).status, 404);
  assert.equal((await db.query('SELECT COUNT(*) AS total FROM Solicitud_Empleo'))[0][0].total, 1);
  const rows = await (await send('GET', '/api/admin/solicitudes', undefined, token)).json();
  assert.equal(rows[0].id_solicitud, id);
  assert.equal(rows[0].titulo_puesto, 'Conductor');
});

test('MySQL real: JPEG/PNG/WebP, nombres únicos, reemplazo, referencias y fotografías originales', async () => {
  const original = '1792970258960.jpg';
  const originalData = await fs.readFile(path.join(uploadDir, original));
  const existing = await addVehicle({imagen_url:`/uploads/${original}`});
  assert.equal((await send('PUT', `/api/vehiculos/${existing.id}`, {...vehicle, imagen_url:'https://example.test/picture.jpg'}, token)).status, 200);
  assert.deepEqual(await fs.readFile(path.join(uploadDir, original)), originalData);
  let previous;
  for (const format of ['jpeg', 'png', 'webp']) {
    const buffer = await sharp({create:{width:2,height:2,channels:3,background:'blue'}}).toFormat(format).toBuffer();
    const form = new FormData();
    for (const [key,value] of Object.entries(vehicle)) form.append(key,String(value));
    form.append('imagen', new Blob([buffer], {type:`image/${format}`}), 'same-name.html');
    const response = await send('PUT', `/api/vehiculos/${existing.id}`, form, token);
    assert.equal(response.status, 200);
    const {imagen_url} = await response.json();
    const filename = imagen_url.split('/').pop();
    createdFiles.add(filename);
    assert.match(filename, /^managed-[0-9a-f-]{36}\.(jpeg|png|webp)$/);
    assert.equal((await send('GET', imagen_url)).status, 200);
    assert.equal((await sharp(await fs.readFile(path.join(uploadDir,filename))).metadata()).format, format);
    if (previous) { assert.notEqual(filename,previous); await waitRemoved(previous); }
    previous = filename;
  }
  const shared = await addVehicle({imagen_url:`/uploads/${previous}`});
  assert.equal((await send('DELETE', `/api/vehiculos/${existing.id}`, undefined, token)).status, 200);
  await fs.access(path.join(uploadDir,previous));
  assert.equal((await send('DELETE', `/api/vehiculos/${shared.id}`, undefined, token)).status, 200);
  await waitRemoved(previous);
  assert.deepEqual(await fs.readFile(path.join(uploadDir, original)), originalData);
});

test('MySQL real: migración compatible y datos de demostración repetibles sin cuentas compartidas', async () => {
  const migration = await fs.readFile(path.resolve(__dirname, '../migrations/001_least_privilege_default.sql'), 'utf8');
  await db.query(migration);
  const sql = await fs.readFile(path.resolve(__dirname, '../demo-data.sql'), 'utf8');
  const counts = async () => Promise.all(['Vehiculos', 'Servicios', 'Vacantes', 'Usuarios'].map(async table =>
    (await db.query(`SELECT COUNT(*) AS total FROM ${table}`))[0][0].total));
  const before = await counts();
  for (const statement of sql.replace(/--[^\n]*/g, '').split(';')) if (statement.replace(/--[^\n]*/g, '').trim()) await db.query(statement);
  const once = await counts();
  for (const statement of sql.replace(/--[^\n]*/g, '').split(';')) if (statement.replace(/--[^\n]*/g, '').trim()) await db.query(statement);
  assert.deepEqual(await counts(), once);
  assert.equal(once[0] - before[0], 3);
  assert.equal(once[1] - before[1], 2);
  assert.equal(once[2] - before[2], 1);
  assert.equal(once[3], before[3]);
});

test('MySQL real: server.js arranca con configuración válida y responde HTTP', async () => {
  const {spawn} = require('child_process');
  const child = spawn(process.execPath, ['server.js'], {cwd:path.resolve(__dirname, '..'), env:{...process.env, PORT:'0'}, stdio:['ignore','pipe','pipe']});
  const exit = new Promise(resolve => child.once('exit', resolve));
  let timer;
  try {
    const port = await new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('El servidor no arrancó en 5 segundos')), 5000);
      let output = '';
      child.stdout.on('data', data => {
        output += data;
        const match = output.match(/Servidor backend en puerto (\d+)/);
        if (match) resolve(Number(match[1]));
      });
      child.once('error', reject);
      child.once('exit', () => reject(new Error('El servidor salió antes de escuchar')));
    });
    assert.equal((await fetch(`http://127.0.0.1:${port}/api/public/vacantes`)).status, 200);
  } finally {
    clearTimeout(timer);
    child.kill('SIGTERM');
    await exit;
  }
});
