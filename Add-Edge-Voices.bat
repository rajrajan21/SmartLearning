@echo off
setlocal
title SharpStudy - add Kani and Arul voices, header fix, per-lesson voice list
cd /d "%~dp0"
where node >nul 2>nul || ( echo STOPPED: Node.js not found. & goto :end )
where py >nul 2>&1 && (set "PY=py") || (set "PY=python")
echo Making sure the files can be changed...
attrib -R "packages\shared\src\classroom.ts" "packages\shared\src\settings.ts" "apps\api\src\modules\classroom\service.ts" "apps\web\src\pages\Classroom.tsx" "apps\web\src\styles.css" "apps\api\src\tools\build-audio.ts" "content\audio\voices.json" >nul 2>&1
if exist "apps\api\src\tools\build-audio.ts" if not exist "apps\api\src\tools\build-audio.ts.before-edge-voices" copy /y "apps\api\src\tools\build-audio.ts" "apps\api\src\tools\build-audio.ts.before-edge-voices" >nul
echo Installing the two small Python packages (first time only)...
%PY% -m pip install --quiet edge-tts miniaudio
if errorlevel 1 ( echo STOPPED: pip install failed. Check Python is installed and you are online. & goto :end )
node tools\apply-edge-voices.mjs
if errorlevel 1 ( echo. & echo STOPPED: nothing was changed. Tell Claude what the message above says. & goto :end )
echo.
echo DONE. Restart the site, then press Ctrl+F5 in the browser.
:end
echo.
pause
endlocal
