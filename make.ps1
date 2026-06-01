<#
.SYNOPSIS
    minifintech-malpica — script de automatización para PowerShell nativo.

.DESCRIPTION
    Equivalente al Makefile del proyecto para usuarios que no tienen GNU Make.

    .\make.ps1          ->  Pipeline completo con Docker (recomendado)
    .\make.ps1 help     ->  Lista de comandos disponibles

.EXAMPLE
    .\make.ps1
    .\make.ps1 stop
    .\make.ps1 help
#>

param(
    [string]$Command = "up"
)

# -----------------------------------------------------------------------------
#  Configuración
# -----------------------------------------------------------------------------

$BackendDir  = Join-Path $PSScriptRoot "backend"
$FrontendDir = Join-Path $PSScriptRoot "frontend"
$ComposeFile = Join-Path $BackendDir "docker-compose.yml"

# -----------------------------------------------------------------------------
#  Utilidades
# -----------------------------------------------------------------------------

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "  >>> $Text" -ForegroundColor Cyan
    Write-Host ""
}

function Invoke-InDir {
    param([string]$Dir, [scriptblock]$ScriptBlock)
    Push-Location $Dir
    try { & $ScriptBlock }
    finally { Pop-Location }
}

function Copy-EnvIfMissing {
    param([string]$Dir)
    $target  = Join-Path $Dir ".env"
    $example = Join-Path $Dir ".env.example"
    if (Test-Path $target) {
        Write-Host "  [skip] $target ya existe" -ForegroundColor Yellow
    } else {
        Copy-Item $example $target
        Write-Host "  [ok]   $target creado desde .env.example" -ForegroundColor Green
    }
}

# -----------------------------------------------------------------------------
#  Targets
# -----------------------------------------------------------------------------

function Invoke-Up {
    # Pipeline Docker: .env -> front-install -> front-build -> docker compose up --build --no-start
    # Construye las imágenes y crea los contenedores sin iniciarlos.
    Write-Header "[1/4] Configurando variables de entorno"
    Copy-EnvIfMissing $BackendDir
    Copy-EnvIfMissing $FrontendDir

    Write-Header "[2/4] Instalando dependencias del frontend"
    Invoke-InDir $FrontendDir { npm install }

    Write-Header "[3/4] Build de producción del frontend"
    Invoke-InDir $FrontendDir { npm run build }

    Write-Header "[4/4] Construyendo imágenes Docker (sin iniciar contenedores)"
    Write-Host "  Para arrancar: .\make.ps1 back-up" -ForegroundColor Yellow
    docker compose -f $ComposeFile up --build --no-start
    Write-Host ""
    Write-Host "  Todo listo. Ejecuta  .\make.ps1 back-up  para iniciar." -ForegroundColor Green
}

function Invoke-Stop {
    Write-Header "Deteniendo contenedores"
    docker compose -f $ComposeFile down
}

function Invoke-Clean {
    Write-Header "Limpiando contenedores, volumen y node_modules"
    docker compose -f $ComposeFile down -v
    $backMods  = Join-Path $BackendDir  "node_modules"
    $frontMods = Join-Path $FrontendDir "node_modules"
    if (Test-Path $backMods)  { Remove-Item $backMods  -Recurse -Force }
    if (Test-Path $frontMods) { Remove-Item $frontMods -Recurse -Force }
    Write-Host "  [ok] node_modules eliminados" -ForegroundColor Green
}

function Invoke-Install {
    Write-Header "Instalando dependencias del frontend"
    Invoke-InDir $FrontendDir { npm install }
}

function Invoke-Setup {
    Write-Header "Setup: .env + npm install del frontend (sin build ni start)"
    Copy-EnvIfMissing $BackendDir
    Copy-EnvIfMissing $FrontendDir
    Invoke-InDir $FrontendDir { npm install }
}

# --- Backend Docker ---

function Invoke-BackUp {
    Write-Header "Backend — docker compose up --build"
    docker compose -f $ComposeFile up --build
}

function Invoke-BackDown {
    Write-Header "Backend — docker compose down"
    docker compose -f $ComposeFile down
}

function Invoke-BackDownV {
    Write-Header "Backend — docker compose down -v (elimina volumen)"
    docker compose -f $ComposeFile down -v
}

function Invoke-BackLogs {
    Write-Header "Backend — logs en tiempo real"
    docker compose -f $ComposeFile logs -f
}

function Invoke-BackEnv {
    Write-Header "Backend — configurar .env (requerido por Docker Compose)"
    Copy-EnvIfMissing $BackendDir
}

function Invoke-BackResetDb {
    Write-Header "Backend — reiniciando base de datos desde cero"
    Write-Host "  Eliminando volumen de datos..." -ForegroundColor Yellow
    docker compose -f $ComposeFile down -v
    Write-Host ""
    Write-Host "  Levantando servicios y re-ejecutando migraciones..." -ForegroundColor Yellow
    docker compose -f $ComposeFile up
}

# --- Frontend ---

function Invoke-FrontInstall {
    Write-Header "Frontend — npm install"
    Invoke-InDir $FrontendDir { npm install }
}

function Invoke-FrontEnv {
    Write-Header "Frontend — configurar .env"
    Copy-EnvIfMissing $FrontendDir
}

function Invoke-FrontDev {
    Write-Header "Frontend — servidor de desarrollo (Vite)"
    Invoke-InDir $FrontendDir { npm run dev }
}

function Invoke-FrontBuild {
    Write-Header "Frontend — build de producción"
    Invoke-InDir $FrontendDir { npm run build }
}

function Invoke-FrontPreview {
    Write-Header "Frontend — preview del build"
    Invoke-InDir $FrontendDir { npm run preview }
}

function Invoke-FrontTest {
    Write-Header "Frontend — tests (Vitest)"
    Invoke-InDir $FrontendDir { npm test }
}

function Invoke-FrontCoverage {
    Write-Header "Frontend — tests con cobertura"
    Invoke-InDir $FrontendDir { npm run test:cov }
}

# --- Ayuda ---

function Invoke-Help {
    $cyan   = [System.ConsoleColor]::Cyan
    $yellow = [System.ConsoleColor]::Yellow
    $white  = [System.ConsoleColor]::White

    Write-Host ""
    Write-Host "  minifintech-malpica — comandos disponibles" -ForegroundColor $cyan
    Write-Host ""
    Write-Host "  ALTO NIVEL" -ForegroundColor $yellow
    Write-Host "  .\make.ps1 up               " -NoNewline -ForegroundColor $cyan; Write-Host "Setup completo + Docker Compose up --build (default)" -ForegroundColor $white
    Write-Host "  .\make.ps1 stop             " -NoNewline -ForegroundColor $cyan; Write-Host "Detiene y elimina los contenedores" -ForegroundColor $white
    Write-Host "  .\make.ps1 clean            " -NoNewline -ForegroundColor $cyan; Write-Host "down -v + borra node_modules" -ForegroundColor $white
    Write-Host "  .\make.ps1 install          " -NoNewline -ForegroundColor $cyan; Write-Host "npm install en frontend" -ForegroundColor $white
    Write-Host "  .\make.ps1 setup            " -NoNewline -ForegroundColor $cyan; Write-Host "Copia .env.example -> .env + npm install frontend" -ForegroundColor $white
    Write-Host ""
    Write-Host "  BACKEND — Docker" -ForegroundColor $yellow
    Write-Host "  .\make.ps1 back-up          " -NoNewline -ForegroundColor $cyan; Write-Host "docker compose up --build" -ForegroundColor $white
    Write-Host "  .\make.ps1 back-down        " -NoNewline -ForegroundColor $cyan; Write-Host "docker compose down" -ForegroundColor $white
    Write-Host "  .\make.ps1 back-down-v      " -NoNewline -ForegroundColor $cyan; Write-Host "docker compose down -v (elimina volumen)" -ForegroundColor $white
    Write-Host "  .\make.ps1 back-logs        " -NoNewline -ForegroundColor $cyan; Write-Host "Ver logs en tiempo real" -ForegroundColor $white
    Write-Host "  .\make.ps1 back-env         " -NoNewline -ForegroundColor $cyan; Write-Host "Copia .env.example -> .env (requerido por Docker)" -ForegroundColor $white
    Write-Host "  .\make.ps1 back-reset-db    " -NoNewline -ForegroundColor $cyan; Write-Host "Elimina el volumen de datos y reinicia desde cero" -ForegroundColor $white
    Write-Host ""
    Write-Host "  FRONTEND" -ForegroundColor $yellow
    Write-Host "  .\make.ps1 front-install    " -NoNewline -ForegroundColor $cyan; Write-Host "npm install" -ForegroundColor $white
    Write-Host "  .\make.ps1 front-env        " -NoNewline -ForegroundColor $cyan; Write-Host "Copia .env.example -> .env" -ForegroundColor $white
    Write-Host "  .\make.ps1 front-dev        " -NoNewline -ForegroundColor $cyan; Write-Host "Servidor de desarrollo con HMR (Vite)" -ForegroundColor $white
    Write-Host "  .\make.ps1 front-build      " -NoNewline -ForegroundColor $cyan; Write-Host "Build de producción en dist/" -ForegroundColor $white
    Write-Host "  .\make.ps1 front-preview    " -NoNewline -ForegroundColor $cyan; Write-Host "Sirve el build de producción localmente" -ForegroundColor $white
    Write-Host "  .\make.ps1 front-test       " -NoNewline -ForegroundColor $cyan; Write-Host "Tests (Vitest)" -ForegroundColor $white
    Write-Host "  .\make.ps1 front-coverage   " -NoNewline -ForegroundColor $cyan; Write-Host "Tests con reporte de cobertura" -ForegroundColor $white
    Write-Host ""
}

# -----------------------------------------------------------------------------
#  Dispatcher
# -----------------------------------------------------------------------------

switch ($Command.ToLower()) {
    "up"             { Invoke-Up }
    "stop"           { Invoke-Stop }
    "clean"          { Invoke-Clean }
    "install"        { Invoke-Install }
    "setup"          { Invoke-Setup }

    "back-up"        { Invoke-BackUp }
    "back-down"      { Invoke-BackDown }
    "back-down-v"    { Invoke-BackDownV }
    "back-logs"      { Invoke-BackLogs }
    "back-env"       { Invoke-BackEnv }
    "back-reset-db"  { Invoke-BackResetDb }

    "front-install"  { Invoke-FrontInstall }
    "front-env"      { Invoke-FrontEnv }
    "front-dev"      { Invoke-FrontDev }
    "front-build"    { Invoke-FrontBuild }
    "front-preview"  { Invoke-FrontPreview }
    "front-test"     { Invoke-FrontTest }
    "front-coverage" { Invoke-FrontCoverage }

    { $_ -in "help", "-h", "--help" } { Invoke-Help }

    default {
        Write-Host ""
        Write-Host "  [error] Comando desconocido: '$Command'" -ForegroundColor Red
        Write-Host "  Ejecuta  .\make.ps1 help  para ver los comandos disponibles." -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
}
