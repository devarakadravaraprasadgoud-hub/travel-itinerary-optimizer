# Launch Script for Travel Itinerary Optimizer (DAA Prototype)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Travel Itinerary Optimizer (DAA Project Prototype)    " -ForegroundColor Green
Write-Host "   Algorithms: TSP, Dynamic Programming, Branch & Bound  " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$WorkspaceRoot = $PSScriptRoot
$BackendDir = Join-Path $WorkspaceRoot "backend"
$FrontendDir = Join-Path $WorkspaceRoot "frontend"

# 1. Start Flask Backend inside the backend directory to avoid path spaces issues
Write-Host "`n[1/2] Starting Flask Backend on http://127.0.0.1:5055..." -ForegroundColor Green
$BackendJob = Start-Process -FilePath "python" -ArgumentList "app.py" -WorkingDirectory $BackendDir -PassThru -NoNewWindow

Start-Sleep -Seconds 2

# 2. Start Vite React Frontend
Write-Host "[2/2] Starting Vite React Frontend on http://localhost:3000..." -ForegroundColor Green
Set-Location -Path $FrontendDir
try {
    npm run dev
} finally {
    # Cleanup backend process when user presses Ctrl+C in frontend
    if ($BackendJob) {
        Write-Host "`nShutting down backend process..." -ForegroundColor Yellow
        Stop-Process -Id $BackendJob.Id -Force -ErrorAction SilentlyContinue
    }
}
