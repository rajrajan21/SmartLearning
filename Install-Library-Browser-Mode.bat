@echo off
setlocal
title SharpStudy - real-browser mode for the E-Library collector
cd /d "%~dp0"
rem Only needed if a book site blocks plain downloads. Installs playwright-core (it uses your installed Chrome), then
rem switch "Use a real browser" ON in Admin ^> E-Library.
where npm >nul 2>&1
if errorlevel 1 ( echo STOPPED: Node.js / npm is not installed. & goto :end )
cd tools\library
if not exist package.json ( echo {"name":"library-tools","private":true,"type":"module"}> package.json )
call npm i playwright-core
echo Done.
:end
pause
endlocal
