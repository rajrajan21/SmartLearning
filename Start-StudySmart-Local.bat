@echo off
cd /d "%~dp0"
title SharpStudy - local test site
echo === SharpStudy local test site ===
where node >nul 2>nul || (echo Node.js was not found. Install the LTS version from nodejs.org. & pause & exit /b)
where pnpm >nul 2>nul || (echo Installing pnpm... & call npm install -g pnpm)
echo Checking project packages (first time can take a few minutes)... & call pnpm install
echo Building the website...
call pnpm --filter @studysmart/web build
if errorlevel 1 (echo The website build failed. Send me the messages above. & pause & exit /b)
set WEB_DIR=%~dp0apps\web\dist
set PORT=3000
set ADMIN_KEY=local-test-admin-key-change-me-0123456789
set ADMIN_USER_ID=itsme.rajrajan@gmail.com
echo.
echo Site:   http://localhost:3000
echo Admin:  http://localhost:3000/admin   (key: %ADMIN_KEY%)
echo Close this window to stop the site. Lesson audio made by Generate-Lesson-Audio.bat is picked up when this starts.
echo.
start "" http://localhost:3000
call pnpm --filter @studysmart/api start
pause
