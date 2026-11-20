@echo off
setlocal
cd /d "%~dp0"
set LOG=build-visuals-report.txt
echo Building animated explainers and the visuals coverage report ... > "%LOG%"
call pnpm --filter @studysmart/api visuals:build >> "%LOG%" 2>&1
type "%LOG%"
echo.
echo DONE. Animated pages are in content\classroom (files starting auto-). Coverage report: Admin > Visuals: coverage report.
echo To download the real pictures, run Fetch-Lesson-Pictures.bat.
pause
