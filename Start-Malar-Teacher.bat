@echo off
cd /d "%~dp0Malar Teacher"
title Malar Teacher (speech server)
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install the LTS version from nodejs.org, then run this file again.
  pause
  exit /b
)
if not exist "node_modules\@met4citizen\headtts" (
  echo First-time setup: installing the voice engine. This can take a few minutes...
  call npm install --ignore-scripts --no-audit --no-fund
  if errorlevel 1 (
    echo Setup failed. Check your internet connection and run this file again.
    pause
    exit /b
  )
)
if not defined CLIPS_DIR set CLIPS_DIR=D:\Malar Teacher Clips
set TTS_DEVICE=cpu
set TTS_DTYPE=fp32
node server.mjs
echo.
echo Malar Teacher has stopped. If this was not expected, send the file "Malar Teacher\server.log" to Claude.
pause
