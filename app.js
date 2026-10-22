/**
 * SinergIA - Asistente Educativo y Auditor de Prompts
 * Diseñado para usuarios comunes, con navegación sólida, preguntas universales
 * y prompt final 100% editable en fondo blanco.
 */

(function () {
  'use strict';

  // =========================================================================
  // ESTADO DE LA APLICACIÓN
  // =========================================================================
  const state = {
    currentUser: null,
    profileType: "student", // 'student' o 'teacher'
    topicName: "Historia Universal",
    educationLevel: "Secundaria / Bachillerato",
    sessionGoal: "Comprender los conceptos principales paso a paso con ejemplos claros",

    currentQuizPillar: 0,
    answersLog: [],

    // Elementos del prompt
    promptParts: {
      role: "",
      objective: "",
      context: "",
      instructions: "",
      limits: ""
    },

    finalPromptText: "",
    temperature: 0.0
  };

  // =========================================================================
  // PREGUNTAS DEL QUIZ (100% UNIVERSALES, SIN TECNICISMOS NI PROGRAMACIÓN)
  // =========================================================================
  function getUniversalQuestions() {
    const isTeacher = state.profileType === 'teacher';
    const topic = state.topicName || "el tema elegido";
    const level = state.educationLevel;
    const goal = state.sessionGoal || "aprender con claridad";

    return [
      {
        key: "role",
        stepTitle: "Paso 1: Quién es tu Asistente (Rol)",
        badgeText: "1. Rol",
        question: isTeacher
          ? `Para preparar tus clases sobre "${topic}", ¿qué función prefieres que cumpla el asistente contigo?`
          : `Para estudiar "${topic}", ¿qué tipo de trato y ayuda esperas recibir del asistente?`,
        tip: "Definir quién es el asistente asegura que hable con paciencia y con un tono adecuado a tu situación.",
        options: [
          {
            text: isTeacher
              ? "Un colega docente que me ayude a ordenar ideas, sugerir ejemplos y preparar explicaciones sencillas."
              : "Un tutor paciente que me explique paso a paso, use ejemplos cotidianos y me motive a pensar.",
            correct: true,
            feedback: "¡Excelente! Al pedirle que sea un tutor o colega paciente, el asistente se convierte en una compañía de aprendizaje y no intenta suplantarte."
          },
          {
            text: isTeacher
              ? "Una máquina que escriba todo de golpe sin que yo tenga que revisarlo ni adaptarlo a mis alumnos."
              : "Alguien que me dé directamente las tareas ya resueltas para solo copiarlas sin pensar.",
            correct: false,
            feedback: "Cuidado: Si el asistente hace todo por ti, no hay aprendizaje real. La tecnología debe ayudarte a comprender, no a copiar sin reflexionar."
          },
          {
            text: "No importa definir quién es; cualquier respuesta automática sirve igual.",
            correct: false,
            feedback: "Sin definir su rol, la IA suele responder con textos impersonales, fríos o demasiado complicados."
          }
        ],
        preset: isTeacher
          ? `Actúa como un colega docente y asesor pedagógico sobre "${topic}". Tu labor es ayudarme a diseñar explicaciones amenas y actividades claras para el nivel de ${level}.`
          : `Actúa como un tutor educativo paciente y comprensivo sobre "${topic}". Tu objetivo es explicarme con ejemplos sencillos y guiarme paso a paso.`
      },

      {
        key: "objective",
        stepTitle: "Paso 2: Qué buscas lograr (Objetivo)",
        badgeText: "2. Objetivo",
        question: `Para tu meta ("${goal}"), ¿cuál es el objetivo más claro que podemos darle al asistente?`,
        tip: "Un buen objetivo se enfoca en que tú entiendas a fondo el tema, no en acumular información inútil.",
        options: [
          {
            text: isTeacher
              ? `Ayudarme a estructurar el tema de "${topic}" para que mis alumnos lo comprendan sin saturarse.`
              : `Ayudarme a comprender los puntos clave de "${topic}" para que yo pueda explicarlos con mis propias palabras.`,
            correct: true,
            feedback: "¡Muy bien! Un objetivo centrado en comprender te da autonomía y asegura que domines el tema de verdad."
          },
          {
            text: "Escribir textos gigantescos con palabras complicadas para impresionar a la gente.",
            correct: false,
            feedback: "Lo complicado no es señal de sabiduría. La verdadera meta es hacer fácil y entendible lo que antes parecía difícil."
          },
          {
            text: "Adivinar preguntas sin importar si entendemos de dónde salieron.",
            correct: false,
            feedback: "La meta no es adivinar, sino construir un aprendizaje sólido y duradero."
          }
        ],
        preset: isTeacher
          ? `Objetivo: Ayudarme a organizar y desglosar "${topic}" para alcanzar esta meta: ${goal}.`
          : `Objetivo: Guiarme a comprender los conceptos clave de "${topic}" para que logre: ${goal}.`
      },

      {
        key: "context",
        stepTitle: "Paso 3: Tu situación y nivel (Contexto)",
        badgeText: "3. Contexto",
        question: `¿Por qué es importante indicarle que el nivel es "${level}"?`,
        tip: "El contexto le enseña al asistente desde qué nivel empezar, para que no use palabras inaccesibles ni tampoco explicaciones infantiles.",
        options: [
          {
            text: `Para que use un vocabulario accesible, ejemplos familiares y la dificultad justa para ${level}.`,
            correct: true,
            feedback: "¡Exacto! El contexto garantiza que la explicación esté a tu altura y te resulte atractiva y comprensible."
          },
          {
            text: "Para que la pantalla de la computadora gaste menos batería.",
            correct: false,
            feedback: "El contexto no tiene relación con el hardware, sino con la pedagogía y la claridad de la respuesta."
          },
          {
            text: "Da lo mismo; los asistentes saben todo mágicamente sin que les digas nada.",
            correct: false,
            feedback: "Falso. Los asistentes necesitan que les indiques el punto de partida para no desorientarte."
          }
        ],
        preset: `Contexto: La persona interesada está en el nivel de "${level}". El tema es "${topic}". Se requiere un lenguaje cercano, ordenado y libre de tecnicismos innecesarios.`
      },

      {
        key: "instructions",
        stepTitle: "Paso 4: Cómo responderte (Instrucciones)",
        badgeText: "4. Instrucciones",
        question: `¿Qué formato de respuesta te resulta más fácil de leer y estudiar sobre "${topic}"?`,
        tip: "Dividir la respuesta en 3 pasos sencillos (concepto, ejemplo y pregunta de repaso) es la mejor manera de aprender.",
        options: [
          {
            text: "1. Explicación breve de la idea central. 2. Un ejemplo de la vida real. 3. Una pregunta breve para comprobar si lo entendí.",
            correct: true,
            feedback: "¡La mejor estructura! Te permite entender la teoría, verla en la práctica y luego comprobar si te quedó clara."
          },
          {
            text: "Un solo párrafo interminable de 50 líneas sin puntos ni descansos.",
            correct: false,
            feedback: "Los párrafos eternos cansan la vista y hacen que se pierda la idea principal."
          },
          {
            text: "Que responda únicamente con 'sí' o 'no' sin dar ninguna explicación.",
            correct: false,
            feedback: "Eso no te permite aprender ni profundizar en nada."
          }
        ],
        preset: `Instrucciones paso a paso:
1. Explica la idea principal de forma breve y clara.
2. Da un ejemplo práctico o cotidiano sobre "${topic}".
3. Termina con una pregunta sencilla de comprobación para verificar que se comprendió el tema.`
      },

      {
        key: "limits",
        stepTitle: "Paso 5: Límites y Verdad (Rigor)",
        badgeText: "5. Límites",
        question: `Para cuidar la verdad y evitar datos inventados sobre "${topic}", ¿qué límite es indispensable ponerle?`,
        tip: "A veces la IA inventa respuestas si no las sabe. Es fundamental prohibirle que invente datos.",
        options: [
          {
            text: "Prohibirle terminantemente inventar datos, fechas o autores. Si no tiene certeza, debe decir con sinceridad: 'No tengo ese dato comprobado'.",
            correct: true,
            feedback: "¡Regla de oro del auditor! Admitir lo que no se sabe con honestidad es la mayor garantía de que no te engañen con información falsa."
          },
          {
            text: "Dejar que invente lo que sea con tal de que la respuesta se vea completa y bonita.",
            correct: false,
            feedback: "¡Muy peligroso! Estudiar con datos falsos genera errores y desinformación."
          },
          {
            text: "No ponerle ningún límite porque las computadoras son infalibles.",
            correct: false,
            feedback: "Falso. Los modelos de IA cometen errores con frecuencia si no se les imponen frenos de veracidad."
          }
        ],
        preset: `Límites y Cuidado de la Verdad:
- No inventes fechas, cifras, autores ni datos dudosos sobre "${topic}".
- Si no tienes la certeza de una información, di claramente: "No dispongo de ese dato comprobado".
- No des la respuesta final sin antes guiar el razonamiento. Respeta siempre el criterio del usuario.`
      }
    ];
  }

  // =========================================================================
  // REFERENCIAS DOM
  // =========================================================================
  const dom = {
    // Vistas
    viewWelcome: document.getElementById('view-welcome'),
    viewAuth: document.getElementById('view-auth'),
    viewTopicSetup: document.getElementById('view-topic-setup'),
    viewQuiz: document.getElementById('view-quiz'),
    viewLab: document.getElementById('view-lab'),

    // Navegación
    brandLogo: document.getElementById('brand-logo'),
    navStepTracker: document.getElementById('nav-step-tracker'),
    pillStep1: document.getElementById('pill-step-1'),
    pillStep2: document.getElementById('pill-step-2'),
    pillStep3: document.getElementById('pill-step-3'),
    userPill: document.getElementById('user-pill'),
    userNameDisplay: document.getElementById('user-name-display'),
    btnLogout: document.getElementById('btn-logout'),

    // Portada
    btnStartApp: document.getElementById('btn-start-app'),
    btnGuestEntry: document.getElementById('btn-guest-entry'),

    // Auth
    btnAuthBack: document.getElementById('btn-auth-back'),
    formAuth: document.getElementById('form-auth'),
    tabLogin: document.getElementById('tab-login'),
    tabRegister: document.getElementById('tab-register'),
    groupFullname: document.getElementById('group-fullname'),
    inputFullname: document.getElementById('input-fullname'),
    inputEmail: document.getElementById('input-email'),
    inputPassword: document.getElementById('input-password'),
    btnTogglePwd: document.getElementById('btn-toggle-pwd'),
    btnSubmitText: document.getElementById('btn-submit-text'),
    authTitle: document.getElementById('auth-title'),
    authSubtitle: document.getElementById('auth-subtitle'),
    errorEmail: document.getElementById('error-email'),
    errorPassword: document.getElementById('error-password'),

    // Paso 1: Tema
    btnTopicBackHome: document.getElementById('btn-topic-back-home'),
    roleStudent: document.getElementById('role-student'),
    roleTeacher: document.getElementById('role-teacher'),
    inputTopicName: document.getElementById('input-topic-name'),
    selectEducationLevel: document.getElementById('select-education-level'),
    inputTopicGoal: document.getElementById('input-topic-goal'),
    btnConfirmTopic: document.getElementById('btn-confirm-topic'),

    // Paso 2: Quiz
    quizPillarTitle: document.getElementById('quiz-pillar-title'),
    quizStepText: document.getElementById('quiz-step-text'),
    quizProgressFill: document.getElementById('quiz-progress-fill'),
    quizBadgeText: document.getElementById('quiz-badge-text'),
    quizQuestionTitle: document.getElementById('quiz-question-title'),
    quizSimpleTip: document.getElementById('quiz-simple-tip'),
    quizOptionsList: document.getElementById('quiz-options-list'),
    quizFeedbackBox: document.getElementById('quiz-feedback-box'),
    feedbackTitleText: document.getElementById('feedback-title-text'),
    feedbackExplanationText: document.getElementById('feedback-explanation-text'),
    inputLiveDraft: document.getElementById('input-live-draft'),
    btnApplyRecommended: document.getElementById('btn-apply-recommended'),
    btnQuizPrev: document.getElementById('btn-quiz-prev'),
    btnQuizNext: document.getElementById('btn-quiz-next'),
    btnQuizNextText: document.getElementById('btn-quiz-next-text'),

    // Paso 3: Asistente y Laboratorio
    btnLabBackQuiz: document.getElementById('btn-lab-back-quiz'),
    btnLabChangeTopic: document.getElementById('btn-lab-change-topic'),
    finalPromptTextarea: document.getElementById('final-prompt-textarea'),
    btnSavePrompt: document.getElementById('btn-save-prompt'),
    btnCopyPrompt: document.getElementById('btn-copy-prompt'),
    btnResetPrompt: document.getElementById('btn-reset-prompt'),

    // Temperatura
    sliderTemp: document.getElementById('slider-temp'),
    tempValBadge: document.getElementById('temp-val-badge'),
    tempExplanationBox: document.getElementById('temp-explanation-box'),

    // Dictamen
    badgeAuditScore: document.getElementById('badge-audit-score'),
    iconCrit1: document.getElementById('icon-crit-1'),
    textCrit1: document.getElementById('text-crit-1'),
    iconCrit2: document.getElementById('icon-crit-2'),
    textCrit2: document.getElementById('text-crit-2'),
    iconCrit3: document.getElementById('icon-crit-3'),
    textCrit3: document.getElementById('text-crit-3'),
    iconCrit4: document.getElementById('icon-crit-4'),
    textCrit4: document.getElementById('text-crit-4'),

    // Chat Sandbox
    badgeSandboxTopic: document.getElementById('badge-sandbox-topic'),
    chatBox: document.getElementById('chat-box'),
    chatInitialBubble: document.getElementById('chat-initial-bubble'),
    inputChat: document.getElementById('input-chat'),
    btnSendChat: document.getElementById('btn-send-chat'),

    // Toast
    appToast: document.getElementById('app-toast'),
    toastMessage: document.getElementById('toast-message')
  };

  // =========================================================================
  // ENRUTADOR DE VISTAS Y NAVEGACIÓN TOTALMENTE FUNCIONAL
  // =========================================================================
  function showView(viewId) {
    const allViews = [
      dom.viewWelcome,
      dom.viewAuth,
      dom.viewTopicSetup,
      dom.viewQuiz,
      dom.viewLab
    ];
    allViews.forEach(v => v.classList.remove('active'));

    if (viewId === 'welcome') {
      dom.viewWelcome.classList.add('active');
      setStepPills(0);
    } else if (viewId === 'auth') {
      dom.viewAuth.classList.add('active');
    } else if (viewId === 'topic') {
      dom.viewTopicSetup.classList.add('active');
      setStepPills(1);
    } else if (viewId === 'quiz') {
      dom.viewQuiz.classList.add('active');
      setStepPills(2);
      loadQuizQuestion(state.currentQuizPillar);
    } else if (viewId === 'lab') {
      dom.viewLab.classList.add('active');
      setStepPills(3);
      generateAndDisplayFinalPrompt();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setStepPills(stepNum) {
    if (stepNum === 0) {
      dom.navStepTracker.classList.add('hidden');
      return;
    }
    dom.navStepTracker.classList.remove('hidden');

    [dom.pillStep1, dom.pillStep2, dom.pillStep3].forEach((pill, idx) => {
      const current = idx + 1;
      pill.classList.remove('active', 'completed');
      if (current === stepNum) {
        pill.classList.add('active');
      } else if (current < stepNum) {
        pill.classList.add('completed');
      }
    });
  }

  // =========================================================================
  // NOTIFICACIONES TOAST
  // =========================================================================
  let toastTimer = null;
  function showNotice(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    dom.toastMessage.textContent = msg;
    dom.appToast.classList.remove('hidden');

    toastTimer = setTimeout(() => {
      dom.appToast.classList.add('hidden');
    }, 3200);
  }

  // =========================================================================
  // INICIO DE SESIÓN
  // =========================================================================
  let isRegister = false;

  function initAuth() {
    dom.tabLogin.addEventListener('click', () => toggleAuthTabs(false));
    dom.tabRegister.addEventListener('click', () => toggleAuthTabs(true));

    dom.btnAuthBack.addEventListener('click', () => showView('welcome'));

    dom.btnTogglePwd.addEventListener('click', () => {
      const type = dom.inputPassword.getAttribute('type') === 'password' ? 'text' : 'password';
      dom.inputPassword.setAttribute('type', type);
    });

    dom.formAuth.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = dom.inputEmail.value.trim();
      const pwd = dom.inputPassword.value;
      const name = dom.inputFullname.value.trim();

      dom.errorEmail.textContent = '';
      dom.errorPassword.textContent = '';

      let ok = true;
      if (!email || !email.includes('@')) {
        dom.errorEmail.textContent = 'Ingresa un correo electrónico válido.';
        ok = false;
      }
      if (!pwd || pwd.length < 6) {
        dom.errorPassword.textContent = 'La contraseña debe tener mínimo 6 caracteres.';
        ok = false;
      }

      if (!ok) return;

      const user = {
        name: isRegister && name ? name : (email.split('@')[0] || "Usuario"),
        email: email
      };
      setSession(user);
    });

    dom.btnLogout.addEventListener('click', () => {
      state.currentUser = null;
      localStorage.removeItem('sinergia_white_user');
      dom.userPill.classList.add('hidden');
      showNotice('Sesión cerrada.');
      showView('welcome');
    });

    const saved = localStorage.getItem('sinergia_white_user');
    if (saved) {
      try {
        setSession(JSON.parse(saved), false);
      } catch (e) {
        console.error(e);
      }
    }
  }

  function toggleAuthTabs(reg) {
    isRegister = reg;
    dom.tabLogin.classList.toggle('active', !reg);
    dom.tabRegister.classList.toggle('active', reg);
    dom.groupFullname.style.display = reg ? 'flex' : 'none';
    dom.authTitle.textContent = reg ? 'Crea tu Cuenta' : 'Acceso al Asistente';
    dom.authSubtitle.textContent = reg
      ? 'Regístrate para guardar tus temas de estudio y configuraciones.'
      : 'Ingresa tu correo y contraseña para guardar tu avance y tus temas de estudio.';
    dom.btnSubmitText.textContent = reg ? 'Crear Cuenta' : 'Entrar al Asistente';
  }

  function setSession(user, redirect = true) {
    state.currentUser = user;
    localStorage.setItem('sinergia_white_user', JSON.stringify(user));
    dom.userNameDisplay.textContent = user.name;
    dom.userPill.classList.remove('hidden');

    if (redirect) {
      showNotice(`Bienvenido/a, ${user.name}`);
      showView('topic');
    }
  }

  // =========================================================================
  // PASO 1: ELECCIÓN DE TEMA (SIN TECNICISMOS)
  // =========================================================================
  function initTopicSetup() {
    dom.btnTopicBackHome.addEventListener('click', () => showView('welcome'));

    dom.roleStudent.addEventListener('click', () => setRole('student'));
    dom.roleTeacher.addEventListener('click', () => setRole('teacher'));

    document.querySelectorAll('.topic-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.getAttribute('data-topic');
        dom.inputTopicName.value = t;
        showNotice(`Tema elegido: ${t}`);
      });
    });

    dom.btnConfirmTopic.addEventListener('click', () => {
      const topic = dom.inputTopicName.value.trim();
      const goal = dom.inputTopicGoal.value.trim();
      const level = dom.selectEducationLevel.value;

      if (!topic) {
        showNotice('Por favor escribe el tema que quieres estudiar.');
        dom.inputTopicName.focus();
        return;
      }

      state.topicName = topic;
      state.educationLevel = level;
      state.sessionGoal = goal || `Aprender los puntos principales de ${topic}`;

      // Reset prompt parts for fresh generation
      state.promptParts = { role: "", objective: "", context: "", instructions: "", limits: "" };
      state.currentQuizPillar = 0;
      state.answersLog = [];

      showNotice(`Tema configurado: ${state.topicName}`);
      showView('quiz');
    });
  }

  function setRole(role) {
    state.profileType = role;
    if (role === 'student') {
      dom.roleStudent.classList.add('selected');
      dom.roleTeacher.classList.remove('selected');
      dom.roleStudent.querySelector('.badge').className = 'badge badge-success';
      dom.roleStudent.querySelector('.badge').textContent = 'Seleccionado';
      dom.roleTeacher.querySelector('.badge').className = 'badge badge-neutral';
      dom.roleTeacher.querySelector('.badge').textContent = 'Elegir';
    } else {
      dom.roleTeacher.classList.add('selected');
      dom.roleStudent.classList.remove('selected');
      dom.roleTeacher.querySelector('.badge').className = 'badge badge-success';
      dom.roleTeacher.querySelector('.badge').textContent = 'Seleccionado';
      dom.roleStudent.querySelector('.badge').className = 'badge badge-neutral';
      dom.roleStudent.querySelector('.badge').textContent = 'Elegir';
    }
  }

  // =========================================================================
  // PASO 2: QUIZ EDUCATIVO CON BOTÓN DE REGRESO 100% OPERATIVO
  // =========================================================================
  function loadQuizQuestion(idx) {
    const questions = getUniversalQuestions();
    const q = questions[idx];
    if (!q) return;

    state.currentQuizPillar = idx;
    const total = questions.length;

    dom.quizPillarTitle.textContent = q.stepTitle;
    dom.quizStepText.textContent = `Pregunta ${idx + 1} de ${total}`;
    dom.quizProgressFill.style.width = `${((idx + 1) / total) * 100}%`;

    dom.quizBadgeText.textContent = q.badgeText;
    dom.quizQuestionTitle.textContent = q.question;
    dom.quizSimpleTip.innerHTML = `<strong>Consejo:</strong> ${q.tip}`;

    dom.quizOptionsList.innerHTML = '';
    dom.quizFeedbackBox.classList.add('hidden');
    dom.btnQuizNext.disabled = true;

    q.options.forEach((opt, optIdx) => {
      const letter = String.fromCharCode(65 + optIdx);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'option-button';
      b.innerHTML = `
        <span class="option-letter">${letter}</span>
        <span class="option-text">${opt.text}</span>
      `;
      b.addEventListener('click', () => chooseOption(idx, optIdx));
      dom.quizOptionsList.appendChild(b);
    });

    // Populate draft input
    dom.inputLiveDraft.value = state.promptParts[q.key] || q.preset;

    // BOTÓN ANTERIOR SIEMPRE HABILITADO
    // Si está en la pregunta 0, regresa a la vista de Tema (Paso 1).
    // Si está en la pregunta 1..4, regresa a la pregunta previa.
    dom.btnQuizPrev.disabled = false;
    dom.btnQuizNextText.textContent = (idx === total - 1) ? 'Terminar y Ver Asistente' : 'Siguiente Paso';

    // Si ya había respondido
    const prev = state.answersLog[idx];
    if (prev !== undefined) {
      revealFeedback(idx, prev);
    }
  }

  function chooseOption(qIdx, optIdx) {
    state.answersLog[qIdx] = optIdx;
    saveDraftFromLiveInput(qIdx);
    revealFeedback(qIdx, optIdx);
  }

  function revealFeedback(qIdx, optIdx) {
    const questions = getUniversalQuestions();
    const q = questions[qIdx];
    const sel = q.options[optIdx];

    const allButtons = dom.quizOptionsList.querySelectorAll('.option-button');
    allButtons.forEach((btn, i) => {
      btn.classList.remove('selected', 'correct', 'incorrect');
      if (i === optIdx) {
        btn.classList.add('selected');
        if (sel.correct) {
          btn.classList.add('correct');
        } else {
          btn.classList.add('incorrect');
        }
      }
      if (!sel.correct && q.options[i].correct) {
        btn.classList.add('correct');
      }
    });

    dom.quizFeedbackBox.classList.remove('hidden', 'favorable', 'corrective');
    if (sel.correct) {
      dom.quizFeedbackBox.classList.add('favorable');
      dom.feedbackTitleText.textContent = '¡Comprobación favorable!';
    } else {
      dom.quizFeedbackBox.classList.add('corrective');
      dom.feedbackTitleText.textContent = 'Observación pedagógica:';
    }
    dom.feedbackExplanationText.textContent = sel.feedback;

    dom.btnQuizNext.disabled = false;
  }

  function saveDraftFromLiveInput(qIdx) {
    const questions = getUniversalQuestions();
    const q = questions[qIdx];
    const val = dom.inputLiveDraft.value.trim();
    if (val) {
      state.promptParts[q.key] = val;
    }
  }

  function initQuizHandlers() {
    dom.btnApplyRecommended.addEventListener('click', () => {
      const questions = getUniversalQuestions();
      const q = questions[state.currentQuizPillar];
      dom.inputLiveDraft.value = q.preset;
      state.promptParts[q.key] = q.preset;
      showNotice('Sugerencia ideal aplicada.');
    });

    dom.inputLiveDraft.addEventListener('input', () => {
      saveDraftFromLiveInput(state.currentQuizPillar);
    });

    // BOTÓN ANTERIOR: Regresa al paso anterior con total certeza
    dom.btnQuizPrev.addEventListener('click', () => {
      saveDraftFromLiveInput(state.currentQuizPillar);
      if (state.currentQuizPillar === 0) {
        // Regresa a la pantalla de Tema (Paso 1)
        showView('topic');
      } else {
        // Regresa a la pregunta previa
        loadQuizQuestion(state.currentQuizPillar - 1);
      }
    });

    // BOTÓN SIGUIENTE
    dom.btnQuizNext.addEventListener('click', () => {
      saveDraftFromLiveInput(state.currentQuizPillar);
      const questions = getUniversalQuestions();
      if (state.currentQuizPillar < questions.length - 1) {
        loadQuizQuestion(state.currentQuizPillar + 1);
      } else {
        showNotice('¡Quiz completado con éxito!');
        showView('lab');
      }
    });
  }

  // =========================================================================
  // PASO 3: LABORATORIO CON PROMPT 100% EDITABLE Y BOTONES DE REGRESO
  // =========================================================================
  function generateAndDisplayFinalPrompt() {
    const questions = getUniversalQuestions();
    questions.forEach(q => {
      if (!state.promptParts[q.key]) {
        state.promptParts[q.key] = q.preset;
      }
    });

    // Si el usuario no ha editado el texto completo antes, compilarlo
    if (!state.finalPromptText || state.finalPromptText.trim() === '') {
      state.finalPromptText = `### INSTRUCCIONES DE MI ASISTENTE EDUCATIVO

1. ROL DEL ASISTENTE:
${state.promptParts.role}

2. OBJETIVO PRINCIPAL:
${state.promptParts.objective}

3. CONTEXTO:
${state.promptParts.context}

4. INSTRUCCIONES DE RESPUESTA:
${state.promptParts.instructions}

5. LÍMITES Y CUIDADO DE LA VERDAD:
${state.promptParts.limits}

[PARÁMETRO DE RIGOR]
Temperatura de trabajo: ${state.temperature.toFixed(1)} (Escala 0.0 a 1.0)`;
    }

    dom.finalPromptTextarea.value = state.finalPromptText;

    // Actualizar sliders y etiquetas
    dom.sliderTemp.value = state.temperature;
    updateTempFeedback(state.temperature);

    dom.badgeSandboxTopic.textContent = `Tema: ${state.topicName} (${state.educationLevel})`;
    dom.chatInitialBubble.textContent = `Hola. Ya tengo cargadas tus instrucciones sobre "${state.topicName}". ¿Qué pregunta o concepto te gustaría analizar primero?`;

    evaluateAuditorRules();
  }

  function updateTempFeedback(temp) {
    state.temperature = parseFloat(temp);
    dom.tempValBadge.textContent = `${state.temperature.toFixed(1)} ${state.temperature === 0.0 ? '(Rigor Máximo)' : state.temperature <= 0.5 ? '(Factual)' : '(Creativo)'}`;

    if (state.temperature === 0.0) {
      dom.tempExplanationBox.innerHTML = `
        <strong>Temperatura 0.0 (Rigor Máximo y Exactitud):</strong> La IA no inventa nada. Responde con datos comprobables, lógica paso a paso y rigor estricto. Ideal para aprender ciencias, historia, matemáticas y resolver dudas sin fallos.
      `;
    } else if (state.temperature <= 0.5) {
      dom.tempExplanationBox.innerHTML = `
        <strong>Temperatura ${state.temperature.toFixed(1)} (Equilibrado):</strong> Explicaciones fluidas con buen cuidado de los datos. Recuerda comprobar siempre fechas o fórmulas importantes.
      `;
    } else {
      dom.tempExplanationBox.innerHTML = `
        <strong>Temperatura ${state.temperature.toFixed(1)} (Creativo / Libre):</strong> Mayor variedad de vocabulario e historias libres, pero <strong>aumenta el riesgo de inventar datos falsos</strong>. No recomendable para exámenes ni datos exactos.
      `;
    }
  }

  function evaluateAuditorRules() {
    const text = dom.finalPromptTextarea.value.toLowerCase();
    const temp = state.temperature;

    let score = 0;

    // Criterio 1: Rol de apoyo
    if (text.includes('tutor') || text.includes('colega') || text.includes('asesor') || text.includes('guía') || text.includes('profesor') || text.includes('asistente')) {
      score += 25;
      setAuditorCrit(dom.iconCrit1, dom.textCrit1, true, "Rol claro de apoyo y enseñanza activa.");
    } else {
      setAuditorCrit(dom.iconCrit1, dom.textCrit1, false, "Define claramente que es un tutor o guía.");
    }

    // Criterio 2: Objetivo activo
    if (text.includes('comprender') || text.includes('aprender') || text.includes('explicar') || text.includes('guiar') || text.includes('resolver')) {
      score += 25;
      setAuditorCrit(dom.iconCrit2, dom.textCrit2, true, "Objetivo centrado en pensar y no en copiar.");
    } else {
      setAuditorCrit(dom.iconCrit2, dom.textCrit2, false, "El objetivo debe fomentar la comprensión.");
    }

    // Criterio 3: Freno a la invención de datos
    if (text.includes('invent') || text.includes('prohib') || text.includes('verdad') || text.includes('certeza') || text.includes('duda') || text.includes('comprob')) {
      score += 25;
      setAuditorCrit(dom.iconCrit3, dom.textCrit3, true, "Límites explícitos para no inventar información.");
    } else {
      setAuditorCrit(dom.iconCrit3, dom.textCrit3, false, "Incluye una regla que prohíba inventar datos.");
    }

    // Criterio 4: Rigor y Temperatura
    if (temp === 0.0) {
      score += 25;
      setAuditorCrit(dom.iconCrit4, dom.textCrit4, true, "Temperatura 0.0: Rigor absoluto sin alucinaciones.");
    } else if (temp <= 0.5) {
      score += 20;
      setAuditorCrit(dom.iconCrit4, dom.textCrit4, true, `Temperatura ${temp.toFixed(1)}: Buen balance pedagógico.`);
    } else {
      setAuditorCrit(dom.iconCrit4, dom.textCrit4, false, `Temperatura ${temp.toFixed(1)}: Riesgo de datos inventados.`);
    }

    dom.badgeAuditScore.textContent = `Calidad: ${score}/100`;
    dom.badgeAuditScore.className = score >= 80 ? 'badge badge-success' : 'badge badge-pomegranate';
  }

  function setAuditorCrit(iconEl, textEl, ok, msg) {
    if (ok) {
      iconEl.className = 'crit-icon passed';
      iconEl.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else {
      iconEl.className = 'crit-icon warning';
      iconEl.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    }
    textEl.textContent = msg;
  }

  function initLabHandlers() {
    // Botones de regreso superiores en el laboratorio
    dom.btnLabBackQuiz.addEventListener('click', () => showView('quiz'));
    dom.btnLabChangeTopic.addEventListener('click', () => showView('topic'));

    // Guardar cambios hechos a mano en el textarea
    dom.btnSavePrompt.addEventListener('click', () => {
      state.finalPromptText = dom.finalPromptTextarea.value;
      evaluateAuditorRules();
      showNotice('¡Cambios guardados en las instrucciones de tu asistente!');
    });

    // Copiar prompt
    dom.btnCopyPrompt.addEventListener('click', () => {
      const text = dom.finalPromptTextarea.value;
      navigator.clipboard.writeText(text).then(() => {
        showNotice('Prompt copiado al portapapeles.');
      }).catch(() => {
        showNotice('Selecciona el texto para copiarlo manualmente.');
      });
    });

    // Restablecer prompt
    dom.btnResetPrompt.addEventListener('click', () => {
      state.finalPromptText = "";
      generateAndDisplayFinalPrompt();
      showNotice('Texto restaurado al formato sugerido.');
    });

    // Slider de temperatura
    dom.sliderTemp.addEventListener('input', (e) => {
      updateTempFeedback(e.target.value);
      // Actualizar línea de temperatura en el textarea si existe
      let cur = dom.finalPromptTextarea.value;
      if (cur.includes('Temperatura de trabajo:')) {
        cur = cur.replace(/Temperatura de trabajo: [0-9.]+/g, `Temperatura de trabajo: ${state.temperature.toFixed(1)}`);
        dom.finalPromptTextarea.value = cur;
        state.finalPromptText = cur;
      }
      evaluateAuditorRules();
    });

    // Chat interactivo
    dom.btnSendChat.addEventListener('click', sendChatMessage);
    dom.inputChat.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendChatMessage();
    });
  }

  // =========================================================================
  // SIMULACIÓN DE CHAT EN TIEMPO REAL CON EL ASISTENTE CREADO
  // =========================================================================
  function sendChatMessage() {
    const text = dom.inputChat.value.trim();
    if (!text) return;

    addChatBubble(text, 'user');
    dom.inputChat.value = '';

    // Burbuja de espera
    const waitBubble = document.createElement('div');
    waitBubble.className = 'chat-bubble bubble-assistant';
    waitBubble.textContent = 'Analizando tu pregunta con las reglas de tu asistente...';
    dom.chatBox.appendChild(waitBubble);
    dom.chatBox.scrollTop = dom.chatBox.scrollHeight;

    setTimeout(() => {
      waitBubble.remove();
      const topic = state.topicName;
      const temp = state.temperature;

      let answer = "";
      let note = "";

      if (temp === 0.0) {
        answer = `
          <strong>Explicación guiada (Rigor Máximo T=0.0):</strong><br>
          Respecto a tu duda sobre <em>"${text}"</em> en el marco de <strong>${topic}</strong>:<br><br>
          1. <strong>Concepto básico:</strong> Partimos de la definición comprobable y verificada del tema.<br>
          2. <strong>Ejemplo concreto:</strong> Podemos observar cómo este principio se aplica directamente en un caso real.<br>
          3. <strong>Pregunta de comprobación:</strong> ¿Cómo resumirías este primer paso con tus propias palabras antes de seguir adelante?
        `;
        note = "Verificación: Información apegada estrictamente a fuentes documentales sin invenciones.";
      } else if (temp <= 0.5) {
        answer = `
          <strong>Explicación clara (Equilibrada T=${temp.toFixed(1)}):</strong><br>
          ¡Muy buena pregunta! En <strong>${topic}</strong>, cuando hablamos de <em>"${text}"</em>:<br><br>
          Imagina una situación cotidiana donde este concepto entra en juego. Lo importante es no memorizar de memoria, sino comprender la causa y el efecto.<br><br>
          ¿Qué parte de esta explicación te gustaría que exploremos más a fondo?
        `;
        note = "Criterio de veracidad: Explicación pedagógica balanceada.";
      } else {
        answer = `
          <strong>Respuesta abierta (Creativa T=${temp.toFixed(1)}):</strong><br>
          ¡Qué punto tan interesante sobre <em>"${text}"</em>! En <strong>${topic}</strong> hay muchas analogías e historias posibles que podemos explorar para inspirarte.<br><br>
          ¿Te gustaría que usemos una metáfora creativa para visualizarlo?
        `;
        note = "Aviso del auditor: Por la temperatura alta, corrobora siempre cualquier dato histórico o científico en libros formales.";
      }

      addChatBubble(answer, 'assistant', note);
    }, 450);
  }

  function addChatBubble(msg, sender, note = "") {
    const div = document.createElement('div');
    div.className = `chat-bubble bubble-${sender}`;
    div.innerHTML = msg;

    if (note) {
      const n = document.createElement('div');
      n.className = 'source-note';
      n.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${note}</span>
      `;
      div.appendChild(n);
    }

    dom.chatBox.appendChild(div);
    dom.chatBox.scrollTop = dom.chatBox.scrollHeight;
  }

  // =========================================================================
  // INICIALIZACIÓN GENERAL Y NAVEGACIÓN ENTRE PASOS
  // =========================================================================
  function init() {
    initAuth();
    initTopicSetup();
    initQuizHandlers();
    initLabHandlers();

    // Portada
    dom.btnStartApp.addEventListener('click', () => {
      if (state.currentUser) {
        showView('topic');
      } else {
        showView('auth');
      }
    });

    dom.btnGuestEntry.addEventListener('click', () => {
      setSession({
        name: "Invitado/a",
        email: "invitado@sinergia.org"
      });
    });

    // Logo principal
    dom.brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.currentUser) {
        showView('topic');
      } else {
        showView('welcome');
      }
    });

    // Botones de pasos en la barra superior (Completamente funcionales siempre)
    dom.pillStep1.addEventListener('click', () => showView('topic'));
    dom.pillStep2.addEventListener('click', () => {
      if (state.topicName) showView('quiz');
    });
    dom.pillStep3.addEventListener('click', () => {
      if (state.topicName) showView('lab');
    });
  }

  init();

})();
