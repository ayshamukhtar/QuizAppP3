let currentQuestion = 0;
let score = 0;
let quizData = [];
let timerInterval;
const TIME_LIMIT = 15;

function loadQuestion() {
  clearInterval(timerInterval);

  const q = quizData[currentQuestion];
  if (!q) return; // safeguard

  document.getElementById('question').innerText = q.question;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  startTimer();  

  ['A', 'B', 'C', 'D'].forEach(letter => {
    const btn = document.createElement('button');
    btn.classList.add('btn', 'btn-outline-warning', 'mb-2');
    btn.innerText = q[letter];
    btn.onclick = () => {
      clearInterval(timerInterval); // stop timer on answer
      const isCorrect = letter === q.answer;

      btn.classList.remove('btn-outline-warning');
      btn.classList.add(isCorrect ? 'correct' : 'wrong');

      if (isCorrect) score++;

      // Disable all buttons
      const allButtons = optionsDiv.querySelectorAll('button');
      allButtons.forEach(b => b.disabled = true);

      setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < quizData.length) {
          loadQuestion();
        } else {
          localStorage.setItem('score', score);
          window.location.href = 'results.html';
        }
      }, 800);
    };
    optionsDiv.appendChild(btn);
  });
}

function startTimer() {
  let timeRemaining = TIME_LIMIT;
  const timerDisplay = document.getElementById('timer');
  timerDisplay.textContent = `Time: ${timeRemaining}`;

  timerInterval = setInterval(() => {
    timeRemaining--;
    timerDisplay.textContent = `Time: ${timeRemaining}`;
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      currentQuestion++;
      if (currentQuestion < quizData.length) {
        loadQuestion();
      } else {
        localStorage.setItem('score', score);
        window.location.href = 'results.html';
      }
    }
  }, 1000);
}

async function loadQuizData() {
  try {
    const res = await fetch('questions.json');
    const fullData = await res.json();
    const selectedCount = parseInt(localStorage.getItem('numQuestions')) || 10;
    quizData = shuffleArray(fullData).slice(0, selectedCount);
    loadQuestion();
  } catch (error) {
    console.error('Error loading questions:', error);
    document.getElementById('question').innerText = "Failed to load questions.";
  }
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

window.onload = loadQuizData;


