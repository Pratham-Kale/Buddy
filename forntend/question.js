let currentQuestion = 0;
let totalQuestions = 10;

// start
function startQuestions() {
    document.getElementById("intro").classList.add("hidden");
    document.getElementById("questionBox").classList.remove("hidden");
    createDots();
    showQuestion();
}

// create dots
function createDots() {
    let container = document.getElementById("dotsContainer");
    container.innerHTML = "";

    for (let i = 0; i < totalQuestions; i++) {
        let dot = document.createElement("span");
        dot.classList.add("dot");

        dot.addEventListener("click", () => {
            currentQuestion = i;
            showQuestion();
        });

        container.appendChild(dot);
    }
}

// show question
function showQuestion() {
    document.getElementById("questionText").innerText =
        "Question " + (currentQuestion + 1);

    let dots = document.querySelectorAll(".dot");
    dots.forEach(dot => dot.classList.remove("active"));
    dots[currentQuestion].classList.add("active");
}

// next
function nextQuestion() {
    if (currentQuestion < totalQuestions - 1) {
        currentQuestion++;
        showQuestion();
    }
}

// prev
function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
}