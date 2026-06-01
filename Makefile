# =============================================================================
#  minifintech-malpica — Makefile
#  Requiere: GNU Make + Git Bash / MSYS2 en Windows
#
#  make          →  pipeline completo con Docker (recomendado)
#  make help     →  lista de targets disponibles
# =============================================================================

BACKEND_DIR  := backend
FRONTEND_DIR := frontend
COMPOSE_FILE := $(BACKEND_DIR)/docker-compose.yml

.DEFAULT_GOAL := up

# -----------------------------------------------------------------------------
#  PIPELINES PRINCIPALES  (fire-and-forget)
# -----------------------------------------------------------------------------

# Pipeline Docker: .env → front-install → front-build → docker compose build
# Construye las imágenes y crea los contenedores sin iniciarlos.
# Para arrancar: make back-up
.PHONY: up
up: back-env front-env front-install front-build ## [DEFAULT] Setup completo + build frontend + build imágenes Docker (sin iniciar)
	docker compose -f $(COMPOSE_FILE) up --build --no-start

# -----------------------------------------------------------------------------
#  UTILIDADES
# -----------------------------------------------------------------------------

.PHONY: stop
stop: ## Detiene y elimina los contenedores Docker
	docker compose -f $(COMPOSE_FILE) down

.PHONY: clean
clean: ## docker compose down -v + borra node_modules de ambos proyectos
	docker compose -f $(COMPOSE_FILE) down -v
	rm -rf $(BACKEND_DIR)/node_modules $(FRONTEND_DIR)/node_modules

.PHONY: install
install: front-install ## npm install en frontend

.PHONY: setup
setup: back-env front-env front-install ## Solo .env + npm install del frontend (sin build ni start)

# -----------------------------------------------------------------------------
#  BACKEND — Docker
# -----------------------------------------------------------------------------

.PHONY: back-up
back-up: ## [back] docker compose up --build
	docker compose -f $(COMPOSE_FILE) up --build

.PHONY: back-down
back-down: ## [back] docker compose down
	docker compose -f $(COMPOSE_FILE) down

.PHONY: back-down-v
back-down-v: ## [back] docker compose down -v  (elimina volumen de datos)
	docker compose -f $(COMPOSE_FILE) down -v

.PHONY: back-logs
back-logs: ## [back] Ver logs en tiempo real
	docker compose -f $(COMPOSE_FILE) logs -f

.PHONY: back-env
back-env: ## [back] Copia .env.example -> .env (requerido por Docker Compose)
	test -f $(BACKEND_DIR)/.env || cp $(BACKEND_DIR)/.env.example $(BACKEND_DIR)/.env

.PHONY: back-reset-db
back-reset-db: ## [back] Elimina el volumen de datos y reinicia (re-ejecuta migraciones desde cero)
	docker compose -f $(COMPOSE_FILE) down -v
	docker compose -f $(COMPOSE_FILE) up

# -----------------------------------------------------------------------------
#  FRONTEND
# -----------------------------------------------------------------------------

.PHONY: front-install
front-install: ## [front] npm install
	cd $(FRONTEND_DIR) && npm install

.PHONY: front-env
front-env: ## [front] Copia .env.example -> .env (no sobreescribe si ya existe)
	test -f $(FRONTEND_DIR)/.env || cp $(FRONTEND_DIR)/.env.example $(FRONTEND_DIR)/.env

.PHONY: front-dev
front-dev: ## [front] Servidor de desarrollo con HMR (Vite)
	cd $(FRONTEND_DIR) && npm run dev

.PHONY: front-build
front-build: ## [front] Build de producción en dist/
	cd $(FRONTEND_DIR) && npm run build

.PHONY: front-preview
front-preview: ## [front] Sirve el build de producción localmente
	cd $(FRONTEND_DIR) && npm run preview

.PHONY: front-test
front-test: ## [front] Ejecuta la suite de tests (Vitest)
	cd $(FRONTEND_DIR) && npm test

.PHONY: front-coverage
front-coverage: ## [front] Tests con reporte de cobertura
	cd $(FRONTEND_DIR) && npm run test:cov

# -----------------------------------------------------------------------------
#  AYUDA
# -----------------------------------------------------------------------------

.PHONY: help
help: ## Muestra esta ayuda
	@echo ""
	@echo "  minifintech-malpica — comandos disponibles"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
