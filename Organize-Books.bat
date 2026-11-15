@echo off
setlocal
cd /d "%~dp0"
title SharpStudy - Organize NCERT textbooks
echo.
echo  ==========================================================
echo   SharpStudy - join the NCERT zip files into one PDF per book
echo  ==========================================================
echo   Reads the zip files in content\books\pdf\class-3 ... class-7
echo   and saves maths.pdf, evs.pdf, english.pdf and so on.
echo.
set "PY="
where py >nul 2>nul && set "PY=py -3"
if not defined PY ( where python >nul 2>nul && set "PY=python" )
if not defined PY (
  for /d %%D in ("%LocalAppData%\Programs\Python\Python3*") do if exist "%%D\python.exe" set "PY=%%D\python.exe"
)
if not defined PY (
  echo  Python was not found. Install it from https://www.python.org/downloads/
  echo  and tick "Add python.exe to PATH", then run this again.
  goto :end
)
set "REPORT=organize-books-report.txt"
echo SharpStudy organize books %date% %time% > "%REPORT%"
echo Using: %PY% >> "%REPORT%"
echo Installing the PDF helper (pypdf)...
%PY% -m pip install pypdf >> "%REPORT%" 2>&1
%PY% -c "import pypdf; print('pypdf', pypdf.__version__)" >> "%REPORT%" 2>&1
if errorlevel 1 (
  echo  Could not install pypdf. Details are in %REPORT%.
  type "%REPORT%"
  goto :end
)
echo Joining the books... this takes a few minutes, please wait.
%PY% tools\organize_books.py %* >> "%REPORT%" 2>&1
set "RC=%ERRORLEVEL%"
type "%REPORT%"
echo.
if "%RC%"=="0" (echo  Finished. Your books are in content\books\pdf.) else (echo  Finished with problems - see the lines above. A copy is in %REPORT%.)
:end
echo.
pause
endlocal
