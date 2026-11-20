@echo off
setlocal
title SharpStudy - collect free question papers
cd /d "%~dp0"
set "LOG=%~dp0papers-harvest-report.txt"
echo ==== %date% %time% ==== >> "%LOG%"
where node >nul 2>&1
if errorlevel 1 (
  echo STOPPED: Node.js is not installed. Install it from https://nodejs.org then run this again.
  echo STOPPED: node not installed >> "%LOG%"
  goto :end
)
echo Collecting free question papers (settings come from Admin ^> Question papers). This is polite and slow on purpose...
node tools\papers\harvest.mjs %* >> "%LOG%" 2>&1
type "%LOG%" | findstr /C:"DONE" /C:"STOPPED" /C:"blocked" /C:"finished" /C:"saved:"
echo.
echo Full log: papers-harvest-report.txt   Summary: tools\papers\last-run.json
echo New papers appear on the site after you run Go-Live.bat (or Publish-To-GitHub.bat).
:end
if not "%PAPERS_QUIET%"=="1" pause
endlocal
