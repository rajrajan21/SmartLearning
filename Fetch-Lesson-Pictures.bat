@echo off
setlocal
cd /d "%~dp0"
echo ================================================================
echo  Fetch openly licensed lesson pictures (Wikimedia Commons)
echo  Keeps ONLY public domain, CC0, CC BY and CC BY-SA pictures,
echo  shrinks them to small WebP files and records the credit line.
echo  Safe to run again: pictures already fetched are skipped.
echo ================================================================
echo.
echo Step 1: rebuilding the picture list from the lessons ...
call pnpm --filter @studysmart/api visuals:build
if errorlevel 1 (echo The picture list could not be built. & pause & exit /b 1)
set PY=py -3
%PY% --version >nul 2>&1 || set PY=python
%PY% -c "import PIL" >nul 2>&1 || (echo Installing Pillow ... & %PY% -m pip install pillow)
echo.
echo Step 2: downloading (one picture at a time, with polite pauses; this can take a while) ...
%PY% tools\pictures\fetch_pictures.py %*
echo.
echo A full log is in fetch-pictures-report.txt. Run Build-Visuals-Report.bat or open Admin > Visuals: coverage report to see what is covered.
echo Pictures that could not be found free are listed in tools\pictures\failed.json (run with --retry-failed to try them again).
pause
