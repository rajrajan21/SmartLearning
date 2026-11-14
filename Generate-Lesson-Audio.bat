@echo off
cd /d "%~dp0"
title StudySmart - generate teacher audio
set REPORT=generate-audio-report.txt
echo === StudySmart: generate Malar Teacher audio for lessons === > %REPORT%
echo.
where node >nul 2>nul || (echo Node.js was not found. Install the LTS version from nodejs.org. & pause & exit /b)
where pnpm >nul 2>nul || (echo Installing pnpm... & call npm install -g pnpm)
if not exist node_modules (echo Installing project packages, please wait... & call pnpm install)
curl -s -m 5 http://localhost:8080/api/health >nul 2>nul
if errorlevel 1 (
  echo The Malar Teacher speech server is not running.
  echo Start "Start Malar Teacher.bat" in the Malar Teacher folder, wait until it says the voice engine is ready, then run this file again.
  echo Speech server not running >> %REPORT%
  pause & exit /b
)
echo Generating audio for every lesson sentence that does not have it yet...
call pnpm --filter @studysmart/api audio:build >> %REPORT% 2>&1
type %REPORT%
echo.
echo DONE. New audio is in content\audio. Run Publish-To-GitHub.bat to save it to GitHub.
pause
