@echo off
setlocal
title SharpStudy - remove a book from the E-Library
cd /d "%~dp0"
rem Takedown: deletes the book's files and catalogue row and stops it coming back.
rem Usage:  Remove-Library-Book.bat BOOK-ID [BOOK-ID ...]   (the id is shown in Admin ^> E-Library)
if "%~1"=="" ( echo Give at least one book id, for example: Remove-Library-Book.bat ia-some-book & goto :end )
node tools\library\remove.mjs %*
:end
pause
endlocal
