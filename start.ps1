# Start all infrastructure and microservices with Docker Compose
# Run from repo root: .\start.ps1

Set-Location $PSScriptRoot

Write-Host "Building and starting all services (infrastructure + microservices)..." -ForegroundColor Cyan
docker compose up --build -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start. Check logs with: docker compose logs -f" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Services are starting. Ports:" -ForegroundColor Green
Write-Host "  API Gateway:     http://localhost:8080"
Write-Host "  Catalog:         http://localhost:8081"
Write-Host "  Availability:    http://localhost:8082"
Write-Host "  Reservation:     http://localhost:8083"
Write-Host "  Order:           http://localhost:8084"
Write-Host "  Notification:    http://localhost:8085"
Write-Host "  Payment:         http://localhost:8086"
Write-Host "  Redis UI:        http://localhost:5540"
Write-Host '  Postgres UI:     http://localhost:5551  (Adminer: PostgreSQL, server postgres, user ticketing, DB ticketing_orders, pw ticketing_secret)'
Write-Host ""
Write-Host "View logs:  docker compose logs -f" -ForegroundColor Yellow
Write-Host "Stop all:   docker compose down" -ForegroundColor Yellow
