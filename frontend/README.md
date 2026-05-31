# Mini Plataforma Fintech — Frontend

SPA en React + TypeScript con arquitectura Clean (Ports & Adapters), dark mode mobile-first y conexión al backend vía TanStack Query.

## Stack

- **React 19 + TypeScript** — Vite como bundler (sin Next.js)
- **react-router-dom v7** — ruteo del lado del cliente
- **@tanstack/react-query v5** — data fetching, cache e invalidación
- **CSS Modules + CSS Variables** — estilos sin frameworks UI externos
- **lucide-react** — íconos
- **Vitest + Testing Library** — tests unitarios y de componentes

## Requisitos Previos

- Node.js 20 LTS o superior
- Backend corriendo en `http://localhost:3000` (ver `backend/README.md`)

---

## Setup

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Si el backend corre en un puerto o host distinto, editar `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

---

## Variables de Entorno

| Variable | Descripción | Default |
|---|---|---|
| `VITE_API_BASE_URL` | URL base del backend | `http://localhost:3000` |

---

## Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Type-check + build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm test` | Ejecuta la suite de tests con Vitest |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:cov` | Tests con reporte de cobertura |

---

## Pantallas

| Ruta | Descripción |
|---|---|
| `/dashboard` | KPIs generales: usuarios, saldos, volumen, transacciones del día |
| `/usuarios` | Listado de usuarios con búsqueda; paginación en desktop, scroll infinito en móvil |
| `/usuarios/:id` | Detalle de usuario: saldo actual, historial de movimientos |
| `/transacciones` | Listado con filtros (estado, rango de fechas, montos, usuario); paginación en desktop, scroll infinito en móvil |
| `/transacciones/:id` | Detalle de transacción con timeline de estados |
| `/pendientes` | Transacciones pendientes con acciones de aprobar y rechazar |

Los modales de **Crear transacción**, **Confirmar aprobación** y **Rechazar con motivo** se abren sobre cualquier pantalla sin cambiar de ruta.

---

## Arquitectura

```
src/
├── domain/           # Tipos e interfaces puras (sin dependencias)
│   ├── user/
│   ├── transaction/
│   └── dashboard/
├── application/      # Casos de uso + puertos (interfaces de gateway)
│   ├── ports/        # UserGateway, TransactionGateway, DashboardGateway
│   ├── user/
│   ├── transaction/
│   ├── dashboard/
│   └── hooks/        # useDebounce, usePageSize
├── infrastructure/   # Adaptadores concretos
│   ├── http/         # HttpClient, gateways HTTP
│   ├── react-query/  # query-client, query-keys, hooks por caso de uso
│   ├── auth/         # Gestión del x-user-id en sessionStorage
│   └── composition-root.ts
├── ui/               # Capa de presentación
│   ├── components/   # Button, Input, Badge, KpiCard, Modal, Tabs, Timeline, InfiniteList, ...
│   ├── modals/       # Crear / Aprobar / Rechazar transacción
│   ├── toast/        # ToastProvider + useToast()
│   ├── screens/      # Una carpeta por pantalla
│   ├── layout/       # AppLayout (Header + Outlet + BottomNav)
│   └── router.tsx
├── styles/           # tokens.css, reset.css, globals.css
├── utils/            # cx(), formatCurrency(), formatDate()
├── App.tsx
└── main.tsx
```

**Reglas de dependencia:**

- `domain/` no depende de nadie.
- `application/` solo depende de `domain/`.
- `infrastructure/` implementa los puertos definidos en `application/`.
- `ui/` consume únicamente hooks de `infrastructure/react-query/hooks/` y tipos de `domain/`. Ningún componente instancia gateways ni invoca `fetch` directamente.

---

## Diseño

- Dark mode con paleta Belo: verde neón `#00FFB2`, fondo `#0A0A0A`, surface `#121212`.
- Mobile-first: breakpoints en `768px` (tablet) y `1024px` (desktop).
- Bottom nav en móvil; navegación horizontal en desktop.
- Tipografía Inter + JetBrains Mono para IDs y montos.
