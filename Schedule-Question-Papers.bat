@echo off
setlocal enabledelayedexpansion
title SharpStudy - schedule the question paper collector
cd /d "%~dp0"
rem Creates Windows scheduled tasks that run Harvest-Question-Papers.bat quietly. Default 3 runs a day: 07:00, 13:00, 20:00.
rem Re-run this file after changing "Runs per day" in Admin (it replaces the old tasks). Works only while the PC is on.
set "N=%~1"
if "%N%"=="" set "N=3"
for /l %%i in (1,1,12) do schtasks /Delete /TN "SharpStudy Question Papers %%i" /F >nul 2>&1
set "T1=07:00" & set "T2=13:00" & set "T3=20:00" & set "T4=10:00" & set "T5=16:00" & set "T6=23:00"
set "T7=05:00" & set "T8=09:00" & set "T9=12:00" & set "T10=15:00" & set "T11=18:00" & set "T12=22:00"
if %N% GTR 12 set "N=12"
for /l %%i in (1,1,%N%) do (
  schtasks /Create /F /SC DAILY /ST !T%%i! /TN "SharpStudy Question Papers %%i" /TR "cmd /c set PAPERS_QUIET=1 ^& \"%~dp0Harvest-Question-Papers.bat\"" >nul
  if errorlevel 1 ( echo Could not create task %%i. Try running this file as administrator. ) else echo Scheduled run %%i at !T%%i!
)
echo.
echo Done: %N% runs a day. To remove them run:  schtasks /Delete /TN "SharpStudy Question Papers 1" /F  (and 2, 3 ...)
pause
endlocal
