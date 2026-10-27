# Backend Import Truck L&B

## Configuración

Desde `backend/`, instala con `npm ci`. La imagen de pruebas utiliza Node 24; la verificación local se realizó con Node 26.12.1 y MySQL Community 8.4.6.

1. Copia `.env.example` a `.env` y completa la conexión MySQL. La cuenta de la aplicación necesita SELECT/INSERT/UPDATE/DELETE sobre su base, sin permisos administrativos globales.
2. Genera `JWT_SECRET` con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. No publiques el resultado. Las variables del proceso prevalecen sobre `.env`.
3. Para una instalación **nueva**, ejecuta `mysql -h HOST -u USUARIO -p < script_base_de_datos.sql`. Crea `import_truck_db` con siete tablas InnoDB y claves foráneas. Si eliges otro nombre, adapta explícitamente CREATE DATABASE y USE antes de ejecutarlo.
4. Para una base **existente**, conserva los datos y revisa el motor con `SHOW TABLE STATUS`. El esquema con IF NOT EXISTS no modifica tablas existentes. Ejecuta únicamente la migración revisada: `mysql -h HOST -u USUARIO -p NOMBRE_BD < migrations/001_least_privilege_default.sql`. Cambia el rol predeterminado de cuentas futuras; no cambia usuarios existentes ni elimina registros. No convierte motores existentes: una conversión requiere planificación separada.
5. Opcionalmente, en una base de demostración: `mysql -h HOST -u USUARIO -p NOMBRE_BD < demo-data.sql`. Añade vehículos, servicios y una vacante; permite ejecuciones sucesivas sin duplicar esos datos. No crea cuentas compartidas.
6. Configura `ADMIN_EMAIL`, `ADMIN_NAME` y `ADMIN_PASSWORD` de forma privada; ejecuta `npm run seed:admin`. La contraseña requiere 12 caracteres y un máximo de 72 bytes. Una cuenta existente solo se restablece con `ALLOW_ADMIN_RESET=true`. Retira esas variables al terminar. Las instalaciones anteriores deben rotar cualquier contraseña de demostración y, para invalidar tokens anteriores, cambiar JWT_SECRET.
7. Inicia con `npm start`. El servidor comprueba MySQL antes de escuchar y rechaza un JWT_SECRET menor de 32 bytes. Puerto predeterminado: 3000.

Configura `CORS_ORIGINS` con los orígenes completos de React, separados por comas. Por defecto admite localhost:5173 y 127.0.0.1:5173. CORS controla la lectura desde navegadores; los permisos dependen del token. El frontend conserva su configuración existente de VITE_API_URL y el encabezado Bearer.

## Contrato HTTP

Las rutas y nombres JSON originales se conservan. Una validación fallida devuelve `400` con `{ error, detalles: [{ campo, mensaje }] }`.

| Ruta | Acceso y respuesta |
|---|---|
| POST /api/auth/login | `{correo,password}` → `{mensaje,token,usuario:{nombre,rol}}`; JWT HS256 de 8 horas. Credenciales incorrectas: 401 uniforme. |
| GET /api/vehiculos | Array de vehículos; filtros opcionales marca, anio y busqueda. Los filtros vacíos se ignoran. |
| GET /api/vehiculos/:id | Objeto vehículo; 404 si no existe, 400 si el ID no es válido. |
| POST /api/vehiculos | Admin; JSON o multipart, `{tipo_vehiculo,marca,modelo,anio,precio,caracteristicas?,estado?,imagen_url?}`; archivo opcional `imagen`. Devuelve 201 `{mensaje,id,imagen_url}`. |
| PUT /api/vehiculos/:id | Admin; mismos campos obligatorios que creación. Conserva la imagen si no recibe otra. 200 `{mensaje,id,imagen_url}`. |
| DELETE /api/vehiculos/:id | Admin; 200 `{mensaje}` o 404. Las cotizaciones existentes se conservan y su referencia al vehículo pasa a NULL. |
| POST /api/public/cotizaciones | `{nombre_cliente,correo_cliente,telefono_cliente,requerimiento,id_vehiculo?,id_servicio?}` → 201 `{mensaje}`. Referencias inexistentes: 404. Permite cotizaciones generales sin referencia. |
| POST /api/public/contacto | `{nombre_remitente,correo_remitente,asunto,mensaje}` → 201 `{mensaje}`. |
| GET /api/public/vacantes | Array de vacantes activas. |
| POST /api/public/postular | `{id_vacante,nombre_candidato,correo_candidato,telefono_candidato,experiencia}` → 201 `{mensaje,id}`. Vacante inexistente: 404; cerrada: 409. |
| GET /api/admin/cotizaciones | Admin; array con datos del vehículo o servicio. |
| GET /api/admin/cotizaciones/:id | Admin; objeto cotización o 404. |
| GET /api/admin/mensajes | Admin; array de mensajes persistidos. |
| GET /api/admin/solicitudes | Admin; array de solicitudes con título de vacante. |
| GET /uploads/:archivo | Imagen estática. |

Las rutas administrativas exigen `Authorization: Bearer TOKEN`: sin token válido, 401; rol distinto de admin, 403. Los filtros SQL usan parámetros, al igual que las inserciones.

Años: 1886 hasta el siguiente año calendario. Precios: 0 a 99999999.99, máximo dos decimales. Estados: Disponible, Vendido o Reservado. Teléfonos: hasta 15 caracteres, al menos 7 dígitos; se permiten + inicial, espacios, paréntesis y guiones. Los campos TEXT se limitan a 16000 caracteres para respetar TEXT con utf8mb4.

JSON y formularios de texto: máximo 100 KB. Login: 10 solicitudes por IP en 15 minutos; rutas públicas: 100 por IP en 15 minutos. Exceso: 429 con Retry-After. Los contadores viven en memoria; varios procesos necesitan un almacén compartido. El backend no confía automáticamente en X-Forwarded-For: un despliegue con proxy requiere configurar y probar la confianza de la infraestructura para no agrupar todos los clientes bajo la misma IP.

Imágenes: JPEG/PNG/WebP estáticos, máximo 5 MiB y 40 millones de píxeles. Se comprueba MIME y decodificación real con Sharp y se recodifica sin metadatos; SVG, GIF, animaciones y archivos dañados se rechazan. Los nombres UUID llevan prefijo `managed-`. La limpieza tras reemplazar/eliminar comprueba referencias y solo borra imágenes con ese prefijo. Las fotografías anteriores permanecen. Las URL externas deben usar HTTP(S).

## Pruebas reproducibles

```sh
npm ci
npm test
TEST_DB_HOST=127.0.0.1 TEST_DB_PORT=3306 TEST_DB_USER=usuario_pruebas TEST_DB_PASSWORD=valor_privado npm run test:integration
npm audit
```

Usa un servidor MySQL dedicado a pruebas. La cuenta de integración necesita CREATE/DROP DATABASE; no uses la cuenta de aplicación ni un servidor de compañeros. El ejecutor genera un nombre `import_truck_test_<uuid>`, aplica el esquema sin su CREATE DATABASE/USE fijo, crea datos efímeros y elimina exclusivamente esa base al finalizar. No utiliza DB_NAME de `.env` ni importa dotenv. El esquema se ejecuta dos veces, y también se verifica la migración y la repetibilidad de los datos demo.

Alternativa Docker, preparada pero **no ejecutada en esta auditoría** por ausencia de Docker local:

```sh
docker compose -p import-truck-isolated-tests -f compose.test.yaml up --build --abort-on-container-exit --exit-code-from tests
docker compose -p import-truck-isolated-tests -f compose.test.yaml down -v
```

No publica puertos ni monta bases del host. La contraseña del contenedor es exclusivamente de pruebas. No se agregaron archivos fuera de backend/ ni un workflow de GitHub Actions: las pruebas MySQL sí se ejecutaron localmente. Estos comandos pueden incorporarse a la CI del equipo mediante un cambio separado.
