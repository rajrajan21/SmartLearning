@echo off
cd /d "%~dp0"
title StudySmart - local test site
echo === StudySmart local test site ===
where node >nul 2>nul || (echo Node.js was not found. Install the LTS version from nodejs.org. & pause & exit /b)
where pnpm >nul 2>nul || (echo Installing pnpm... & call npm install -g pnpm)
if not exist node_modules (echo Installing project packages, please wait... & call pnpm install)
echo Building the website...
call pnpm --filter @studysmart/web build
if errorlevel 1 (echo The website build failed. Send me the messages above. & pause & exit /b)
set WEB_DIR=%~dp0apps\web\dist
set PORT=3000
if "%ADMIN_KEY%"=="" set ADMIN_KEY=local-test-admin-key-change-me-0123456789
echo.
echo Site:   http://localhost:3000
echo Admin:  http://localhost:3000/admin   (key: %ADMIN_KEY%)
echo Close this window to stop the site. Lesson audio made by Generate-Lesson-Audio.bat is picked up when this starts.
echo.
start "" http://localhost:3000
call pnpm --filter @studysmart/api start
pause
