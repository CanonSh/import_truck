# Import Truck L&B

Aplicación web para consultar el inventario de vehículos y los servicios de transporte de Import Truck L&B. El repositorio contiene un frontend React/Vite, una API Express y un esquema MySQL.

## Requisitos

- Git.
- Node.js 20.19+ o 22.12+, con npm.
- MySQL en ejecución y un usuario con permisos para crear la base de datos inicial.

## Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
cd import_truck
```

Reemplaza `URL_DEL_REPOSITORIO` por la URL Git proporcionada para este proyecto.

## Preparar MySQL

Desde la raíz del proyecto, importa el esquema:

```bash
mysql -u USUARIO_MYSQL -p < backend/script_base_de_datos.sql
```

MySQL solicitará la contraseña de forma interactiva. El script crea y selecciona `import_truck_db`, crea las tablas y carga registros de ejemplo. Debe ejecutarse solo para la inicialización de una base vacía: algunas inserciones seed no son idempotentes y pueden fallar si ya existen.

## Configurar y arrancar el backend

El backend necesita un archivo local `backend/.env`. Créalo manualmente; este archivo está excluido de Git. Sustituye los marcadores por los valores de tu entorno y genera `JWT_SECRET` localmente, por ejemplo con `openssl rand -base64 48`.

```dotenv
DB_HOST=127.0.0.1
DB_USER=USUARIO_MYSQL
DB_PASSWORD=CONTRASENA_MYSQL
DB_NAME=import_truck_db
JWT_SECRET=SECRETO_ALEATORIO_GENERADO_LOCALMENTE
PORT=3000
```

No copies estos marcadores literalmente ni publiques el archivo `.env`. El servidor carga este archivo al arrancar; sus valores prevalecen sobre variables del shell.

En una terminal:

```bash
cd backend
npm install
npm start
```

La API estará disponible en `http://localhost:3000`. Las imágenes subidas se sirven desde `/uploads`.

## Configurar y arrancar el frontend

El archivo de desarrollo `frontend/.env.development` apunta a la API local y al servidor de imágenes:

```text
VITE_API_URL=http://localhost:3000/api
VITE_UPLOADS_URL=http://localhost:3000
```

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abre la URL que muestra Vite, normalmente `http://localhost:5173`. Si cambias variables `VITE_*`, reinicia Vite para que las vuelva a cargar.

## Comprobaciones disponibles

Desde `backend/`:

```bash
npm test
```

Desde `frontend/`:

```bash
npm run lint
npm run build
```

El build de Vite escribe el resultado en `frontend/dist/`.

## Administración

La administración requiere iniciar sesión con una cuenta cuyo rol sea `admin`. El backend valida el JWT y el rol en cada ruta protegida; ocultar páginas en React no sustituye esa protección. El esquema incluye datos seed para desarrollo. No uses credenciales de demostración en producción ni ejecutes `backend/pass.js` sin revisar su efecto: ese script cambia o crea la cuenta seed.

Para producción, configura una base de datos y un secreto JWT propios, restringe permisos MySQL y sirve la aplicación mediante HTTPS. No reutilices los datos ni las credenciales de desarrollo.