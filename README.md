# Institutional Document Management System (IDMS)

### Universidad Politécnica de Quintana Roo

Sistema interno para la **gestión de documentos institucionales**, diseñado para permitir almacenamiento, versionado, distribución controlada y auditoría de documentos dentro de la universidad.

Construido como una **aplicación web con arquitectura modular**, con procesamiento asíncrono de archivos, autenticación institucional mediante Google OAuth y control de acceso por roles jerárquicos.

---

## Tabla de Contenidos

- [Institutional Document Management System (IDMS)](#institutional-document-management-system-idms)
    - [Universidad Politécnica de Quintana Roo](#universidad-politécnica-de-quintana-roo)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [1. Objetivo del Sistema](#1-objetivo-del-sistema)
  - [2. Tipo de Sistema](#2-tipo-de-sistema)
  - [3. Roles y Usuarios](#3-roles-y-usuarios)
    - [Roles del Sistema](#roles-del-sistema)
    - [Asignación Automática de Roles por Email](#asignación-automática-de-roles-por-email)
    - [Estructura Organizacional](#estructura-organizacional)
    - [Matriz de Permisos por Rol](#matriz-de-permisos-por-rol)
  - [4. Funcionalidades Principales](#4-funcionalidades-principales)
    - [Autenticación](#autenticación)
  - [5. Gestión de Documentos](#5-gestión-de-documentos)
  - [6. Versionado de Documentos](#6-versionado-de-documentos)
  - [7. Distribución y Permisos](#7-distribución-y-permisos)
  - [8. Procesamiento Asíncrono](#8-procesamiento-asíncrono)
  - [9. Seguridad](#9-seguridad)
  - [10. Auditoría](#10-auditoría)
  - [11. Restricciones del Sistema](#11-restricciones-del-sistema)
    - [Archivos](#archivos)
    - [Búsqueda](#búsqueda)
    - [Paginación](#paginación)
  - [12. Arquitectura del Proyecto](#12-arquitectura-del-proyecto)
  - [13. Arquitectura Backend](#13-arquitectura-backend)
    - [Separación de responsabilidades por módulo](#separación-de-responsabilidades-por-módulo)
  - [14. Base de Datos](#14-base-de-datos)
  - [15. Infraestructura](#15-infraestructura)
    - [Docker](#docker)
    - [Nginx (recomendado en producción)](#nginx-recomendado-en-producción)
  - [16. Flujos del Sistema](#16-flujos-del-sistema)
    - [Subida de documento](#subida-de-documento)
    - [Nueva versión](#nueva-versión)
    - [Compartir documento](#compartir-documento)
    - [Autenticación](#autenticación-1)
  - [17. Stack Tecnológico](#17-stack-tecnológico)
    - [Backend](#backend)
    - [Frontend](#frontend)
    - [Base de Datos e Infraestructura](#base-de-datos-e-infraestructura)
  - [18. Requisitos del Servidor](#18-requisitos-del-servidor)
    - [Mínimos recomendados](#mínimos-recomendados)
    - [Justificación](#justificación)
    - [Capacidad estimada](#capacidad-estimada)
  - [19. Instalación y Despliegue](#19-instalación-y-despliegue)
    - [Desarrollo](#desarrollo)
    - [Producción (servidor universitario)](#producción-servidor-universitario)
    - [Actualización en producción](#actualización-en-producción)
    - [Crear primer administrador](#crear-primer-administrador)
  - [20. Variables de Entorno](#20-variables-de-entorno)
    - [`backend/.env`](#backendenv)
    - [`docker/.env`](#dockerenv)
  - [21. Limitaciones Técnicas](#21-limitaciones-técnicas)
    - [Actuales (conocidas)](#actuales-conocidas)
    - [Pendientes de implementación](#pendientes-de-implementación)
  - [22. Estado del Proyecto](#22-estado-del-proyecto)
    - [Implementado ✅](#implementado-)
    - [En progreso 🔄](#en-progreso-)
    - [Planificado 📋](#planificado-)

---

## 1. Objetivo del Sistema

El **IDMS UPQROO** permite que usuarios institucionales puedan:

- Subir y gestionar documentos institucionales
- Controlar versiones de documentos con integridad verificada (SHA-256)
- Compartir documentos con usuarios individuales o departamentos completos
- Acceder a documentos según rol y área organizacional
- Auditar todas las acciones sobre documentos

Todo dentro de una **infraestructura interna segura** alojada en el servidor universitario.

---

## 2. Tipo de Sistema

Sistema web institucional interno (Intranet).

**Características principales:**

- API REST con Express
- Procesamiento asíncrono de archivos con BullMQ + Redis
- Autenticación con Google OAuth institucional (`@upqroo.edu.mx`)
- Control de acceso por roles jerárquicos (5 niveles)
- Aislamiento de documentos por Secretaría y Departamento
- Versionado de documentos con límite configurable
- Validación de integridad de archivos con hash SHA-256
- Búsqueda combinada FULLTEXT + LIKE
- Auditoría completa de acciones sobre documentos
- Almacenamiento en filesystem del servidor universitario
- Arquitectura modular con separación de responsabilidades
- Infraestructura Dockerizada (MySQL + Redis)
- Cluster mode para aprovechar múltiples cores del servidor
- Compresión de respuestas HTTP

---

## 3. Roles y Usuarios

Los usuarios se autentican mediante **Google OAuth institucional** y el rol se asigna automáticamente según el email al primer login.

### Roles del Sistema

| Rol         | Descripción                                    | Permisos                                                     |
| ----------- | ---------------------------------------------- | ------------------------------------------------------------ |
| `admin`     | Administrador del sistema                      | Acceso total sin restricciones                               |
| `secretary` | Secretarios y Directores de área               | Gestión completa de su Secretaría                            |
| `director`  | Directores de Programa y Jefes de Departamento | Gestión de su departamento                                   |
| `professor` | Profesores                                     | Subida si el Director lo habilita, descarga de lo compartido |
| `student`   | Alumnos                                        | Solo ver y descargar documentos enviados                     |

### Asignación Automática de Roles por Email

| Email                                                                                                                                                                                                                                                                                                                          | Rol asignado |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| `sistemas@upqroo.edu.mx`                                                                                                                                                                                                                                                                                                       | `admin`      |
| `secretaria.academica@`, `sec.admin@`, `planeacion@`, `vinculacion@`                                                                                                                                                                                                                                                           | `secretary`  |
| `ing.biotecnologia@`, `ing.software@`, `lic.terapiafisica@`, `ing.biomedica@`, `ing.financiera@`, `lic.gestion@`, `serv.escolares@`, `rec.financieros@`, `rec.humanos@`, `rec.materiales@`, `serv.generales@`, `calidad@`, `estadistica@`, `gestionempresarial@`, `prensaydifusion@`, `coordinaciondeportiva@`, `maria.vidal@` | `director`   |
| Matrícula numérica (ej: `202200467@`)                                                                                                                                                                                                                                                                                          | `student`    |
| Cualquier otro email `@upqroo.edu.mx`                                                                                                                                                                                                                                                                                          | `professor`  |

### Estructura Organizacional

```
SISTEMA
│
├── Secretaría Académica (secretary)
│   ├── Ing. Biotecnología (director)
│   ├── Ing. TI e Innovación Digital (director)
│   ├── Lic. Terapia Física (director)
│   ├── Ing. Biomédica (director)
│   ├── Ing. Financiera (director)
│   ├── Lic. Administración (director)
│   └── Servicios Escolares (director)
│
├── Secretaría Administrativa (secretary)
│   ├── Recursos Financieros (director)
│   ├── Recursos Humanos (director)
│   ├── Recursos Materiales (director)
│   └── Servicios Generales (director)
│
├── Secretaría de Planeación (secretary)
│   ├── Calidad (director)
│   ├── Sistemas Informáticos (director)
│   └── Evaluación y Estadística (director)
│
└── Dirección de Vinculación (secretary)
    ├── Gestión Empresarial (director)
    ├── Prensa y Difusión (director)
    └── Cultura y Deporte (director)
```

### Matriz de Permisos por Rol

| Acción                        | `admin`                | `secretary`           | `director`       | `professor`                | `student`              |
| ----------------------------- | ---------------------- | --------------------- | ---------------- | -------------------------- | ---------------------- |
| Ver documentos propios        | ✅                     | ✅                    | ✅               | ✅                         | ✅                     |
| Ver documentos de su área     | ✅ toda la universidad | ✅ toda su secretaría | ✅ solo su depto | ✅ si se los comparten     | ✅ si se los comparten |
| Subir documentos              | ✅                     | ✅                    | ✅               | ⚙️ si director lo habilita | ❌                     |
| Editar documentos             | ✅                     | ✅ su secretaría      | ✅ su depto      | ✅ solo los suyos          | ❌                     |
| Compartir documentos          | ✅                     | ✅                    | ✅ su depto      | ❌                         | ❌                     |
| Eliminar documentos           | ✅                     | ✅ su secretaría      | ✅ su depto      | ❌                         | ❌                     |
| Gestionar usuarios            | ✅                     | ❌                    | ❌               | ❌                         | ❌                     |
| Gestionar departamentos       | ✅                     | ❌                    | ❌               | ❌                         | ❌                     |
| Habilitar subida a profesores | ✅                     | ❌                    | ✅ su depto      | ❌                         | ❌                     |
| Ver auditoría                 | ✅                     | ✅ su secretaría      | ✅ su depto      | ❌                         | ❌                     |

---

## 4. Funcionalidades Principales

### Autenticación

El sistema utiliza **Google OAuth** para autenticar usuarios institucionales.

**Flujo:**

1. Usuario inicia sesión con su cuenta Google `@upqroo.edu.mx`
2. Se valida el dominio institucional
3. Si el usuario no existe, se crea automáticamente con el rol correspondiente
4. El backend genera un **JWT de sesión** almacenado en cookie segura

**Configuración de sesión:**

- Duración: `4 horas`
- Almacenamiento: cookie `httpOnly`, `secure`, `sameSite=strict`

---

## 5. Gestión de Documentos

Los usuarios pueden, según su rol:

- Subir documentos (PDF actualmente, Word/Excel/PPT en versiones futuras)
- Ver y descargar documentos
- Crear nuevas versiones
- Editar metadatos (título, descripción)
- Compartir con usuarios o departamentos
- Eliminar documentos (soft delete con posibilidad de restauración)

**Almacenamiento:**

- Filesystem del servidor → archivos físicos
- Base de datos MySQL → metadata, versiones, permisos y auditoría

---

## 6. Versionado de Documentos

Cada documento puede tener múltiples versiones con límite configurable.

```
Documento: Reglamento Interno

v1.pdf  →  hash: a3f8c2...
v2.pdf  →  hash: b9d1e4...
v3.pdf  →  hash: c7a2f5...
```

- Las versiones se registran en `document_versions`
- Cada versión almacena su hash SHA-256 para verificación de integridad
- El límite de versiones es configurable via `MAX_DOCUMENT_VERSIONS` (default: 20)
- Al alcanzar el límite, se rechaza la subida con mensaje de error claro

**Ruta de almacenamiento:**

```
/storage/documents/{grupo}/{documentId}/v{version}.pdf
```

Ejemplo:

```
/storage/documents/0/42/v1.pdf
/storage/documents/0/42/v2.pdf
```

---

## 7. Distribución y Permisos

Los documentos pueden compartirse con:

- Usuarios individuales
- Departamentos completos
- Múltiples destinatarios

**Permisos disponibles:**

| Permiso          | Descripción                 |
| ---------------- | --------------------------- |
| `view`           | Ver metadatos del documento |
| `download`       | Descargar el archivo        |
| `upload_version` | Subir nuevas versiones      |
| `edit`           | Editar metadatos            |
| `share`          | Compartir con otros         |

**Ejemplo de flujo institucional:**

```
Secretaría Académica → Directores de Programa
Director de Programa → Profesores del área
Director de Programa → Alumnos del programa
```

Los profesores con permiso de subida habilitado por su Director pueden subir documentos en el departamento correspondiente.

---

## 8. Procesamiento Asíncrono

El procesamiento de archivos se realiza mediante **colas de trabajo** para no bloquear la API.

**Tecnologías:** BullMQ + Redis

**Flujo:**

```
Controller
    ↓
Service (registra en DB + encola job)
    ↓
Queue (BullMQ → Redis)
    ↓
Worker (proceso separado)
    ↓
Storage filesystem
```

**Configuración del worker:**

- Concurrencia: 5 jobs simultáneos
- Reintentos: 3 intentos con backoff exponencial (2s base)
- Limpieza automática de archivos temporales huérfanos cada hora
- Archivos temporales con más de 2 horas de antigüedad se eliminan automáticamente

---

## 9. Seguridad

| Medida                 | Implementación                                        |
| ---------------------- | ----------------------------------------------------- |
| Autenticación          | Google OAuth + validación de dominio `@upqroo.edu.mx` |
| Sesión                 | JWT en cookie `httpOnly`, `secure`, `sameSite=strict` |
| Autorización           | Middleware de roles jerárquicos por endpoint          |
| Aislamiento de datos   | Documentos filtrados por área según rol               |
| Rate limiting          | 10 intentos de login por 15 minutos por IP            |
| CORS                   | Lista blanca de orígenes configurada via `.env`       |
| Integridad de archivos | Hash SHA-256 calculado y almacenado en cada versión   |
| Soft delete            | Los documentos eliminados no se borran físicamente    |

---

## 10. Auditoría

El sistema registra automáticamente en `document_audit_logs` todas las acciones relevantes sobre documentos.

**Acciones auditadas:**

| Acción                        | Cuándo                                  |
| ----------------------------- | --------------------------------------- |
| `document_created`            | Al crear un documento                   |
| `document_uploaded`           | Al subir o versionar un archivo         |
| `document_downloaded`         | Al descargar una versión                |
| `document_shared`             | Al compartir con usuario o departamento |
| `document_permission_revoked` | Al revocar un permiso                   |
| `document_updated`            | Al editar título o descripción          |
| `document_deleted`            | Al hacer soft delete                    |

Cada registro incluye `metadata` JSON con contexto específico de la acción (versión descargada, con quién se compartió, qué campos se editaron, etc.).

Los logs de auditoría son accesibles via `GET /documents/:documentId/audit` para roles `admin`, `secretary` y `director`.

---

## 11. Restricciones del Sistema

### Archivos

| Parámetro                       | Valor                                           |
| ------------------------------- | ----------------------------------------------- |
| Tamaño máximo                   | 20MB por archivo                                |
| Tipos soportados actualmente    | PDF                                             |
| Tipos planificados              | Word (.docx), Excel (.xlsx), PowerPoint (.pptx) |
| Versiones máximas por documento | 20 (configurable via `MAX_DOCUMENT_VERSIONS`)   |

### Búsqueda

- Mínimo 2 caracteres para activar búsqueda
- Máximo 20 resultados por búsqueda
- Soporta búsqueda parcial (ej: `"Reglamen"` encuentra `"Reglamento"`)
- Resultados ordenados por relevancia combinada (FULLTEXT + LIKE)

### Paginación

- Default: 20 registros por página
- Máximo: 100 registros por página
- Las respuestas incluyen `total`, `totalPages`, `page` y `limit`

---

## 12. Arquitectura del Proyecto

Monorepo con separación clara entre backend, frontend e infraestructura.

```
intranet-documents-upqroo
│
├── backend                 # API REST Node.js
├── frontend                # React + Vite
├── docker                  # Docker Compose + MySQL schema
├── docs                    # Documentación adicional
├── scripts                 # Scripts de utilidad
├── storage                 # Archivos de documentos (gitignored)
├── logs                    # Logs de PM2 (gitignored)
│
├── ecosystem.config.cjs    # Configuración PM2
├── README.md
└── .gitignore
```

---

## 13. Arquitectura Backend

```
backend/src
│
├── config
│   ├── env.ts              # Variables de entorno tipadas
│   └── redis.ts            # Conexión Redis
│
├── infrastructure
│   ├── database
│   │   ├── schema          # Schemas Drizzle ORM
│   │   ├── relations.ts    # Relaciones entre tablas
│   │   ├── drizzle.ts      # Instancia Drizzle
│   │   └── connection.ts   # Pool MySQL (connectionLimit: 100)
│   │
│   ├── queues
│   │   └── document.queue.ts
│   │
│   ├── workers
│   │   ├── document.worker.ts  # Procesamiento de archivos
│   │   └── cleanup.worker.ts   # Limpieza de temporales (cada hora)
│   │
│   └── storage
│       ├── store.service.ts    # Gestión de rutas de almacenamiento
│       └── hash.service.ts     # Cálculo SHA-256 por streaming
│
├── middleware
│   ├── auth.middleware.ts           # Verificación JWT
│   ├── admin.middleware.ts          # roleMiddleware + adminMiddleware
│   ├── documentRole.middleware.ts   # Permisos por documento
│   ├── upload.middleware.ts         # Multer + validación de tipo/tamaño
│   └── rateLimit.middleware.ts      # Rate limiting auth
│
├── modules
│   ├── auth                # Google OAuth + JWT
│   ├── users               # Perfil y listado de usuarios
│   ├── departments         # Gestión de departamentos y permisos de profesores
│   └── documents           # CRUD, versiones, permisos, auditoría, búsqueda
│
├── types
│   └── express.d.ts        # Extensión del tipo Request (user con rol)
│
├── server.ts               # Express + Cluster mode
└── worker.ts               # Entry point del worker
```

### Separación de responsabilidades por módulo

| Capa         | Responsabilidad                       |
| ------------ | ------------------------------------- |
| `routes`     | Definición de endpoints y middlewares |
| `controller` | Manejo HTTP, parsing, respuestas      |
| `service`    | Lógica de aplicación y orquestación   |
| `domain`     | Reglas de negocio puras               |
| `repository` | Acceso a base de datos                |
| `validators` | Validación de entrada con Zod         |
| `types`      | Interfaces TypeScript del módulo      |

---

## 14. Base de Datos

**MySQL 8** con las siguientes tablas:

| Tabla                          | Descripción                                             |
| ------------------------------ | ------------------------------------------------------- |
| `users`                        | Usuarios con rol del sistema                            |
| `departments`                  | Secretarías y departamentos con jerarquía (`parent_id`) |
| `department_users`             | Relación usuario-departamento                           |
| `professor_upload_permissions` | Permisos de subida habilitados por directores           |
| `documents`                    | Documentos con soft delete                              |
| `document_versions`            | Versiones con ruta, tamaño y hash SHA-256               |
| `document_permissions`         | Permisos granulares por usuario o departamento          |
| `document_audit_logs`          | Auditoría de acciones con metadata JSON                 |

**Configuración MySQL (`my.cnf`):**

```ini
max_connections = 500
innodb_buffer_pool_size = 512M
innodb_buffer_pool_instances = 4
wait_timeout = 300
```

---

## 15. Infraestructura

### Docker

Los servicios de base de datos e infraestructura corren en Docker:

```yaml
services:
  mysql: MySQL 8.0 con schema inicial
  redis: Para BullMQ (colas de jobs)
```

El backend y el worker corren **fuera de Docker** directamente en el servidor Ubuntu, gestionados por PM2.

El filesystem de documentos (`/storage`) vive directamente en el servidor para no aumentar el tamaño de la imagen Docker.

### Nginx (recomendado en producción)

```
Servidor Ubuntu
│
├── Nginx
│   ├── Sirve frontend (build estático de React/Vite)
│   └── Proxy → backend :3000
│
├── PM2
│   ├── idms-server  (cluster, N workers según cores)
│   └── idms-worker  (fork, 1 instancia)
│
├── Docker
│   ├── MySQL :3306
│   └── Redis :6379
│
└── Filesystem
    ├── /var/intranet-upqroo/storage   (documentos)
    └── /var/intranet-upqroo/tmp       (temporales)
```

---

## 16. Flujos del Sistema

### Subida de documento

```
POST /documents          → Crea registro en DB
POST /documents/upload   → Multer guarda en /tmp
                         → Se encola job en BullMQ
                         → Respuesta inmediata al usuario
                              ↓ (asíncrono)
                         Worker calcula SHA-256
                         Worker verifica límite de versiones
                         Worker mueve archivo a /storage
                         Worker registra versión en DB
                         Worker limpia archivo /tmp
```

### Nueva versión

```
POST /documents/upload   → Mismo flujo que subida inicial
                         → Worker calcula MAX(version) + 1
                         → Row-level lock evita condición de carrera
```

### Compartir documento

```
POST /documents/share    → Verifica permiso 'share' del solicitante
                         → Crea registro en document_permissions
                         → Registra en auditoría
```

### Autenticación

```
POST /auth/google        → Verifica token Google
                         → Valida dominio @upqroo.edu.mx
                         → Crea usuario si no existe (asigna rol por email)
                         → Genera JWT con userId + email + role
                         → Setea cookie httpOnly
```

---

## 17. Stack Tecnológico

### Backend

| Tecnología          | Versión | Uso                   |
| ------------------- | ------- | --------------------- |
| Node.js             | 24.14.0 | Runtime               |
| Express             | 4.19.2  | Framework HTTP        |
| TypeScript          | 5.6.2   | Tipado estático       |
| Drizzle ORM         | 0.36.0  | ORM para MySQL        |
| BullMQ              | 5.71.0  | Colas de trabajo      |
| ioredis             | 5.10.0  | Cliente Redis         |
| jsonwebtoken        | 9.0.3   | JWT                   |
| google-auth-library | 10.6.1  | Google OAuth          |
| multer              | 2.1.1   | Upload de archivos    |
| zod                 | 3.23.8  | Validación de entrada |
| compression         | 1.7.4   | Compresión HTTP       |
| express-rate-limit  | 8.3.1   | Rate limiting         |

### Frontend

| Tecnología | Uso        |
| ---------- | ---------- |
| React      | UI         |
| Vite       | Build tool |

### Base de Datos e Infraestructura

| Tecnología       | Uso                                   |
| ---------------- | ------------------------------------- |
| MySQL 8.0        | Base de datos principal               |
| Redis            | Broker de colas BullMQ                |
| Docker + Compose | Contenedores de infraestructura       |
| PM2              | Supervisor de procesos Node.js        |
| Nginx            | Reverse proxy + servidor de estáticos |

---

## 18. Requisitos del Servidor

### Mínimos recomendados

| Componente     | Mínimo           | Recomendado      |
| -------------- | ---------------- | ---------------- |
| CPU            | 4 cores          | 8 cores          |
| RAM            | 4 GB             | 8 GB             |
| Disco          | 100 GB SSD       | 500 GB SSD       |
| OS             | Ubuntu 20.04 LTS | Ubuntu 22.04 LTS |
| Node.js        | 24.14.0          | 24.14.0          |
| Docker         | 24+              | 24+              |
| Docker Compose | 2.x              | 2.x              |

### Justificación

- **CPU — 4 cores mínimo:** El servidor corre en cluster mode, un proceso Node.js por core. Con 4 cores puedes manejar cómodamente 200-400 requests/segundo concurrentes.
- **RAM — 4 GB mínimo:** MySQL necesita 512MB de `innodb_buffer_pool`, Redis ~100MB, los workers de Node ~200MB cada uno. Con 4 GB tienes margen para el OS y picos de carga.
- **Disco — 100 GB mínimo:** Con 50,000 documentos de hasta 20MB cada uno, el peor caso teórico es ~1TB. En la práctica los PDFs institucionales promedian 1-3MB, por lo que 100GB cubre ~30,000-50,000 documentos reales. Ajustar según crecimiento.
- **SSD obligatorio:** Las operaciones de lectura/escritura de archivos y MySQL son intensivas en I/O. Un disco mecánico degradaría significativamente el rendimiento con usuarios concurrentes.

### Capacidad estimada

| Métrica                                  | Capacidad                              |
| ---------------------------------------- | -------------------------------------- |
| Usuarios registrados                     | Hasta 5,000                            |
| Usuarios concurrentes activos            | Hasta 1,000 (con hardware recomendado) |
| Documentos totales                       | Hasta 50,000 sin degradación           |
| Requests por segundo (endpoints simples) | 200-500 rps                            |
| Requests por segundo (con queries DB)    | 50-150 rps                             |
| Jobs de procesamiento simultáneos        | 5 (configurable en worker)             |

---

## 19. Instalación y Despliegue

### Desarrollo

```bash
# Clonar repositorio
git clone https://github.com/upqroo/intranet-documents-upqroo.git
cd intranet-documents-upqroo

# Levantar infraestructura Docker
cd docker
cp .env.example .env     # Configurar variables
docker compose up -d

# Configurar backend
cd ../backend
cp .env.example .env     # Configurar variables
pnpm install

# Correr servidor y worker en terminales separadas
pnpm dev
pnpm worker
```

### Producción (servidor universitario)

```bash
# Instalar dependencias globales (una sola vez)
npm install -g pm2
npm install -g pnpm

# Clonar e instalar
git clone https://github.com/upqroo/intranet-documents-upqroo.git
cd intranet-documents-upqroo

# Configurar variables de entorno
cd backend
cp .env.example .env
nano .env    # Editar con valores de producción

# Levantar infraestructura
cd ../docker
cp .env.example .env
docker compose up -d

# Build y arranque con PM2
cd ../backend
pnpm install
pnpm build
pm2 start ../ecosystem.config.cjs --env production
pm2 save
pm2 startup    # Seguir instrucciones del output para arranque automático
```

### Actualización en producción

```bash
git pull
cd backend
pnpm install
pnpm build
pm2 restart all
```

### Crear primer administrador

Después del primer login, asigna rol admin manualmente:

```sql
UPDATE users SET role = 'admin' WHERE email = 'sistemas@upqroo.edu.mx';
-- O para cuenta de pruebas:
UPDATE users SET role = 'admin' WHERE email = 'tu.correo@upqroo.edu.mx';
```

---

## 20. Variables de Entorno

### `backend/.env`

| Variable                | Descripción                                             | Ejemplo                                               |
| ----------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| `PORT`                  | Puerto del servidor                                     | `3000`                                                |
| `DB_HOST`               | Host de MySQL                                           | `localhost`                                           |
| `DB_PORT`               | Puerto de MySQL                                         | `3306`                                                |
| `DB_USER`               | Usuario de MySQL                                        | `appuser`                                             |
| `DB_PASSWORD`           | Contraseña MySQL                                        | `****`                                                |
| `DB_NAME`               | Nombre de la base de datos                              | `intranet-upqroo`                                     |
| `GOOGLE_CLIENT_ID`      | Client ID de Google OAuth                               | `xxxxx.apps.googleusercontent.com`                    |
| `COOKIE_NAME`           | Nombre de la cookie de sesión                           | `auth_token`                                          |
| `JWT_SECRET`            | Secreto para firmar JWT (mínimo 64 chars en producción) | `****`                                                |
| `JWT_EXPIRES`           | Duración del JWT                                        | `4h`                                                  |
| `REDIS_HOST`            | Host de Redis                                           | `127.0.0.1`                                           |
| `REDIS_PORT`            | Puerto de Redis                                         | `6379`                                                |
| `STORAGE_PATH`          | Ruta absoluta al directorio de archivos                 | `/var/intranet-upqroo/storage`                        |
| `TMP_PATH`              | Ruta absoluta al directorio temporal                    | `/var/intranet-upqroo/tmp`                            |
| `ALLOWED_ORIGINS`       | Orígenes CORS permitidos (separados por coma)           | `http://localhost:5173,http://intranet.upqroo.edu.mx` |
| `MAX_DOCUMENT_VERSIONS` | Máximo de versiones por documento                       | `20`                                                  |

> ⚠️ **En producción:** `STORAGE_PATH` y `TMP_PATH` deben ser rutas **absolutas**. Las rutas relativas (`./storage`) pueden fallar dependiendo del directorio de trabajo del proceso.
> ⚠️ **En producción:** `JWT_SECRET` debe ser un string aleatorio de al menos 64 caracteres. Generar con:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### `docker/.env`

| Variable              | Descripción                |
| --------------------- | -------------------------- |
| `MYSQL_ROOT_PASSWORD` | Contraseña root de MySQL   |
| `MYSQL_DATABASE`      | Nombre de la base de datos |
| `MYSQL_USER`          | Usuario de la aplicación   |
| `MYSQL_PASSWORD`      | Contraseña del usuario     |
| `MYSQL_PORT`          | Puerto expuesto en el host |

---

## 21. Limitaciones Técnicas

### Actuales (conocidas)

| Limitación                                | Impacto | Notas                                                                                           |
| ----------------------------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| Sin HTTPS propio                          | Medio   | Depende de Nginx para HTTPS. Sin Nginx + certificado, las cookies `secure` no funcionan         |
| Sin refresh de JWT                        | Bajo    | La sesión expira a las 4 horas. El usuario debe volver a hacer login                            |
| Worker sin supervisión automática sin PM2 | Medio   | Sin PM2, si el worker cae nadie lo reinicia. Jobs quedan en cola en Redis hasta reinicio manual |
| Tipos de archivo solo PDF                 | Bajo    | Word, Excel y PPT están planificados. Los MIME types están comentados en `upload.middleware.ts` |
| Sin notificaciones                        | Bajo    | No hay aviso cuando un documento es compartido contigo                                          |
| Sin refresh de roles en JWT               | Bajo    | Si el rol de un usuario cambia en DB, el JWT anterior sigue siendo válido hasta que expire      |

### Pendientes de implementación

| Mejora                        | Descripción                                                    |
| ----------------------------- | -------------------------------------------------------------- |
| PM2 en servidor universitario | Supervisión automática del worker. Requiere acceso al servidor |
| Soporte Word/Excel/PPT        | Habilitar en `upload.middleware.ts` cuando se requiera         |
| Notificaciones                | Avisar cuando un documento es compartido                       |
| Endpoint para cambio de roles | Actualmente solo via SQL directo                               |
| Papelera de documentos        | Listar y restaurar documentos soft-deleted                     |

---

## 22. Estado del Proyecto

### Implementado ✅

- Arquitectura modular completa
- Base de datos MySQL con schema optimizado
- Google OAuth con validación de dominio institucional
- Sistema de roles jerárquicos (admin, secretary, director, professor, student)
- Asignación automática de rol por email al primer login
- Aislamiento de documentos por Secretaría y Departamento
- Subida de documentos con procesamiento asíncrono (BullMQ)
- Versionado con límite configurable y control de condición de carrera
- Validación de integridad de archivos con SHA-256
- Permisos granulares por usuario y departamento
- Búsqueda combinada FULLTEXT + LIKE con scoring de relevancia
- Paginación con total de registros en todos los listados
- Auditoría completa de acciones sobre documentos
- Soft delete de documentos
- Compresión de respuestas HTTP
- Cluster mode para múltiples cores
- Limpieza automática de archivos temporales huérfanos
- CORS configurable via variables de entorno
- Rate limiting en autenticación
- Docker para MySQL y Redis
- Configuración PM2 lista para despliegue

### En progreso 🔄

- Integración completa del frontend React
- Activación de PM2 en servidor universitario (pendiente acceso)

### Planificado 📋

- Soporte para Word, Excel y PowerPoint
- Sistema de notificaciones al compartir documentos
- Papelera de reciclaje con restauración de documentos
- Endpoint de gestión de roles desde la interfaz
- Pruebas automatizadas de integración
- Auditoría de acciones en usuarios y departamentos

---

_Universidad Politécnica de Quintana Roo_
