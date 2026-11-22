@echo off
setlocal
title FinAgent - AI-Powered Personal Finance Agent
set "PY_EXE=%LOCALAPPDATA%\Programs\Python\Python313\python.exe"

if exist "%PY_EXE%" (
    echo [FinAgent] Launching using Python 3.13 at: %PY_EXE%
    "%PY_EXE%" run_app.py %*
    goto :end
)

where python >nul 2>&1
if %ERRORLEVEL% equ 0 (
    python run_app.py %*
    goto :end
)

echo [!] Could not locate Python 3.13 executable.
echo Please run: & "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe" run_app.py
pause

:end
endlocal
