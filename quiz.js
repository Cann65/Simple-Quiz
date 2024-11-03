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
let timeLeft = 50 * 60; // 200 Minuten in Sekunden
let selectedAnswers = new Set();
let questionAnsweredIncorrectly = false;
let numberOfQuestions = 50;

// Funktion zum Laden der Fragen aus der JSON-Datei und Zufallsauswahl von 50 Fragen
async function loadQuestions() {
  try {
    const response = await fetch("questions100.json");
    allQuestions = await response.json();
    startQuiz();
  } catch (error) {
    console.error("Fehler beim Laden der Fragen:", error);
  }
}

// Funktion zum zufälligen Auswählen von Fragen
function selectRandomQuestions(allQuestions, numQuestions) {
  const shuffled = allQuestions.sort(() => 0.5 - Math.random()); // Zufällig mischen
  return shuffled.slice(0, numQuestions); // Die ersten numQuestions auswählen
}

function startQuiz() {
  // Alle Variablen zurücksetzen
  score = 0;
  correctCount = 0;
  currentQuestionIndex = 0;
  timeLeft = 50 * 60;
  questionAnsweredIncorrectly = false;
  selectedAnswers.clear();

  // Wählt 50 zufällige Fragen
  questions = selectRandomQuestions(allQuestions, numberOfQuestions);

  // Event-Listener nur einmal hinzufügen
  nextButton.innerText = "Next";
  nextButton.classList.add("next-btn");
  nextButton.disabled = true;
  nextButton.onclick = nextQuestion; // Event-Listener nur einmal setzen

  showQuestion(questions[currentQuestionIndex]);
  startTimer();
}

function showQuestion(questionObj) {
  questionContainer.innerText = questionObj.question;
  answerContainer.innerHTML = "";
  explanationContainer.innerHTML = ""; // Erklärung zurücksetzen
  selectedAnswers.clear();
  questionAnsweredIncorrectly = false;
  nextButton.disabled = true;

  Object.keys(questionObj.answers).forEach((key) => {
    const button = document.createElement("button");
    button.innerText = `${key}: ${questionObj.answers[key]}`;
    button.classList.add("answer-btn");
    button.addEventListener("click", () =>
      handleAnswerSelection(button, key, questionObj)
    );
    answerContainer.appendChild(button);
  });

  answerContainer.appendChild(nextButton);
}

function handleAnswerSelection(button, selectedAnswer, questionObj) {
  const isCorrect = questionObj.correctAnswer.includes(selectedAnswer);

  if (isCorrect) {
    selectedAnswers.add(selectedAnswer);
    button.classList.add("correct");

    // Richtig-Audio abspielen
    correctSound.play();

    // Prüfen, ob alle richtigen Antworten ausgewählt wurden
    if (
      selectedAnswers.size === questionObj.correctAnswer.length &&
      [...selectedAnswers].every((answer) =>
        questionObj.correctAnswer.includes(answer)
      )
    ) {
      // Nur Punkt geben, wenn keine falsche Antwort vorher gewählt wurde
      if (!questionAnsweredIncorrectly) {
        score++;
        correctCount++;
      }

      // Erklärung anzeigen und "Next"-Button aktivieren
      displayExplanation(questionObj.explanation);
      nextButton.disabled = false;
    }
  } else {
    // Markiere die Antwort als falsch und setze die Frage auf "falsch beantwortet"
    button.classList.add("incorrect");
    questionAnsweredIncorrectly = true;

    // Falsch-Audio abspielen
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
    timerDisplay.innerText = `${minutes}m ${seconds}s`;
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

// Lade die Fragen, sobald das Dokument bereit ist
document.addEventListener("DOMContentLoaded", loadQuestions);
