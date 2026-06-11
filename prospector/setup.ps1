# PROSPECTOR - Generic Setup Script (PowerShell)
# Run from project root: .\setup.ps1

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " PROSPECTOR - Asteroid Mining Feasibility Engine" -ForegroundColor Cyan
Write-Host " Setup Script" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$ProjectRoot = $PSScriptRoot
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$VenvDir = Join-Path $BackendDir "venv"

# ── Find Python ──────────────────────────────────────────────────────────────
Write-Host "`n[1/4] Finding Python..." -ForegroundColor Yellow
$PythonPath = $null
$PythonCandidates = @("python", "py", "python3")

foreach ($candidate in $PythonCandidates) {
    try {
        $result = & $candidate --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $PythonPath = $candidate
            Write-Host "    Found: $candidate -> $result" -ForegroundColor Green
            break
        }
    } catch { continue }
}

if (-not $PythonPath) {
    Write-Host "    ERROR: Python not found in PATH! Install Python 3.11+ from python.org" -ForegroundColor Red
    exit 1
}

# ── Find Node/npm ────────────────────────────────────────────────────────────
Write-Host "`n[2/4] Finding Node.js..." -ForegroundColor Yellow
$NpmPath = $null
try {
    $result = & npm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $NpmPath = "npm"
        Write-Host "    Found npm: v$result" -ForegroundColor Green
    }
} catch {
    Write-Host "    WARNING: npm not found in PATH. Frontend will not be installed automatically." -ForegroundColor Yellow
}

# ── Backend: Create venv ─────────────────────────────────────────────────────
Write-Host "`n[3/4] Setting up Python virtual environment..." -ForegroundColor Yellow

if (-not (Test-Path $VenvDir)) {
    Write-Host "    Creating venv..." -ForegroundColor Gray
    & $PythonPath -m venv $VenvDir
    Write-Host "    Created venv at: $VenvDir" -ForegroundColor Green
} else {
    Write-Host "    venv already exists at: $VenvDir" -ForegroundColor Green
}

$VenvPython = Join-Path $VenvDir "Scripts\python.exe"
$VenvPip = Join-Path $VenvDir "Scripts\pip.exe"
$VenvAlembic = Join-Path $VenvDir "Scripts\alembic.exe"

# Upgrade pip
Write-Host "    Upgrading pip..." -ForegroundColor Gray
& $VenvPip install --upgrade pip -q

# Install requirements
Write-Host "    Installing requirements (may take 2-3 minutes)..." -ForegroundColor Gray
$RequirementsFile = Join-Path $BackendDir "requirements.txt"
& $VenvPip install --default-timeout=100 -r $RequirementsFile

if ($LASTEXITCODE -ne 0) {
    Write-Host "    ERROR: pip install failed!" -ForegroundColor Red
    exit 1
}
Write-Host "    Python dependencies installed successfully" -ForegroundColor Green

# ── Backend: Alembic migration ───────────────────────────────────────────────
Write-Host "`n    Running database migrations..." -ForegroundColor Gray
Push-Location $BackendDir
try {
    & $VenvAlembic upgrade head
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    Database schema created successfully" -ForegroundColor Green
    } else {
        Write-Host "    WARNING: Migration failed - check .env database URL" -ForegroundColor Yellow
    }
} finally {
    Pop-Location
}

# ── Frontend: npm install ────────────────────────────────────────────────────
Write-Host "`n[4/4] Setting up Frontend..." -ForegroundColor Yellow
if ($NpmPath) {
    Push-Location $FrontendDir
    try {
        Write-Host "    Running npm install (may take 1-2 minutes)..." -ForegroundColor Gray
        & $NpmPath install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    Frontend dependencies installed" -ForegroundColor Green
        } else {
            Write-Host "    ERROR: npm install failed!" -ForegroundColor Red
        }
    } finally {
        Pop-Location
    }
} else {
    Write-Host "    SKIPPED - npm not available" -ForegroundColor Yellow
    Write-Host "    Manually run: cd frontend && npm install" -ForegroundColor Gray
}

# ── Print Commands ───────────────────────────────────────────────────────────
Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host " Setup Complete! Run Commands:" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

Write-Host ""
Write-Host "BACKEND (open Terminal 1):" -ForegroundColor Yellow
Write-Host "  cd `"$BackendDir`"" -ForegroundColor White
Write-Host "  venv\Scripts\activate" -ForegroundColor White
Write-Host "  uvicorn app.main:app --reload --port 8000" -ForegroundColor White

Write-Host ""
Write-Host "FRONTEND (open Terminal 2):" -ForegroundColor Yellow
Write-Host "  cd `"$FrontendDir`"" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White

Write-Host ""
Write-Host "TRIGGER INITIAL DATA SYNC (after both are running):" -ForegroundColor Yellow
Write-Host "  curl -X POST http://localhost:8000/api/asteroids/sync" -ForegroundColor White

Write-Host ""
Write-Host "ACCESS:" -ForegroundColor Yellow
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  API Docs:  http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  API:       http://localhost:8000/api" -ForegroundColor Cyan
Write-Host ""
