# PowerShell script for Raindrop deployment
Write-Host "Deploying to Raindrop..." -ForegroundColor Green
Write-Host ""

# Add Node.js to PATH
$nodePath = "C:\Program Files\nodejs"
if (Test-Path $nodePath) {
    $env:PATH = "$nodePath;$env:PATH"
    Write-Host "Added Node.js to PATH" -ForegroundColor Yellow
} else {
    Write-Host "Node.js not found at $nodePath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Running TypeScript check..." -ForegroundColor Yellow

# Run type check
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "TypeScript check failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Deploying to Raindrop..." -ForegroundColor Yellow

# Deploy to Raindrop
raindrop build deploy

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green