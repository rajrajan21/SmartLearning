@echo off
setlocal
cd /d "%~dp0"
title SharpStudy - try the Indian-English voices on one chapter
set REPORT=try-voices-report.txt
rem The chapter to record (part of its file name). This one is Class 6 Science, Magnets. It takes a few minutes.
set CHAPTER=magnetic-and-non-magnetic
rem malar = American woman. priya, ravi = Hindi-trained voices. asha, kiran = British voices, closer to Indian English pronunciation. Only the new ones are recorded.
set VOICES=malar,priya,ravi,asha,kiran
echo === SharpStudy: try voices on one chapter === > %REPORT%
echo.
where node >nul 2>nul
if errorlevel 1 goto nonode
where pnpm >nul 2>nul
if errorlevel 1 call npm install -g pnpm
if not exist node_modules call pnpm install
curl -s -m 5 http://localhost:8080/api/health >nul 2>nul
if errorlevel 1 goto nospeech
set TRIES=0
:waitvoice
curl -s -m 5 http://localhost:8080/api/health | findstr /r /c:"tts.*true" >nul 2>nul
if not errorlevel 1 goto voiceready
set /a TRIES+=1
if %TRIES% GTR 40 goto nospeech
echo Waiting for the voice engine to get ready, try %TRIES% of 40 ...
timeout /t 5 /nobreak >nul
goto waitvoice
:voiceready
echo Recording chapter "%CHAPTER%" in voices: %VOICES%
call pnpm --filter @studysmart/api audio:build --jobs 2 --only "%CHAPTER%" --voices "%VOICES%" >> %REPORT% 2>&1
set RC=%ERRORLEVEL%
type %REPORT%
echo.
if not "%RC%"=="0" goto failed
echo DONE. To listen: restart Start-StudySmart-Local.bat, open http://localhost:3000/classroom
echo Open Class 6, Science, Magnets. Use the voice list above the board to play each voice.
echo Tell me which woman and which man sound best, and I will use only those for all lessons.
goto end
:nonode
echo Node.js was not found. Install the LTS version from nodejs.org, then run this file again.
goto end
:nospeech
echo The Malar Teacher speech server is not running.
echo Open the Malar Teacher folder inside this folder and run "Start Malar Teacher.bat".
echo Wait until it says the voice engine is ready, then run this file again.
goto end
:failed
echo NOT FINISHED. Read the lines above. The same text is in %REPORT%.
:end
echo.
pause
