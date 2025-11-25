let game.name = `/games_in_library.game.name`
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval = null;
let seconds = 0;
let selectedQuestions = [];

const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const currentQEl = document.getElementById('currentQ');
const totalQEl = document.getElementById('totalQ');
const scoreEl = document.getElementById('score');
const finalTimeEl = document.getElementById('finalTime');
const timeEl = document.getElementById('time');

// Load questions for the new game
fetch(`assets/games/${game.name}.json`)
  .then(res => res.json())
  .then(data => {
    questions = data;
    startQuiz();
  });

document.getElementById('playAgainBtn').addEventListener('click', startQuiz);
document.getElementById('restartBtn').addEventListener('click', startQuiz);
document.getElementById('cancelBtn').addEventListener('click', () => location.reload());

function startQuiz() {
  score = 0;
  seconds = 0;
  currentQuestionIndex = 0;

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  timeEl.textContent = '00:00';

  selectedQuestions = [...questions].sort(() => 0.5 - Math.random()).slice(0, 10);

  totalQEl.textContent = selectedQuestions.length;

  showScreen('quizScreen');
  startTimer();
  showQuestion();
}

function showQuestion() {
  if (currentQuestionIndex >= selectedQuestions.length) {
    endQuiz();
    return;
  }

  const q = selectedQuestions[currentQuestionIndex];
  currentQEl.textContent = currentQuestionIndex + 1;
  questionEl.textContent = q.question;
  optionsEl.innerHTML = '';

  q.options.forEach((option, i) => {
    const btn = document.createElement('div');
    btn.classList.add('option');
    btn.textContent = option;
    btn.addEventListener('click', () => selectAnswer(i, btn));
    optionsEl.appendChild(btn);
  });
}

function selectAnswer(selectedIndex, btn) {
  const correctIndex = selectedQuestions[currentQuestionIndex].answer;

  document.querySelectorAll('.option').forEach(b => b.style.pointerEvents = 'none');

  if (selectedIndex === correctIndex) {
    score++;
    btn.classList.add('correct');
  } else {
    btn.classList.add('wrong');
    document.querySelectorAll('.option')[correctIndex].classList.add('correct');
  }

  setTimeout(() => {
    currentQuestionIndex++;
    showQuestion();
  }, 1000);
}

function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    timeEl.textContent = `${mins}:${secs}`;
  }, 1000);
}

function endQuiz() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  showScreen('resultScreen');
  scoreEl.textContent = score;
  finalTimeEl.textContent = timeEl.textContent;
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}
