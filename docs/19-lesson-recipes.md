# Lesson recipes (the short way to build classroom lessons)

A recipe is a small JSON file in `content/recipes/` that describes one classroom lesson. `Build-Lessons.bat` turns every recipe into a full classroom lesson in `content/classroom/` and checks it against the rule book (docs/18). Audio then comes from `Generate-Lesson-Audio.bat`.

- `parts`: the pictures. Library pieces (`numberline`, `pie`, `fractionbar`, `dots`), plain texts (`label`) and anything else the board can draw (`raw`). New pieces go in `apps/api/src/tools/lessonkit/components.ts`.
- `steps`: what the teacher says (`say`: English, Tamil), what happens on the board (`do`: verb, picture, the word that triggers it) and an optional question (`q`).
- The compiler stops a lesson that breaks the rules: missing Tamil, a wrong option with no kind explanation, a picture that is never shown, duplicate options.
- Quality is not automatic: look at every new lesson on the board (the preview tool in apps/web/src/_preview) before it is published.
