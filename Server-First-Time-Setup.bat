@echo off
setlocal
title SharpStudy - first-time server install
cd /d "%~dp0"
call _common.cmd || goto :end
echo Run Publish-To-GitHub.bat first so the server can download the code. Continue? (Ctrl+C to cancel)
pause
scp %SSHOPT% deploy\first-time.sh ubuntu@%HOST%:/tmp/first-time.sh
if errorlevel 1 ( echo STOPPED: cannot reach the server. Is it created and is IP %HOST% attached? & goto :end )
ssh %SSHOPT% -t ubuntu@%HOST% "sed -i 's/\r$//' /tmp/first-time.sh && bash /tmp/first-time.sh" 2>&1 | powershell -nop -c "$input | Tee-Object -FilePath server-setup-report.txt"
echo.
echo Done. Copy the ADMIN KEY shown above into your password manager. Log: server-setup-report.txt
:end
pause
endlocal
