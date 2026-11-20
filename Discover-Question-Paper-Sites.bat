@echo off
setlocal
title SharpStudy - check question paper websites
cd /d "%~dp0"
set "LOG=%~dp0papers-discover-report.txt"
echo ==== %date% %time% ==== >> "%LOG%"
where node >nul 2>&1
if errorlevel 1 ( echo STOPPED: Node.js is not installed. Install it from https://nodejs.org & goto :end )
echo Checking every website on the list (robots rules, reachability, PDFs found)...
node tools\papers\discover.mjs >> "%LOG%" 2>&1
type "%LOG%"
echo.
echo Result file: tools\papers\sites-status.json  (also lists NEW sites it noticed, for you to review)
:end
pause
endlocal
