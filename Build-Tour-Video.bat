@echo off
setlocal
title SharpStudy - rebuild the "How it works" tour video
cd /d "%~dp0"
set "LOG=%~dp0tools\tour\build-report.txt"
echo ==== %date% %time% ==== >> "%LOG%"
where python >nul 2>&1
if errorlevel 1 (
  echo STOPPED: Python is not installed. Install it from https://www.python.org then run this again.
  echo STOPPED: python not installed >> "%LOG%"
  goto :end
)
where ffmpeg >nul 2>&1
if errorlevel 1 (
  echo STOPPED: ffmpeg is not installed. Install it ^(winget install Gyan.FFmpeg^) then run this again.
  echo STOPPED: ffmpeg not installed >> "%LOG%"
  goto :end
)
rem One-time helpers (skipped quickly when already installed): Pillow, numpy, playwright and its browser.
python -c "import PIL, numpy, playwright" >nul 2>&1
if errorlevel 1 (
  echo Installing the helpers once ^(Pillow, numpy, playwright^)...
  python -m pip install --quiet pillow numpy playwright >> "%LOG%" 2>&1
  python -m playwright install chromium >> "%LOG%" 2>&1
)
rem The voice: the Malar speech server on port 8080 is used when it is running ^(start Malar first for the best voice^).
rem Tamil: without the Tamil voice server on port 8090 the Tamil video is built with captions and music only.
echo Building the English and Tamil tour videos. This takes several minutes...
python tools\tour\build_tour.py %* >> "%LOG%" 2>&1
if errorlevel 1 ( echo FAILED: see the end of tools\tour\build-report.txt & type "%LOG%" | findstr /C:"Error" /C:"STOPPED" /C:"Traceback" ) else ( echo DONE: new videos are in apps\web\public\tour-video. Publish the site as usual. )
echo.
echo Full log: tools\tour\build-report.txt
:end
if not "%TOUR_QUIET%"=="1" pause
endlocal
