@echo off
setlocal
title SharpStudy - E-Library collector
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required.
  exit /b 1
)
echo Running the reviewed-edition collector for the local project.
node tools\library\harvest.mjs >> library-harvest-report.txt 2>&1
if errorlevel 1 echo Collector failed. See library-harvest-report.txt.
echo The live library uses the Oracle collector managed in SharpStudy Admin.
if not "%LIBRARY_QUIET%"=="1" pause
endlocal
