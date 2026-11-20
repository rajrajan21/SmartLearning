@echo off
setlocal
cd /d "%~dp0"
set LOG=build-gk-report.txt
echo Building GK lessons and puzzles (tools\gk\src) into content\gk ... > "%LOG%"
python tools\gk\build.py >> "%LOG%" 2>&1
if errorlevel 1 python3 tools\gk\build.py >> "%LOG%" 2>&1
set RC=%ERRORLEVEL%
type "%LOG%"
if not "%RC%"=="0" (echo. ^& echo THE BUILD FOUND PROBLEMS. Fix the lines above, then run this again.) else (echo. ^& echo DONE. Reload on the admin GK content manager page, then run Generate-Lesson-Audio.bat to add the teacher voice.)
pause
