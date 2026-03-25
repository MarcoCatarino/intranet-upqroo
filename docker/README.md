# Docker — IDMS UPQROO

Infraestructura de base de datos y caché del sistema. Contiene **MySQL 8** y **Redis 7** como servicios Dockerizados. El backend y el worker de Node.js corren **fuera de Docker**, gestionados por PM2.

---

## Tabla de Contenidos

- [Docker — IDMS UPQROO](#docker--idms-upqroo)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Servicios](#servicios)
  - [Estructura](#estructura)
  - [Variables de Entorno](#variables-de-entorno)
  - [Comandos](#comandos)
  - [Schema de Base de Datos](#schema-de-base-de-datos)
    - [Tablas creadas](#tablas-creadas)
    - [Índices de rendimiento destacados](#índices-de-rendimiento-destacados)
    - [Recrear el schema manualmente](#recrear-el-schema-manualmente)
  - [Configuración MySQL](#configuración-mysql)
  - [Configuración de Apache](#configuración-de-apache)
    - [Módulos requeridos](#módulos-requeridos)
    - [VirtualHost](#virtualhost)
    - [Activar el sitio](#activar-el-sitio)
    - [Verificar que el proxy funciona](#verificar-que-el-proxy-funciona)
  - [Notas de Producción](#notas-de-producción)

---

## Servicios

| Servicio | Imagen           | Puerto por defecto | Uso                     |
| -------- | ---------------- | ------------------ | ----------------------- |
| `mysql`  | `mysql:8.0`      | `3306`             | Base de datos principal |
| `redis`  | `redis:7-alpine` | `6379`             | Broker de colas BullMQ  |

Ambos servicios tienen `restart: always` y healthchecks configurados. Los datos persisten en volúmenes Docker nombrados (`mysql_data`, `redis_data`), por lo que sobreviven reinicios y actualizaciones de imagen.

---

## Estructura

```
docker/
├── docker-compose.yml
├── .env.example
├── .gitignore
└── mysql/
    ├── init/
    │   └── schema.sql      # Schema inicial — se ejecuta solo en el primer arranque
    └── my.cnf              # Configuración de rendimiento de MySQL
```

---

## Variables de Entorno

Copia `.env.example` a `.env` y completa los valores antes de arrancar:

```bash
cp .env.example .env
```

| Variable              | Descripción                             | Ejemplo           |
| --------------------- | --------------------------------------- | ----------------- |
| `MYSQL_ROOT_PASSWORD` | Contraseña del usuario `root` de MySQL  | `r00t_s3cur3`     |
| `MYSQL_DATABASE`      | Nombre de la base de datos a crear      | `intranet-upqroo` |
| `MYSQL_USER`          | Usuario de la aplicación                | `appuser`         |
| `MYSQL_PASSWORD`      | Contraseña del usuario de la aplicación | `app_s3cur3`      |
| `MYSQL_PORT`          | Puerto expuesto en el host              | `3306`            |
| `REDIS_PORT`          | Puerto de Redis expuesto en el host     | `6379`            |

> ⚠️ Si el servidor universitario ya tiene MySQL corriendo en el puerto `3306`, cambia `MYSQL_PORT` a otro puerto (ej. `3307`) y actualiza `DB_PORT` en el `.env` del backend.

---

## Comandos

```bash
# Levantar servicios en segundo plano
docker compose up -d

# Ver estado de los servicios
docker compose ps

# Ver logs
docker compose logs -f mysql
docker compose logs -f redis

# Detener servicios (conserva datos)
docker compose stop

# Eliminar servicios y volúmenes (borra todos los datos)
docker compose down -v

# Entrar al shell de MySQL
docker exec -it intranet-upqroo_mysql mysql -u appuser -p intranet-upqroo

# Verificar que Redis responde
docker exec -it intranet-upqroo_redis redis-cli ping
```

---

## Schema de Base de Datos

El archivo `mysql/init/schema.sql` se ejecuta **automáticamente** la primera vez que se crea el contenedor. Si el volumen `mysql_data` ya existe, este script **no se vuelve a ejecutar**.

### Tablas creadas

| Tabla                          | Descripción                                                                                                                                                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`                        | Usuarios persistentes (admin, secretary, director, assistant). Los roles `professor` y `student` son efímeros y no se guardan aquí.                                                                                           |
| `departments`                  | Secretarías y departamentos con jerarquía `parent_id` y soft delete                                                                                                                                                           |
| `department_users`             | Relación usuario-departamento con rol                                                                                                                                                                                         |
| `professor_upload_permissions` | Habilita a un profesor a subir archivos en un departamento específico                                                                                                                                                         |
| `director_share_permissions`   | Habilita a un director a compartir documentos de su departamento                                                                                                                                                              |
| `documents`                    | Documentos con soft delete (`deleted_at`)                                                                                                                                                                                     |
| `document_versions`            | Versiones de archivos con ruta, tamaño, MIME type y hash SHA-256                                                                                                                                                              |
| `document_permissions`         | Permisos granulares (`view`, `download`, `upload_version`, `edit`, `share`) por usuario o departamento. Columna `target_audience ENUM('all','professors','students')` controla qué miembros del departamento ven el documento |
| `document_audit_logs`          | Registro de acciones: creación, subida, edición y eliminación de documentos                                                                                                                                                   |
| `student_enrollments`          | Padrón de alumnos por carrera (matrícula + departamento)                                                                                                                                                                      |

### Índices de rendimiento destacados

```sql
-- Búsqueda full-text en documentos
FULLTEXT INDEX idx_documents_search (title, description)

-- Lookup rápido de permisos
CREATE INDEX idx_permissions_lookup ON document_permissions (document_id, user_id, department_id);

-- Documentos activos por departamento
CREATE INDEX idx_documents_active_department ON documents (department_id, deleted_at);
```

### Recrear el schema manualmente

Si necesitas reinicializar la base de datos:

```bash
# Eliminar volumen y volver a crear (borra todos los datos)
docker compose down -v
docker compose up -d

# O aplicar el schema manualmente sobre una DB existente
docker exec -i intranet-upqroo_mysql mysql -u root -p intranet-upqroo < mysql/init/schema.sql
```

---

## Configuración MySQL

El archivo `mysql/my.cnf` se monta en el contenedor como configuración adicional:

```ini
[mysqld]
max_connections      = 500
innodb_buffer_pool_size     = 512M
innodb_buffer_pool_instances = 4
wait_timeout         = 300
interactive_timeout  = 300
innodb_read_io_threads  = 4
innodb_write_io_threads  = 4
character-set-server = utf8mb4
collation-server     = utf8mb4_unicode_ci
sql_mode             = STRICT_TRANS_TABLES
```

**Notas sobre los valores:**

`max_connections = 500` — El pool del backend usa hasta 100 conexiones. El margen restante permite conexiones directas para administración, múltiples instancias del servidor en cluster y el worker.

`innodb_buffer_pool_size = 512MB` — Caché principal de InnoDB. Reducir si el servidor tiene menos de 4 GB de RAM disponible para MySQL. El valor ideal es el 50-70% de la RAM dedicada a MySQL.

`wait_timeout = 300` — Coincide con el `connectTimeout` del pool del backend para evitar errores de conexión cerrada.

---

## Configuración de Apache

El backend y el frontend **no corren en Docker**. Apache sirve el build estático de React y hace proxy al servidor Node.js.

### Módulos requeridos

```bash
a2enmod proxy
a2enmod proxy_http
a2enmod rewrite
a2enmod headers
systemctl restart apache2
```

### VirtualHost

Crea el archivo `/etc/apache2/sites-available/intranet-upqroo.conf`:

```apache
<VirtualHost *:80>
    ServerName intranet.upqroo.edu.mx

    # ── Frontend — build estático de Vite ───────────────────────────────────
    DocumentRoot /var/intranet-upqroo/frontend/dist

    <Directory /var/intranet-upqroo/frontend/dist>
        Options -Indexes
        AllowOverride All
        Require all granted
        # Necesario para React Router (SPA): cualquier ruta que no sea un
        # archivo existente se redirige al index.html
        FallbackResource /index.html
    </Directory>

    # ── Backend — proxy al servidor Node.js ─────────────────────────────────
    ProxyPreserveHost On
    ProxyPass        /api/ http://127.0.0.1:3000/
    ProxyPassReverse /api/ http://127.0.0.1:3000/

    RequestHeader set X-Forwarded-Proto "http"

    ErrorLog  ${APACHE_LOG_DIR}/intranet-upqroo-error.log
    CustomLog ${APACHE_LOG_DIR}/intranet-upqroo-access.log combined
</VirtualHost>
```

> Si el backend corre en un puerto distinto al `3000`, actualiza las líneas `ProxyPass` y `ProxyPassReverse` con el puerto correcto.

### Activar el sitio

```bash
a2ensite intranet-upqroo.conf
systemctl reload apache2
```

### Verificar que el proxy funciona

```bash
# El backend debe responder a través de Apache
curl http://intranet.upqroo.edu.mx/api/health

# El frontend debe servir el index.html
curl -I http://intranet.upqroo.edu.mx/
```

---

## Notas de Producción

**El schema solo se ejecuta una vez.** Si necesitas agregar una tabla o índice después del despliegue inicial, aplícalo manualmente con `docker exec` o con un cliente MySQL. No basta con modificar `schema.sql` y reiniciar el contenedor si el volumen ya existe.

**No expongas los puertos de Docker al exterior.** Los puertos `3306` y `6379` mapean al `127.0.0.1` del servidor. El backend los accede por `localhost`. Nunca deben estar accesibles desde internet.

**Backup de datos.** Los datos de MySQL están en el volumen `mysql_data`. Para hacer backup:

```bash
docker exec intranet-upqroo_mysql mysqldump -u root -p intranet-upqroo > backup_$(date +%Y%m%d).sql
```

**Redis no persiste jobs por defecto.** Los jobs en cola de BullMQ viven en Redis. Si Redis se reinicia antes de que el worker procese un job, el job puede perderse. Para mayor seguridad en producción, considera agregar `--appendonly yes` al servicio de Redis en el `docker-compose.yml`.
