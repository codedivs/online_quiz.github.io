let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let seconds = 0;

const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const currentQEl = document.getElementById('currentQ');
const totalQEl = document.getElementById('totalQ');
const scoreEl = document.getElementById('score');
const finalTimeEl = document.getElementById('finalTime');
const timeEl = document.getElementById('time');

let selectedQuestions = [];

// Load questions
fetch((`assets/games/${gameName}.json`)
  .then(res => res.json())
  .then(data => {
    questions = data;
  });

// Start Quiz
document.getElementById('startBtn').addEventListener('click', startQuiz);
document.getElementById('playAgainBtn').addEventListener('click', startQuiz);
document.getElementById('restartBtn').addEventListener('click', startQuiz);
document.getElementById('cancelBtn').addEventListener('click', () => {
  location.reload();
});

function startQuiz() {
  score = 0;
  seconds = 0;
  currentQuestionIndex = 0;

  // Pick 15 random questions
  selectedQuestions = [...questions]
    .sort(() => 0.5 - Math.random())
    .slice(0, 15);

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

  // Disable all options
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
  clearInterval(timerInterval);
  showScreen('resultScreen');
  scoreEl.textContent = score;
  finalTimeEl.textContent = timeEl.textContent;
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}
