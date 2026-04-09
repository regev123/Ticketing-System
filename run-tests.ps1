# Run all backend tests across Maven modules.
# Usage:
#   .\run-tests.ps1
#   .\run-tests.ps1 -SkipIntegration

param(
    [switch]$SkipIntegration
)

Set-Location $PSScriptRoot

$mavenArgs = @("-B", "test")
if ($SkipIntegration) {
    # Conventional switch respected by many test setups.
    $mavenArgs += "-DskipITs=true"
}

Write-Host "Running tests for all Maven modules..." -ForegroundColor Cyan

if (Get-Command mvn -ErrorAction SilentlyContinue) {
    Write-Host "Using local Maven (mvn)." -ForegroundColor Green
    & mvn @mavenArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Tests failed (local Maven)." -ForegroundColor Red
        exit $LASTEXITCODE
    }
    Write-Host "All tests passed." -ForegroundColor Green
    exit 0
}

Write-Host "Local Maven not found. Falling back to Dockerized Maven..." -ForegroundColor Yellow

$dockerMavenCmd = @(
    "run", "--rm",
    "-v", "${PSScriptRoot}:/workspace",
    "-w", "/workspace",
    "maven:3.9-eclipse-temurin-21",
    "mvn"
) + $mavenArgs

& docker @dockerMavenCmd
if ($LASTEXITCODE -ne 0) {
    Write-Host "Tests failed (Dockerized Maven)." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "All tests passed." -ForegroundColor Green
exit 0

