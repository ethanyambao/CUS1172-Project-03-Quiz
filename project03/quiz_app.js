// quiz_app.js

const appState = {
  username: "",
  quizId: "",
  currentQuestion: 0,
  score: 0,
  total: 0,
  startTime: null,
  correctAnswer: "",
};

document.addEventListener("DOMContentLoaded", () => {
  update_view("#intro_view");
  Handlebars.registerHelper('ifCond', function (v1, v2, options) {
    return (v1 === v2) ? options.fn(this) : options.inverse(this);
  });
  document.querySelector("#widget_view").onclick = (e) => handle_event(e);
});

function handle_event(e) {
  const id = e.target.id;
  const dataset = e.target.dataset;

  if (id === "start_quiz") {
    appState.username = document.querySelector("#username").value;
    appState.quizId = document.querySelector("#quiz_select").value;
    appState.currentQuestion = 0;
    appState.score = 0;
    appState.total = 0;
    appState.startTime = Date.now();
    load_question();
  }

  if (id === "submit-text-answer") {
    const input = document.querySelector("#text-response").value.trim().toLowerCase();
    const correct = appState.correctAnswer.toLowerCase();
    if (input === correct) {
      show_feedback("Awesome!");
      appState.score++;
      setTimeout(() => {
        appState.currentQuestion++;
        load_question();
      }, 1000);
    } else {
      show_feedback(`Correct answer is: ${appState.correctAnswer}`, true);
    }
  }

  if (dataset.answer) {
    if (dataset.answer === appState.correctAnswer) {
      show_feedback("Brilliant!");
      appState.score++;
      setTimeout(() => {
        appState.currentQuestion++;
        load_question();
      }, 1000);
    } else {
      show_feedback(`Correct answer is: ${appState.correctAnswer}`, true);
    }
  }

  if (dataset.img) {
    if (dataset.img === appState.correctAnswer) {
      show_feedback("Good work!");
      appState.score++;
      setTimeout(() => {
        appState.currentQuestion++;
        load_question();
      }, 1000);
    } else {
      show_feedback("That was not the correct image.", true);
    }
  }

  if (id === "got_it") {
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
  appState.total++;
  update_view("#question_view", {
    question: data,
    currentIndex: appState.currentQuestion + 1,
    total: 5
  });
}

function show_feedback(msg, isWrong = false) {
  update_view("#feedback_view", {
    feedback: msg,
    showButton: isWrong
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
