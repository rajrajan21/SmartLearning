# Lesson content schema

The authoritative definition is the zod schema in `packages/shared/src/lesson.ts`. Both the API (on save/publish) and the web app (on render) use it.

A topic version contains an ordered list of **blocks**. Block types:

| type | purpose |
|---|---|
| `explanation` | Plain explanation, EN + TA text, keep-English terms |
| `story` | Short story that carries the concept |
| `worked_example` | Steps, each with reasoning |
| `image` / `diagram` | SVG or raster asset + alt text + caption (alt text mandatory) |
| `teacher_narration` | Malar Teacher script: list of sentences, each with audio key, board actions, optional checkpoint |
| `audio` | Standalone audio clip with transcript |
| `quiz` | Inline checkpoint referencing question IDs |
| `flashcards` | Term/definition pairs |
| `timeline`, `map` | Social-science patterns |
| `experiment` | Guided science activity: materials, steps, safety note, observe/explain prompts |
| `simulation` | Registered interactive component + parameters |
| `teach_back` | Prompt asking the student to explain; rubric of required ideas and common misconceptions |
| `summary` | Key points and formulas |

Every block has: `id`, `type`, `provenance` (`original | ai_drafted_reviewed | licensed | govt_open`), optional `objectiveIds`, and `i18n` text where relevant. Video and animation blocks are reserved types, not enabled yet.

## Teacher narration (audio now, video later)

```json
{
  "type": "teacher_narration",
  "teacher": "malar-english",
  "sentences": [
    { "id": "s1", "text": {"en": "Let's start with a pizza."}, "audioKey": null,
      "board": [{"op": "draw", "shape": "circle", "label": "pizza"}] ,
      "checkpoint": null }
  ]
}
```

`audioKey` is filled by the TTS batch job after approval. A future lip-sync clip is stored as `videoKey` on the same sentence ID, so nothing else changes.
