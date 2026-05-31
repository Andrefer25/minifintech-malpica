# Decisiones Técnicas

Este documento explica las principales decisiones de diseño y arquitectura que tomé durante el desarrollo de la plataforma, tanto en el backend como en el frontend. La intención es que cualquier persona que lea el código pueda entender no solo el _qué_, sino el _por qué_.

---

## Backend

### Framework: Fastify

Elegí Fastify en lugar de Express porque ofrece un rendimiento notablemente superior gracias a su pipeline de parseo de JSON y su sistema de serialización de respuestas basado en esquemas JSON Schema. Además, su sistema de plugins con hooks bien definidos (`preHandler`, `onError`) facilita separar responsabilidades sin acoplamiento implícito. NestJS era otra opción válida, pero considero que introduce demasiada abstracción con decoradores para un proyecto de este alcance; prefiero que la estructura sea explícita y rastreable sin necesidad de magia de framework.

### ORM: TypeORM

Opté por TypeORM porque integra de forma natural con TypeScript (entidades tipadas, repositorios genéricos) y ofrece un sistema de migraciones versionadas que es fundamental para proyectos financieros donde los cambios de esquema deben ser auditables y reproducibles. El `QueryBuilder` resultó especialmente útil para los filtros dinámicos del listado de transacciones, donde la cantidad de criterios opcionales hace difícil construir queries de forma legible con SQL crudo.

### Arquitectura Hexagonal (Ports & Adapters)

La decisión de arquitectura hexagonal fue deliberada: quería que el dominio y los casos de uso fueran completamente independientes del framework HTTP y de la base de datos. Esto significa que si mañana necesito reemplazar Fastify por otro framework, o PostgreSQL por otra base de datos, los casos de uso no cambian. Las interfaces de repositorio (`UserRepository`, `TransactionRepository`) viven en el dominio y son implementadas por adaptadores de infraestructura; ningún caso de uso importa TypeORM ni Fastify.

Esto también facilita enormemente el testing: puedo probar la lógica de negocio con mocks simples sin levantar una base de datos.

### Inyección de Dependencias: Awilix

Para cablear las dependencias utilicé Awilix, que permite un contenedor DI explícito sin depender de decoradores de TypeScript ni de `reflect-metadata` más allá de lo necesario. La resolución de dependencias es visible en un único archivo (`di/container.ts`), lo que hace que el grafo de dependencias sea fácil de leer y modificar. Comparado con soluciones como InversifyJS, Awilix es más directo y no requiere decorar cada clase.

### Concurrencia y Atomicidad: Unit of Work con SELECT FOR UPDATE

Este fue probablemente el punto más crítico del diseño. El principal riesgo en un sistema financiero es el _double-spend_: dos operaciones que leen el mismo saldo simultáneamente, ambas ven saldo suficiente, y ambas debitan, llevando el balance a negativo.

Para prevenirlo implementé un patrón `UnitOfWork` que envuelve cada operación en una transacción de base de datos. Cuando una transacción necesita debitar fondos (tanto en la creación automática como en la aprobación manual), primero adquiere un lock pesimista sobre la fila del usuario origen mediante `SELECT ... FOR UPDATE`. Este lock garantiza que ninguna otra transacción de base de datos pueda leer o modificar ese registro hasta que la operación actual termine. PostgreSQL gestiona esto a nivel de motor, por lo que la protección es robusta.

La lógica de lock vive en el método `lockUser()` del `TxContext`, que encapsula el `QueryBuilder` de TypeORM con `setLock('pessimistic_write')`. Los casos de uso no saben cómo funciona el lock internamente; simplemente llaman a `tx.lockUser(userId)` y reciben el usuario con la garantía de exclusividad.

### Regla de Negocio: Umbral de $50.000

Las transacciones menores o iguales a $50.000 se completan automáticamente al crearse: el sistema adquiere el lock, verifica el saldo, mueve los fondos y registra el historial, todo en una sola transacción atómica. Las transacciones superiores a $50.000 quedan en estado `PENDING` y requieren aprobación manual; en ese caso no se mueven fondos hasta que un operador las apruebe. Si al momento de aprobar el saldo es insuficiente, la transacción se rechaza automáticamente con el motivo "Saldo insuficiente" y se retorna un `409 Conflict`, diferenciando este caso del rechazo manual.

### Manejo de Errores

Definí una clase abstracta `DomainError` que extiende `Error` y declara un campo `httpStatus`. Cada error de dominio hereda de ella e indica el código HTTP apropiado. El handler centralizado de Fastify (`setErrorHandler`) detecta si el error es una instancia de `DomainError` y responde con el status y mensaje correspondientes. Los errores de validación de schema (generados por el propio Fastify) se capturan por separado y se devuelven como `400`. Cualquier otro error inesperado retorna `500` sin exponer detalles internos.

Esta decisión me permitió mantener las rutas completamente limpias de lógica de manejo de errores: simplemente ejecutan el caso de uso y el error se propaga.

### Historial de Estados y Saldos

Decidí registrar un historial inmutable de cada cambio de estado de transacción (`TransactionStatusHistory`) y de cada movimiento de saldo (`UserBalanceHistory`). Esta auditoría es esencial en sistemas financieros y no tiene costo significativo al ejecutarse dentro de la misma transacción de base de datos que el cambio principal. El historial de saldos guarda el balance antes y después de cada operación, lo que permite reconstruir el estado de una cuenta en cualquier punto del tiempo.

### Tests

Los tests unitarios cubren las entidades de dominio (`Transaction`, `User`) y los casos de uso con repositorios mockeados. Preferí tests de dominio puros porque son los más valiosos: verifican que las reglas de negocio (validaciones, transiciones de estado, invariantes) funcionen correctamente sin depender de infraestructura. Utilicé Jest con `ts-jest` para mantener la configuración simple.

---

## Frontend

### Framework: React + Vite

Elegí React con Vite (sin Next.js) porque la aplicación es puramente una SPA que consume una API REST; no hay necesidad de SSR ni generación estática. Vite ofrece un tiempo de arranque en desarrollo casi instantáneo gracias al ESM nativo en el browser, y el build de producción es eficiente con Rollup.

### Arquitectura Clean (Ports & Adapters)

Apliqué el mismo principio de separación que en el backend: las capas internas no saben nada de las externas.

- **`domain/`** contiene tipos puros (interfaces, enums) sin ninguna dependencia.
- **`application/`** define los puertos (interfaces de gateway) y los casos de uso. Un caso de uso como `CreateTransactionUseCase` recibe un `TransactionGateway` (interfaz) y no sabe si la implementación habla HTTP, WebSocket o es un mock.
- **`infrastructure/`** implementa los gateways como llamadas HTTP a través de un `HttpClient` centralizado, y provee los hooks de React Query.
- **`ui/`** únicamente consume hooks de React Query y tipos de dominio. Ningún componente instancia gateways ni hace `fetch` directamente.

Esta separación hace que agregar tests de integración o reemplazar la capa HTTP sea trivial.

### Data Fetching: TanStack Query

TanStack Query (React Query v5) resuelve varios problemas de forma elegante: cache automática con invalidación, estados de loading/error/success sin boilerplate, refetch automático, y soporte de primera clase para scroll infinito con `useInfiniteQuery`. La alternativa habría sido manejar el estado de los requests manualmente con `useEffect` + `useState`, lo cual es propenso a errores y requiere implementar el cache y la deduplicación desde cero.

Definí query keys tipadas en un único archivo (`query-keys.ts`) que actúan como el "mapa de cache" de la aplicación, facilitando la invalidación selectiva después de mutaciones.

### Paginación en Desktop e Infinite Scroll en Móvil

Para los listados de usuarios y transacciones implementé dos estrategias según el dispositivo. En desktop, la paginación clásica con números de página es más apropiada: el usuario puede saltar directamente a una página específica y la tabla tiene una altura predecible. En móvil, el scroll infinito es más natural para la navegación táctil.

La implementación del scroll infinito no requirió ninguna librería adicional: utilicé `useInfiniteQuery` de TanStack Query para la lógica de paginación y un `IntersectionObserver` nativo en el navegador para detectar cuando el sentinel (elemento al final de la lista) entra en el viewport y disparar la carga de la siguiente página.

### Autenticación Simulada con `x-user-id`

El mecanismo de autenticación simulada funciona de la siguiente manera: al iniciar la sesión, el frontend genera un UUID v4 con `crypto.randomUUID()` y lo persiste en `sessionStorage` con un TTL de una hora. En cada request HTTP, el `HttpClient` lee este UUID y lo envía en el header `x-user-id`. El backend valida que el header exista y que tenga formato UUID, y lo adjunta al contexto del request.

Decidí usar `sessionStorage` en lugar de `localStorage` para que la sesión expire al cerrar la pestaña, lo cual es un comportamiento más seguro para un contexto financiero simulado. El UUID es visible en la UI como "usuario logueado".

### Manejo de Estados de UI

Cada pantalla contempla explícitamente tres estados adicionales al estado "normal con datos": carga (`isLoading`), error (`isError`) y lista vacía (`isEmpty`). Los errores de mutaciones (crear, aprobar, rechazar transacciones) se comunican a través de un sistema de toasts global (`ToastProvider`) que no interfiere con el flujo principal de la pantalla. Esto evita el antipatrón de mostrar errores dentro de formularios que desaparecen al cerrar el modal.

---

## Criterios Transversales

### Separación de Responsabilidades

Tanto en backend como en frontend, la regla principal es que las capas internas no conocen a las externas. El dominio del backend no importa TypeORM. Los casos de uso del frontend no importan `fetch`. Esta restricción se mantiene de forma estructural gracias a la organización de carpetas y se verifica visualmente revisando los imports de cada archivo.

### Docker Compose

El `docker-compose.yml` levanta PostgreSQL y el backend con un único comando. El servicio de backend espera a que Postgres esté saludable (mediante `healthcheck` y `depends_on: condition: service_healthy`) antes de arrancar, y ejecuta las migraciones automáticamente antes de iniciar el servidor. Esto garantiza que el entorno sea reproducible sin intervención manual.
