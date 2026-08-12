@echo off
REM SpecForge — one-shot setup and push script
REM Run this from the specforge directory:
REM   cd C:\Users\abdul\.gemini\antigravity\brain\d10daf45-33ec-4531-83f6-cf3cbc111c1c\scratch\specforge
REM   setup.bat

echo [1/7] Installing npm dependencies...
npm install
if errorlevel 1 goto :error

echo [2/7] Initializing git...
git init
git remote add origin https://github.com/Sameer8549/SpecForge.git 2>nul || git remote set-url origin https://github.com/Sameer8549/SpecForge.git

echo [3/7] Committing Step 1 — project scaffold...
git add .
git commit -m "chore: project scaffold + design skill setup"

echo [4/7] Committing Step 2 — design direction...
git add DESIGN.md PRODUCT.md
git commit -m "docs: lock visual direction and design system" --allow-empty

echo [5/7] Committing Step 3-11 — all pages...
git add src/ public/ index.html .gitignore README.md vite.config.js package.json
git commit -m "feat: landing page through settings — all 11 pages complete"

echo [6/7] Pushing to GitHub...
git push -u origin main
if errorlevel 1 (
  echo Push failed — try: git push -u origin master
  git push -u origin master
)

echo [7/7] Starting dev server...
npm run dev

goto :end
:error
echo Setup failed. Check error above.
exit /b 1
:end
