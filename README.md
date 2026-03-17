# UPQROO Intranet — Frontend

Interfaz web del sistema de gestión de documentos institucionales de la Universidad Politécnica de Quintana Roo.

---

## Stack

- **Vite + React 18 + TypeScript**
- **TailwindCSS** — estilos con variables CSS centralizadas
- **Zustand** — estado global (auth + documentos)
- **React Router v6** — rutas protegidas
- **Radix UI** — componentes accesibles (Dialog, Dropdown, Toast)
- **Lucide React** — íconos

---

## Configuración inicial

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tu Google Client ID

# 3. Iniciar servidor de desarrollo
pnpm dev
```

El dev server corre en `http://localhost:5173` y hace proxy al backend en `http://localhost:3000`.

---

## Variables de entorno

| Variable                | Descripción                       |
| ----------------------- | --------------------------------- |
| `VITE_API_URL`          | URL del backend (default: `/api`) |
| `VITE_GOOGLE_CLIENT_ID` | Client ID de Google OAuth         |

---

## Estructura del proyecto

```
src/
├── index.css               ← Design tokens (colores, tipografía, espaciado, etc.)
│
├── types/
│   └── index.ts            ← Interfaces TypeScript del dominio
│
├── services/
│   └── api.ts              ← Capa de acceso al backend (fetch centralizado)
│
├── store/
│   ├── authStore.ts        ← Estado de autenticación (Zustand + persistencia)
│   └── documentsStore.ts   ← Estado de documentos (Zustand)
│
├── lib/
│   └── utils.ts            ← cn(), formatDate(), labels de permisos, etc.
│
├── components/
│   ├── ui/                 ← Componentes base reutilizables
│   │   ├── Button.tsx
│   │   ├── Input.tsx       ← Input, Textarea, Select
│   │   ├── Badge.tsx       ← Badge, Spinner, EmptyState, Divider
│   │   ├── Dialog.tsx      ← Wrapper de Radix Dialog
│   │   └── Toast.tsx       ← Sistema de notificaciones
│   │
│   ├── layout/             ← Estructuras de página
│   │   ├── AppLayout.tsx   ← Sidebar + Header + área de contenido
│   │   ├── ErrorLayout.tsx ← Páginas 404 / 500
│   │   └── ProtectedRoute.tsx ← Guardas de ruta (auth, admin, public-only)
│   │
│   └── dialogs/            ← Modales de operaciones
│       ├── CreateDocumentDialog.tsx  ← Crear y editar documento
│       ├── UploadFileDialog.tsx      ← Subir PDF (drag & drop)
│       └── ShareDocumentDialog.tsx  ← Compartir con usuario o departamento
│
└── pages/
    ├── LoginPage.tsx
    ├── DashboardPage.tsx
    ├── DocumentsPage.tsx
    ├── DocumentDetailPage.tsx
    ├── DepartmentsPage.tsx
    ├── DepartmentDetailPage.tsx
    └── UsersPage.tsx
```

---

## Design tokens

Todos los valores de diseño están centralizados en `src/index.css`:

```css
:root {
  --color-brand-orange: #e8621a; /* Naranja UPQROO */
  --color-brand-brown: #6b3d2e; /* Café UPQROO */
  --sidebar-width: 260px;
  --header-height: 60px;
  /* ... */
}
```

Para cambiar la apariencia de toda la app, solo edita ese archivo.

---

## Rutas

| Ruta               | Acceso      | Descripción                   |
| ------------------ | ----------- | ----------------------------- |
| `/login`           | Público     | Inicio de sesión con Google   |
| `/dashboard`       | Autenticado | Panel principal               |
| `/documents`       | Autenticado | Lista de documentos           |
| `/documents/:id`   | Autenticado | Detalle, versiones, permisos  |
| `/departments`     | Autenticado | Lista de departamentos        |
| `/departments/:id` | Autenticado | Detalle y miembros            |
| `/users`           | Solo admin  | Lista de usuarios del sistema |

---

## Notas de diseño

- **Solo PC** — `min-width: 1280px` en el body, sin breakpoints responsivos
- **Tipografía**: Playfair Display (títulos) + DM Sans (texto general)
- **Paleta**: naranja UPQROO `#E8621A` + café `#6B3D2E` sobre fondo cálido `#FAFAF8`
- **Dialogs**: todas las operaciones de creación/edición se hacen en modales sobre la página actual
