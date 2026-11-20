@echo off
setlocal
cd /d "%~dp0"
title SharpStudy - draw E-Library page pictures
set REPORT=build-library-pages-report.txt
rem Draws ready-made page pictures for every E-Library book so the Book Reader opens pages instantly.
rem Safe to stop (Ctrl+C) and run again: finished pages are skipped. The site also does this by itself in the background,
rem a few books at a time; this file is only for drawing the whole shelf at once. Widths and quality come from Admin > E-Library.
rem To redraw ONE book, delete its folder in data\library\pages and run this again.
echo === SharpStudy: E-Library page pictures === > %REPORT%
where node >nul 2>nul
if errorlevel 1 goto nonode
where pnpm >nul 2>nul
if errorlevel 1 call npm install -g pnpm
if not exist node_modules call pnpm install
echo Drawing page pictures for the E-Library books. This can take a while for a big shelf...
call pnpm --filter @studysmart/api library:pages >> %REPORT% 2>&1
set RC=%ERRORLEVEL%
type %REPORT%
echo.
if "%RC%"=="0" (echo Done.) else (echo Finished with problems. See %REPORT%.)
pause
exit /b %RC%
:nonode
echo Node.js is not installed. Install it from https://nodejs.org and run this again.
pause
exit /b 1
