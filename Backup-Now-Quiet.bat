@echo off
cd /d "%~dp0apps\api"
call pnpm backup >> "%~dp0backups-log.txt" 2>&1
