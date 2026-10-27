const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'test-secret-with-at-least-32-bytes-only';
const dbPath = require.resolve('../src/config/db');
let execute = async () => [[]];
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true,
  exports: { execute: (...args) => execute(...args) } };
const app = require('../src/app');
let server, base;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));
const request = (path, body, headers = {}) => fetch(base + path, {
  method: body === undefined ? 'GET' : 'POST',
  headers: { 'content-type': 'application/json', ...headers },
  body: body === undefined ? undefined : JSON.stringify(body),
});

test('HTTP: acceso administrativo y JWT inválidos/expirados', async () => {
  for (const token of [null, 'invalid', jwt.sign({rol:'admin'}, process.env.JWT_SECRET, {expiresIn:-1}),
    jwt.sign({rol:'admin'}, process.env.JWT_SECRET, {algorithm:'HS384'})]) {
    const response = await request('/api/admin/mensajes', undefined, token ? {authorization:`Bearer ${token}`} : {});
    assert.equal(response.status, 401);
  }
  const token = jwt.sign({rol:'empleado'}, process.env.JWT_SECRET);
  assert.equal((await request('/api/admin/mensajes', undefined, {authorization:`Bearer ${token}`})).status, 403);
});

test('HTTP: login, credenciales uniformes, expiración y límite de intentos', async () => {
  const hash = await bcrypt.hash('test-valid-password', 10);
  execute = async (_sql, [email]) => [email === 'admin@example.com' ? [{id_usuario:1, nombre:'Admin', rol:'admin', password_hash:hash}] : []];
  const valid = await request('/api/auth/login', {correo:'admin@example.com', password:'test-valid-password'});
  assert.equal(valid.status, 200);
  const payload = jwt.verify((await valid.json()).token, process.env.JWT_SECRET);
  assert.equal(payload.rol, 'admin');
  assert.equal(payload.exp - payload.iat, 8 * 60 * 60);
  const wrong = await request('/api/auth/login', {correo:'admin@example.com', password:'wrong'});
  const missing = await request('/api/auth/login', {correo:'missing@example.com', password:'wrong'});
  assert.equal(wrong.status, 401);
  assert.equal(missing.status, 401);
  assert.deepEqual(await wrong.json(), await missing.json());
  for (let i = 0; i < 7; i++) await request('/api/auth/login', {});
  const limited = await request('/api/auth/login', {});
  assert.equal(limited.status, 429);
  assert.ok(limited.headers.get('retry-after'));
});

test('HTTP: JSON malformado, tamaño y CORS', async () => {
  const malformed = await fetch(base + '/api/public/contacto', {method:'POST', headers:{'content-type':'application/json'}, body:'{'});
  assert.equal(malformed.status, 400);
  assert.equal((await request('/api/public/contacto', {mensaje:'a'.repeat(110000)})).status, 413);
  const allowed = await request('/api/public/vacantes', undefined, {origin:'http://localhost:5173'});
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  const denied = await request('/api/public/vacantes', undefined, {origin:'https://untrusted.example'});
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
  assert.equal(denied.headers.get('x-powered-by'), null);
});

test('HTTP: validaciones rechazan IDs, filtros y campos antes de SQL', async () => {
  execute = async () => { throw new Error('No debe consultar SQL'); };
  const admin = {authorization:`Bearer ${jwt.sign({rol:'admin'}, process.env.JWT_SECRET)}`};
  for (const path of ['/api/vehiculos/no-id', '/api/vehiculos/0', '/api/vehiculos?marca=a&marca=b', '/api/vehiculos?anio=abc', '/api/admin/cotizaciones/1abc']) {
    assert.equal((await request(path, undefined, admin)).status, 400, path);
  }
  for (const body of [[], {}, {nombre_cliente:'Ana', correo_cliente:'ana@example.com', telefono_cliente:'abcdefgh', requerimiento:'Camión'},
    {nombre_cliente:'Ana', correo_cliente:'ana@example.com', telefono_cliente:'7777-7777', requerimiento:'Camión', id_vehiculo:0}]) {
    assert.equal((await request('/api/public/cotizaciones', body)).status, 400);
  }
  const vehicle = {tipo_vehiculo:'Camión', marca:'Volvo', modelo:'VNL', anio:2020, precio:100};
  for (const changes of [{precio:-1}, {anio:-1}, {estado:'unknown'}, {imagen_url:'javascript:alert(1)'}, {marca:[]}]) {
    assert.equal((await request('/api/vehiculos', {...vehicle, ...changes}, admin)).status, 400);
  }
});

test('HTTP: cotización con referencia inexistente devuelve 404', async () => {
  execute = async () => { throw Object.assign(new Error('FK'), {code:'ER_NO_REFERENCED_ROW_2'}); };
  const response = await request('/api/public/cotizaciones', {nombre_cliente:'Ana', correo_cliente:'ana@example.com', telefono_cliente:'7777-7777', requerimiento:'Camión', id_vehiculo:999});
  assert.equal(response.status, 404);
});

test('HTTP: cargas falsificadas, SVG, campos inesperados y límite de tamaño', async () => {
  execute = async () => { throw new Error('No debe consultar SQL'); };
  const admin = {authorization:`Bearer ${jwt.sign({rol:'admin'}, process.env.JWT_SECRET)}`};
  for (const [field, type, data, status] of [
    ['imagen', 'image/jpeg', '<script>bad</script>', 400],
    ['imagen', 'image/svg+xml', '<svg></svg>', 400],
    ['archivo', 'image/png', 'bad', 400],
    ['imagen', 'image/png', 'a'.repeat(5 * 1024 * 1024 + 1), 400],
  ]) {
    const form = new FormData();
    form.append(field, new Blob([data], {type}), 'unsafe.html');
    const response = await fetch(base + '/api/vehiculos', {method:'POST', headers:admin, body:form});
    assert.equal(response.status, status);
  }
});

test('HTTP: archivo decodificado se limpia cuando falla la validación o SQL', async () => {
  const fs = require('fs/promises');
  const path = require('path');
  const sharp = require('sharp');
  const uploads = path.resolve(__dirname, '../uploads');
  const before = (await fs.readdir(uploads)).sort();
  const png = await sharp({create:{width:2,height:2,channels:3,background:'red'}}).png().toBuffer();
  const admin = {authorization:`Bearer ${jwt.sign({rol:'admin'}, process.env.JWT_SECRET)}`};
  for (const valid of [false, true]) {
    execute = async () => { throw new Error('SQL offline'); };
    const form = new FormData();
    if (valid) for (const [key,value] of Object.entries({tipo_vehiculo:'Camión', marca:'Volvo', modelo:'VNL', anio:'2020', precio:'100'})) form.append(key,value);
    form.append('imagen', new Blob([png], {type:'image/png'}), 'same.png');
    const response = await fetch(base + '/api/vehiculos', {method:'POST', headers:admin, body:form});
    assert.equal(response.status, valid ? 500 : 400);
    assert.deepEqual((await fs.readdir(uploads)).sort(), before);
  }
});
