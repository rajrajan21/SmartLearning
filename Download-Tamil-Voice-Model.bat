@echo off
setlocal
cd /d "%~dp0"
title SharpStudy - download the Tamil-oriented teacher voice model
echo This downloads the free voice model (about 4 GB) using Windows curl.
echo You will be asked for your Hugging Face READ token. Paste it once; it is not saved.
echo If it stops, run this again: it resumes.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File tools\tamil-voice-trial\download-model.ps1
echo.
pause
