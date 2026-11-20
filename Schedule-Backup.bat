@echo off
cd /d "%~dp0"
set TASK=SharpStudy Daily Backup
schtasks /Create /F /SC DAILY /ST 03:00 /TN "%TASK%" /TR "\"%~dp0Backup-Now-Quiet.bat\"" >nul
if errorlevel 1 goto failed
echo Daily backup scheduled for 3:00 AM (your PC must be on). Remove it with: schtasks /Delete /TN "%TASK%" /F
goto end
:failed
echo Could not schedule it. Right-click this file and choose Run as administrator.
:end
pause
