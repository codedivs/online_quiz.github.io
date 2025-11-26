"use strict";

// Global game state
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval = null;
let seconds = 0;
let selectedQuestions = [];

// DOM Elements
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const startScreen = document.getElementById('startScreen');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const currentQEl = document.getElementById('currentQ');
const totalQEl = document.getElementById('totalQ');
const scoreEl = document.getElementById('score');
const finalTimeEl = document.getElementById('finalTime');
const timeEl = document.getElementById('time');
const gameTitleEl = document.getElementById('gameTitle') || document.querySelector('h1');
const startTitleEl = document.getElementById('startTitle');

// Extract game slug from URL: game.html?g=capital-cities
function getGameSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get('g') || 'capital-cities'; // fallback
}

const GAME_SLUG = getGameSlug();

// Update page title and UI
document.title = "Loading Game...";
if (gameTitleEl) gameTitleEl.textContent = "Loading...";
if (startTitleEl) startTitleEl.textContent = "Loading...";

// Load questions dynamically
fetch(`/assets/games/${GAME_SLUG}.json`)
  .then(res => {
    if (!res.ok) throw new Error(`Game not found: ${GAME_SLUG}`);
    return res.json();
  })
  .then(data => {
    questions = data;
    
    // Optional: Load game name from games_in_library.json for better title
    fetch('/games_in_library.json')
      .then(r => r.json())
      .then(library => {
        const game = library.find(g => g.game_id === GAME_SLUG);
        const gameName = game ? game.game_name : GAME_SLUG.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        
        document.title = `${gameName} - Quiz Game`;
        if (gameTitleEl) gameTitleEl.textContent = gameName;
        if (startTitleEl) startTitleEl.textContent = gameName;
        if (document.getElementById('startDesc')) {
          document.getElementById('startDesc').innerHTML = `Let's Go!!`;
        }
      })
      .catch(() => {
        // Fallback if library fails
        const niceName = GAME_SLUG.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        document.title = `${niceName} - Quiz Game`;
        if (gameTitleEl) gameTitleEl.textContent = niceName;
        if (startTitleEl) startTitleEl.textContent = niceName;
      });
      
    console.log(`Loaded ${questions.length} questions for ${GAME_SLUG}`);
  })
  .catch(err => {
    console.error(err);
    document.querySelector('.container').innerHTML = `
      <div style="text-align:center; padding: 4rem; color: #fff;">
        <h1>Game Not Found</h1>
        <p>Could not load <strong>${GAME_SLUG}</strong>.</p>
        <a href="/" class="btn-primary" style="margin-top: 1rem; display: inline-block;">Back to Games</a>
      </div>
    `;
  });

// === Quiz Logic Below (unchanged, just cleaned) ===

function startQuiz() {
  if (!questions || questions.length === 0) {
    alert("No questions loaded!");
    return;
  }
  score = 0;
  seconds = 0;
  currentQuestionIndex = 0;
  if (timerInterval) clearInterval(timerInterval);

  selectedQuestions = [...questions]
    .sort(() => 0.5 - Math.random())
    .slice(0, 10);

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
    btn.className = 'option';
    btn.textContent = option;
    btn.onclick = () => selectAnswer(i, btn);
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
  }, 1200);
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

// Event Listeners
document.getElementById('startBtn')?.addEventListener('click', startQuiz);
document.getElementById('playAgainBtn')?.addEventListener('click', startQuiz);
document.getElementById('restartBtn')?.addEventListener('click', startQuiz);
document.getElementById('cancelBtn')?.addEventListener('click', () => location.href = '/');
