# Backend — IDMS UPQROO

API REST del sistema de gestión documental institucional. Construida con **Node.js + Express + TypeScript**, procesamiento asíncrono con **BullMQ + Redis** y persistencia en **MySQL** a través de **Drizzle ORM**.

---

## Tabla de Contenidos

- [Stack](#stack)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Módulos](#módulos)
- [Middlewares](#middlewares)
- [Infraestructura Interna](#infraestructura-interna)
- [Endpoints de la API](#endpoints-de-la-api)
- [Variables de Entorno](#variables-de-entorno)
- [Scripts Disponibles](#scripts-disponibles)
- [Tests](#tests)
- [Notas de Producción](#notas-de-producción)

---

## Stack

| Tecnología          | Versión | Uso                            |
| ------------------- | ------- | ------------------------------ |
| Node.js             | 24.14.0 | Runtime                        |
| Express             | 4.19.2  | Framework HTTP                 |
| TypeScript          | 5.6.2   | Tipado estático                |
| Drizzle ORM         | 0.36.0  | ORM para MySQL                 |
| mysql2              | 3.11.3  | Driver MySQL                   |
| BullMQ              | 5.71.0  | Colas de trabajo               |
| ioredis             | 5.10.0  | Cliente Redis                  |
| jsonwebtoken        | 9.0.3   | JWT                            |
| google-auth-library | 10.6.1  | Google OAuth                   |
| multer              | 2.1.1   | Upload de archivos             |
| zod                 | 3.23.8  | Validación de entrada          |
| compression         | 1.8.1   | Compresión de respuestas HTTP  |
| express-rate-limit  | 8.3.1   | Rate limiting en autenticación |

---

## Estructura del Proyecto

```
backend/src/
│
├── config/
│   ├── env.ts              # Variables de entorno tipadas y validadas al arrancar
│   └── redis.ts            # Conexión Redis singleton
│
├── infrastructure/
│   ├── database/
│   │   ├── schema/         # Schemas Drizzle ORM (uno por tabla)
│   │   ├── relations.ts    # Relaciones entre tablas para Drizzle
│   │   ├── drizzle.ts      # Instancia Drizzle
│   │   └── connection.ts   # Pool MySQL (connectionLimit: 100, queueLimit: 200)
│   │
│   ├── queues/
│   │   └── document.queue.ts   # Cola BullMQ para procesamiento de archivos
│   │
│   ├── workers/
│   │   ├── document.worker.ts  # Procesa jobs: hash SHA-256, copia a storage, registra versión
│   │   └── cleanup.worker.ts   # Limpia archivos tmp-* con más de 24h cada hora
│   │
│   └── storage/
│       ├── store.service.ts    # Gestión de rutas: /storage/documents/{grupo}/{id}/v{n}.ext
│       └── hash.service.ts     # Cálculo SHA-256 por streaming
│
├── middleware/
│   ├── auth.middleware.ts           # Verifica JWT en cookie; popula req.user
│   ├── admin.middleware.ts          # roleMiddleware() + adminMiddleware()
│   ├── documentRole.middleware.ts   # Verifica permisos granulares sobre un documento
│   ├── upload.middleware.ts         # Multer con filtro MIME/extensión y límite 20 MB
│   └── rateLimit.middleware.ts      # 10 intentos de login / 15 min / IP
│
├── modules/
│   ├── auth/               # Google OAuth + generación de JWT
│   ├── users/              # Perfil propio, listado (admin), búsqueda, creación
│   ├── departments/        # CRUD de departamentos, miembros, permisos de profesores y directores
│   ├── documents/          # CRUD, versiones, compartición, permisos, auditoría, búsqueda
│   └── students/           # Importación CSV del padrón, listado de matrículas
│
├── types/
│   └── express.d.ts        # Extiende Express.Request con `user`
│
├── server.ts               # Express + CORS + Cluster mode (un worker por CPU core)
└── worker.ts               # Entry point del worker de BullMQ + cleanup scheduler
```

---

## Módulos

### `auth`

Gestiona el login con Google OAuth y el logout.

- **`auth.domain.ts`** — Valida dominio `@upqroo.edu.mx`; resuelve rol por email con lógica de precedencia (admin → secretary → director → student → professor)
- **`auth.service.ts`** — Verifica el token Google; decide si el usuario es efímero (student/professor) o se persiste en DB; resuelve `departmentId` para alumnos desde el padrón
- **Usuarios efímeros:** `student` y `professor` no se guardan en la tabla `users`. Su identidad la gestiona el JWT firmado en cada sesión.

### `users`

- `GET /users/me` — Perfil del usuario autenticado (incluye `departmentId` para alumnos)
- `GET /users` — Listado paginado (solo admin)
- `GET /users/search?q=` — Búsqueda por nombre o email (todos los roles autenticados)
- `POST /users` — Crear usuario (jerarquía: admin crea secretary, secretary crea director/assistant, director crea professor)
- `GET /users/department/:id` — Usuarios de un departamento

### `departments`

- CRUD de departamentos con jerarquía `parent_id` (soft delete)
- Gestión de miembros: agregar/quitar usuarios del departamento
- `POST /:departmentId/professor-upload/:professorId` — Habilita subida a un profesor (admin o director)
- `POST /:departmentId/director-share/:directorId` — Habilita compartición a un director (admin o secretary)

### `documents`

- `POST /documents` — Crear documento (registra en DB, sin archivo aún)
- `POST /documents/upload` — Subir archivo (Multer → tmp → cola BullMQ)
- `GET /documents` — Listar documentos accesibles al usuario (paginado)
- `GET /documents/search?q=` — Búsqueda FULLTEXT + LIKE con ranking de relevancia
- `GET /documents/:id` — Detalle del documento
- `PATCH /documents/:id` — Editar metadatos
- `DELETE /documents/:id` — Soft delete (admin, secretary, director)
- `GET /documents/:id/versions` — Listado de versiones
- `GET /documents/:id/version/:n` — Descargar versión específica
- `POST /documents/share` — Compartir con un departamento (con `target_audience`) o con un usuario individual
- `GET /documents/:id/permissions` — Ver permisos activos (incluye `targetAudience` por entrada)
- `DELETE /documents/:id/permissions` — Revocar permiso por `departmentId` o `userId`
- `GET /documents/:id/audit` — Logs de auditoría
- `POST /documents/retry-failed` — Reintentar jobs fallidos (solo admin)

### `students`

- `POST /students/upload-csv` — Importar padrón de alumnos (admin, director)
- `GET /students/:departmentId/enrollments` — Listar matrículas del padrón

---

## Middlewares

### `authMiddleware`

Verifica que la cookie de sesión contenga un JWT válido. Popula `req.user` con `{ id, email, role, departmentId? }`.

### `roleMiddleware(...roles)`

Verifica que el rol del usuario esté entre los permitidos. Para roles efímeros (student, professor) usa el rol del JWT directamente; para los demás, consulta la DB para obtener el rol actualizado.

### `documentRoleMiddleware(permission)`

Verifica permisos granulares sobre un documento específico en este orden:

1. Admin → acceso total
2. Owner del documento → acceso total
3. Professor con `professor_upload_permissions` para el departamento del documento (solo para `upload_version`)
4. Permiso directo por `userId` en `document_permissions`
5. Permiso por `departmentId` del usuario en `document_permissions`
6. Director con `director_share_permissions` para su departamento (solo para `share`)

### `uploadMiddleware`

Multer configurado con:

- Destino: `TMP_PATH` (validado al arrancar)
- Naming: `tmp-{timestamp}-{random}.ext`
- MIME types permitidos: PDF, Word, Excel, PowerPoint
- Límite: 20 MB

### `authRateLimiter`

10 intentos de login por IP cada 15 minutos.

---

## Infraestructura Interna

### Cola de documentos

```typescript
// document.queue.ts
defaultJobOptions: {
  attempts: 3,
  backoff: { type: "exponential", delay: 2000 },
  removeOnComplete: true,
  removeOnFail: false,
}
```

### Worker de documentos

Al procesar un job:

1. Calcula hash SHA-256 del archivo temporal
2. Inicia transacción con `SELECT ... FOR UPDATE` para evitar condición de carrera en el número de versión
3. Verifica que no se exceda `MAX_DOCUMENT_VERSIONS`
4. Copia el archivo al storage (`fs.copyFile` — compatible entre particiones distintas)
5. Registra la versión en DB
6. Elimina el archivo temporal (en `finally`)

### Worker de limpieza

Ejecuta cada hora. Elimina archivos `tmp-*` con más de **24 horas** de antigüedad. El prefijo `tmp-` asegura que no se borren otros archivos que puedan coexistir en el directorio temporal.

### Cluster mode

`server.ts` usa `node:cluster` para lanzar un worker por CPU core. Si un worker muere, el proceso primario lo reinicia automáticamente.

---

## Endpoints de la API

### Auth

| Método | Ruta           | Acceso      | Descripción                  |
| ------ | -------------- | ----------- | ---------------------------- |
| `POST` | `/auth/google` | Público     | Login con token Google OAuth |
| `POST` | `/auth/logout` | Autenticado | Invalida la cookie de sesión |

### Users

| Método | Ruta                    | Acceso                   | Descripción                 |
| ------ | ----------------------- | ------------------------ | --------------------------- |
| `GET`  | `/users/me`             | Autenticado              | Perfil del usuario actual   |
| `GET`  | `/users`                | Admin                    | Listado paginado            |
| `GET`  | `/users/search`         | Autenticado              | Búsqueda por nombre/email   |
| `POST` | `/users`                | Admin/Secretary/Director | Crear usuario               |
| `GET`  | `/users/department/:id` | Autenticado              | Usuarios de un departamento |

### Departments

| Método   | Ruta                                             | Acceso          | Descripción                       |
| -------- | ------------------------------------------------ | --------------- | --------------------------------- |
| `GET`    | `/departments`                                   | Autenticado     | Listar departamentos activos      |
| `GET`    | `/departments/:id`                               | Autenticado     | Detalle de un departamento        |
| `POST`   | `/departments`                                   | Admin           | Crear departamento                |
| `PATCH`  | `/departments/:id`                               | Admin           | Editar nombre/slug                |
| `DELETE` | `/departments/:id`                               | Admin           | Soft delete                       |
| `GET`    | `/departments/:id/users`                         | Autenticado     | Miembros del departamento         |
| `POST`   | `/departments/users`                             | Admin           | Agregar usuario al departamento   |
| `DELETE` | `/departments/:id/user/:userId`                  | Admin           | Quitar usuario del departamento   |
| `POST`   | `/departments/:id/professor-upload/:professorId` | Admin/Director  | Habilitar subida a profesor       |
| `DELETE` | `/departments/:id/professor-upload/:professorId` | Admin/Director  | Revocar subida a profesor         |
| `POST`   | `/departments/:id/director-share/:directorId`    | Admin/Secretary | Habilitar compartición a director |
| `DELETE` | `/departments/:id/director-share/:directorId`    | Admin/Secretary | Revocar compartición a director   |

### Documents

| Método   | Ruta                         | Acceso                             | Descripción                                   |
| -------- | ---------------------------- | ---------------------------------- | ----------------------------------------------|
| `GET`    | `/documents`                 | Autenticado                        | Listar documentos accesibles (paginado)       |
| `GET`    | `/documents/search`          | Autenticado                        | Búsqueda por título/descripción               |
| `POST`   | `/documents`                 | Admin/Secretary/Director/Assistant | Crear documento                               |
| `POST`   | `/documents/upload`          | Según permisos                     | Subir archivo a un documento                  |
| `GET`    | `/documents/:id`             | Según permisos `view`              | Detalle                                       |
| `PATCH`  | `/documents/:id`             | Según permisos `edit`              | Editar metadatos                              |
| `DELETE` | `/documents/:id`             | Admin/Secretary/Director           | Soft delete                                   |
| `GET`    | `/documents/:id/versions`    | Según permisos `view`              | Historial de versiones                        |
| `GET`    | `/documents/:id/version/:n`  | Según permisos `download`          | Descargar versión                             |
| `POST`   | `/documents/share`           | Según permisos `share`             | Compartir con departamento o usuario          |
| `GET`    | `/documents/:id/permissions` | Según permisos `share`             | Ver permisos (incluye `targetAudience`)       |
| `DELETE` | `/documents/:id/permissions` | Según permisos `share`             | Revocar permiso por `departmentId` o `userId` |
| `GET`    | `/documents/:id/audit`       | Según permisos `view`              | Logs de auditoría                             |
| `POST`   | `/documents/retry-failed`    | Admin                              | Reintentar jobs fallidos                      |

### Students

| Método | Ruta                                  | Acceso         | Descripción                |
| ------ | ------------------------------------- | -------------- | -------------------------- |
| `POST` | `/students/upload-csv`                | Admin/Director | Importar padrón de alumnos |
| `GET`  | `/students/:departmentId/enrollments` | Admin/Director | Listar matrículas          |

### Health

| Método | Ruta       | Acceso  | Descripción                    |
| ------ | ---------- | ------- | ------------------------------ |
| `GET`  | `/health`  | Público | Status del proceso + worker ID |
| `GET`  | `/db-test` | Público | Prueba de conexión a MySQL     |

---

## Variables de Entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

| Variable                | Requerida | Default      | Descripción                             |
| ----------------------- | --------- | ------------ | --------------------------------------- |
| `PORT`                  | No        | `3000`       | Puerto HTTP del servidor                |
| `NODE_ENV`              | No        | —            | `production` activa cookies `secure`    |
| `DB_HOST`               | Sí        | `localhost`  | Host MySQL                              |
| `DB_PORT`               | No        | `3306`       | Puerto MySQL                            |
| `DB_USER`               | Sí        | —            | Usuario MySQL                           |
| `DB_PASSWORD`           | Sí        | —            | Contraseña MySQL                        |
| `DB_NAME`               | Sí        | —            | Base de datos MySQL                     |
| `GOOGLE_CLIENT_ID`      | Sí        | —            | OAuth Client ID de Google Cloud         |
| `COOKIE_NAME`           | No        | `auth_token` | Nombre de la cookie de sesión           |
| `JWT_SECRET`            | Sí        | —            | Mínimo 64 caracteres en producción      |
| `JWT_EXPIRES`           | No        | `4h`         | Duración del JWT (`4h`, `8h`, `1d`)     |
| `REDIS_HOST`            | No        | `127.0.0.1`  | Host de Redis                           |
| `REDIS_PORT`            | No        | `6379`       | Puerto de Redis                         |
| `STORAGE_PATH`          | Sí        | —            | Ruta absoluta al directorio de archivos |
| `TMP_PATH`              | Sí        | —            | Ruta absoluta al directorio temporal    |
| `ALLOWED_ORIGINS`       | Sí        | —            | Orígenes CORS separados por coma        |
| `MAX_DOCUMENT_VERSIONS` | No        | `20`         | Máximo de versiones por documento       |

---

## Scripts Disponibles

```bash
# Desarrollo (con hot reload)
pnpm dev          # API
pnpm worker       # Worker de BullMQ

# Producción
pnpm build        # Compila TypeScript → dist/
pnpm start        # Ejecuta dist/server.js
pnpm start:worker # Ejecuta dist/worker.js

# Utilidades
pnpm test         # Ejecuta tests con node:test
pnpm typecheck    # Verifica tipos sin emitir
pnpm db:test      # Prueba conexión a la DB
```

---

## Tests

Tests unitarios con el módulo nativo `node:test` de Node.js. No requieren dependencias externas.

```bash
pnpm test
```

**Cobertura actual:**

- `auth.domain.test.ts` — Validación de dominio institucional
- `auth.middleware.test.ts` — Verificación de JWT válido
- `auth.service.test.ts` — Generación y verificación de JWT
- `documents.domain.test.ts` — Validación del schema de creación de documento
- `permissions.domain.test.ts` — Validación del schema de compartición
- `share.validator.test.ts` — Casos edge del validator de permisos
- `versions.domain.test.ts` — Lógica de incremento de versiones

---

## Notas de Producción

**Rutas de almacenamiento:** Siempre usa rutas absolutas en `.env`. Las rutas relativas fallan con PM2 porque el directorio de trabajo puede variar.

```env
STORAGE_PATH=/var/intranet-upqroo/storage
TMP_PATH=/var/intranet-upqroo/tmp
```

**Puerto:** El puerto 3000 puede estar ocupado en el servidor universitario. Configura `PORT` en `.env` antes de desplegar.

**Cluster + Worker:** El servidor y el worker son **procesos separados**. No lances el worker dentro del cluster; el archivo `worker.ts` es su propio entry point. En PM2 deben registrarse como dos apps distintas en `ecosystem.config.cjs`.

**`fs.copyFile` en lugar de `fs.rename`:** El sistema usa `copyFile` para mover archivos de `TMP_PATH` a `STORAGE_PATH`. Esto evita el error `EXDEV` cuando ambas rutas están en particiones de disco distintas, caso común en servidores Linux.
