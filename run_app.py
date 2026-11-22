"""
FinAgent Single-Command Launch Orchestrator
Starts both:
1. FastAPI Backend (http://127.0.0.1:8000)
2. Vite React Frontend (http://localhost:5173)
"""

import os
import sys
import subprocess
import time
import signal

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

def main():
    print("=" * 60)
    print("  FINAGENT - AI-POWERED PERSONAL FINANCE AGENT")
    print("  Lunetra / Cyber-Fintech Theme Edition")
    print("=" * 60)

    # 1. Start FastAPI Backend
    python_exe = sys.executable
    if not os.path.exists(python_exe) or "WindowsApps" in python_exe:
        local_py = os.path.expandvars(r"%LOCALAPPDATA%\Programs\Python\Python313\python.exe")
        if os.path.exists(local_py):
            python_exe = local_py
    print(f"\n[1/2] Starting FastAPI backend on http://127.0.0.1:8000 using {python_exe}...")
    backend_proc = subprocess.Popen(
        [python_exe, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=BACKEND_DIR
    )

    time.sleep(2)

    # 2. Start Vite Frontend
    print("\n[2/2] Starting Vite React frontend on http://localhost:5173...")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=FRONTEND_DIR,
        shell=True
    )

    print("\n" + "=" * 60)
    print("  FINAGENT IS RUNNING!")
    print("  Frontend UI : http://localhost:5173")
    print("  Backend API : http://127.0.0.1:8000")
    print("  Swagger Docs: http://127.0.0.1:8000/docs")
    print("  Press Ctrl+C to stop both servers.")
    print("=" * 60 + "\n")

    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("Backend process terminated.")
                break
            if frontend_proc.poll() is not None:
                print("Frontend process terminated.")
                break
    except KeyboardInterrupt:
        print("\nStopping FinAgent services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Done. Goodbye!")

if __name__ == "__main__":
    main()
