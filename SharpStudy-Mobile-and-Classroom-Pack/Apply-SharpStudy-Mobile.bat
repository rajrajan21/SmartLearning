@echo off
setlocal
set "RESULT=1"
set "REPO=D:\Smart Learning Website"
if not "%~1"=="" set "REPO=%~1"
where git >nul 2>nul
if errorlevel 1 (
  echo Git for Windows is required.
  goto done
)
if not exist "%REPO%\apps\web\src\components\Layout.tsx" (
  echo SharpStudy source not found in "%REPO%".
  goto done
)
pushd "%REPO%" || goto done
git apply --reverse --check "%~dp0sharpstudy-mobile.patch" >nul 2>nul
if not errorlevel 1 (
  echo The SharpStudy mobile and Classroom pack is already applied.
  set "RESULT=0"
  goto leave
)
git apply --check "%~dp0sharpstudy-mobile.patch"
if errorlevel 1 (
  echo No changes were applied. Confirm this checkout already contains the layout gallery rollout.
  goto leave
)
git apply "%~dp0sharpstudy-mobile.patch"
if errorlevel 1 goto leave
echo Applied the SharpStudy mobile and Classroom pack. No files were staged, published or deployed.
set "RESULT=0"
:leave
popd
:done
if not defined SHARPSTUDY_NO_PAUSE pause
exit /b %RESULT%
