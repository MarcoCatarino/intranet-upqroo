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
  - [8. Padrón de Alumnos](#8-padrón-de-alumnos)
  - [9. Procesamiento Asíncrono](#9-procesamiento-asíncrono)
  - [10. Seguridad](#10-seguridad)
  - [11. Auditoría](#11-auditoría)
  - [12. Restricciones del Sistema](#12-restricciones-del-sistema)
    - [Archivos](#archivos)
    - [Búsqueda](#búsqueda)
    - [Paginación](#paginación)
  - [13. Arquitectura del Proyecto](#13-arquitectura-del-proyecto)
  - [14. Base de Datos](#14-base-de-datos)
  - [15. Infraestructura](#15-infraestructura)
    - [Diagrama de producción](#diagrama-de-producción)
  - [16. Flujos del Sistema](#16-flujos-del-sistema)
    - [Subida de documento](#subida-de-documento)
    - [Compartir documento](#compartir-documento)
    - [Autenticación](#autenticación-1)
    - [Padrón de alumnos](#padrón-de-alumnos)
  - [17. Stack Tecnológico](#17-stack-tecnológico)
    - [Backend](#backend)
    - [Frontend](#frontend)
    - [Base de Datos e Infraestructura](#base-de-datos-e-infraestructura)
  - [18. Requisitos del Servidor](#18-requisitos-del-servidor)
    - [Mínimos recomendados](#mínimos-recomendados)
    - [Capacidad estimada](#capacidad-estimada)
  - [19. Instalación y Despliegue](#19-instalación-y-despliegue)
    - [Desarrollo local](#desarrollo-local)
    - [Producción (servidor universitario)](#producción-servidor-universitario)
    - [Actualización en producción](#actualización-en-producción)
    - [Crear primer administrador](#crear-primer-administrador)
  - [20. Variables de Entorno](#20-variables-de-entorno)
    - [`backend/.env`](#backendenv)
    - [`frontend/.env`](#frontendenv)
    - [`docker/.env`](#dockerenv)
  - [21. Limitaciones Técnicas](#21-limitaciones-técnicas)

---

## 1. Objetivo del Sistema

El **IDMS UPQROO** permite que usuarios institucionales puedan:

- Subir y gestionar documentos institucionales con control de versiones
- Verificar la integridad de archivos mediante hash SHA-256
- Compartir documentos con usuarios individuales o departamentos completos
- Acceder a documentos según rol y área organizacional
- Gestionar el padrón de alumnos por carrera mediante archivos CSV
- Auditar todas las acciones relevantes sobre documentos

Todo dentro de una **infraestructura interna segura** alojada en el servidor universitario.

---

## 2. Tipo de Sistema

Sistema web institucional interno (Intranet).

**Características principales:**

- API REST con Express
- Interfaz web con React + Vite (solo PC, `min-width: 1280px`)
- Procesamiento asíncrono de archivos con BullMQ + Redis
- Autenticación con Google OAuth institucional (`@upqroo.edu.mx`)
- Control de acceso por roles jerárquicos (6 niveles)
- Aislamiento de documentos por Secretaría y Departamento
- Versionado de documentos con límite configurable (default: 20)
- Validación de integridad de archivos con hash SHA-256
- Búsqueda combinada FULLTEXT + LIKE con ranking de relevancia
- Auditoría de acciones sobre documentos
- Padrón de alumnos por carrera gestionado mediante CSV
- Almacenamiento en filesystem del servidor universitario
- Infraestructura Dockerizada (MySQL + Redis)
- Cluster mode para aprovechar múltiples cores del servidor
- Compresión de respuestas HTTP

---

## 3. Roles y Usuarios

Los usuarios se autentican mediante **Google OAuth institucional** y el rol se asigna automáticamente según el email al primer login.

### Roles del Sistema

| Rol         | Descripción                                    | Permisos generales                                           |
| ----------- | ---------------------------------------------- | ------------------------------------------------------------ |
| `admin`     | Administrador del sistema                      | Acceso total sin restricciones                               |
| `secretary` | Secretarías institucionales                    | Gestión completa dentro de su Secretaría                     |
| `director`  | Directores de programa y jefes de departamento | Gestión de su departamento + padrón de alumnos               |
| `assistant` | Asistentes administrativos                     | Subida, edición y compartición de documentos                 |
| `professor` | Profesores                                     | Subida si el Director lo habilita; descarga de lo compartido |
| `student`   | Alumnos                                        | Solo ver y descargar documentos compartidos con su carrera   |

### Asignación Automática de Roles por Email

| Email                                                                                                                                                                                                                                                                                                                          | Rol asignado |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| `sistemas@upqroo.edu.mx`                                                                                                                                                                                                                                                                                                       | `admin`      |
| `secretaria.academica@`, `sec.admin@`, `planeacion@`, `vinculacion@`                                                                                                                                                                                                                                                           | `secretary`  |
| `ing.biotecnologia@`, `ing.software@`, `lic.terapiafisica@`, `ing.biomedica@`, `ing.financiera@`, `lic.gestion@`, `serv.escolares@`, `rec.financieros@`, `rec.humanos@`, `rec.materiales@`, `serv.generales@`, `calidad@`, `estadistica@`, `gestionempresarial@`, `prensaydifusion@`, `coordinaciondeportiva@`, `maria.vidal@` | `director`   |
| Matrícula numérica (ej: `202200467@`)                                                                                                                                                                                                                                                                                          | `student`    |
| Cualquier otro email `@upqroo.edu.mx`                                                                                                                                                                                                                                                                                          | `professor`  |

> **Nota:** Los roles `student` y `professor` son **efímeros**: no se persisten en la base de datos. Su identidad la gestiona el JWT firmado en cada sesión.

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

| Acción                        | `admin`        | `secretary`      | `director`     | `assistant`        | `professor`                | `student`              |
| ----------------------------- | -------------- | ---------------- | -------------- | ------------------ | -------------------------- | ---------------------- |
| Ver documentos compartidos    | ✅ universidad | ✅ su secretaría | ✅ su depto    | ✅ los compartidos | ✅ si se los comparten     | ✅ si se los comparten |
| Subir documentos              | ✅             | ✅               | ✅             | ✅                 | ⚙️ si director lo habilita | ❌                     |
| Editar documentos             | ✅             | ✅               | ✅             | ✅                 | ❌                         | ❌                     |
| Compartir documentos          | ✅             | ✅               | ✅ con permiso | ✅                 | ❌                         | ❌                     |
| Eliminar documentos           | ✅             | ✅               | ✅             | ❌                 | ❌                         | ❌                     |
| Gestionar usuarios            | ✅             | ❌               | ❌             | ❌                 | ❌                         | ❌                     |
| Gestionar departamentos       | ✅             | ❌               | ❌             | ❌                 | ❌                         | ❌                     |
| Habilitar subida a profesores | ✅             | ❌               | ✅ su depto    | ❌                 | ❌                         | ❌                     |
| Gestionar padrón de alumnos   | ✅             | ❌               | ✅ su depto    | ❌                 | ❌                         | ❌                     |
| Ver auditoría                 | ✅             | ✅               | ✅             | ❌                 | ❌                         | ❌                     |

---

## 4. Funcionalidades Principales

### Autenticación

El sistema utiliza **Google OAuth** para autenticar usuarios institucionales.

**Flujo:**

1. Usuario inicia sesión con su cuenta Google `@upqroo.edu.mx`
2. Se valida el dominio institucional
3. Si el usuario no existe y no es efímero, se crea automáticamente con el rol correspondiente
4. El backend genera un **JWT de sesión** almacenado en cookie segura

**Configuración de sesión:**

- Duración: `4 horas`
- Almacenamiento: cookie `httpOnly`, `secure`, `sameSite=strict`

---

## 5. Gestión de Documentos

Los usuarios pueden, según su rol:

- Subir documentos (PDF, Word, Excel, PowerPoint — hasta 20 MB)
- Ver y descargar documentos
- Crear nuevas versiones de un documento existente
- Editar metadatos (título, descripción, departamento)
- Compartir con departamentos completos
- Eliminar documentos (soft delete)

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
/storage/documents/{grupo}/{documentId}/v{version}.ext
```

Ejemplo:

```
/storage/documents/0/42/v1.pdf
/storage/documents/0/42/v2.docx
```

---

## 7. Distribución y Permisos

Los documentos se comparten **por departamento**. No existe compartición individual por usuario en la interfaz principal.

**Permisos disponibles:**

| Permiso          | Descripción                       |
| ---------------- | --------------------------------- |
| `view`           | Ver metadatos del documento       |
| `download`       | Descargar el archivo              |
| `upload_version` | Subir nuevas versiones            |
| `edit`           | Editar metadatos                  |
| `share`          | Compartir con otros departamentos |

**Control de compartición para directores:**

Los directores solo pueden compartir si el administrador o una secretaría les habilitó el permiso `director_share_permissions` para su departamento.

**Ejemplo de flujo institucional:**

```
Secretaría Académica → Departamentos de carrera
Director de Programa → Alumnos de la carrera (vía padrón)
Director de Programa → Profesores habilitados
```

---

## 8. Padrón de Alumnos

Los directores y administradores pueden gestionar el padrón de alumnos de cada carrera mediante archivos CSV.

**Funcionamiento:**

- Subida de CSV con matrículas (una por línea)
- El CSV **reemplaza** el padrón completo del departamento al subirse
- Máximo: 2,000 matrículas por importación
- Tamaño máximo: 500 KB
- Los alumnos cuya matrícula aparezca en el padrón de una carrera pueden ver los documentos compartidos con ese departamento al iniciar sesión

**Formato CSV aceptado:**

```
202200467
202200123
202201089
```

El sistema ignora automáticamente encabezados como `matricula`, `matrícula`, `no. control`, etc.

---

## 9. Procesamiento Asíncrono

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
Storage filesystem (copyFile — compatible entre particiones)
```

**Configuración del worker:**

- Concurrencia: 5 jobs simultáneos
- Reintentos: 3 intentos con backoff exponencial (2s base)
- Limpieza automática de temporales cada hora
- Archivos `tmp-*` con más de 24 horas se eliminan automáticamente

---

## 10. Seguridad

| Medida                 | Implementación                                                  |
| ---------------------- | --------------------------------------------------------------- |
| Autenticación          | Google OAuth + validación de dominio `@upqroo.edu.mx`           |
| Sesión                 | JWT en cookie `httpOnly`, `secure`, `sameSite=strict`           |
| Autorización           | Middleware de roles jerárquicos por endpoint                    |
| Aislamiento de datos   | Documentos filtrados por área según rol                         |
| Rate limiting          | 10 intentos de login por 15 minutos por IP                      |
| CORS                   | Lista blanca de orígenes configurada via `.env`                 |
| Integridad de archivos | Hash SHA-256 calculado y almacenado en cada versión             |
| Soft delete            | Los documentos eliminados no se borran físicamente de inmediato |
| Acceso a eliminados    | `userHasDocumentAccess` filtra documentos con `deleted_at`      |

---

## 11. Auditoría

El sistema registra automáticamente en `document_audit_logs` las acciones relevantes sobre documentos.

**Acciones auditadas:**

| Acción              | Cuándo                          |
| ------------------- | ------------------------------- |
| `document_created`  | Al crear un documento           |
| `document_uploaded` | Al subir o versionar un archivo |
| `document_updated`  | Al editar título o descripción  |
| `document_deleted`  | Al hacer soft delete            |

> Las acciones de lectura (ver, descargar) **no generan logs** para evitar contaminación del registro en documentos de alta demanda como horarios.

Los logs son accesibles via `GET /documents/:documentId/audit` para roles `admin`, `secretary` y `director`.

---

## 12. Restricciones del Sistema

### Archivos

| Parámetro                       | Valor                                                |
| ------------------------------- | ---------------------------------------------------- |
| Tamaño máximo                   | 20 MB por archivo                                    |
| Tipos soportados                | PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx) |
| Versiones máximas por documento | 20 (configurable via `MAX_DOCUMENT_VERSIONS`)        |

### Búsqueda

- Mínimo 2 caracteres para activar búsqueda
- Máximo 20 resultados por búsqueda
- Soporta búsqueda parcial
- Resultados ordenados por relevancia combinada (FULLTEXT + LIKE)

### Paginación

- Default: 20 registros por página
- Máximo: 100 registros por página
- Las respuestas incluyen `total`, `totalPages`, `page` y `limit`

---

## 13. Arquitectura del Proyecto

Monorepo con separación clara entre backend, frontend e infraestructura.

```
intranet-documents-upqroo/
│
├── backend/                # API REST Node.js + TypeScript
├── frontend/               # React + Vite + TailwindCSS
├── docker/                 # Docker Compose + schema MySQL
│
├── ecosystem.config.cjs    # Configuración PM2 (producción)
├── README.md
└── .gitignore
```

Para la documentación detallada de cada parte, consulta los READMEs específicos:

- [`backend/README.md`](./backend/README.md)
- [`docker/README.md`](./docker/README.md)
- [`frontend/README.md`](./frontend/README.md)

---

## 14. Base de Datos

**MySQL 8** con las siguientes tablas:

| Tabla                          | Descripción                                                   |
| ------------------------------ | ------------------------------------------------------------- |
| `users`                        | Usuarios persistentes (admin, secretary, director, assistant) |
| `departments`                  | Secretarías y departamentos con jerarquía (`parent_id`)       |
| `department_users`             | Relación usuario-departamento con rol                         |
| `professor_upload_permissions` | Permisos de subida habilitados por directores a profesores    |
| `director_share_permissions`   | Permisos de compartición habilitados a directores             |
| `documents`                    | Documentos con soft delete                                    |
| `document_versions`            | Versiones con ruta, tamaño y hash SHA-256                     |
| `document_permissions`         | Permisos granulares por usuario o departamento                |
| `document_audit_logs`          | Auditoría de acciones con metadata JSON                       |
| `student_enrollments`          | Padrón de alumnos por carrera (matrícula + departamento)      |

---

## 15. Infraestructura

### Diagrama de producción

```
Servidor Ubuntu
│
├── Apache2
│   ├── Sirve frontend (build estático de React/Vite)
│   └── Proxy reverso → backend :PORT
│
├── PM2
│   ├── idms-server  (cluster, N workers según cores)
│   └── idms-worker  (fork, 1 instancia)
│
├── Docker
│   ├── MySQL 8.0 :3306
│   └── Redis 7 :6379
│
└── Filesystem
    ├── /var/intranet-upqroo/storage   (documentos)
    └── /var/intranet-upqroo/tmp       (temporales)
```

Ver [`docker/README.md`](./docker/README.md) para instrucciones de Docker y configuración de Apache.

---

## 16. Flujos del Sistema

### Subida de documento

```
POST /documents          → Crea registro en DB
POST /documents/upload   → Multer guarda en /tmp
                         → Encola job en BullMQ
                         → Respuesta inmediata al usuario
                              ↓ (asíncrono)
                         Worker calcula SHA-256
                         Worker verifica límite de versiones
                         Worker copia archivo a /storage (cross-filesystem safe)
                         Worker registra versión en DB
                         Worker elimina archivo /tmp
```

### Compartir documento

```
POST /documents/share    → Verifica permiso 'share' del solicitante
                         → Verifica director_share_permissions si aplica
                         → Crea registro en document_permissions
```

### Autenticación

```
POST /auth/google        → Verifica token Google
                         → Valida dominio @upqroo.edu.mx
                         → Si es efímero (student/professor): no persiste en DB
                         → Si no existe en DB (director/secretary/admin): crea usuario
                         → Genera JWT con userId + email + role (+ departmentId para alumnos)
                         → Setea cookie httpOnly
```

### Padrón de alumnos

```
POST /students/upload-csv  → Valida CSV (tamaño, extensión, formato)
                           → Parsea matrículas (ignora encabezados, duplicados)
                           → Dentro de una transacción: elimina padrón anterior + inserta nuevo
                           → Responde con inserted, skipped, invalid
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
| compression         | 1.8.1   | Compresión HTTP       |
| express-rate-limit  | 8.3.1   | Rate limiting         |

### Frontend

| Tecnología   | Versión | Uso                     |
| ------------ | ------- | ----------------------- |
| React        | 18.3.1  | Biblioteca de UI        |
| Vite         | 5.4.8   | Build tool y dev server |
| TypeScript   | 5.5.3   | Tipado estático         |
| TailwindCSS  | 3.4.13  | Estilos utilitarios     |
| Zustand      | 5.0.0   | Estado global           |
| React Router | 6.26.2  | Enrutamiento            |
| Radix UI     | —       | Componentes accesibles  |
| Lucide React | 0.446.0 | Íconos                  |

### Base de Datos e Infraestructura

| Tecnología       | Uso                                   |
| ---------------- | ------------------------------------- |
| MySQL 8.0        | Base de datos principal               |
| Redis 7          | Broker de colas BullMQ                |
| Docker + Compose | Contenedores de infraestructura       |
| PM2              | Supervisor de procesos Node.js        |
| Apache2          | Reverse proxy + servidor de estáticos |

---

## 18. Requisitos del Servidor

### Mínimos recomendados

| Componente     | Mínimo           | Recomendado      |
| -------------- | ---------------- | ---------------- |
| CPU            | 4 cores          | 8 cores          |
| RAM            | 4 GB             | 8 GB             |
| Disco          | 100 GB           | 500 GB           |
| OS             | Ubuntu 20.04 LTS | Ubuntu 22.04 LTS |
| Node.js        | 24.14.0          | 24.14.0          |
| Docker         | 24+              | 24+              |
| Docker Compose | 2.x              | 2.x              |

### Capacidad estimada

| Métrica                              | Capacidad                          |
| ------------------------------------ | ---------------------------------- |
| Usuarios registrados                 | Hasta 5,000                        |
| Usuarios concurrentes activos        | Hasta 1,000 (hardware recomendado) |
| Documentos totales                   | Hasta 50,000 sin degradación       |
| Requests/segundo (endpoints simples) | 200–500 rps                        |
| Requests/segundo (con queries DB)    | 50–150 rps                         |
| Jobs de procesamiento simultáneos    | 5 (configurable)                   |

---

## 19. Instalación y Despliegue

### Desarrollo local

```bash
# 1. Clonar repositorio
git clone https://github.com/upqroo/intranet-documents-upqroo.git
cd intranet-documents-upqroo

# 2. Infraestructura (MySQL + Redis)
cd docker
cp .env.example .env        # Editar variables
docker compose up -d

# 3. Backend
cd ../backend
cp .env.example .env        # Editar variables
pnpm install
pnpm dev          # API en :3000
# En otra terminal:
pnpm worker       # Worker de documentos

# 4. Frontend
cd ../frontend
cp .env.example .env        # Editar VITE_GOOGLE_CLIENT_ID
pnpm install
pnpm dev          # UI en http://localhost:5173
```

### Producción (servidor universitario)

```bash
# Dependencias globales (una sola vez)
npm install -g pm2 pnpm

# Clonar e instalar
git clone https://github.com/upqroo/intranet-documents-upqroo.git
cd intranet-documents-upqroo

# Infraestructura Docker
cd docker && cp .env.example .env && docker compose up -d

# Backend
cd ../backend
cp .env.example .env        # Editar con valores de producción
pnpm install && pnpm build
pm2 start ../ecosystem.config.cjs --env production
pm2 save && pm2 startup

# Frontend
cd ../frontend
cp .env.example .env        # VITE_API_URL + VITE_GOOGLE_CLIENT_ID
pnpm install && pnpm build
mkdir -p /var/intranet-upqroo/frontend/dist
cp -r dist/* /var/intranet-upqroo/frontend/dist/
```

### Actualización en producción

```bash
git pull

cd backend && pnpm install && pnpm build
pm2 restart all

cd ../frontend && pnpm install && pnpm build
cp -r dist/* /var/intranet-upqroo/frontend/dist/
```

### Crear primer administrador

Después del primer login, asigna el rol manualmente:

```sql
UPDATE users SET role = 'admin' WHERE email = 'sistemas@upqroo.edu.mx';
```

---

## 20. Variables de Entorno

### `backend/.env`

| Variable                | Descripción                                           | Ejemplo                            |
| ----------------------- | ----------------------------------------------------- | ---------------------------------- |
| `PORT`                  | Puerto del servidor                                   | `3000`                             |
| `DB_HOST`               | Host de MySQL                                         | `localhost`                        |
| `DB_PORT`               | Puerto de MySQL                                       | `3306`                             |
| `DB_USER`               | Usuario de MySQL                                      | `appuser`                          |
| `DB_PASSWORD`           | Contraseña MySQL                                      | `****`                             |
| `DB_NAME`               | Nombre de la base de datos                            | `intranet-upqroo`                  |
| `GOOGLE_CLIENT_ID`      | Client ID de Google OAuth                             | `xxxxx.apps.googleusercontent.com` |
| `COOKIE_NAME`           | Nombre de la cookie de sesión                         | `auth_token`                       |
| `JWT_SECRET`            | Secreto para firmar JWT (mín. 64 chars en producción) | `****`                             |
| `JWT_EXPIRES`           | Duración del JWT                                      | `4h`                               |
| `REDIS_HOST`            | Host de Redis                                         | `127.0.0.1`                        |
| `REDIS_PORT`            | Puerto de Redis                                       | `6379`                             |
| `STORAGE_PATH`          | Ruta **absoluta** al directorio de archivos           | `/var/intranet-upqroo/storage`     |
| `TMP_PATH`              | Ruta **absoluta** al directorio temporal              | `/var/intranet-upqroo/tmp`         |
| `ALLOWED_ORIGINS`       | Orígenes CORS permitidos (separados por coma)         | `http://intranet.upqroo.edu.mx`    |
| `MAX_DOCUMENT_VERSIONS` | Máximo de versiones por documento                     | `20`                               |

> ⚠️ **En producción:** `STORAGE_PATH` y `TMP_PATH` deben ser rutas **absolutas**. Generar `JWT_SECRET` con:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### `frontend/.env`

| Variable                | Descripción               | Ejemplo                            |
| ----------------------- | ------------------------- | ---------------------------------- |
| `VITE_API_URL`          | URL base del backend      | `/api` o `http://localhost:3000`   |
| `VITE_GOOGLE_CLIENT_ID` | Client ID de Google OAuth | `xxxxx.apps.googleusercontent.com` |

### `docker/.env`

| Variable              | Descripción                         |
| --------------------- | ----------------------------------- |
| `MYSQL_ROOT_PASSWORD` | Contraseña root de MySQL            |
| `MYSQL_DATABASE`      | Nombre de la base de datos          |
| `MYSQL_USER`          | Usuario de la aplicación            |
| `MYSQL_PASSWORD`      | Contraseña del usuario              |
| `MYSQL_PORT`          | Puerto expuesto en el host          |
| `REDIS_PORT`          | Puerto de Redis expuesto en el host |

---

## 21. Limitaciones Técnicas

| Limitación                     | Impacto     | Notas                                                                    |
| ------------------------------ | ----------- | ------------------------------------------------------------------------ |
| Sin HTTPS propio               | Medio       | Depende de Apache para HTTPS. Sin SSL, las cookies `secure` no funcionan |
| Sin refresh de JWT             | Bajo        | La sesión expira a las 4h; el usuario debe volver a hacer login          |
| Worker sin supervisión sin PM2 | Medio       | Sin PM2, si el worker cae los jobs quedan en cola en Redis               |
| Sin notificaciones             | Bajo        | No hay aviso cuando un documento es compartido con el usuario            |
| Sin refresh de roles en JWT    | Bajo        | Si el rol cambia en DB, el JWT anterior sigue válido hasta que expire    |
| Solo PC                        | Bajo        | `min-width: 1280px`, sin diseño responsivo para móviles                  |
| Padrón reemplaza completamente | Informativo | Subir un CSV nuevo reemplaza todo el padrón del departamento             |

---

_Universidad Politécnica de Quintana Roo_
