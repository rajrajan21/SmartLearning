SharpStudy - Kani and Arul voices, header fix, per-lesson voice list

1. Extract this into D:\Smart Learning Website (do it AFTER the audio-coverage and Hindi patches).
2. Double-click Add-Edge-Voices.bat. It stops without changing anything if a file is not what it expects.
3. Restart the site; Ctrl+F5 in the browser.
4. Run Generate-Edge-Audio.bat to record Kani (Neerja). It does not need the Malar speech server.

What changed
- Header: tabs no longer run over the logo. Wide screens keep one row; narrower screens put the tabs on a second row.
- Lessons: the teacher list shows only voices that have audio for THAT lesson. A voice with none is not listed, and the lesson plays a voice that has audio (Kani first, then Malar).
  Admin > Classroom > Voice: "Show only the voices that have audio for this lesson" (on by default).
- Voices: Kani = Neerja (woman), Arul = Prabhat (man), both Indian English. Speed 0.92 in content\audio\voices.json (lower = slower).
  Existing Malar/priya2 audio is untouched. Stop recording priya2.
- apps\api\src\tools\build-audio.ts now also runs voices that start with "edge:" through tools\edge\edge_speak.py.
- The voices need internet only while recording. The MP3s are stored and served from our own site.
Undo: each changed file has a .before-edge-voices copy next to it.
