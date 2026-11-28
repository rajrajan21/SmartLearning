@echo off
setlocal
if /i "%~1"=="off" (
  for /l %%i in (1,1,12) do schtasks /Delete /TN "SharpStudy Library %%i" /F >nul 2>&1
  echo Old Windows library tasks removed.
  exit /b 0
)
echo The live collector is scheduled on Oracle from SharpStudy Admin ^> E-Library.
echo Set runs per day and books per run there. It is off until enabled.
echo Pass "off" to remove any old Windows tasks.
endlocal
