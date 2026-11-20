@echo off
setlocal EnableExtensions DisableDelayedExpansion
title SharpStudy - Mobile code-only release
set "REPO=D:\Smart Learning Website"
set "PACK=SharpStudy-Mobile-and-Classroom-Pack\sharpstudy-mobile.patch"
set "MESSAGE=Release SharpStudy mobile and Classroom code"
set "FILES=apps/web/src/classroom.test.tsx apps/web/src/components/AppBar.tsx apps/web/src/components/InstallPopup.tsx apps/web/src/components/Layout.tsx apps/web/src/components/Logo.tsx apps/web/src/components/MainNav.tsx apps/web/src/components/MeSettings.tsx apps/web/src/components/sitePresets.css apps/web/src/pages/Classroom.tsx"
set EXCLUDE=":(exclude)apps/web/src/classroom.test.tsx" ":(exclude)apps/web/src/components/AppBar.tsx" ":(exclude)apps/web/src/components/InstallPopup.tsx" ":(exclude)apps/web/src/components/Layout.tsx" ":(exclude)apps/web/src/components/Logo.tsx" ":(exclude)apps/web/src/components/MainNav.tsx" ":(exclude)apps/web/src/components/MeSettings.tsx" ":(exclude)apps/web/src/components/sitePresets.css" ":(exclude)apps/web/src/pages/Classroom.tsx"
set "RESULT=1"
set "PUSHED="
cd /d "%REPO%" || goto done
where git >nul 2>&1 || (echo [X] Git is not available. & goto done)
git apply --reverse --check "%PACK%" >nul 2>&1 || (echo [X] The complete mobile pack could not be verified in this checkout. & goto done)
where ssh >nul 2>&1 || (echo [X] OpenSSH Client is required. & goto done)
set "SERVER="
set "KEY="
for /f "tokens=1,* delims==" %%A in ('powershell -NoProfile -Command "foreach ($line in [IO.File]::ReadAllLines('Go-Live.bat')) { if ($line.StartsWith('set '+[char]34+'SERVER=') -or $line.StartsWith('set '+[char]34+'KEY=')) { $line.Substring(5).TrimEnd([char]34) } }"') do set "%%A=%%B"
if not defined SERVER (echo [X] Go-Live.bat has no server setting. & goto done)
if not exist "%KEY%" (echo [X] The SSH key configured in Go-Live.bat is unavailable. & goto done)
if /i "%~1"=="--check" (
  call :verify_release || goto done
  echo [OK] The nine-file mobile commit is verified. No release actions ran.
  set "RESULT=0"
  goto done
)
set "BRANCH="
for /f %%H in ('git branch --show-current') do set "BRANCH=%%H"
if /i not "%BRANCH%"=="main" (echo [X] Switch to the project's main branch before releasing. & goto done)
git fetch origin main || goto done
set "LOCALHEAD="
set "REMOTEHEAD="
for /f %%H in ('git rev-parse HEAD') do set "LOCALHEAD=%%H"
for /f %%H in ('git rev-parse FETCH_HEAD') do set "REMOTEHEAD=%%H"
if not defined LOCALHEAD goto done
if not defined REMOTEHEAD goto done
if /i not "%LOCALHEAD%"=="%REMOTEHEAD%" goto retry
git diff --quiet HEAD -- %FILES%
if errorlevel 2 goto done
if errorlevel 1 goto commit
call :verify_release || goto done
echo The mobile code is already on the remote. Continuing with the server update.
goto confirm_deploy

:retry
set "PARENT="
for /f %%H in ('git rev-parse HEAD~1') do set "PARENT=%%H"
if /i not "%PARENT%"=="%REMOTEHEAD%" (
  echo [X] Local main has additional commits or has diverged. The release stopped before publishing.
  goto done
)
call :verify_release || goto done
git diff --quiet HEAD -- %FILES% || (echo [X] Mobile files changed after the release commit. & goto done)
choice /c YN /n /m "Push the existing mobile-only commit and deploy? [Y/N] "
if errorlevel 2 goto done
goto push

:commit
echo These are the only paths eligible for this release:
git diff --name-status HEAD -- %FILES%
choice /c YN /n /m "Commit these mobile changes, push and deploy? [Y/N] "
if errorlevel 2 goto done
git commit --only -m "%MESSAGE%" -- %FILES% || goto done
call :verify_release || goto done

:push
git push origin HEAD:refs/heads/main || goto done
set "PUSHED=1"
goto deploy

:confirm_deploy
choice /c YN /n /m "Update the live site to the mobile release? [Y/N] "
if errorlevel 2 goto done
set "PUSHED=1"

:deploy
git fetch origin main || goto done
for /f %%H in ('git rev-parse HEAD') do set "LOCALHEAD=%%H"
for /f %%H in ('git rev-parse FETCH_HEAD') do set "REMOTEHEAD=%%H"
if /i not "%LOCALHEAD%"=="%REMOTEHEAD%" (echo [X] Remote main advanced. The server update was skipped. & goto done)
ssh -i "%KEY%" -o BatchMode=yes -o StrictHostKeyChecking=yes "%SERVER%" "sudo bash /opt/studysmart/deploy/update.sh && test $(sudo -u studysmart git -C /opt/studysmart rev-parse HEAD) = %LOCALHEAD%" || goto done
echo [OK] The live server is running mobile release %LOCALHEAD%.
set "RESULT=0"

:done
if "%RESULT%"=="1" if defined PUSHED echo The code was pushed. Check the server output above before retrying deployment.
if "%RESULT%"=="1" if not defined PUSHED echo Release stopped before a successful push or deployment.
if not defined SHARPSTUDY_NO_PAUSE pause
exit /b %RESULT%

:verify_release
set "SUBJECT="
for /f "tokens=1,*" %%A in ('git --no-pager log -1 --oneline --no-decorate') do set "SUBJECT=%%B"
if not "%SUBJECT%"=="%MESSAGE%" (
  echo [X] The latest commit is not the expected mobile release.
  exit /b 1
)
git diff --quiet HEAD~1 HEAD -- . %EXCLUDE% || (echo [X] The release commit includes files outside the mobile pack. & exit /b 1)
exit /b 0
