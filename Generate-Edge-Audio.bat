@echo off
setlocal
cd /d "%~dp0"
title SharpStudy - generate Kani (Neerja) audio
set REPORT=generate-edge-audio-report.txt
rem Voices to record: kani = Indian-English woman (Neerja), arul = Indian-English man (Prabhat). Add arul later: set VOICES=kani,arul
set VOICES=kani
rem Clips made at the same time. 6 is gentle on the voice service; if you see many "failed" lines in the report, lower it to 3.
set JOBS=6
echo === SharpStudy: generate %VOICES% audio === > %REPORT%
where node >nul 2>nul || ( echo STOPPED: Node.js not found. & goto :end )
where pnpm >nul 2>nul || call npm install -g pnpm
if not exist node_modules call pnpm install
echo Priority order: CBSE 6, 3, 7, 4, Matric 10, 9, then everything else. Safe to stop and run again: finished clips are skipped.
set FIRST=cbse-6- classroom-6- cbse-3- classroom-3- cbse-7- classroom-7- cbse-4- classroom-4- tnm-10- tnm-9-
for %%P in (%FIRST%) do (
  echo === Priority: %%P === >> %REPORT%
  call pnpm --filter @studysmart/api audio:build --lang en --only "%%P" --jobs %JOBS% --voices "%VOICES%" >> %REPORT% 2>&1
)
echo === PC priorities complete. Remaining CBSE classes are assigned to Oracle. === >> %REPORT%
echo.
echo Finished. Details are in %REPORT%. Look at the last lines for "Sentences wanted ... generated ...".
:end
pause
endlocal
