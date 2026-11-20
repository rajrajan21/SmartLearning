rem Shared settings for the Server-*.bat files
set "HOST=137.23.46.97"
set "SSHKEY=%USERPROFILE%\.ssh\sharpstudy_oracle"
set "SSHOPT=-i "%SSHKEY%" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15"
where ssh >nul 2>&1
if errorlevel 1 (
  echo STOPPED: ssh not found. Turn on "OpenSSH Client" in Windows Optional Features.
  exit /b 1
)
if not exist "%SSHKEY%" (
  echo STOPPED: key %SSHKEY% not found.
  exit /b 1
)
exit /b 0
