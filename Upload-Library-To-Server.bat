@echo off
setlocal
title SharpStudy - copy the E-Library books to the server
cd /d "%~dp0"
rem Copies data\library (the big PDF files, kept out of git) to the server. Run only once the server exists.
rem The small catalogue (content\library\catalog.json) goes with your normal publish to GitHub.
set "KEY=%USERPROFILE%\.ssh\sharpstudy_oracle"
set "HOST=ubuntu@137.23.46.97"
set "DEST=/home/ubuntu/SmartLearning/data/library/"
if not exist "data\library" ( echo Nothing to upload: data\library does not exist yet. & goto :end )
if not exist "%KEY%" ( echo STOPPED: key not found at %KEY% & goto :end )
ssh -i "%KEY%" -o ConnectTimeout=10 -o BatchMode=yes %HOST% "echo ok" >nul 2>&1
if errorlevel 1 ( echo The server is not reachable yet, so nothing was uploaded. Try again once it is running. & goto :end )
where rsync >nul 2>&1
if not errorlevel 1 (
  rsync -avz --partial -e "ssh -i \"%KEY%\"" "data/library/" "%HOST%:%DEST%"
) else (
  ssh -i "%KEY%" %HOST% "mkdir -p %DEST%" 
  scp -i "%KEY%" -r "data\library\*" "%HOST%:%DEST%"
)
echo Done.
:end
pause
endlocal
