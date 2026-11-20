@echo off
setlocal
title SharpStudy - check the list of free kids' book websites
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 ( echo STOPPED: Node.js is not installed. & goto :end )
rem Reads tools\library\sites.json, politely probes each site (robots.txt, reachability) and writes library-discover-report.txt.
node tools\library\discover.mjs %*
echo.
echo Report: library-discover-report.txt   Edit tools\library\sites.json to add or change sites.
:end
pause
endlocal
