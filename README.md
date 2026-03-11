# Institutional Document Management System (IDMS)

Sistema interno para la **gestión de documentos institucionales**, diseñado para permitir almacenamiento, versionado y distribución controlada de documentos dentro de una organización.

El sistema está construido como una **aplicación web con arquitectura modular**, con procesamiento asíncrono de archivos y autenticación institucional mediante Google.

---

# Table of Contents

- [Institutional Document Management System (IDMS)](#institutional-document-management-system-idms)
- [Table of Contents](#table-of-contents)
- [1. Objetivo del Sistema](#1-objetivo-del-sistema)
- [2. Tipo de Sistema](#2-tipo-de-sistema)
  - [Características principales](#características-principales)
- [3. Usuarios del Sistema](#3-usuarios-del-sistema)
- [4. Funcionalidades Principales](#4-funcionalidades-principales)
  - [Autenticación](#autenticación)
    - [Configuración de sesión](#configuración-de-sesión)
- [5. Gestión de Documentos](#5-gestión-de-documentos)
- [6. Versionado de Documentos](#6-versionado-de-documentos)
- [7. Distribución de Documentos](#7-distribución-de-documentos)
- [8. Permisos de Documento](#8-permisos-de-documento)
  - [Permisos disponibles](#permisos-disponibles)
- [9. Procesamiento de Archivos](#9-procesamiento-de-archivos)
- [10. Restricciones del Sistema](#10-restricciones-del-sistema)
  - [Tamaño máximo de archivo](#tamaño-máximo-de-archivo)
  - [Tipos de archivo soportados](#tipos-de-archivo-soportados)
- [11. Auditoría](#11-auditoría)
- [12. Seguridad](#12-seguridad)
  - [Autenticación](#autenticación-1)
  - [Sesión](#sesión)
  - [Cookies seguras](#cookies-seguras)
- [13. Soft Delete](#13-soft-delete)
- [14. Arquitectura del Proyecto](#14-arquitectura-del-proyecto)
- [15. Arquitectura Backend](#15-arquitectura-backend)
- [16. Arquitectura de Módulos](#16-arquitectura-de-módulos)
  - [Separación de responsabilidades](#separación-de-responsabilidades)
- [17. Arquitectura Frontend](#17-arquitectura-frontend)
- [18. Infraestructura](#18-infraestructura)
- [19. Base de Datos](#19-base-de-datos)
  - [Entidades principales](#entidades-principales)
- [20. Flujo del Sistema](#20-flujo-del-sistema)
  - [Flujo de autenticación](#flujo-de-autenticación)
  - [Flujo de subida de documento](#flujo-de-subida-de-documento)
  - [Flujo de nueva versión](#flujo-de-nueva-versión)
  - [Flujo de compartir documento](#flujo-de-compartir-documento)
- [21. Stack Tecnológico](#21-stack-tecnológico)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Base de Datos](#base-de-datos)
  - [Infraestructura](#infraestructura)
- [22. Estado del Proyecto](#22-estado-del-proyecto)

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

Los documentos se almacenan en el filesystem y su metadata en la base de datos.

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

## Permisos disponibles

| Permiso        | Descripción                      |
| -------------- | -------------------------------- |
| view           | Ver metadatos del documento      |
| download       | Descargar archivo                |
| upload_version | Subir nuevas versiones           |
| edit           | Editar información del documento |
| share          | Compartir documento              |

Ejemplo:

| Documento  | Destinatario | Permiso        |
| ---------- | ------------ | -------------- |
| Reglamento | Profesor     | view           |
| Reglamento | Dirección    | upload_version |

---

# 9. Procesamiento de Archivos

El procesamiento de archivos es **asíncrono**.

Tecnologías utilizadas:

- **BullMQ**
- **Redis**

Esto permite:

- mover archivos
- generar rutas organizadas
- registrar versiones
- evitar bloquear la API

---

# 10. Restricciones del Sistema

## Tamaño máximo de archivo

```
50 MB
```

## Tipos de archivo soportados

- PDF
- Word
- Excel
- PowerPoint

---

# 11. Auditoría

La auditoría completa **no está implementada en esta versión**.

Se implementará en futuros sprints mediante:

- activity logs
- historial de documentos
- seguimiento de acciones de usuarios

---

# 12. Seguridad

Medidas implementadas:

## Autenticación

Google OAuth

## Sesión

JWT

## Cookies seguras

- `httpOnly`
- `secure`
- `sameSite=strict`

---

# 13. Soft Delete

Los documentos utilizan **soft delete** para evitar pérdida de información.

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

# 14. Arquitectura del Proyecto

El proyecto utiliza un **monorepo**.

```
institution-docs-system
│
├── backend
├── frontend
├── docker
├── docs
├── scripts
│
├── docker-compose.yml
├── pnpm-workspace.yaml
└── README.md
```

Repositorio:

- GitHub private
- Monorepo

---

# 15. Arquitectura Backend

```
backend
│
├── src
│
│   ├── modules
│   │
│   │   ├── auth
│   │   ├── users
│   │   ├── departments
│   │   └── documents
│
│   ├── infrastructure
│   │
│   │   ├── database
│   │   ├── redis
│   │   ├── queues
│   │   ├── workers
│   │   └── storage
│
│   ├── middleware
│   ├── utils
│   ├── types
│
│   └── server.ts
│
├── storage
├── tmp
└── tests
```

---

# 16. Arquitectura de Módulos

Ejemplo del módulo `documents`.

```
documents
│
├── document.routes.ts
├── document.controller.ts
├── document.service.ts
├── document.repository.ts
├── document.domain.ts
├── document.validators.ts
└── document.types.ts
```

## Separación de responsabilidades

| Capa       | Responsabilidad         |
| ---------- | ----------------------- |
| routes     | Definición de endpoints |
| controller | Manejo HTTP             |
| service    | Lógica de aplicación    |
| domain     | Reglas de negocio       |
| repository | Acceso a base de datos  |

---

# 17. Arquitectura Frontend

```
frontend
│
├── src
│
│   ├── api
│   ├── store
│   ├── pages
│   ├── components
│   ├── features
│   ├── hooks
│   ├── layouts
│   └── types
│
├── public
└── vite.config.ts
```

---

# 18. Infraestructura

Infraestructura basada en **Docker**.

Servicios principales:

- MySQL
- Redis
- Backend
- Frontend

Orquestación mediante:

```
docker-compose
```

---

# 19. Base de Datos

El sistema utiliza **MySQL 8**.

## Entidades principales

- `users`
- `departments`
- `department_users`
- `documents`
- `document_versions`
- `document_shares`

Capacidad estimada:

- 2000 usuarios
- 100k documentos
- 300k versiones

---

# 20. Flujo del Sistema

## Flujo de autenticación

1. Usuario accede al sistema
2. Selecciona **Login with Google**
3. Google OAuth autentica al usuario
4. Google devuelve `id_token`
5. Frontend envía token al backend

```
POST /auth/google
```

1. Backend valida token
2. Verifica usuario en base de datos
3. Genera JWT
4. Envía cookie segura
5. Usuario queda autenticado

---

## Flujo de subida de documento

1. Usuario selecciona archivo
2. Frontend envía request

```
POST /documents
```

1. Express recibe request
2. `multer` guarda archivo temporalmente

```
/tmp/uploads
```

1. Service crea registro en `documents`
2. Se crea versión inicial en `document_versions`
3. Se envía job a BullMQ
4. Worker procesa archivo
5. Archivo se mueve a storage

Ejemplo:

```
/storage/docs/9f/20/9f20ab91/v1.pdf
```

---

## Flujo de nueva versión

```
POST /documents/:id/version
```

1. Se sube archivo
2. Service calcula nueva versión

```
max(version) + 1
```

1. Se registra en `document_versions`
2. Worker procesa archivo
3. Se guarda como `v2.pdf`

---

## Flujo de compartir documento

```
POST /documents/:id/share
```

1. Usuario selecciona destinatarios
2. Backend crea registros en `document_shares`
3. Usuarios o departamentos obtienen acceso al documento

---

# 21. Stack Tecnológico

## Backend

- Node.js
- Express
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

# 22. Estado del Proyecto

Arquitectura final del sistema:

- Modular
- Domain-driven design (light)
- Procesamiento asíncrono de archivos
- REST API
- Monorepo
- Dockerized infrastructure

---
