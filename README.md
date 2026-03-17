# Institutional Document Management System (IDMS)

Sistema interno para la **gestión de documentos institucionales**, diseñado para permitir almacenamiento, versionado y distribución controlada de documentos dentro de una organización.

El sistema está construido como una **aplicación web con arquitectura modular**, con procesamiento asíncrono de archivos y autenticación institucional mediante Google.

---

# Table of Contents

1. Objetivo del Sistema
2. Tipo de Sistema
3. Usuarios del Sistema
4. Funcionalidades Principales
5. Gestión de Documentos
6. Versionado de Documentos
7. Distribución de Documentos
8. Permisos de Documento
9. Procesamiento Asíncrono de Archivos
10. Restricciones del Sistema
11. Seguridad
12. Soft Delete
13. Arquitectura del Proyecto
14. Arquitectura Backend
15. Arquitectura de Módulos
16. Infraestructura
17. Base de Datos
18. Flujo del Sistema
19. Stack Tecnológico
20. Estado del Proyecto

---

# 1. Objetivo del Sistema

El **Institutional Document Management System (IDMS)** permite que usuarios institucionales puedan:

- Subir documentos
- Gestionar versiones de documentos
- Compartir documentos
- Distribuir documentos a departamentos o usuarios
- Acceder a documentos según permisos

Todo dentro de una **infraestructura interna segura**.

---

# 2. Tipo de Sistema

Sistema web institucional interno.

## Características principales

- API REST
- Procesamiento asíncrono de archivos
- Autenticación con Google OAuth
- Control de acceso por permisos
- Versionado de documentos
- Almacenamiento en filesystem
- Arquitectura modular
- Infraestructura Dockerizada

---

# 3. Usuarios del Sistema

Los usuarios se autentican mediante **Google OAuth institucional**.

Ejemplos de roles organizacionales:

- Secretaría Académica
- Dirección de Carrera
- Profesores
- Administración
- Departamentos institucionales

El sistema **no implementa roles complejos inicialmente**, pero la arquitectura permite agregarlos en el futuro.

---

# 4. Funcionalidades Principales

## Autenticación

El sistema utiliza **Google OAuth** para autenticar usuarios.

Flujo general:

1. Usuario inicia sesión con Google
2. Se valida el dominio institucional
3. Si el usuario no existe en la base de datos, se crea automáticamente
4. El backend genera un **JWT de sesión**

### Configuración de sesión

- Duración: **4 horas**
- Almacenamiento: **cookie httpOnly**

Configuración de seguridad:

- `httpOnly`
- `secure`
- `sameSite=strict`

---

# 5. Gestión de Documentos

Los usuarios pueden:

- Subir documentos
- Ver documentos
- Descargar documentos
- Crear nuevas versiones
- Compartir documentos

Los documentos se almacenan en:

- **Filesystem → archivos**
- **Base de datos → metadata**

---

# 6. Versionado de Documentos

Cada documento puede tener múltiples versiones.

Ejemplo:

```
Documento: Reglamento

v1.pdf
v2.pdf
v3.pdf
```

Las versiones se registran en la base de datos y el archivo físico se almacena en el filesystem.

---

# 7. Distribución de Documentos

Los documentos pueden compartirse con:

- Usuarios individuales
- Departamentos
- Múltiples departamentos

Ejemplo de flujo institucional:

```
Secretaría → Directores
Director → Profesores
Director → Estudiantes
```

---

# 8. Permisos de Documento

El sistema permite permisos granulares al compartir documentos.

Permisos disponibles:

| Permiso        | Descripción            |
| -------------- | ---------------------- |
| view           | Ver metadatos          |
| download       | Descargar archivo      |
| upload_version | Subir nuevas versiones |
| edit           | Editar documento       |
| share          | Compartir documento    |

---

# 9. Procesamiento Asíncrono de Archivos

El procesamiento de archivos se realiza mediante **colas de trabajo**.

Tecnologías:

- BullMQ
- Redis

Esto permite:

- evitar bloquear la API
- mover archivos al storage final
- procesar versiones
- organizar rutas de almacenamiento

Arquitectura:

```
Controller
    ↓
Service
    ↓
Queue (BullMQ)
    ↓
Worker
    ↓
Storage filesystem
```

---

# 10. Restricciones del Sistema

## Tamaño máximo

```
50MB
```

## Tipos soportados

- PDF
- Word
- Excel
- PowerPoint

---

# 11. Seguridad

Medidas implementadas:

### Autenticación

Google OAuth

### Sesión

JWT en cookie segura

### Cookies

```
httpOnly
secure
sameSite=strict
```

---

# 12. Soft Delete

Los documentos utilizan **soft delete**.

En lugar de eliminar registros permanentemente:

```sql
UPDATE documents
SET deleted_at = NOW();
```

Esto permite:

- restaurar documentos
- implementar papelera
- mantener historial

---

# 13. Arquitectura del Proyecto

El proyecto utiliza un **monorepo**.

```
intranet-documents-upqroo
│
├── backend
├── frontend
├── docker
├── docs
├── scripts
├── storage
│
├── README.md
└── .gitignore
```

---

# 14. Arquitectura Backend

```
backend
│
├── src
│
├── config
│   ├── env.ts
│   └── redis.ts
│
├── infrastructure
│
│   ├── database
│   │   ├── migrations
│   │   ├── schema
│   │   ├── drizzle.ts
│   │   ├── relations.ts
│   │   └── connection.ts
│
│   ├── queues
│   │   └── document.queue.ts
│
│   ├── workers
│   │   └── document.worker.ts
│
│   └── storage
│       └── store.service.ts
│
├── middleware
│
├── modules
│   ├── auth
│   ├── users
│   ├── departments
│   └── documents
│
├── types
├── utils
│
├── server.ts
└── worker.ts
```

---

# 15. Arquitectura de Módulos

Ejemplo del módulo `documents`.

```
documents
│
├── documents.routes.ts
├── documents.controller.ts
├── documents.service.ts
├── documents.repository.ts
├── documents.domain.ts
├── documents.validators.ts
└── documents.types.ts
```

Separación de responsabilidades:

| Capa       | Responsabilidad        |
| ---------- | ---------------------- |
| routes     | endpoints              |
| controller | manejo HTTP            |
| service    | lógica de aplicación   |
| domain     | reglas de negocio      |
| repository | acceso a base de datos |

---

# 16. Infraestructura

Infraestructura basada en **Docker**.

Servicios:

- MySQL
- Redis
- Backend
- Frontend

Configuración mediante:

```
docker-compose
```

Estructura:

```
docker
│
└── mysql
    └── init
        └── schema.sql
```

---

# 17. Base de Datos

Base de datos:

```
MySQL 8
```

Entidades principales:

- `users`
- `departments`
- `departments_users`
- `documents`
- `document_versions`
- `document_permissions`

---

# 18. Flujo del Sistema

## Flujo de subida de documento

```
POST /documents
```

Proceso:

1. Usuario sube archivo
2. `multer` guarda temporalmente

```
/tmp/uploads
```

3. Service crea registro en `documents`
4. Se crea versión inicial en `document_versions`
5. Se envía job a **BullMQ**
6. Worker procesa archivo
7. Archivo se mueve a **storage**

Ejemplo de ruta final:

```
/storage/docs/9f/20/9f20ab91/v1.pdf
```

---

## Flujo de nueva versión

```
POST /documents/:id/version
```

Proceso:

1. Usuario sube archivo
2. Service calcula versión

```
max(version) + 1
```

3. Se registra en `document_versions`
4. Worker mueve archivo al storage

---

## Flujo de compartir documento

```
POST /documents/:id/share
```

Proceso:

1. Usuario selecciona destinatarios
2. Backend crea permisos en `document_permissions`
3. Usuarios o departamentos obtienen acceso

---

# 19. Stack Tecnológico

## Backend

- Node.js
- Express
- TypeScript
- Drizzle ORM
- BullMQ
- Redis

## Frontend

- React
- Vite

## Base de Datos

- MySQL 8

## Infraestructura

- Docker
- Docker Compose

---

# 20. Estado del Proyecto

Estado actual:

Implementado:

- Arquitectura modular
- Base de datos MySQL
- Esquemas con Drizzle
- Subida de documentos
- Versionado
- Sistema de permisos
- Procesamiento asíncrono con BullMQ
- Workers para manejo de archivos
- Almacenamiento en filesystem
- Docker para infraestructura

En progreso:

- Integración completa de autenticación Google OAuth
- Endpoints finales de documentos
- Pruebas automatizadas
- Auditoría de acciones
