@echo off
setlocal enabledelayedexpansion
title SharpStudy - schedule the E-Library collector
cd /d "%~dp0"
rem NOT run automatically. Run this file only when you want the collector on a timetable.
rem Creates Windows scheduled tasks that run Harvest-Library-Books.bat quietly. Default 3 runs a day: 06:30, 13:30, 21:00.
rem The collector also needs "Collector job" switched ON in Admin ^> E-Library, otherwise each run does nothing.
rem To remove the tasks:  Schedule-Library-Books.bat off
if /i "%~1"=="off" (
  for /l %%i in (1,1,12) do schtasks /Delete /TN "SharpStudy Library %%i" /F >nul 2>&1
  echo All E-Library scheduled runs removed.
  goto :end
)
set "N=%~1"
if "%N%"=="" set "N=3"
for /l %%i in (1,1,12) do schtasks /Delete /TN "SharpStudy Library %%i" /F >nul 2>&1
set "T1=06:30" & set "T2=13:30" & set "T3=21:00" & set "T4=10:00" & set "T5=16:30" & set "T6=23:30"
set "T7=04:30" & set "T8=08:30" & set "T9=12:00" & set "T10=15:00" & set "T11=18:30" & set "T12=22:30"
if %N% GTR 12 set "N=12"
for /l %%i in (1,1,%N%) do (
  schtasks /Create /F /SC DAILY /ST !T%%i! /TN "SharpStudy Library %%i" /TR "cmd /c set LIBRARY_QUIET=1 ^& \"%~dp0Harvest-Library-Books.bat\"" >nul
  if errorlevel 1 ( echo Could not create task %%i. Try running this file as administrator. ) else echo Scheduled run %%i at !T%%i!
)
echo.
echo Done: %N% runs a day. Works only while the PC is on. Remove with: Schedule-Library-Books.bat off
:end
pause
endlocal
