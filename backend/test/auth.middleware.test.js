const { after, test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const {
  verifyToken,
  verifyAdmin,
} = require("../src/middlewares/auth.middleware");

const testSecret = "auth-middleware-test-secret";
const previousSecret = process.env.JWT_SECRET;
process.env.JWT_SECRET = testSecret;

after(() => {
  if (previousSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = previousSecret;
  }
});

const runAuthorization = (token) => {
  const req = { headers: token ? { authorization: `Bearer ${token}` } : {} };
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  let nextCalled = false;

  verifyToken(req, res, () => {
    verifyAdmin(req, res, () => {
      nextCalled = true;
    });
  });

  return { req, res, nextCalled };
};

const makeToken = (payload) => jwt.sign(payload, testSecret);

test("admin autenticado pasa ambos middlewares", () => {
  const result = runAuthorization(makeToken({ id: 1, rol: "admin" }));

  assert.equal(result.nextCalled, true);
  assert.equal(result.req.user.rol, "admin");
  assert.equal(result.res.statusCode, 200);
});

test("rol usuario recibe 403", () => {
  const result = runAuthorization(makeToken({ id: 2, rol: "usuario" }));

  assert.equal(result.nextCalled, false);
  assert.equal(result.res.statusCode, 403);
});

test("rol ausente recibe 403", () => {
  const result = runAuthorization(makeToken({ id: 3 }));

  assert.equal(result.nextCalled, false);
  assert.equal(result.res.statusCode, 403);
});

test("solicitud sin autenticación recibe 401", () => {
  const result = runAuthorization();

  assert.equal(result.nextCalled, false);
  assert.equal(result.res.statusCode, 401);
});
