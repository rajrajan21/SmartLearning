@echo off
setlocal enabledelayedexpansion
title SharpStudy - schedule the Facebook/Instagram posting runs
cd /d "%~dp0"
rem NOT run automatically. Run this file only when you want the PC to trigger posting runs on a timetable.
rem (When the site runs on the server you can instead tick "Run on schedule from the website itself" in Admin ^> Social: schedule and rotation.)
rem Creates Windows scheduled tasks that run Social-Post-Run.bat quietly. Default 4 runs a day (India time windows are decided by the site;
rem a run that is not due, or whose gates are closed, does nothing).  Remove them:  Schedule-Social-Posts.bat off
if /i "%~1"=="off" (
  for /l %%i in (1,1,12) do schtasks /Delete /TN "SharpStudy Social %%i" /F >nul 2>&1
  echo All Social scheduled runs removed.
  goto :end
)
set "N=%~1"
if "%N%"=="" set "N=4"
for /l %%i in (1,1,12) do schtasks /Delete /TN "SharpStudy Social %%i" /F >nul 2>&1
set "T1=08:00" & set "T2=12:30" & set "T3=17:00" & set "T4=20:00" & set "T5=10:00" & set "T6=14:30"
set "T7=06:30" & set "T8=09:30" & set "T9=11:00" & set "T10=15:30" & set "T11=18:30" & set "T12=21:00"
if %N% GTR 12 set "N=12"
for /l %%i in (1,1,%N%) do (
  schtasks /Create /F /SC DAILY /ST !T%%i! /TN "SharpStudy Social %%i" /TR "cmd /c set SOCIAL_QUIET=1 ^& \"%~dp0Social-Post-Run.bat\"" >nul
  if errorlevel 1 ( echo Could not create task %%i. Try running this file as administrator. ) else echo Scheduled run %%i at !T%%i!
)
echo.
echo Done: %N% runs a day. Works only while the PC is on and SOCIAL_ADMIN_KEY is set. Remove with: Schedule-Social-Posts.bat off
:end
pause
endlocal
