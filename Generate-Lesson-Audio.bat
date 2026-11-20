@echo off
setlocal
cd /d "%~dp0"
title SharpStudy - generate teacher audio
set REPORT=generate-audio-report.txt
rem How many pieces of audio are made at the same time. 1 or 2 keeps your PC free for other work; raise it to go faster.
rem JOBS = clips made at the same time. The speech server has 3 engines, so more than 3 gives no gain; use 2 if the PC feels slow.
set JOBS=3
rem Teacher voices to record. malar = American woman. priya = Indian-English woman, ravi = Indian-English man.
rem jaya = Tamil-teacher woman and murali = Tamil-teacher man are recorded afterwards by a second step (they need the extra voice server). Set TAMILVOICES= (empty) to skip them.
set TAMILVOICES=
rem Add priya2 and ravi2 to hear a second Indian-English pair and keep the one you like. Delete a name to skip it (less time).
rem Speed-up: every extra voice repeats every sentence. Two voices = one third less work. Add malar back here when you want all three.
set VOICES=priya2
echo === SharpStudy: generate Malar Teacher audio for lessons === > %REPORT%
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
echo Using %JOBS% at a time, voices: %VOICES%, then %TAMILVOICES%. Change JOBS and VOICES at the top of this file.
echo Generating audio for every lesson sentence that does not have it yet...
rem Priority order: these classes first (lessons, questions and classroom boards), then everything else. Edit the list to change the order.
set FIRST=cbse-6- classroom-6- cbse-3- classroom-3- cbse-7- classroom-7- cbse-4- classroom-4- tnm-10- tnm-9-
for %%P in (%FIRST%) do (
  echo === Priority: %%P === >> %REPORT%
  call pnpm --filter @studysmart/api audio:build --lang en --only "%%P" --jobs %JOBS% --voices "%VOICES%" >> %REPORT% 2>&1
)
echo === Everything else === >> %REPORT%
call pnpm --filter @studysmart/api audio:build --lang en --jobs %JOBS% --voices "%VOICES%" >> %REPORT% 2>&1
set RC=%ERRORLEVEL%
if not "%RC%"=="0" goto afterparler
if "%TAMILVOICES%"=="" goto afterparler
if not exist tools\tamil-voice-trial\model\indic\config.json goto noparlermodel
echo Starting the Tamil-teacher voice server (the model takes a few minutes to load)...
start "ParlerVoices" /min cmd /c "tools\tamil-voice-trial\venv\Scripts\python tools\tamil-voice-trial\serve.py > parler-server-log.txt 2>&1"
set PTRIES=0
:waitparler
curl -s -m 5 http://localhost:8090/api/health | findstr /r /c:"tts.*true" >nul 2>nul
if not errorlevel 1 goto parlerready
set /a PTRIES+=1
if %PTRIES% GTR 90 goto parlerfail
echo Waiting for the Tamil-teacher voices, try %PTRIES% of 90 ...
timeout /t 5 /nobreak >nul
goto waitparler
:parlerready
echo Recording the Tamil-teacher voices (slower, about one clip at a time): %TAMILVOICES%
call pnpm --filter @studysmart/api audio:build --jobs 1 --voices "%TAMILVOICES%" >> %REPORT% 2>&1
set RC=%ERRORLEVEL%
goto stopparler
:parlerfail
echo The Tamil-teacher voice server did not start. See parler-server-log.txt. The other voices are done. >> %REPORT%
set RC=1
goto stopparler
:noparlermodel
echo Tamil-teacher voice model is missing. Run Download-Tamil-Voice-Model.bat first. The other voices are done. >> %REPORT%
set RC=1
goto afterparler
:stopparler
taskkill /fi "WINDOWTITLE eq ParlerVoices*" /f >nul 2>nul
:afterparler
type %REPORT%
echo.
if not "%RC%"=="0" goto failed
echo DONE. New audio is in content\audio. Run Publish-To-GitHub.bat to save it to GitHub.
goto end
:nonode
echo Node.js was not found. Install the LTS version from nodejs.org, then run this file again.
goto end
:nospeech
echo The Malar Teacher speech server is not running.
echo Open the Malar Teacher folder inside this folder and run "Start Malar Teacher.bat".
echo Wait until it says the voice engine is ready, then run this file again.
echo Speech server not running >> %REPORT%
goto end
:failed
echo NOT FINISHED. Read the lines above. The same text is in %REPORT%.
echo NOT FINISHED >> %REPORT%
:end
echo.
pause
