@echo off
setlocal
cd /d "%~dp0"
title Append the 2026-11-20 handover
if not exist HANDOVER.md ( echo STOPPED: HANDOVER.md not found in this folder. & goto :end )
if not exist HANDOVER-2026-11-20.md ( echo STOPPED: HANDOVER-2026-11-20.md not found. & goto :end )
findstr /c:"HANDOVER TO CHATGPT" HANDOVER.md >nul && ( echo Already appended. Nothing changed. & goto :end )
type HANDOVER-2026-11-20.md >> HANDOVER.md
>> JOBS_AND_IMPACT.md echo.
>> JOBS_AND_IMPACT.md echo - 2026-11-20: Kani audio run (Generate-Edge-Audio.bat, JOBS=6, re-run until generated 0); Go-Live.bat for GitHub + server + audio copy. See HANDOVER.md section "HANDOVER TO CHATGPT" for the full open-work list.
>> CONVERSATION_HISTORY.md echo.
>> CONVERSATION_HISTORY.md echo - 2026-11-20: Owner moved the project to ChatGPT. Decisions: Edge voices as Kani/Arul; Classroom + Study path layouts and Today widgets (rail/tabs/drawer); admin redesign with monitor, stats, reports, server health and storage sizes; live audio not playing is the top issue.
echo DONE. HANDOVER.md, JOBS_AND_IMPACT.md and CONVERSATION_HISTORY.md updated.
:end
echo.
pause
endlocal
