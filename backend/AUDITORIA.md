# Auditoría del backend — 26 de octubre de 2026

## Base y alcance

Repositorio CanonSh/import_truck. Se compararon las referencias remotas actuales: main `87dfd06` y BC181438 `b91d29b`. Main contiene el merge de la rama y el backend es idéntico en ambas. Se creó `fix/backend-audit-integration` desde main, sin modificar frontend/ ni las fotografías originales. El historial reciente ya incluía autenticación, validación, transacciones de vehículos y postulaciones: se conservaron.

## Hallazgos y correcciones

| Problema / causa | Cambio y archivos |
|---|---|
| Login revelaba correos existentes; sin límite de intentos ni restricción explícita del algoritmo JWT | Respuesta 401 uniforme, comparación bcrypt cuando falta la cuenta, límite por IP, HS256; controllers/auth.controller.js, middlewares/auth.middleware.js, routes/auth.routes.js. |
| Contraseña administrativa fija en SQL y pass.js; rol privilegiado por defecto | Aprovisionamiento explícito mediante variables privadas, restablecimiento optativo, semillas demo separadas y sin usuarios, rol empleado por defecto; pass.js, script_base_de_datos.sql, demo-data.sql, migrations/001_least_privilege_default.sql. No se modificaron cuentas existentes. |
| Servidor escuchaba aunque MySQL fallara; dotenv sobrescribía variables del proceso | Comprobación de conexión antes del arranque, secreto mínimo, DB_PORT, cola de conexiones limitada, prioridad al entorno; server.js, src/config/db.js. |
| CORS abierto y errores de carga/tamaño incompletos | Orígenes configurables, Helmet, límites de cuerpo y rutas públicas, errores 400/413, logs sin cuerpos ni mensajes SQL privados; src/app.js. |
| IDs de consulta, filtros, teléfonos, año y precio admitían entradas inválidas | Validadores de tipos, rangos, longitudes y URL; middlewares/validation.middleware.js, middlewares/vehicle-validation.middleware.js, routes/public.routes.js, routes/admin.routes.js, routes/vehiculo.routes.js. Se conservan filtros vacíos. |
| Cotización con referencia inexistente producía 500 por FK | Respuesta 404 para ER_NO_REFERENCED_ROW_2; controllers/public.controller.js. La FK sigue siendo la garantía de integridad. |
| Multer confiaba en MIME y fecha para los nombres | Decodificación y recodificación real de JPEG/PNG/WebP, límites, UUID y escritura exclusiva; middlewares/upload.middleware.js. |
| Limpieza de imágenes podía borrar fotografías originales | Solo limpia archivos nuevos managed-* sin referencias; controllers/vehiculo.controller.js. La limpieza de cargas fallidas se espera antes de responder. |
| Sin evidencia de persistencia real y documentación backend vacía | Pruebas HTTP, integración MySQL aislada, .env.example, API_BACKEND.md y entorno Docker opcional. |

Las transacciones y bloqueos ya existentes se conservaron. Todas las consultas revisadas usan parámetros para datos del usuario. La estructura de siete tablas coincide con las consultas; se explicita InnoDB para instalaciones nuevas. No se ejecutó ninguna migración sobre una base existente del equipo.

Dependencias añadidas: express-rate-limit para límites de solicitudes; helmet para cabeceras; sharp para validar y normalizar imágenes. package-lock.json conserva versiones reproducibles. No hubo cambios masivos de formato.

## Evidencia ejecutada

- `npm ci --ignore-scripts` inicial y posterior instalación normal de las tres dependencias añadidas.
- `npm test`: 13 pruebas aprobadas, incluidas las cuatro pruebas originales. HTTP real con SQL simulado para aislar fallos y verificar errores, validación, permisos, tokens, límites, CORS y limpieza.
- `npm run test:integration`: 8 pruebas aprobadas contra **MySQL Community 8.4.6 real**, en 127.0.0.1:33070 y bases temporales generadas por ejecución. Cada una se eliminó al terminar.
- Integración: esquema repetible, siete tablas InnoDB, conexión y arranque de server.js, login bcrypt/JWT, permisos de todas las rutas administrativas y escritura de vehículos, inventario/filtros/CRUD, cotizaciones y referencias, mensajes, vacantes activas y postulaciones, imágenes reales y conservación de originales, migración y datos demo repetibles.
- Las pruebas comprueban registros mediante SQL y recuperación administrativa HTTP, no solo códigos de respuesta.
- Pruebas repetidas después de cada conjunto de cambios; fallos intermedios corregidos antes de cerrar la etapa.
- Sintaxis de todos los archivos JavaScript del backend aprobada con node --check; git diff --check aprobado.
- npm audit final: 0 vulnerabilidades reportadas.
- git diff contra origin/main confirma frontend/ y backend/uploads/ sin cambios.

Entorno local: Node 26.12.1. Las instrucciones reproducibles y los detalles del contrato están en API_BACKEND.md. Docker/Node 24 están preparados como alternativa, sin afirmar que se hayan ejecutado.

## Compatibilidad y límites

Se preservan rutas y campos de las respuestas exitosas y el formato de validación. Cambios deliberados: login inexistente pasa de 404 a 401; referencia de cotización inexistente de 500 a 404; entradas malformadas ahora reciben 400. Se requieren JWT_SECRET fuerte y orígenes CORS de despliegue. Imágenes nuevas admitidas: JPEG/PNG/WebP estáticos. La interfaz React no se modificó ni se ejecutó una prueba visual del navegador.

Las cuentas demo preexistentes deben rotarse explícitamente: retirar semillas inseguras no revoca una contraseña ya instalada. Los tokens conservan roles hasta su expiración de 8 horas; no existe revocación individual. TLS y configuración de proxy son responsabilidad del despliegue. El límite en memoria corresponde a un proceso, no a un clúster.

La limpieza de imágenes tras commit sigue siendo de mejor esfuerzo: un fallo de disco/proceso puede dejar huérfanos; la comprobación de referencias no elimina completamente carreras entre operaciones concurrentes sobre la misma imagen. No se añadieron trabajos destructivos de limpieza. Las URL externas no garantizan que el recurso exista. No se probaron carga sostenida, concurrencia exhaustiva ni despliegue de producción.

No se creó workflow fuera de backend/ para respetar el alcance solicitado. La alternativa Docker no fue ejecutada; la integración local MySQL sí. Este informe demuestra los flujos probados en el entorno aislado, no certifica la infraestructura ni los datos de producción.

Fuentes técnicas: [seguridad de Express](https://expressjs.com/advanced/best-practice-security/), [CORS de Express](https://expressjs.com/en/resources/middleware/cors/) e [instalación binaria oficial de MySQL](https://dev.mysql.com/doc/refman/8.0/en/binary-installation.html).

## Archivos modificados

- `backend/.dockerignore`
- `backend/.env.example`
- `backend/API_BACKEND.md`
- `backend/AUDITORIA.md`
- `backend/Dockerfile.test`
- `backend/compose.test.yaml`
- `backend/demo-data.sql`
- `backend/integration/api.mysql.test.js`
- `backend/migrations/001_least_privilege_default.sql`
- `backend/package-lock.json`
- `backend/package.json`
- `backend/pass.js`
- `backend/script_base_de_datos.sql`
- `backend/server.js`
- `backend/src/app.js`
- `backend/src/config/db.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/controllers/public.controller.js`
- `backend/src/controllers/vehiculo.controller.js`
- `backend/src/middlewares/auth.middleware.js`
- `backend/src/middlewares/upload.middleware.js`
- `backend/src/middlewares/validation.middleware.js`
- `backend/src/middlewares/vehicle-validation.middleware.js`
- `backend/src/routes/admin.routes.js`
- `backend/src/routes/auth.routes.js`
- `backend/src/routes/public.routes.js`
- `backend/src/routes/vehiculo.routes.js`
- `backend/test/api.test.js`
