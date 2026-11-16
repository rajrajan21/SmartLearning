@echo off
setlocal
cd /d "%~dp0"
set LOG=build-book-pages-report.txt
echo Building fast page pictures for the textbooks. This can take a long while and can be stopped and re-run. > "%LOG%"
echo Building fast page pictures. You can close this window and run it again later; finished pages are kept.
call pnpm install >> "%LOG%" 2>&1
call pnpm --filter @studysmart/api books:pages
if errorlevel 1 (echo NOT FINISHED. See the messages above. & echo NOT FINISHED >> "%LOG%") else (echo DONE. Restart Start-StudySmart-Local.bat so the reader uses the new pictures.)
pause
