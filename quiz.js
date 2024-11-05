const quizContainer = document.getElementById("quiz-container");
const questionContainer = document.getElementById("question-container");
const answerContainer = document.getElementById("answer-container");
const timerDisplay = document.getElementById("time");
const explanationContainer = document.createElement("div");
const nextButton = document.createElement("button");

// Audio-Elemente für Sounds
const correctSound = document.getElementById("correct-sound");
const incorrectSound = document.getElementById("incorrect-sound");

let allQuestions = [];
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let correctCount = 0;
let timeLeft = 50 * 60; // 50 Minuten in Sekunden
let selectedAnswers = new Set();
let questionAnsweredIncorrectly = false;
let numberOfQuestions = 50;

async function loadQuestions() {
  try {
    const response = await fetch("questions100.json");
    if (!response.ok)
      throw new Error("JSON-Datei konnte nicht geladen werden.");
    allQuestions = await response.json();
    startQuiz();
  } catch (error) {
    console.error("Fehler beim Laden der Fragen:", error);
    questionContainer.innerText =
      "Fragen konnten nicht geladen werden. Bitte versuche es später erneut.";
  }
}

function selectRandomQuestions(allQuestions, numQuestions) {
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numQuestions);
}

function startQuiz() {
  score = 0;
  correctCount = 0;
  currentQuestionIndex = 0;
  timeLeft = 50 * 60;
  questionAnsweredIncorrectly = false;
  selectedAnswers.clear();

  questions = selectRandomQuestions(allQuestions, numberOfQuestions);

  nextButton.innerText = "Next";
  nextButton.classList.add("next-btn");
  nextButton.disabled = true;
  nextButton.onclick = nextQuestion;

  showQuestion(questions[currentQuestionIndex]);
  startTimer();
}

function showQuestion(questionObj) {
  questionContainer.innerText = "";
  questionContainer.innerHTML = `<pre>${questionObj.question}</pre>`;
  answerContainer.innerHTML = "";
  explanationContainer.innerHTML = "";
  selectedAnswers.clear();
  questionAnsweredIncorrectly = false;
  nextButton.disabled = true;

  Object.keys(questionObj.answers).forEach((key) => {
    const button = document.createElement("button");
    button.innerText = `${key.toUpperCase()}: ${questionObj.answers[key]}`;
    button.classList.add("answer-btn");
    button.addEventListener("click", () =>
      handleAnswerSelection(button, key, questionObj)
    );
    answerContainer.appendChild(button);
  });

  answerContainer.appendChild(nextButton);
}

function handleAnswerSelection(button, selectedAnswer, questionObj) {
  const normalizedSelectedAnswer = selectedAnswer.toLowerCase();
  const normalizedCorrectAnswers = questionObj.correctAnswer.map((answer) =>
    answer.toLowerCase()
  );

  const isCorrect = normalizedCorrectAnswers.includes(normalizedSelectedAnswer);

  if (isCorrect) {
    selectedAnswers.add(normalizedSelectedAnswer);
    button.classList.add("correct");

    correctSound.play();

    if (
      selectedAnswers.size === normalizedCorrectAnswers.length &&
      [...selectedAnswers].every((answer) =>
        normalizedCorrectAnswers.includes(answer)
      )
    ) {
      if (!questionAnsweredIncorrectly) {
        score++;
        correctCount++;
      }
      displayExplanation(questionObj.explanation);
      nextButton.disabled = false;
    }
  } else {
    button.classList.add("incorrect");
    questionAnsweredIncorrectly = true;

    incorrectSound.play();
  }
}

function displayExplanation(explanation) {
  explanationContainer.innerText = explanation;
  explanationContainer.classList.add("explanation");
  answerContainer.appendChild(explanationContainer);
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion(questions[currentQuestionIndex]);
  } else {
    endQuiz();
  }
}

function startTimer() {
  const timer = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.innerText = `${minutes}m ${
      seconds < 10 ? "0" : ""
    }${seconds}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      endQuiz();
    }
  }, 1000);
}

function endQuiz() {
  const totalQuestions = questions.length;
  const percentageScore = (correctCount / totalQuestions) * 100;
  const resultText = percentageScore >= 80 ? "Bestanden!" : "Nicht bestanden.";

  questionContainer.innerText = "Quiz beendet!";
  answerContainer.innerHTML = `
    <p>Du hast ${correctCount} von ${totalQuestions} Fragen richtig beantwortet.</p>
    <p>Punktestand: ${percentageScore.toFixed(2)}%</p>
    <p>${resultText}</p>
    <button id="restart-btn">Neustarten</button>
  `;

  timerDisplay.innerText = "";

  document.getElementById("restart-btn").addEventListener("click", () => {
    startQuiz();
  });
}

document.addEventListener("DOMContentLoaded", loadQuestions);
