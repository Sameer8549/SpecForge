# SpecForge setup and push script (PowerShell)
# Run from specforge directory:
#   cd "C:\Users\abdul\.gemini\antigravity\brain\d10daf45-33ec-4531-83f6-cf3cbc111c1c\scratch\specforge"
#   .\setup.ps1

Set-Location $PSScriptRoot

Write-Host "[1/5] Installing npm dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { Write-Error "npm install failed"; exit 1 }

Write-Host "[2/5] Initializing git repository..." -ForegroundColor Cyan
git init
git remote add origin https://github.com/Sameer8549/SpecForge.git 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote set-url origin https://github.com/Sameer8549/SpecForge.git
}

Write-Host "[3/5] Staging all files..." -ForegroundColor Cyan
git add .
git commit -m "fix: remove opacity: 0 scroll-reveal state to prevent disappearing elements on click and re-render"

Write-Host "[4/5] Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Trying 'master' branch..." -ForegroundColor Yellow
    git push -u origin master
}

Write-Host "[5/5] Starting dev server..." -ForegroundColor Green
npm run dev
