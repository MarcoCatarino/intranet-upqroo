# Frontend — IDMS UPQROO

Interfaz web del sistema de gestión documental institucional. Construida con **React 18 + Vite + TypeScript**, estilos con **TailwindCSS** y diseño con tokens CSS centralizados en la paleta de colores UPQROO.

> **Solo PC.** La interfaz tiene `min-width: 1280px` y no es responsiva para móviles o tablets.

---

## Tabla de Contenidos

- [Frontend — IDMS UPQROO](#frontend--idms-upqroo)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Stack](#stack)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Rutas](#rutas)
    - [Guardas de ruta](#guardas-de-ruta)
  - [Design Tokens](#design-tokens)
    - [Fuentes](#fuentes)
  - [Componentes](#componentes)
    - [Componentes UI base](#componentes-ui-base)
    - [AppLayout y PageHeader](#applayout-y-pageheader)
  - [Estado Global](#estado-global)
    - [`authStore` (Zustand + persistencia)](#authstore-zustand--persistencia)
    - [`documentsStore` (Zustand)](#documentsstore-zustand)
  - [Capa de API](#capa-de-api)
  - [Tipos](#tipos)
  - [Variables de Entorno](#variables-de-entorno)
  - [Scripts Disponibles](#scripts-disponibles)
  - [Notas de Producción](#notas-de-producción)

---

## Stack

| Tecnología            | Versión | Uso                                              |
| --------------------- | ------- | ------------------------------------------------ |
| React                 | 18.3.1  | Biblioteca de UI                                 |
| Vite                  | 5.4.8   | Build tool y dev server                          |
| TypeScript            | 5.5.3   | Tipado estático                                  |
| TailwindCSS           | 3.4.13  | Estilos utilitarios                              |
| Zustand               | 5.0.0   | Estado global                                    |
| React Router          | 6.26.2  | Enrutamiento del lado del cliente                |
| Radix UI              | —       | Componentes accesibles (Dialog, Dropdown, Toast) |
| Lucide React          | 0.446.0 | Íconos                                           |
| clsx + tailwind-merge | —       | Composición de clases CSS                        |

---

## Estructura del Proyecto

```
frontend/src/
│
├── index.css                   # Design tokens CSS (colores, tipografía, espaciado)
├── main.tsx                    # Entry point — monta App + ToastProvider
├── App.tsx                     # Router con rutas protegidas y públicas
├── vite-env.d.ts               # Tipos de variables de entorno de Vite
│
├── types/
│   └── index.ts                # Interfaces TypeScript del dominio (User, Document, etc.)
│
├── services/
│   └── api.ts                  # Capa de acceso al backend (fetch centralizado)
│
├── store/
│   ├── authStore.ts            # Estado de autenticación (Zustand + persistencia)
│   └── documentsStore.ts       # Estado de documentos (Zustand)
│
├── lib/
│   └── utils.ts                # cn(), formatDate(), helpers de roles, PERMISSION_LABELS, etc.
│
├── components/
│   ├── ui/                     # Componentes base reutilizables
│   │   ├── Button.tsx          # Button (primary, secondary, ghost, danger, outline)
│   │   ├── Input.tsx           # Input, Textarea, Select
│   │   ├── Badge.tsx           # Badge, Spinner, EmptyState, Divider
│   │   ├── Dialog.tsx          # Wrapper de Radix Dialog + DialogFooter
│   │   └── Toast.tsx           # Sistema de notificaciones (Zustand + Radix Toast)
│   │
│   ├── layout/                 # Estructuras de página
│   │   ├── AppLayout.tsx       # Sidebar + Header + área de contenido + PageHeader
│   │   ├── ErrorLayout.tsx     # Páginas de error (404, 500, genérico)
│   │   └── ProtectedRoute.tsx  # Guardas de ruta: ProtectedRoute, AdminRoute, PublicOnlyRoute
│   │
│   ├── dialogs/                # Modales de operaciones principales
│   │   ├── CreateDocumentDialog.tsx  # Crear y editar documentos
│   │   ├── UploadFileDialog.tsx      # Subir archivo (drag & drop, PDF/Word/Excel/PPT)
│   │   ├── ShareDocumentDialog.tsx   # Compartir con departamentos (+ selector de audiencia) o usuario individual (dos tabs)
│   │   ├── AddUserDialog.tsx         # Agregar usuario a departamento
│   │   └── CreateUserDialog.tsx      # Crear nuevo usuario institucional
│   │
│   └── sections/               # Componentes específicos por sección
│       ├── dashboard/
│       │   ├── StarCard.tsx          # Tarjeta de estadística del dashboard
│       │   ├── RecentDocumentRow.tsx # Fila de documento reciente
│       │   └── QuickUploadBanner.tsx # Banner de acceso rápido a subir
│       ├── departments/
│       │   ├── DepartmentCard.tsx    # Tarjeta de área (con acciones admin)
│       │   ├── DepartmentTree.tsx    # Vista árbol de Secretarías + sub-departamentos
│       │   ├── CreateDepartmentDialog.tsx
│       │   └── EditDepartmentDialog.tsx
│       ├── documents/
│       │   ├── DocumentTableRow.tsx  # Fila de tabla con acciones contextuales
│       │   └── DocumentsByDepartment.tsx  # Vista agrupada para roles de solo lectura
│       └── users/
│           └── UserTableRow.tsx      # Fila de tabla de usuarios
│
└── pages/
    ├── LoginPage.tsx           # Login con Google OAuth
    ├── DashboardPage.tsx       # Panel principal con estadísticas y recientes
    ├── DocumentsPage.tsx       # Lista de documentos con búsqueda y paginación
    ├── DocumentsDetailPage.tsx # Detalle: versiones, permisos y auditoría
    ├── DepartmentsPage.tsx     # Lista de departamentos (árbol o grid)
    ├── DepartmentDetailPage.tsx # Detalle: miembros y padrón de alumnos
    └── UsersPage.tsx           # Lista de usuarios (solo admin)
```

---

## Rutas

| Ruta                         | Guarda       | Página                 | Descripción                   |
| ---------------------------- | ------------ | ---------------------- | ----------------------------- |
| `/login`                     | Público      | `LoginPage`            | Inicio de sesión con Google   |
| `/dashboard`                 | Autenticado  | `DashboardPage`        | Panel principal               |
| `/documents`                 | Autenticado  | `DocumentsPage`        | Lista de documentos           |
| `/documents/:documentId`     | Autenticado  | `DocumentDetailPage`   | Detalle, versiones, permisos  |
| `/departments`               | Autenticado  | `DepartmentsPage`      | Lista de departamentos        |
| `/departments/:departmentId` | Autenticado  | `DepartmentDetailPage` | Detalle y miembros            |
| `/users`                     | Solo `admin` | `UsersPage`            | Lista de usuarios del sistema |
| `/`                          | —            | Redirect               | Redirige a `/dashboard`       |
| `*`                          | —            | `NotFoundPage`         | Página 404                    |

### Guardas de ruta

**`ProtectedRoute`** — verifica que haya sesión activa. Si no hay cookie válida, redirige a `/login`. Envuelve todas las rutas en `AppLayout`.

**`AdminRoute`** — verifica que el rol del usuario sea `admin`. Si no, redirige a `/dashboard`.

**`PublicOnlyRoute`** — redirige a `/dashboard` si el usuario ya está autenticado. Evita que un usuario logueado vuelva a `/login`.

---

## Design Tokens

Todos los valores de diseño están centralizados en `src/index.css` como variables CSS:

```css
:root {
  /* Colores de marca UPQROO */
  --color-brand-orange: #e8621a;
  --color-brand-orange-dark: #c44e0e;
  --color-brand-brown: #6b3d2e;
  --color-brand-brown-dark: #4a2820;

  /* Superficies */
  --color-surface: #fafaf8;
  --color-surface-secondary: #f2ede8;
  --color-surface-tertiary: #eae3db;
  --color-surface-border: #d9cfca;

  /* Texto */
  --color-text-primary: #1c1410;
  --color-text-secondary: #4a3e38;
  --color-text-muted: #8c7a72;

  /* Status */
  --color-status-success: #2e7d52;
  --color-status-warning: #c47b20;
  --color-status-error: #c0392b;
  --color-status-info: #2471a3;

  /* Layout */
  --sidebar-width: 260px;
  --sidebar-collapsed: 68px;
  --header-height: 60px;

  /* Tipografía */
  --font-display: "Playfair Display"; /* Títulos */
  --font-body: "DM Sans"; /* Texto general */
  --font-mono: "JetBrains Mono"; /* Código y hashes */
}
```

### Fuentes

Las fuentes se cargan desde Google Fonts en `index.css`. Para uso offline o en redes sin acceso externo, descárgalas y sírvelas localmente.

| Fuente           | Uso                               | Pesos              |
| ---------------- | --------------------------------- | ------------------ |
| Playfair Display | Títulos, encabezados, UI de marca | 600, 700           |
| DM Sans          | Texto, labels, botones            | 300, 400, 500, 600 |
| JetBrains Mono   | Hashes SHA-256, matrículas, slugs | 400, 500           |

---

## Componentes

### Componentes UI base

**`Button`** — variantes `primary`, `secondary`, `ghost`, `danger`, `outline`. Tamaños `sm`, `md`, `lg`. Prop `isLoading` muestra spinner integrado.

**`Input`**, **`Textarea`**, **`Select`** — con soporte para `label`, `error`, `hint` y `leftIcon`. Todos con `forwardRef`.

**`Badge`** — variantes `default`, `success`, `warning`, `error`, `info`, `orange`.

**`Dialog`** — wrapper de Radix Dialog. Tamaños `sm`, `md`, `lg`, `xl`. Siempre usar con `DialogFooter` para los botones de acción.

**`Toast`** — sistema de notificaciones global. Se llama así desde cualquier parte:

```typescript
import { toast } from "@/components/ui/Toast";
toast.success("Título", "Descripción opcional");
toast.error("Error", "Mensaje de error");
```

**`EmptyState`** — estado vacío con ícono, título, descripción y acción opcional.

**`Spinner`** — spinner de carga, tamaños `sm`, `md`, `lg`.

### AppLayout y PageHeader

`AppLayout` incluye el sidebar colapsable y el header con buscador global. El buscador en el header navega a `/documents?q=...` al presionar Enter.

`PageHeader` es el encabezado estándar de cada página:

```tsx
<PageHeader
  title="Documentos"
  description="25 documentos disponibles"
  action={<Button>Nuevo</Button>}
/>
```

---

## Estado Global

### `authStore` (Zustand + persistencia)

Almacena la sesión del usuario actual. Persiste en `localStorage` con la clave `upqroo-auth`.

```typescript
const { user, isAuthenticated, fetchMe, logout } = useAuthStore();
```

| Campo             | Tipo            | Descripción                         |
| ----------------- | --------------- | ----------------------------------- |
| `user`            | `User \| null`  | Usuario autenticado                 |
| `isAuthenticated` | `boolean`       | Si hay sesión activa                |
| `sessionVerified` | `boolean`       | Si ya se verificó con el servidor   |
| `isLoading`       | `boolean`       | Mientras se consulta `/users/me`    |
| `fetchMe()`       | `Promise<void>` | Verifica la sesión al cargar la app |
| `logout()`        | `Promise<void>` | Cierra sesión y limpia el estado    |

### `documentsStore` (Zustand)

Gestiona la lista paginada de documentos.

```typescript
const {
  documents,
  total,
  page,
  totalPages,
  isLoading,
  fetchDocuments,
  refresh,
} = useDocumentsStore();
```

`refresh()` vuelve a cargar la página actual. Útil después de crear, editar o eliminar un documento.

---

## Capa de API

Todas las llamadas al backend pasan por `src/services/api.ts`. Usa `fetch` nativo con `credentials: "include"` para enviar la cookie de sesión.

```typescript
import {
  documentsApi,
  departmentsApi,
  usersApi,
  authApi,
  studentsApi,
} from "@/services/api";

// Ejemplos
await documentsApi.list(page);
await documentsApi.create({ title, departmentId });
await documentsApi.upload(documentId, file);
await documentsApi.share({ documentId, departmentId, permission });
await studentsApi.uploadCsv(file, departmentId);
await studentsApi.getEnrollments(departmentId);
```

Si el servidor responde con un status no-OK, la función lanza un `Error` con el mensaje del backend. Los componentes muestran este mensaje en los toasts de error.

La URL base se toma de `VITE_API_URL`. En desarrollo apunta al backend local; en producción apunta a `/api` (que Apache hace proxy al Node.js).

---

## Tipos

Todos los tipos del dominio están en `src/types/index.ts`:

| Tipo                     | Descripción                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `UserRole`               | `"admin" \| "secretary" \| "director" \| "assistant" \| "professor" \| "student"`       |
| `TargetAudience`         | `"all" \| "professors" \| "students"` — controla quién del departamento ve el documento |
| `User`                   | Usuario con `id`, `email`, `name`, `role`, `avatarUrl`, `departmentId?`                 |
| `Department`             | Con `id`, `name`, `slug`, `parentId`                                                    |
| `Document`               | Con `id`, `title`, `departmentId`, `currentVersion`, `mimeType`, `deletedAt`            |
| `DocumentVersion`        | Con `version`, `filePath`, `fileSize`, `fileHash`, `mimeType`                           |
| `DocumentPermission`     | Con `permission`, `userId?`, `departmentId?`, `targetAudience`                          |
| `AuditLog`               | Con `action`, `userId`, `metadata`, `createdAt`                                         |
| `PermissionType`         | `"view" \| "download" \| "upload_version" \| "edit" \| "share"`                         |
| `AuditAction`            | `"document_created" \| "document_uploaded" \| "document_updated" \| "document_deleted"` |
| `Enrollment`             | Con `matricula`, `uploadedBy`, `updatedAt`                                              |
| `EnrollmentImportResult` | Con `inserted`, `skipped`, `invalid[]`, `departmentId`                                  |
| `PaginatedResponse<T>`   | Con `data`, `total`, `page`, `limit`, `totalPages`                                      |

---

## Variables de Entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

| Variable                | Descripción               | Desarrollo              | Producción        |
| ----------------------- | ------------------------- | ----------------------- | ----------------- |
| `VITE_API_URL`          | URL base del backend      | `http://localhost:3000` | `/api`            |
| `VITE_GOOGLE_CLIENT_ID` | Client ID de Google OAuth | El mismo en ambos       | El mismo en ambos |

> `VITE_API_URL=/api` en producción funciona porque Apache hace proxy de `/api/` al backend Node.js en el mismo servidor.

---

## Scripts Disponibles

```bash
# Desarrollo con hot reload
pnpm dev

# Build de producción (TypeScript + Vite)
pnpm build

# Vista previa del build de producción
pnpm preview
```

El build genera la carpeta `dist/` con los archivos estáticos listos para servir con Apache.

---

## Notas de Producción

**Copiar el build a Apache.** Después de cada `pnpm build`, copia el contenido de `dist/` al directorio que Apache sirve:

```bash
pnpm build
cp -r dist/* /var/intranet-upqroo/frontend/dist/
```

**`FallbackResource /index.html` en Apache es obligatorio.** Sin esto, las rutas de React Router (como `/documents/42`) devuelven 404 porque Apache busca el archivo físico en disco y no lo encuentra.

**Google OAuth requiere orígenes autorizados.** En Google Cloud Console, agrega el dominio de producción (`http://intranet.upqroo.edu.mx`) a los **Orígenes de JavaScript autorizados** y las **URIs de redireccionamiento autorizadas** de la credencial OAuth.

**Sin responsividad.** El `body` tiene `min-width: 1280px`. En pantallas más pequeñas aparece scroll horizontal. Esta es una decisión de diseño deliberada: el sistema está pensado para uso en computadoras de escritorio del personal universitario.

**Tipografía desde Google Fonts.** El servidor universitario necesita acceso a internet para cargar las fuentes. Si la red interna no tiene acceso externo, descarga las fuentes y sírvelas localmente modificando el `@import` en `index.css`.
