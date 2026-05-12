    // ── QUESTIONS DATA ────────────────────────────────────
    const questions = [
      {
        q: "What does <code>typeof null</code> return in JavaScript?",
        options: ["null", "undefined", "object", "boolean"],
        answer: 2,
        explanation: "// BUG: typeof null === 'object' — a famous JS quirk since 1995!"
      },
      {
        q: "Which method converts a JSON string into a JavaScript object?",
        options: ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.objectify()"],
        answer: 1,
        explanation: "// JSON.parse() parses a string → JS object."
      },
      {
        q: "What is the output of <code>[] + []</code>?",
        options: ["[]", "0", '""', "undefined"],
        answer: 2,
        explanation: '// [] + [] = "" — both arrays coerce to empty strings!'
      },
      {
        q: "Which keyword declares a block-scoped variable that cannot be reassigned?",
        options: ["var", "let", "const", "static"],
        answer: 2,
        explanation: "// const = constant reference. Can't reassign, but object props can change."
      },
      {
        q: "What does the <code>===</code> operator check?",
        options: ["Value only", "Type only", "Value and Type", "Reference only"],
        answer: 2,
        explanation: "// === is strict equality — checks both value AND type. No coercion!"
      },
      {
        q: "What is a closure in JavaScript?",
        options: [
          "A function that returns a promise",
          "A function with access to its outer scope even after the outer function has returned",
          "A method to close browser windows",
          "An IIFE"
        ],
        answer: 1,
        explanation: "// Closures remember the scope where they were created. Powerful pattern!"
      },
      {
        q: "Which Array method returns a NEW array without modifying the original?",
        options: ["push()", "splice()", "map()", "sort()"],
        answer: 2,
        explanation: "// map() returns a new array. push/splice/sort mutate the original."
      },
      {
        q: "What does <code>async/await</code> work on top of?",
        options: ["Callbacks", "Promises", "setTimeout", "Generators"],
        answer: 1,
        explanation: "// async/await is syntactic sugar over Promises. Much cleaner syntax!"
      },
      {
        q: "What is the result of <code>0.1 + 0.2 === 0.3</code>?",
        options: ["true", "false", "undefined", "NaN"],
        answer: 1,
        explanation: "// false! Floating point precision issue: 0.1 + 0.2 = 0.30000000000000004"
      },
      {
        q: "Which method removes the LAST element from an array?",
        options: ["shift()", "unshift()", "pop()", "splice()"],
        answer: 2,
        explanation: "// pop() removes last. shift() removes first. Easy to mix up!"
      },
      {
        q: "What does <code>event.preventDefault()</code> do?",
        options: [
          "Stops event bubbling",
          "Removes the event listener",
          "Prevents the default browser action for that event",
          "Clears the event queue"
        ],
        answer: 2,
        explanation: "// preventDefault() stops default actions like form submit or link navigation."
      },
      {
        q: "In the browser, what does <code>localStorage</code> store data as?",
        options: ["JSON", "Objects", "Strings", "Numbers"],
        answer: 2,
        explanation: "// localStorage only stores strings! Use JSON.stringify/parse for objects."
      },
      {
        q: "Which symbol is used for arrow functions?",
        options: ["->", "=>", "::", ">>"],
        answer: 1,
        explanation: "// => is the fat arrow. A common beginner mistake: -> is not valid JS!"
      },
      {
        q: "What does the <code>spread operator</code> (<code>...</code>) do?",
        options: [
          "Creates a deep copy of an object",
          "Expands an iterable into individual elements",
          "Merges two functions",
          "Declares rest parameters only"
        ],
        answer: 1,
        explanation: "// Spread unpacks iterables: [...arr1, ...arr2] merges arrays!"
      },
      {
        q: "Which of these is NOT a falsy value in JavaScript?",
        options: ["0", '""', "[]", "null"],
        answer: 2,
        explanation: "// [] is TRUTHY! Empty arrays/objects are truthy. Only primitives like 0, '', null, undefined, NaN, false are falsy."
      }
    ];

    // ── STATE ─────────────────────────────────────────────
    let currentQ   = 0;
    let score      = 0;
    let wrong      = 0;
    let skipped    = 0;
    let answered   = false;
    let timer      = null;
    let timeLeft   = 20;
    const TIMER_MAX = 20;

    // ── DOM REFS ──────────────────────────────────────────
    const startScreen    = document.getElementById('startScreen');
    const quizScreen     = document.getElementById('quizScreen');
    const scoreScreen    = document.getElementById('scoreScreen');
    const startBtn       = document.getElementById('startBtn');
    const nextBtn        = document.getElementById('nextBtn');
    const restartBtn     = document.getElementById('restartBtn');
    const progressFill   = document.getElementById('progressFill');
    const progressText   = document.getElementById('progressText');
    const scoreText      = document.getElementById('scoreText');
    const timerFill      = document.getElementById('timerFill');
    const timerCount     = document.getElementById('timerCount');
    const questionNum    = document.getElementById('questionNum');
    const questionText   = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const feedback       = document.getElementById('feedback');
    const finalScore     = document.getElementById('finalScore');
    const finalTotal     = document.getElementById('finalTotal');
    const scoreGrade     = document.getElementById('scoreGrade');
    const statCorrect    = document.getElementById('statCorrect');
    const statWrong      = document.getElementById('statWrong');
    const statSkipped    = document.getElementById('statSkipped');

    // ── KEYS ──────────────────────────────────────────────
    const KEYS = ['A', 'B', 'C', 'D'];

    // ── HELPERS ───────────────────────────────────────────
    function padNum(n) { return String(n).padStart(3, '0'); }

    function getGrade(s, total) {
      const pct = (s / total) * 100;
      if (pct === 100) return { label: 'S — PERFECT', cls: 'grade-S' };
      if (pct >= 80)   return { label: 'A — EXCELLENT', cls: 'grade-A' };
      if (pct >= 60)   return { label: 'B — GOOD', cls: 'grade-B' };
      if (pct >= 40)   return { label: 'C — AVERAGE', cls: 'grade-C' };
      return              { label: 'F — TRY AGAIN', cls: 'grade-F' };
    }

    // ── TIMER ─────────────────────────────────────────────
    function startTimer() {
      clearInterval(timer);
      timeLeft = TIMER_MAX;
      updateTimerUI();
      timer = setInterval(() => {
        timeLeft--;
        updateTimerUI();
        if (timeLeft <= 0) {
          clearInterval(timer);
          handleTimeout();
        }
      }, 1000);
    }

    function updateTimerUI() {
      const pct = (timeLeft / TIMER_MAX) * 100;
      timerFill.style.width = pct + '%';
      timerCount.textContent = timeLeft;
      timerFill.className = 'timer-fill';
      if (timeLeft <= 5)  timerFill.classList.add('danger');
      else if (timeLeft <= 10) timerFill.classList.add('warn');
    }

    function handleTimeout() {
      skipped++;
      answered = true;
      disableOptions();
      // highlight correct answer
      const opts = optionsContainer.querySelectorAll('.option');
      opts[questions[currentQ].answer].classList.add('correct');
      feedback.textContent = '// TIME_OUT — ' + questions[currentQ].explanation;
      feedback.className = 'feedback wrong';
      nextBtn.classList.add('visible');
    }

    // ── RENDER QUESTION ───────────────────────────────────
    function renderQuestion() {
      answered = false;
      feedback.textContent = '';
      feedback.className = 'feedback';
      nextBtn.classList.remove('visible');

      const q = questions[currentQ];
      const total = questions.length;

      // Progress
      progressText.textContent = `Q ${currentQ + 1} / ${total}`;
      scoreText.textContent    = `SCORE: ${score}`;
      progressFill.style.width = ((currentQ / total) * 100) + '%';
      questionNum.textContent  = `// Q_${padNum(currentQ + 1)}`;
      questionText.innerHTML   = q.q;

      // Options
      optionsContainer.innerHTML = '';
      q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option';
        btn.innerHTML = `<span class="option-key">${KEYS[i]}</span>${opt}`;
        btn.addEventListener('click', () => handleAnswer(i));
        optionsContainer.appendChild(btn);
      });

      startTimer();
    }

    // ── HANDLE ANSWER ─────────────────────────────────────
    function handleAnswer(selected) {
      if (answered) return;
      answered = true;
      clearInterval(timer);

      const q = questions[currentQ];
      const opts = optionsContainer.querySelectorAll('.option');

      disableOptions();

      if (selected === q.answer) {
        opts[selected].classList.add('correct');
        score++;
        scoreText.textContent = `SCORE: ${score}`;
        feedback.textContent  = '// CORRECT — ' + q.explanation;
        feedback.className    = 'feedback correct';
      } else {
        opts[selected].classList.add('wrong');
        opts[q.answer].classList.add('correct');
        wrong++;
        feedback.textContent = '// WRONG — ' + q.explanation;
        feedback.className   = 'feedback wrong';
      }

      nextBtn.classList.add('visible');
    }

    function disableOptions() {
      optionsContainer.querySelectorAll('.option').forEach(btn => {
        btn.disabled = true;
      });
    }

    // ── NEXT QUESTION ─────────────────────────────────────
    function nextQuestion() {
      currentQ++;
      if (currentQ >= questions.length) {
        showScore();
      } else {
        renderQuestion();
      }
    }

    // ── SHOW SCORE ────────────────────────────────────────
    function showScore() {
      clearInterval(timer);
      quizScreen.style.display = 'none';
      scoreScreen.classList.add('visible');

      const grade = getGrade(score, questions.length);
      finalScore.textContent = score;
      finalTotal.textContent = `/ ${questions.length} correct`;
      scoreGrade.textContent = grade.label;
      scoreGrade.className   = `score-grade ${grade.cls}`;
      statCorrect.textContent = score;
      statWrong.textContent   = wrong;
      statSkipped.textContent = skipped;
    }

    // ── RESTART ───────────────────────────────────────────
    function restartQuiz() {
      currentQ = 0; score = 0; wrong = 0; skipped = 0;
      scoreScreen.classList.remove('visible');
      quizScreen.style.display = 'block';
      renderQuestion();
    }

    // ── START ─────────────────────────────────────────────
    function startQuiz() {
      startScreen.style.display = 'none';
      quizScreen.style.display  = 'block';
      renderQuestion();
    }

    // ── KEYBOARD SHORTCUTS ────────────────────────────────
    document.addEventListener('keydown', (e) => {
      if (!answered) {
        if (e.key === 'a' || e.key === 'A') handleAnswer(0);
        if (e.key === 'b' || e.key === 'B') handleAnswer(1);
        if (e.key === 'c' || e.key === 'C') handleAnswer(2);
        if (e.key === 'd' || e.key === 'D') handleAnswer(3);
      }
      if (e.key === 'Enter' && answered) nextQuestion();
    });

    // ── EVENTS ────────────────────────────────────────────
    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', nextQuestion);
    restartBtn.addEventListener('click', restartQuiz);
  