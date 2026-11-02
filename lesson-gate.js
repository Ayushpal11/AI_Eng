/*
 * Lesson access check for AI Engineering Course.
 *
 * Integration contract: call createLessonGate(...) from the course's existing
 * script, passing its lesson data and an onPass callback that opens/unlocks the
 * requested lesson. Existing lesson quiz items are used as the question bank.
 */
(function (global) {
  'use strict';

  const QUESTION_COUNT = 10;
  const PASS_COUNT = 5;
  const STYLE_ID = 'ai-eng-lesson-gate-styles';

  function collectQuestions(lessons) {
    return lessons.flatMap(lesson => (lesson.quiz || []).map(question => ({
      ...question,
      lessonTitle: lesson.title
    })));
  }

  function sampleQuestions(questions, count) {
    const pool = questions.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, Math.min(count, pool.length));
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .lesson-gate { display:flex; flex-direction:column; gap:16px; }
      .lesson-gate h2 { margin:0; }
      .lesson-gate .gate-intro, .lesson-gate .gate-feedback { color:var(--muted,#5a6272); }
      .lesson-gate .gate-question { font-size:1.2rem; font-weight:600; }
      .lesson-gate .gate-options { display:flex; flex-direction:column; gap:8px; }
      .lesson-gate .gate-option { text-align:left; padding:12px 14px; border:1px solid var(--line,#dce1ea); border-radius:10px; background:var(--surface,#fff); color:var(--ink,#161a22); cursor:pointer; }
      .lesson-gate .gate-option:hover { border-color:var(--acc,#5468ff); }
      .lesson-gate .gate-option:disabled { cursor:default; }
      .lesson-gate .gate-option.is-right { border-color:var(--good,#1f7a4d); }
      .lesson-gate .gate-option.is-wrong { border-color:var(--bad,#b3362f); }
      .lesson-gate .gate-actions { display:flex; gap:10px; flex-wrap:wrap; }
    `;
    document.head.appendChild(style);
  }

  function createLessonGate({ lessons, container, onPass, onCancel, renderMarkdown }) {
    if (!Array.isArray(lessons) || !container || typeof onPass !== 'function') {
      throw new TypeError('Lesson gate requires lessons, a container, and an onPass callback.');
    }
    const bank = collectQuestions(lessons);
    if (bank.length < QUESTION_COUNT) {
      throw new Error(`The lesson gate needs at least ${QUESTION_COUNT} quiz questions.`);
    }
    addStyles();

    let targetIndex = -1;
    let questions = [];
    let index = 0;
    let score = 0;
    let answered = false;

    const format = renderMarkdown || escapeHTML;
    const render = () => {
      const target = lessons[targetIndex];
      if (index >= questions.length) {
        const passed = score >= PASS_COUNT;
        container.innerHTML = `
          <section class="lesson-gate" aria-live="polite">
            <div class="step-kicker">Lesson access check</div>
            <h2>${passed ? 'Lesson unlocked' : 'Not quite yet'}</h2>
            <div class="gate-question">${score} / ${QUESTION_COUNT} correct</div>
            <p class="gate-feedback">${passed
              ? `You passed the check for ${escapeHTML(target.title)}.`
              : `You need at least ${PASS_COUNT} correct answers to open ${escapeHTML(target.title)}.`}</p>
            <div class="gate-actions">
              ${passed ? '<button class="btn pri" type="button" data-gate-open>Open lesson</button>' : '<button class="btn pri" type="button" data-gate-retry>Try another set</button>'}
              <button class="btn" type="button" data-gate-cancel>Back to course</button>
            </div>
          </section>`;
        return;
      }

      const question = questions[index];
      container.innerHTML = `
        <section class="lesson-gate" aria-live="polite">
          <div class="step-kicker">Lesson access check · ${index + 1} of ${QUESTION_COUNT}</div>
          <h2>Answer 10 questions to open ${escapeHTML(target.title)}</h2>
          <div class="gate-question">${format(question.q)}</div>
          <div class="gate-options" role="group" aria-label="Answer choices">
            ${question.options.map((option, choice) => `<button class="gate-option" type="button" data-gate-answer="${choice}">${format(option)}</button>`).join('')}
          </div>
          <p class="gate-feedback">${answered ? (question.explain ? format(question.explain) : (question.lessonTitle ? `From: ${escapeHTML(question.lessonTitle)}` : '')) : `Score: ${score} · 5 correct answers needed`}</p>
          ${answered ? '<div class="gate-actions"><button class="btn pri" type="button" data-gate-next>Next question</button></div>' : ''}
          <div class="gate-actions"><button class="btn" type="button" data-gate-cancel>Cancel</button></div>
        </section>`;

      if (answered) {
        container.querySelectorAll('[data-gate-answer]').forEach(button => {
          const choice = Number(button.dataset.gateAnswer);
          button.disabled = true;
          if (choice === question.correct) button.classList.add('is-right');
          else if (choice === question._picked) button.classList.add('is-wrong');
        });
      }
    };

    const begin = lessonIndex => {
      if (!Number.isInteger(lessonIndex) || !lessons[lessonIndex]) throw new RangeError('Unknown lesson index.');
      targetIndex = lessonIndex;
      questions = sampleQuestions(bank, QUESTION_COUNT);
      index = 0;
      score = 0;
      answered = false;
      render();
    };

    container.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button || !container.contains(button)) return;
      if (button.hasAttribute('data-gate-answer') && !answered) {
        const question = questions[index];
        const choice = Number(button.dataset.gateAnswer);
        question._picked = choice;
        if (choice === question.correct) score++;
        answered = true;
        render();
      } else if (button.hasAttribute('data-gate-next')) {
        index++;
        answered = false;
        render();
      } else if (button.hasAttribute('data-gate-retry')) {
        begin(targetIndex);
      } else if (button.hasAttribute('data-gate-open')) {
        onPass(targetIndex);
      } else if (button.hasAttribute('data-gate-cancel') && onCancel) {
        onCancel(targetIndex);
      }
    });

    return { begin };
  }

  global.createAILessonGate = createLessonGate;
})(window);
