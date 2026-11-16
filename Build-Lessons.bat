@echo off
setlocal
cd /d "%~dp0"
set LOG=build-lessons-report.txt
echo Building lessons from recipes (content\recipes) into content\classroom ... > "%LOG%"
call pnpm --filter @studysmart/api lessons:build >> "%LOG%" 2>&1
set RC=%ERRORLEVEL%
type "%LOG%"
if not "%RC%"=="0" (echo. & echo SOME LESSONS FAILED the rule book. Fix the lines marked FAILED, then run this again.) else (echo. & echo DONE. Now run Generate-Lesson-Audio.bat to add the teacher voice.)
pause
