# Mini Plataforma Fintech — Belo Challenge

Plataforma fintech desarrollada por **André Malpica** para el challenge de Belo.

Incluye una API REST con arquitectura hexagonal (Fastify + TypeORM + PostgreSQL) y una SPA React con arquitectura Clean (Ports & Adapters).

Para las decisiones técnicas ver [`DECISIONES-TECNICAS.md`](./DECISIONES-TECNICAS.md).  
Para documentación detallada de cada módulo ver [`backend/README.md`](./backend/README.md) y [`frontend/README.md`](./frontend/README.md).

---

## Requisitos previos

- **Docker** y **Docker Compose**
- **Node.js 20 LTS** o superior
- **Git Bash** o **MSYS2** para usar el `Makefile`, o **PowerShell** para usar `make.ps1`

> **PowerShell — primera vez:** ejecutar una sola vez para permitir scripts locales:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
> ```

---

## Levantar el proyecto

### Paso 1 — Clonar el repositorio

```bash
git clone <url-del-repo>
cd minifintech-malpica
```

### Paso 2 — Setup inicial

Un único comando configura todo el entorno: variables de entorno, dependencias, build del frontend e imágenes Docker.

```bash
# Git Bash
make

# PowerShell
.\make.ps1
```

El comando ejecuta de forma automática y secuencial:

1. Copia `backend/.env.example → backend/.env` si no existe
2. Copia `frontend/.env.example → frontend/.env` si no existe
3. Instala las dependencias del frontend (`npm install`)
4. Genera el build de producción del frontend (`npm run build`)
5. Construye las imágenes Docker y crea los contenedores sin iniciarlos (`docker compose up --build --no-start`)

### Paso 3 — Iniciar el backend

```bash
# Git Bash
make back-up

# PowerShell
.\make.ps1 back-up
```

Docker Compose levanta PostgreSQL, ejecuta las migraciones pendientes e inicia el servidor de la API.

| Servicio | URL |
|---|---|
| API REST | `http://localhost:3000` |
| Swagger UI | `http://localhost:3000/docs` |
| Health check | `http://localhost:3000/health` |

### Paso 4 — Iniciar el frontend

En una terminal separada, elegir una de las dos opciones:

**Opción A — Producción (`front-preview`)**

Sirve el build generado en el paso 2. Recomendado para evaluar la aplicación tal como se desplegaría.

```bash
# Git Bash
make front-preview

# PowerShell
.\make.ps1 front-preview
```

| Servicio | URL |
|---|---|
| Aplicación web | `http://localhost:4173` |

**Opción B — Desarrollo (`front-dev`)**

Inicia el servidor de desarrollo de Vite con Hot Module Replacement (HMR). Los cambios en el código se reflejan en el navegador de forma instantánea sin necesidad de rebuild. Requiere tener el backend corriendo.

```bash
# Git Bash
make front-dev

# PowerShell
.\make.ps1 front-dev
```

| Servicio | URL |
|---|---|
| Aplicación web | `http://localhost:5173` |

---

## Otros comandos útiles

### Ver logs del backend en tiempo real

```bash
# Git Bash
make back-logs

# PowerShell
.\make.ps1 back-logs
```

### Detener los servicios

```bash
# Git Bash
make stop

# PowerShell
.\make.ps1 stop
```

### Reiniciar la base de datos

Elimina el volumen de datos de PostgreSQL y reinicia los servicios. Docker Compose re-ejecuta todas las migraciones automáticamente, dejando la base de datos en su estado inicial.

Útil cuando se quiere partir de un esquema limpio sin cambiar la configuración del proyecto.

```bash
# Git Bash
make back-reset-db

# PowerShell
.\make.ps1 back-reset-db
```

> **Atención:** esta operación elimina todos los datos almacenados en PostgreSQL de forma irreversible.

### Limpiar el entorno por completo

Elimina los contenedores, el volumen de datos de PostgreSQL y los `node_modules` de ambos proyectos.

```bash
# Git Bash
make clean

# PowerShell
.\make.ps1 clean
```

---

## Referencia de comandos

### Alto nivel

| Makefile | PowerShell | Descripción |
|---|---|---|
| `make` | `.\make.ps1` | Setup completo: `.env`, dependencias, build del frontend e imágenes Docker |
| `make setup` | `.\make.ps1 setup` | Solo copia los `.env` e instala dependencias del frontend, sin build ni inicio |
| `make install` | `.\make.ps1 install` | Instala dependencias del frontend |
| `make stop` | `.\make.ps1 stop` | Detiene y elimina los contenedores |
| `make clean` | `.\make.ps1 clean` | Elimina contenedores, volumen de datos y `node_modules` |

### Backend — Docker

| Makefile | PowerShell | Descripción |
|---|---|---|
| `make back-up` | `.\make.ps1 back-up` | Inicia PostgreSQL y el backend con Docker Compose |
| `make back-down` | `.\make.ps1 back-down` | Detiene y elimina los contenedores |
| `make back-down-v` | `.\make.ps1 back-down-v` | Detiene los contenedores y elimina el volumen de datos |
| `make back-logs` | `.\make.ps1 back-logs` | Muestra los logs en tiempo real |
| `make back-env` | `.\make.ps1 back-env` | Copia `backend/.env.example → .env` |
| `make back-reset-db` | `.\make.ps1 back-reset-db` | Elimina el volumen de datos y reinicia; re-ejecuta las migraciones desde cero |

### Frontend

| Makefile | PowerShell | Descripción |
|---|---|---|
| `make front-install` | `.\make.ps1 front-install` | Instala dependencias |
| `make front-env` | `.\make.ps1 front-env` | Copia `frontend/.env.example → .env` |
| `make front-build` | `.\make.ps1 front-build` | Genera el build de producción en `frontend/dist/` |
| `make front-preview` | `.\make.ps1 front-preview` | Sirve el build de producción en `http://localhost:4173` |
| `make front-dev` | `.\make.ps1 front-dev` | Servidor de desarrollo con HMR en `http://localhost:5173` |
| `make front-test` | `.\make.ps1 front-test` | Ejecuta la suite de tests con Vitest |
| `make front-coverage` | `.\make.ps1 front-coverage` | Genera el reporte de cobertura |

### Ayuda

```bash
make help        # Git Bash
.\make.ps1 help  # PowerShell
```
