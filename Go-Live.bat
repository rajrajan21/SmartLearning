@echo off
setlocal enableextensions
cd /d "%~dp0"
title SharpStudy - Go Live
rem ============================================================
rem  Go-Live.bat : 1) publish code to GitHub  2) update the live site
rem                3) (optional) copy new audio to the live site
rem  Stops at the first failure. Never asks for or stores a password.
rem ============================================================
set "SERVER=ubuntu@130.210.8.102"
set "KEY=D:\Keys\sharpstudy\ssh-key-2026-11-20.key"
set "AUDIO_REMOTE=/srv/studysmart/audio"
set "LOG=go-live-report.txt"
set "STAMP=content\audio\.last-live-sync.txt"

echo ===== Go-Live %DATE% %TIME% ===== > "%LOG%"

if not exist "%KEY%" ( echo [X] SSH key not found: %KEY% & echo [X] SSH key not found >> "%LOG%" & goto :fail )
where ssh >nul 2>&1 || ( echo [X] ssh not found. Turn on "OpenSSH Client" in Windows optional features. & goto :fail )
where git >nul 2>&1 || ( echo [X] git not found. & goto :fail )

echo.
echo === STEP 1 of 3: publish code to GitHub ===
if not exist Publish-To-GitHub.bat ( echo [X] Publish-To-GitHub.bat is missing from this folder. & goto :fail )
call Publish-To-GitHub.bat
if errorlevel 1 ( echo [X] Publish-To-GitHub reported an error. Nothing was sent to the live site. & goto :fail )

rem Make sure GitHub really has our latest commit (the publish script can fail quietly)
git fetch origin >> "%LOG%" 2>&1
if errorlevel 1 ( echo [X] Could not reach GitHub to verify the push. & goto :fail )
for /f %%H in ('git rev-parse HEAD') do set "LOCALHEAD=%%H"
for /f %%H in ('git rev-parse origin/main') do set "REMOTEHEAD=%%H"
if /i not "%LOCALHEAD%"=="%REMOTEHEAD%" (
  echo [X] GitHub does not have your latest commit yet.
  echo     local  %LOCALHEAD%
  echo     github %REMOTEHEAD%
  echo     Open github-publish log, fix the problem, run Go-Live again. The live site was NOT touched.
  goto :fail
)
git status --porcelain | findstr /r "." >nul && echo [!] Note: some files are not committed (they are ignored or new). The live site gets only what is on GitHub.
echo [OK] GitHub is up to date: %REMOTEHEAD%

echo.
echo === STEP 2 of 3: update the live site (pull, build, migrate, restart) ===
ssh -i "%KEY%" -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 %SERVER% "sudo git config --global --add safe.directory /opt/studysmart; sudo bash /opt/studysmart/deploy/update.sh"
if errorlevel 1 ( echo [X] Server update failed - read the messages above. & goto :fail )
echo [OK] Live site updated.

echo.
echo === STEP 3 of 3: copy new audio to the live site (optional) ===
if not exist "content\audio\files" ( echo No content\audio\files folder - skipping audio. & goto :done )
echo Only audio files that are new since the last copy are sent (first time = everything, can be many GB).
echo Do NOT do this while Generate-Edge-Audio.bat is still running - wait for it to finish.
choice /c YN /n /m "Copy audio now? [Y/N] "
if errorlevel 2 goto :done

set "SINCE="
if exist "%STAMP%" set /p SINCE=<"%STAMP%"
for /f "delims=" %%T in ('powershell -NoProfile -Command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set "NOW=%%T"

if defined SINCE ( echo Sending files newer than %SINCE% ... ) else ( echo Sending ALL audio files ... )
if defined SINCE (
  tar -cf - --newer-mtime "%SINCE%" -C content\audio files | ssh -i "%KEY%" %SERVER% "sudo tar -xf - -C %AUDIO_REMOTE%"
) else (
  tar -cf - -C content\audio files | ssh -i "%KEY%" %SERVER% "sudo tar -xf - -C %AUDIO_REMOTE%"
)
if errorlevel 1 ( echo [X] Audio file copy failed. Run Go-Live again - it is safe to repeat. & goto :fail )

rem manifest + voices go LAST so they never point at files that are not there yet
tar -cf - -C content\audio manifest.json voices.json | ssh -i "%KEY%" %SERVER% "sudo tar -xf - -C %AUDIO_REMOTE% && sudo chown -R studysmart:studysmart %AUDIO_REMOTE% 2>/dev/null; sudo systemctl restart studysmart"
if errorlevel 1 ( echo [X] Manifest copy / restart failed. Run Go-Live again. & goto :fail )
>"%STAMP%" echo %NOW%
echo [OK] Audio copied and site restarted.

:done
echo.
echo ===================================================
echo   DONE. Open https://sharpstudy.in and press Ctrl+F5.
echo   Look and feel: Admin - Look and feel - choose "Official Editorial".
echo ===================================================
echo ===== DONE %DATE% %TIME% ===== >> "%LOG%"
pause
exit /b 0

:fail
echo.
echo ===================================================
echo   STOPPED. Nothing after the failed step was run.
echo   Details: %LOG%  (send it to me if you are stuck)
echo ===================================================
echo ===== STOPPED %DATE% %TIME% ===== >> "%LOG%"
pause
exit /b 1
