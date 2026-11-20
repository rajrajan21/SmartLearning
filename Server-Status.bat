@echo off
setlocal
title SharpStudy - server status and logs
cd /d "%~dp0"
call _common.cmd || goto :end
ssh %SSHOPT% ubuntu@%HOST% "uptime; df -h / | tail -1; free -h | head -2; systemctl is-active studysmart caddy postgresql; curl -s http://127.0.0.1:3100/health; echo; echo ---- last app log lines ----; sudo journalctl -u studysmart -n 40 --no-pager" > server-status-report.txt 2>&1
type server-status-report.txt
:end
pause
endlocal
