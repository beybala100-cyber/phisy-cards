// Универсальный движок теста.
// Ожидает в DOM:
//   .quiz-data  — контейнер, в атрибуте data-questions — JSON с вопросами
//   #quizStage  — куда рендерить вопрос
//   #quizProgress, #quizCounter — индикаторы
//   #quizResult — блок с результатом
// Формат вопроса: { q: "текст", options: ["a","b","c"], correct: 1 }

(function () {
  const dataEl = document.querySelector('.quiz-data');
  if (!dataEl) return;

  let questions;
  try {
    questions = JSON.parse(dataEl.dataset.questions);
  } catch (e) {
    console.error('Не удалось прочитать вопросы теста', e);
    return;
  }

  const stage = document.getElementById('quizStage');
  const progressBar = document.getElementById('quizProgress');
  const counter = document.getElementById('quizCounter');
  const resultBox = document.getElementById('quizResult');
  if (!stage) return;

  let current = 0;
  let score = 0;
  let answered = false;

  function render() {
    answered = false;
    const q = questions[current];
    const pct = Math.round((current / questions.length) * 100);
    if (progressBar) progressBar.style.width = pct + '%';
    if (counter) counter.textContent = `Вопрос ${current + 1} из ${questions.length}`;

    const answersHtml = q.options.map((opt, i) => `
      <button class="answer" data-index="${i}">${opt}</button>
    `).join('');

    stage.innerHTML = `
      <p class="q-text">${q.q}</p>
      <div class="answers" id="answersBlock">${answersHtml}</div>
      <div class="feedback" id="qFeedback" aria-live="polite"></div>
      <div class="quiz-actions" id="quizActions" style="display:none;">
        <button class="btn" id="nextBtn">${current === questions.length - 1 ? 'Показать результат' : 'Следующий вопрос →'}</button>
      </div>
    `;

    const answersBlock = document.getElementById('answersBlock');
    const feedback = document.getElementById('qFeedback');
    const actions = document.getElementById('quizActions');

    answersBlock.querySelectorAll('.answer').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const idx = parseInt(btn.dataset.index, 10);
        const isCorrect = idx === q.correct;
        if (isCorrect) score++;
        answersBlock.querySelectorAll('.answer').forEach((b, i) => {
          b.disabled = true;
          if (i === q.correct) b.classList.add('correct');
        });
        if (!isCorrect) btn.classList.add('wrong');
        feedback.textContent = isCorrect ? 'Верно!' : 'Не совсем. Правильный ответ выделен.';
        feedback.className = 'feedback ' + (isCorrect ? 'ok' : 'bad');
        actions.style.display = 'flex';
      });
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
      if (current < questions.length - 1) {
        current++;
        render();
      } else {
        showResult();
      }
    });
  }

  function showResult() {
    stage.innerHTML = '';
    if (progressBar) progressBar.style.width = '100%';
    if (counter) counter.textContent = 'Тест завершён';
    const pct = Math.round((score / questions.length) * 100);
    let verdict;
    if (pct >= 85) verdict = 'Отлично! Тема усвоена.';
    else if (pct >= 60) verdict = 'Хорошо, но стоит повторить некоторые моменты.';
    else verdict = 'Стоит ещё раз обратиться к конспекту по этой теме.';

    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <h3>Результат</h3>
      <p class="result-score">Правильных ответов: <b>${score} из ${questions.length}</b> (${pct}%)</p>
      <p class="result-verdict">${verdict}</p>
      <div class="quiz-actions">
        <button class="btn secondary" id="restartBtn">Пройти заново</button>
      </div>
    `;
    document.getElementById('restartBtn').addEventListener('click', () => {
      current = 0;
      score = 0;
      resultBox.style.display = 'none';
      resultBox.innerHTML = '';
      render();
    });
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  render();
})();