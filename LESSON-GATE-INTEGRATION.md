# Lesson access gate integration

The course stores its 41 lessons and their existing multiple-choice questions in `AI Engineering Course.html`. `lesson-gate.js` provides a reusable 10-question gate that randomly selects 10 existing quiz questions, requires at least 5 correct answers, and then calls the course's lesson-opening callback.

To activate the gate in the course page:

1. Load `lesson-gate.js` from the course HTML (for a local copy, add `<script src="lesson-gate.js"></script>` before the course's main inline script).
2. In the main course script, create the gate after `LS` and the `#view` element are available:

   ```js
   const lessonGate = createAILessonGate({
     lessons: LS,
     container: $('#view'),
     onPass: i => openLesson(i),
     onCancel: () => render(true)
   });
   ```

3. In `openLesson(i)`, replace the current locked-lesson early return with a call to `lessonGate.begin(i)` and return. For example, change the existing check to:

   ```js
   if (!unlocked(i)) { lessonGate.begin(i); return; }
   ```

   To permit direct access after a successful check without marking previous lessons passed, record successful gate unlocks separately in saved state and include that record in `unlocked(i)` (for example, `S.gateUnlocked[i]`). Set that entry in the `onPass` callback before calling `openLesson(i)`.

This keeps course completion separate from the access-check result: passing the gate opens the selected lesson but does not award completion for lessons the learner has not passed.
