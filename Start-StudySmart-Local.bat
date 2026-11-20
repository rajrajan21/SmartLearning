@echo off
cd /d "%~dp0"
title SharpStudy - local test site
echo === SharpStudy local test site ===
where node >nul 2>nul || (echo Node.js was not found. Install the LTS version from nodejs.org. & pause & exit /b)
where pnpm >nul 2>nul || (echo Installing pnpm... & call npm install -g pnpm)
rem Speed: packages and the website are only rebuilt when something changed (set START_FORCE=1 to redo both every time).
node tools\start-check.mjs install
if errorlevel 1 (
  echo Checking project packages ^(first time can take a few minutes^)...
  call pnpm install
  if errorlevel 1 (echo Package install failed. Send me the messages above. & pause & exit /b)
  node tools\start-check.mjs mark install
)
node tools\start-check.mjs build
if errorlevel 1 (
  echo Building the website...
  call pnpm --filter @studysmart/web build
  if errorlevel 1 (echo The website build failed. Send me the messages above. & pause & exit /b)
  node tools\start-check.mjs mark build
)
set WEB_DIR=%~dp0apps\web\dist
set PORT=3000
set ADMIN_KEY=local-test-admin-key-change-me-0123456789
set ADMIN_USER_ID=itsme.rajrajan@gmail.com
echo.
echo Site:   http://localhost:3000
echo Admin:  http://localhost:3000/admin   (key: %ADMIN_KEY%)
echo Close this window to stop the site. Lesson audio made by Generate-Lesson-Audio.bat is picked up when this starts.
echo The browser opens by itself as soon as the site is ready. Only new or changed lessons are loaded, so later starts are quick.
echo.
rem open the browser only once the server answers (waits up to 10 minutes; the first start after many new lessons is the slowest)
start "" /b cmd /c "node tools\start-check.mjs wait http://localhost:3000/health 600 && start "" http://localhost:3000"
call pnpm --filter @studysmart/api start
pause
