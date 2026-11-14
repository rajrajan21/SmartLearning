# Ask Malar Teacher (Module 8)

A question helper inside lessons and after each practice answer. It works at zero cost with no key, and uses a language model only if one is set up on the server.

## How an answer is made
1. The child's text is screened first: personal details (phone, email, links, "my name is"), unsafe topics and prompt tricks are refused kindly and never sent anywhere. Worrying messages ("someone hurts me") get a caring answer with Childline 1098 (free, India), never a model answer.
2. The lesson is split into passages. The best passages for the question are found by word overlap (works for Tamil too).
3. **No key / AI off / daily limit reached / model failed:** the answer is taken straight from the stored lesson ("From your lesson: ..."). If the lesson has nothing on it the helper says it is not sure and suggests a teacher or parent. Before a practice question is answered it gives the authored hints one at a time.
4. **With a key:** the model is told to answer only from those lesson notes, in short simple sentences, in the child's language, with no links or personal questions; the child's words are fenced as data (`<child>` tags). Output is cleaned (no links or markdown, short) and labelled "Written by AI".

## Never leaks answers
A practice question's explanation is given to the model or the child only if that child (signed in, or this device) has already answered it. Before that: hints only.

## Turning a model on (free tiers exist)
Set three server environment variables for any OpenAI-compatible chat endpoint:
`TUTOR_API_URL` (e.g. the provider's `.../v1`), `TUTOR_API_KEY`, `TUTOR_MODEL`.
Nothing is sent to any AI service until all three are set and Admin > Ask the teacher > "Use the AI model" is on. What is sent: the lesson notes and the child's question and last few turns. Never the child's name, email, class or account.

## Limits and privacy
- 20 questions a minute per network address; AI answers per child per day (default 20, admin setting; guests are counted per network address). Answers taken straight from the lesson are not counted.
- Questions and answers are not stored (only a per-day counter). Cleared text lives in the browser tab only.

## Admin settings (Admin > Ask the teacher, and Features)
On/off, show in lessons, show in practice, use the AI model, label AI answers, AI answers per day, longest question, require sign-in, invitation wording.

## Known gaps
Most practice questions have 0 or 1 authored hint, so the no-AI helper has little to reveal before an answer. Writing a second hint for each question will improve this (content work).
