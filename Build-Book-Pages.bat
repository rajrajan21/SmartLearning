@echo off
setlocal
cd /d "%~dp0"
set LOG=build-book-pages-report.txt
echo Building fast page pictures for the textbooks. This can take a long while and can be stopped and re-run. > "%LOG%"
echo Building fast page pictures. You can close this window and run it again later; finished pages are kept.
call pnpm install >> "%LOG%" 2>&1
echo Adding the Tamil textbooks from the Tamil folders ...
call pnpm --filter @studysmart/api books:tamil
if errorlevel 1 goto failed
echo Class 6 first, so the Class 6 reader is fast soon.
call pnpm --filter @studysmart/api books:pages --class 6
if errorlevel 1 goto failed
call pnpm --filter @studysmart/api books:pages
if errorlevel 1 goto failed
echo DONE. Restart Start-StudySmart-Local.bat so the reader uses the new pictures.
pause
exit /b 0
:failed
echo NOT FINISHED. See the messages above.
echo NOT FINISHED >> "%LOG%"
pause
exit /b 1
