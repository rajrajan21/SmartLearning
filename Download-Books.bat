@echo off
setlocal
cd /d "%~dp0"
title SharpStudy - Download NCERT textbooks
echo.
echo  ==========================================================
echo   SharpStudy - NCERT textbook downloader (classes 3 to 7)
echo  ==========================================================
echo   Books are saved to content\books\pdf\class-N\ on this PC.
echo   The website book reader will read them from that folder.
echo.

set "PY="
where py >nul 2>nul && set "PY=py -3"
if not defined PY ( where python >nul 2>nul && set "PY=python" )
if not defined PY (
  echo  Python was not found on this computer.
  echo  Please install it from https://www.python.org/downloads/
  echo  and tick "Add python.exe to PATH" during setup, then run this again.
  goto :end
)

%PY% -c "import pypdf" >nul 2>nul
if errorlevel 1 (
  echo  Tip: for one tidy PDF per book, run once:  pip install pypdf
  echo  ^(Without it the chapters are kept as separate files.^)
  echo.
)

echo  You can pass options, for example:
echo     Download-Books.bat --class 6
echo     Download-Books.bat --class 3 4 --subject maths
echo     Download-Books.bat --dry-run
echo.
echo  Starting... this waits politely between files, so please be patient.
echo.
%PY% tools\download_books.py %*
set "RC=%ERRORLEVEL%"
echo.
if "%RC%"=="0" (
  echo  All finished. Your books are in content\books\pdf
) else (
  echo  Finished, but some books did not download. Check your internet
  echo  connection and run this file again - books already saved are skipped.
)

:end
echo.
pause
endlocal
