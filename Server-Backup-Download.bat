@echo off
setlocal
title SharpStudy - download latest database backup
cd /d "%~dp0"
call _common.cmd || goto :end
if not exist "server-backups" mkdir "server-backups"
ssh %SSHOPT% ubuntu@%HOST% "sudo bash /opt/studysmart/deploy/backup.sh; f=$(ls -t /var/backups/studysmart/*.sql.gz | head -1); sudo cp $f /tmp/latest.sql.gz; sudo chown ubuntu /tmp/latest.sql.gz; echo $f"
scp %SSHOPT% ubuntu@%HOST%:/tmp/latest.sql.gz "server-backups\studysmart-%date:~-4%%date:~3,2%%date:~0,2%.sql.gz"
echo Saved into the server-backups folder.
:end
pause
endlocal
