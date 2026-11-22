@echo off
setlocal
title FinAgent - Personal Finance Agent (Lunetra Theme)
echo ========================================================
echo   FINAGENT: AI-POWERED PERSONAL FINANCE AGENT
echo   Lunetra / Cyber-Fintech Edition
echo ========================================================
echo.

set "PY_EXE=%LOCALAPPDATA%\Programs\Python\Python313\python.exe"

if exist "%PY_EXE%" (
    echo [✓] Located Python 3.13 at: %PY_EXE%
    "%PY_EXE%" run_app.py
    goto :end
)

where python >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [✓] Using system python...
    python run_app.py
    goto :end
)

echo [!] Could not locate Python automatically.
echo Please run: & "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe" run_app.py
pause

:end
endlocal
