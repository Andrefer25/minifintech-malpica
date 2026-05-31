# Mini Plataforma Fintech — Backend

API REST con arquitectura hexagonal implementada en Fastify, TypeORM y PostgreSQL.

## Stack

- **Node.js 20 LTS** + **TypeScript**
- **Fastify v5** — framework HTTP
- **TypeORM v1** — ORM con migraciones versionadas
- **PostgreSQL 15** — base de datos
- **Awilix** — contenedor de inyección de dependencias
- **Jest + ts-jest** — tests unitarios

## Requisitos Previos

### Sin Docker
- Node.js 20 LTS o superior
- PostgreSQL 14 o superior corriendo localmente

### Con Docker
- Docker y Docker Compose

---

## Opción A: Levantar sin Docker (desarrollo local)

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con las credenciales de la instancia de PostgreSQL local:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=beloChallenge
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

### 3. Crear la base de datos

```bash
createdb beloChallenge
```

O desde psql:

```sql
CREATE DATABASE "beloChallenge";
```

### 4. Compilar y ejecutar las migraciones

Las migraciones requieren los archivos compilados en `dist/`:

```bash
npm run build
npm run migration:run
```

### 5. Iniciar el servidor en modo desarrollo

```bash
npm run dev
```

El servidor queda disponible en `http://localhost:3000`.  
La documentación Swagger está en `http://localhost:3000/docs`.

---

## Opción B: Levantar con Docker Compose (recomendado)

Un único comando levanta PostgreSQL y el backend, ejecuta las migraciones automáticamente y expone la API en el puerto 3000.

### 1. Configurar variables de entorno

```bash
cp .env.example .env
```

Los valores por defecto de `.env.example` funcionan sin modificaciones para este modo.

### 2. Levantar los servicios

```bash
docker compose up --build
```

Esto realiza automáticamente:
- Levanta PostgreSQL 15 con healthcheck
- Construye la imagen del backend (multi-stage build)
- Espera a que Postgres esté listo
- Ejecuta `npm run migration:run`
- Inicia el servidor en el puerto 3000

### 3. Verificar que todo esté funcionando

```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"..."}
```

### Comandos útiles

```bash
# Ver logs en tiempo real
docker compose logs -f

# Detener y eliminar contenedores
docker compose down

# Detener y eliminar contenedores + volumen de datos
docker compose down -v
```

---

## Variables de Entorno

| Variable | Descripción | Default |
|---|---|---|
| `DB_HOST` | Host de PostgreSQL | `postgres` (Docker) / `localhost` (local) |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `postgres` |
| `DB_NAME` | Nombre de la base de datos | `beloChallenge` |
| `PORT` | Puerto en el que escucha el servidor | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `CORS_ORIGIN` | Origen(es) permitidos por CORS (`*` para todos) | `*` |

---

## Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor en modo desarrollo con hot-reload (ts-node + nodemon) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Inicia el servidor desde `dist/` (requiere build previo) |
| `npm test` | Ejecuta la suite de tests con Jest |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Tests con reporte de cobertura |
| `npm run migration:run` | Ejecuta migraciones pendientes |
| `npm run migration:revert` | Revierte la última migración |
| `npm run migration:generate` | Genera una nueva migración a partir de cambios en entidades |

---

## Endpoints Principales

Todos los endpoints requieren el header `x-user-id` con un UUID válido (autenticación simulada).

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/users` | Listar usuarios (con paginación) |
| `GET` | `/users/:id` | Obtener usuario por ID |
| `GET` | `/users/:id/balance-history` | Historial de saldos del usuario |
| `GET` | `/transactions` | Listar transacciones (filtros + paginación) |
| `GET` | `/transactions/:id` | Obtener transacción por ID |
| `GET` | `/transactions/:id/status-history` | Historial de estados de una transacción |
| `POST` | `/transactions` | Crear nueva transacción |
| `PATCH` | `/transactions/:id/approve` | Aprobar transacción pendiente |
| `PATCH` | `/transactions/:id/reject` | Rechazar transacción pendiente |
| `GET` | `/dashboard` | KPIs agregados |

La documentación completa con schemas de request/response está disponible en `/docs` (Swagger UI).

---

## Arquitectura

```
src/
├── domain/           # Lógica de negocio pura, sin dependencias externas
│   ├── user/
│   ├── transaction/
│   └── shared/       # DomainError, UnitOfWork
├── application/      # Casos de uso (orquestan dominio e infraestructura)
│   ├── create-transaction/
│   ├── approve-transaction/
│   ├── reject-transaction/
│   ├── get-transactions/
│   └── ...
└── infrastructure/   # Adaptadores concretos
    ├── http/         # Rutas Fastify, DTOs, middleware de autenticación
    ├── persistence/  # Entidades TypeORM, repositorios, migraciones, Unit of Work
    └── di/           # Contenedor Awilix
```

## Licencia

ISC
