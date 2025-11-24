// assets/js/games.js
// Reusable quiz engine – just change the URL like: /game.html?g=capital_cities

const urlParams = new URLSearchParams(window.location.search);
const GAME_NAME = urlParams.get('g') || 'capital_cities'; // default fallback

let questions = [];
let current = 0;
let score = 0;
let startTime;
let timerInterval;

async function loadAndStart() {
  try {
    const basePath = "{{ '/assets/games/' | relative_url }}"; 
    const res = await fetch(basePath + GAME_NAME + ".json");
    
    if (!res.ok) throw new Error('Game not found');
    const data = await res.json();
    questions = shuffle(data.questions).slice(0, 10);
    startGame();
  } catch (err) {
    document.getElementById('question').innerHTML = `
      <p style="color:red;font-size:1.5em">
        Game "${GAME_NAME}" not found!<br><br>
        Check the URL or the file: assets/games/${GAME_NAME}.json
      </p>`;
  }
}

function startGame() {
  score = 0;
  current = 0;
  startTime = Date.now();
  document.getElementById('result').innerHTML = '';
  startTimer();
  showQuestion();
}

function startTimer() {
  timerInterval = setInterval(() => {
    const secs = Math.floor((Date.now() - startTime) / 1000);
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${m}:${s}`;
  }, 500);
}

function showQuestion() {
  if (current >= questions.length) {
    endGame();
    return;
  }

  const q = questions[current];
  document.getElementById('question').textContent = q.question;

  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';

  const options = shuffle([...q.incorrect_answers, q.correct_answer]);

  options.forEach(opt => {
    const btn = document.createElement('div');
    btn.className = 'answer';
    btn.textContent = opt;
    btn.onclick = () => choose(opt === q.correct_answer, btn);
    answersDiv.appendChild(btn);
  });
}

function choose(isCorrect, clickedBtn) {
  // disable all
  document.querySelectorAll('.answer').forEach(b => {
    b.style.pointerEvents = 'none';
    if (b.textContent === questions[current].correct_answer) {
      b.classList.add('correct');
    }
  });

  if (isCorrect) {
    score++;
    clickedBtn.classList.add('correct');
  } else {
    clickedBtn.classList.add('wrong');
  }

  setTimeout(() => {
    current++;
    showQuestion();
  }, 1300);
}

function endGame() {
  clearInterval(timerInterval);
  const totalSecs = Math.floor((Date.now() - startTime) / 1000);
  const m = String(Math.floor(totalSecs / 60)).padStart(2, '0');
  const s = String(totalSecs % 60).padStart(2, '0');

  document.getElementById('question').textContent = 'Finished!';
  document.getElementById('answers').innerHTML = '';
  document.getElementById('result').innerHTML = `
    <div>Score: <strong>${score}/10</strong></div>
    <div style="margin-top:20px">Time: <strong>${m}:${s}</strong></div>
    <button class="restart" onclick="loadAndStart()">Play Again</button>
  `;
}

// Fisher–Yates shuffle
function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Start automatically
window.addEventListener('DOMContentLoaded', loadAndStart);
