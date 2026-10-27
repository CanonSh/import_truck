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
