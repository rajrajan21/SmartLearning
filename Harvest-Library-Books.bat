@echo off
setlocal
title SharpStudy - collect free kids' books for the E-Library
cd /d "%~dp0"
set "LOG=%~dp0library-harvest-report.txt"
echo ==== %date% %time% ==== >> "%LOG%"
where node >nul 2>&1
if errorlevel 1 (
  echo STOPPED: Node.js is not installed. Install it from https://nodejs.org then run this again.
  echo STOPPED: node not installed >> "%LOG%"
  goto :end
)
rem Settings come from Admin ^> E-Library. The job does nothing while "Collector job" is switched OFF there.
rem Add --force to run once anyway:  Harvest-Library-Books.bat --force
rem Optional helpers: Ghostscript (gs) and qpdf make books smaller; "npm i playwright-core" enables real-browser mode.
echo Collecting free, openly licensed kids' books. This is polite and slow on purpose...
node tools\library\harvest.mjs %* >> "%LOG%" 2>&1
type "%LOG%" | findstr /C:"DONE" /C:"STOPPED" /C:"blocked" /C:"finished" /C:"saved" /C:"added" /C:"OFF"
echo.
echo Full log: library-harvest-report.txt   Books are in data\library (not in git).
echo Put them on the server with Upload-Library-To-Server.bat once the server exists.
:end
if not "%LIBRARY_QUIET%"=="1" pause
endlocal
