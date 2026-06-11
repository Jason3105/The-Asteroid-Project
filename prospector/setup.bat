@echo off
REM PROSPECTOR - Generic Setup Script (Windows CMD)
REM Double-click this file or run from Command Prompt

echo ==================================================
echo  PROSPECTOR - Asteroid Mining Feasibility Engine
echo  Setup Script
echo ==================================================
echo.

set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"
set "VENV_DIR=%BACKEND_DIR%\venv"

REM ── Find Python ────────────────────────────────────────────────
echo [1/4] Checking Python installation...

python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "PYTHON=python"
    goto :create_venv
)

py --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "PYTHON=py"
    goto :create_venv
)

python3 --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "PYTHON=python3"
    goto :create_venv
)

echo     ERROR: Python not found in PATH!
echo     Please install Python 3.11+ from https://python.org
echo     Or add Python to your PATH and re-run this script.
pause
exit /b 1

:create_venv
echo [2/4] Setting up Python virtual environment...
if not exist "%VENV_DIR%" (
    echo     Creating virtual environment...
    %PYTHON% -m venv "%VENV_DIR%"
) else (
    echo     Virtual environment already exists.
)

set "VENV_PYTHON=%VENV_DIR%\Scripts\python.exe"
set "VENV_PIP=%VENV_DIR%\Scripts\pip.exe"
set "VENV_ALEMBIC=%VENV_DIR%\Scripts\alembic.exe"

echo     Upgrading pip...
"%VENV_PIP%" install --upgrade pip -q

echo     Installing Python packages (this may take 2-5 minutes)...
"%VENV_PIP%" install --default-timeout=100 -r "%BACKEND_DIR%\requirements.txt"
if %ERRORLEVEL% NEQ 0 (
    echo     ERROR: pip install failed!
    pause
    exit /b 1
)
echo     Python dependencies installed successfully!

REM ── Database migration ─────────────────────────────────────────
echo.
echo [3/4] Running database migrations...
pushd "%BACKEND_DIR%"
"%VENV_ALEMBIC%" upgrade head
if %ERRORLEVEL% EQU 0 (
    echo     Database schema created in Supabase!
) else (
    echo     WARNING: Migration may have failed. Check .env file.
)
popd

REM ── Frontend setup ─────────────────────────────────────────────
echo.
echo [4/4] Installing frontend dependencies...
call npm --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    pushd "%FRONTEND_DIR%"
    call npm install
    if %ERRORLEVEL% EQU 0 (
        echo     Frontend dependencies installed!
    ) else (
        echo     ERROR: npm install failed!
    )
    popd
) else (
    echo     WARNING: npm not found in PATH. Install Node.js from https://nodejs.org
    echo     Then manually run: cd frontend ^&^& npm install
)

REM ── Done ──────────────────────────────────────────────────────
echo.
echo ==================================================
echo  Setup Complete!
echo ==================================================
echo.
echo  BACKEND (run in Terminal 1):
echo    cd "%BACKEND_DIR%"
echo    venv\Scripts\activate
echo    uvicorn app.main:app --reload --port 8000
echo.
echo  FRONTEND (run in Terminal 2):
echo    cd "%FRONTEND_DIR%"
echo    npm run dev
echo.
echo  SYNC DATA (after both are running):
echo    curl -X POST http://localhost:8000/api/asteroids/sync
echo.
echo  OPEN IN BROWSER:
echo    Frontend:  http://localhost:3000
echo    API Docs:  http://localhost:8000/docs
echo.
pause
