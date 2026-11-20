@echo off
cd /d "%~dp0"
echo Saving a backup of accounts, progress and lessons...
cd apps\api
call pnpm backup
echo.
echo Done. The file is in the "backups" folder. Copy it to a USB drive or cloud drive now and then.
pause
