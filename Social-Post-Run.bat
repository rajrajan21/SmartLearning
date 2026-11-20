@echo off
setlocal
title SharpStudy - Facebook and Instagram posting run
cd /d "%~dp0"
set "LOG=%~dp0social-post-report.txt"
echo ==== %date% %time% ==== >> "%LOG%"
where node >nul 2>&1
if errorlevel 1 (
  echo STOPPED: Node.js is not installed. Install it from https://nodejs.org then run this again.
  echo STOPPED: node not installed >> "%LOG%"
  goto :end
)
rem Nothing is posted unless EVERY gate in Admin ^> Social is open (Social ON, Preview only OFF, Approve live posting ON,
rem the platform ON, keys saved, kill switch OFF). Otherwise this only builds/gets a preview or does nothing.
rem Sign-in: set the Windows environment variables SOCIAL_ADMIN_KEY (your ADMIN_KEY) and SOCIAL_ADMIN_USER once. This file never contains or stores them.
rem Options:   Social-Post-Run.bat --preview   (build a preview only)
rem            Social-Post-Run.bat --status    (show gates and counts)
rem            Social-Post-Run.bat --live      (run now for real, if every gate is open)
rem            Social-Post-Run.bat --site http://localhost:3100   (use the local site instead of sharpstudy.in)
node tools\social\run.mjs %* >> "%LOG%" 2>&1
type "%LOG%" | findstr /C:"DONE" /C:"STOPPED" /C:"PREVIEW" /C:"liveReady"
echo.
echo Full log: social-post-report.txt
:end
if not "%SOCIAL_QUIET%"=="1" pause
endlocal
