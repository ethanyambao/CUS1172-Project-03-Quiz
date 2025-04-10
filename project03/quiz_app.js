const appState = {
  username: "",
  quizId: "",
  currentQuestion: 0,
  score: 0,
  total: 0,
  startTime: null,
  correctAnswer: "",
  isLastQuestion: false,
};

document.addEventListener("DOMContentLoaded", () => {
  update_view("#intro_view");
  Handlebars.registerHelper('ifCond', function (v1, v2, options) {
    return (v1 === v2) ? options.fn(this) : options.inverse(this);
  });

  document.querySelector("#widget_view").addEventListener("click", (e) => handle_event(e));
  document.querySelector("#widget_view").addEventListener("submit", (e) => handle_event(e));
});

function handle_event(e) {
  const id = e.target.id;
  const dataset = e.target.dataset;

  if (e.target.id === "start_form") {
    e.preventDefault();
    const nameInput = document.querySelector("#username");
    const quizInput = document.querySelector("#quiz_select");

    appState.username = nameInput.value;
    appState.quizId = quizInput.value;
    appState.currentQuestion = 0;
    appState.score = 0;
    appState.total = 0;
    appState.startTime = Date.now();
    load_question();
    return;
  }

  if (id === "submit-text-answer") {
    const input = document.querySelector("#text-response").value.trim().toLowerCase();
    const correct = appState.correctAnswer.toLowerCase();
    if (input === correct) {
      show_feedback("Correct!", false, true);
      appState.score++;
    } else {
      const content = isImageUrl(appState.correctAnswer)
        ? `<img src='${appState.correctAnswer}' class='img-fluid correct-answer-img' alt='Correct Answer Image'>`
        : `<span class='correct-answer'>${appState.correctAnswer}</span>`;
      show_feedback(`Incorrect. The correct answer is: ${content}`, true);
    }
  }

  if (dataset.answer) {
    if (dataset.answer === appState.correctAnswer) {
      show_feedback("Correct!", false, true);
      appState.score++;
    } else {
      const content = isImageUrl(appState.correctAnswer)
        ? `<img src='${appState.correctAnswer}' class='img-fluid correct-answer-img' alt='Correct Answer Image'>`
        : `<span class='correct-answer'>${appState.correctAnswer}</span>`;
      show_feedback(`Incorrect. The correct answer is: ${content}`, true);
    }
  }

  if (dataset.img) {
    if (e.target.alt === appState.correctAnswer) {
      show_feedback("Correct!", false, true);
      appState.score++;
    } else {
      const correctImage = document.querySelector(`img[alt='${appState.correctAnswer}']`);
      const content = correctImage
        ? `<img src='${correctImage.src}' class='img-fluid correct-answer-img' alt='Correct Answer Image'>`
        : `<span class='correct-answer'>${appState.correctAnswer}</span>`;
      show_feedback(`Incorrect. The correct answer is: ${content}`, true);
    }
  }  

  if (id === "got_it" || id === "next_question") {
    appState.currentQuestion++;
    load_question();
  }

  if (id === "restart_quiz") {
    update_view("#intro_view");
  }
}

async function load_question() {
  const url = `https://my-json-server.typicode.com/ethanyambao/CUS1172-Project-03-Quiz/${appState.quizId}/${appState.currentQuestion}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data || !data.text) {
    show_result();
    return;
  }

  appState.correctAnswer = data.answer;
  appState.isLastQuestion = appState.currentQuestion === 4;
  appState.total++;
  update_view("#question_view", {
    question: data,
    currentIndex: appState.currentQuestion + 1,
    total: 5
  });
}

function show_feedback(msg, isWrong = false, isCorrect = false) {
  update_view("#feedback_view", {
    feedback: msg,
    showButton: isWrong,
    isWrong: isWrong,
    isCorrect: isCorrect,
    showNext: isCorrect,
    isLastQuestion: appState.isLastQuestion
  });
}

function show_result() {
  const score = appState.score;
  const name = appState.username;
  const passed = score >= 4;
  const msg = passed ? `Congratulations ${name}! You pass the quiz` : `Sorry ${name}, try again.`;
  update_view("#result_view", {
    message: msg,
    score: `${score} / 5`
  });
}

function update_view(view, model = {}) {
  const template_source = document.querySelector(view).innerHTML;
  const template = Handlebars.compile(template_source);
  const html = template({ ...model, ...appState });
  document.querySelector("#widget_view").innerHTML = html;
}

function isImageUrl(url) {
  return /\.(jpeg|jpg|gif|png|svg|webp)$/i.test(url);
}
