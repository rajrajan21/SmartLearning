@echo off
setlocal
title SharpStudy - Go live (GitHub then server)
cd /d "%~dp0"
call _common.cmd || goto :end
echo === Step 1: push to GitHub ===
call Publish-To-GitHub.bat %*
echo === Step 2: update the live server ===
ssh %SSHOPT% ubuntu@%HOST% "bash /opt/studysmart/deploy/update.sh" 2>&1 | powershell -nop -c "$input | Tee-Object -FilePath go-live-report.txt"
echo.
echo If you see "SharpStudy is running." above, the site is updated: https://sharpstudy.in
:end
pause
endlocal
