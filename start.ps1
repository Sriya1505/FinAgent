# FinAgent PowerShell Startup Script
# Automatically detects installed Python 3.13 and launches FinAgent

$localPy = "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe"
$localScripts = "$env:LOCALAPPDATA\Programs\Python\Python313\Scripts"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  FINAGENT: AI-POWERED PERSONAL FINANCE AGENT" -ForegroundColor White
Write-Host "  Lunetra / Cyber-Fintech Edition" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Ensure session PATH has Python 3.13 first so sub-commands can find uvicorn/python
if (Test-Path $localPy) {
    Write-Host "[✓] Located Python 3.13 at: $localPy" -ForegroundColor Green
    $env:PATH = "$env:LOCALAPPDATA\Programs\Python\Python313;$localScripts;$env:PATH"
    & $localPy run_app.py
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "[✓] Using system python..." -ForegroundColor Green
    python run_app.py
} else {
    Write-Host "[!] Python 3.13 not found in standard directory." -ForegroundColor Red
    Write-Host "Please check that Python is installed." -ForegroundColor Yellow
}
