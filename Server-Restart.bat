@echo off
setlocal
title SharpStudy - restart server app
cd /d "%~dp0"
call _common.cmd || goto :end
ssh %SSHOPT% ubuntu@%HOST% "sudo systemctl restart studysmart && sleep 3 && curl -fsS http://127.0.0.1:3100/health && echo && echo Restarted OK"
echo.
set /p R=Also reboot the whole server? (type YES to reboot, Enter to skip): 
if /i "%R%"=="YES" ssh %SSHOPT% ubuntu@%HOST% "sudo reboot"
:end
pause
endlocal
