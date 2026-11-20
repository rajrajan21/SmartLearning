@echo off
setlocal
title SharpStudy - Edge voice trial
cd /d "%~dp0"
where py >nul 2>&1 && (set "PY=py") || (set "PY=python")
echo Installing the two small helper packages (first time only)...
%PY% -m pip install --quiet edge-tts mutagen
if errorlevel 1 ( echo STOPPED: could not install. Check that Python is installed and you are online. & goto :end )
%PY% tools\edge-trial\edge_trial.py %*
if errorlevel 1 ( echo STOPPED: see the message above. & goto :end )
for /f "delims=" %%F in ('dir /b /s /o-d tools\edge-trial\out\compare.html 2^>nul') do ( start "" "%%F" & goto :end )
:end
echo.
pause
endlocal
