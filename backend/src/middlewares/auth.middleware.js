const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const [scheme, token] = authHeader?.split(" ") || [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      error: "Acceso denegado. Token no proporcionado.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Token inválido o expirado.",
    });
  }
};

const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.rol !== "admin") {
    return res.status(403).json({
      error: "Acceso denegado. Se requieren permisos de administrador.",
    });
  }

  next();
};

module.exports = { verifyToken, verifyAdmin };
