@echo off
setlocal
cd /d "%~dp0"
title SharpStudy - try a Tamil-oriented Indian English teacher voice
set REPORT=try-tamil-voice-report.txt
echo === Tamil-oriented teacher voice trial === > %REPORT%
echo This installs a free voice engine (a few GB, one time) and records 3 lines in a woman and a man voice.
echo It may be slow on a laptop without a graphics card. The report shows how many seconds each line took.
echo.
where python >nul 2>nul
if errorlevel 1 goto nopython
where git >nul 2>nul
if errorlevel 1 goto nogit
if not exist tools\tamil-voice-trial\venv (
  echo Setting up, please wait ...
  python -m venv tools\tamil-voice-trial\venv >> %REPORT% 2>&1
  call tools\tamil-voice-trial\venv\Scripts\python -m pip install --upgrade pip >> %REPORT% 2>&1
  call tools\tamil-voice-trial\venv\Scripts\python -m pip install torch soundfile "transformers<4.47" >> %REPORT% 2>&1
  call tools\tamil-voice-trial\venv\Scripts\python -m pip install git+https://github.com/huggingface/parler-tts.git >> %REPORT% 2>&1
)
if not exist tools\tamil-voice-trial\model\indic\config.json (
  echo The voice model is not downloaded yet. Run Download-Tamil-Voice-Model.bat first.
  pause
  exit /b 1
)
call tools\tamil-voice-trial\venv\Scripts\python -m pip install "protobuf==4.25.9" >> %REPORT% 2>&1
echo Recording the sample lines ...
call tools\tamil-voice-trial\venv\Scripts\python tools\tamil-voice-trial\trial.py tamil-voice-samples >> %REPORT% 2>&1
type %REPORT%
echo.
echo Listen to the files in the folder "tamil-voice-samples" (woman-1.wav ... man-3.wav), then tell me what you think.
pause
exit /b 0
:nopython
echo Python is not installed. Install Python 3.11 from python.org (tick "Add to PATH"), then run this again.
pause
exit /b 1
:nogit
echo Git is not installed. Install Git for Windows from git-scm.com, then run this again.
pause
exit /b 1
