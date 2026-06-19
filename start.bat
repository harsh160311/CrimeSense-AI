@echo off
echo Starting CrimeSense AI...
echo.

echo [1/2] Starting Backend...
start "CrimeSense Backend" cmd /c "cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend...
start "CrimeSense Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo CrimeSense AI is starting up!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
