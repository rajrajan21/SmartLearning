@echo off
setlocal
cd /d "%~dp0"
echo Adding the Tamil textbooks (content\books\pdf\class-N\Tamil) to the book reader ...
call pnpm --filter @studysmart/api books:tamil
if errorlevel 1 (echo NOT FINISHED. See the messages above.) else (echo DONE. Now run Build-Book-Pages.bat, then restart Start-StudySmart-Local.bat.)
pause
