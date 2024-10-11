const pubnub = new PubNub({
  publishKey: "pub-c-a31ed9a8-8e6e-4c94-9229-3a2f94d4cf02", // Replace with your PubNub publish key
  subscribeKey: "sub-c-8a324682-fdc4-43c3-8308-f76b6410eb1d", // Replace with your PubNub subscribe key
});

const usernameInput = document.getElementById("username");
const joinBtn = document.getElementById("joinBtn");
const questionSection = document.getElementById("questionSection");
const answerSection = document.getElementById("answerSection");
const questionInput = document.getElementById("question");
const askBtn = document.getElementById("askBtn");
const answerInput = document.getElementById("answer");
const answerBtn = document.getElementById("answerBtn");
const messageLog = document.getElementById("messageLog");
const shareLink = document.getElementById("shareLink");
let currentChannel = "";
let role = "res";

// If the URL contains a channel and role, handle the questioner's flow
const queryParams = new URLSearchParams(window.location.search);
const isQuestioner =
  queryParams.has("channel") && queryParams.get("role") === "ques";

// Generate a random channel name
function generateRandomChannel() {
  return "channel_" + Math.random().toString(36).substring(2, 10);
}

// Join the randomly generated channel as responder
joinBtn.addEventListener("click", () => {
  const username = usernameInput.value;
  if (!username) {
    alert("Please enter your username");
    return;
  }

  currentChannel = generateRandomChannel();
  role = "res"; // Default to responder

  // Subscribe to the random channel
  pubnub.subscribe({ channels: [currentChannel] });

  // Display answer input for responder
  questionSection.style.display = "none";
  answerSection.style.display = "block";

  // Generate and display shareable link for questioner
  const shareableLink = `${window.location.origin}?channel=${currentChannel}&role=ques`;
  shareLink.innerHTML = `
  <div>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M10.046 14c-1.506-1.512-1.37-4.1.303-5.779l4.848-4.866c1.673-1.68 4.25-1.816 5.757-.305s1.37 4.1-.303 5.78l-2.424 2.433"/><path d="M13.954 10c1.506 1.512 1.37 4.1-.303 5.779l-2.424 2.433l-2.424 2.433c-1.673 1.68-4.25 1.816-5.757.305s-1.37-4.1.303-5.78l2.424-2.433" opacity=".5"/></g></svg>
   Share this link with the questioner: 
  </div>
  <br> 
  <a class="shlink" href="${shareableLink}">${shareableLink}</a>`;

  // Notify the channel that the responder has joined
  pubnub.publish({
    channel: currentChannel,
    message: { type: "user_connected", username: username, role: role },
  });
});

// Ask a question (for questioner)
askBtn.addEventListener("click", () => {
  const question = questionInput.value;
  pubnub.publish({
    channel: currentChannel,
    message: { type: "ask_question", question: question },
  });
});

// Send an answer (for responder)
answerBtn.addEventListener("click", () => {
  const answer = answerInput.value;
  pubnub.publish({
    channel: currentChannel,
    message: { type: "send_answer", answer: answer },
  });
});

// Listen for incoming messages
pubnub.addListener({
  message: function (event) {
    const msg = event.message;

    if (msg.type === "ask_question") {
      document.getElementById("displayQuestion").innerText = msg.question;
    } else if (msg.type === "send_answer") {
      messageLog.innerText += `Answer: ${msg.answer}\n`;
    } else if (msg.type === "user_connected" && !isQuestioner) {
      messageLog.innerText += `${msg.username} joined as ${msg.role}\n`;
    }
  },
});

if (isQuestioner) {
  joinBtn.style.display = "none";

  currentChannel = queryParams.get("channel");
  role = "ques";

  // Subscribe to the channel
  pubnub.subscribe({ channels: [currentChannel] });

  // Display question input for questioner
  questionSection.style.display = "block";
  answerSection.style.display = "none";

  // Notify the channel that the questioner has joined
  pubnub.publish({
    channel: currentChannel,
    message: { type: "user_connected", username: "ques", role: role },
  });
}

const translations = {
  en: {
      title: "Highest priest GPT",
      username: "Username",
      usernamePlaceholder: "Enter your name",
      createChannel: "Create a new channel as a wizard ✨",
      askQuestion: "Ask a Question",
      questionPlaceholder: "Type your question here",
      askButton: "Ask Question",
      answerQuestion: "Answer the Question",
      waitingQuestion: "Waiting for a question...",
      answerPlaceholder: "Type your answer here",
      answerButton: "Send Answer",
      chatLog: "Chat Log",
      shareLink: "Share this link with the questioner:",
      userJoined: "{username} joined as {role}",
      questioner: "questioner",
      responder: "responder"
  },
  es: {
      title: "GPT del Sumo Sacerdote",
      username: "Nombre de usuario",
      usernamePlaceholder: "Ingrese su nombre",
      createChannel: "Crear un nuevo canal como mago ✨",
      askQuestion: "Hacer una pregunta",
      questionPlaceholder: "Escriba su pregunta aquí",
      askButton: "Preguntar",
      answerQuestion: "Responder la pregunta",
      waitingQuestion: "Esperando una pregunta...",
      answerPlaceholder: "Escriba su respuesta aquí",
      answerButton: "Enviar respuesta",
      chatLog: "Registro de chat",
      shareLink: "Comparte este enlace con el interrogador:",
      userJoined: "{username} se unió como {role}",
      questioner: "interrogador",
      responder: "respondedor"
  },
  fr: {
      title: "GPT du Grand Prêtre",
      username: "Nom d'utilisateur",
      usernamePlaceholder: "Entrez votre nom",
      createChannel: "Créer un nouveau canal en tant que sorcier ✨",
      askQuestion: "Poser une question",
      questionPlaceholder: "Tapez votre question ici",
      askButton: "Poser la question",
      answerQuestion: "Répondre à la question",
      waitingQuestion: "En attente d'une question...",
      answerPlaceholder: "Tapez votre réponse ici",
      answerButton: "Envoyer la réponse",
      chatLog: "Journal de discussion",
      shareLink: "Partagez ce lien avec le questionneur :",
      userJoined: "{username} a rejoint en tant que {role}",
      questioner: "questionneur",
      responder: "répondeur"
  },
  hi: {
      title: "सर्वोच्च पुजारी GPT",
      username: "उपयोगकर्ता नाम",
      usernamePlaceholder: "अपना नाम दर्ज करें",
      createChannel: "जादूगर के रूप में एक नया चैनल बनाएं ✨",
      askQuestion: "एक प्रश्न पूछें",
      questionPlaceholder: "अपना प्रश्न यहां टाइप करें",
      askButton: "प्रश्न पूछें",
      answerQuestion: "प्रश्न का उत्तर दें",
      waitingQuestion: "प्रश्न की प्रतीक्षा कर रहे हैं...",
      answerPlaceholder: "अपना उत्तर यहां टाइप करें",
      answerButton: "उत्तर भेजें",
      chatLog: "चैट लॉग",
      shareLink: "प्रश्नकर्ता के साथ यह लिंक साझा करें:",
      userJoined: "{username} {role} के रूप में शामिल हुए",
      questioner: "प्रश्नकर्ता",
      responder: "उत्तरदात���"
  },
  zh: {
      title: "最高祭司 GPT",
      username: "用户名",
      usernamePlaceholder: "输入您的名字",
      createChannel: "作为巫师创建新频道 ✨",
      askQuestion: "提问",
      questionPlaceholder: "在此输入您的问题",
      askButton: "提问",
      answerQuestion: "回答问题",
      waitingQuestion: "等待问题...",
      answerPlaceholder: "在此输入您的回答",
      answerButton: "发送回答",
      chatLog: "聊天记录",
      shareLink: "与提问者分享此链接：",
      userJoined: "{username} 以 {role} 身份加入",
      questioner: "提问者",
      responder: "回答者"
  },
  ru: {
      title: "Верховный жрец GPT",
      username: "Имя пользователя",
      usernamePlaceholder: "Введите ваше имя",
      createChannel: "Создать новый канал как волшебник ✨",
      askQuestion: "Задать вопрос",
      questionPlaceholder: "Введите ваш вопрос здесь",
      askButton: "Задать вопрос",
      answerQuestion: "Ответить на вопрос",
      waitingQuestion: "Ожидание вопроса...",
      answerPlaceholder: "Введите ваш ответ здесь",
      answerButton: "Отправить ответ",
      chatLog: "Журнал чата",
      shareLink: "Поделитесь этой ссылкой с спрашивающим:",
      userJoined: "{username} присоединился как {role}",
      questioner: "спрашивающий",
      responder: "отвечающий"
  },
  ur: {
      title: "اعلیٰ کاہن GPT",
      username: "صارف نام",
      usernamePlaceholder: "اپنا نام درج کریں",
      createChannel: "جادوگر کے طور پر ایک نیا چینل بنائیں ✨",
      askQuestion: "سوال پوچھیں",
      questionPlaceholder: "اپنا سوال یہاں ٹائپ کریں",
      askButton: "سوال پوچھیں",
      answerQuestion: "سوال کا جواب دیں",
      waitingQuestion: "سوال کا انتظار ہے...",
      answerPlaceholder: "اپنا جواب یہاں ٹائپ کریں",
      answerButton: "جواب بھیجیں",
      chatLog: "چیٹ لاگ",
      shareLink: "سوال کرنے والے کے ساتھ یہ لنک شیئر کریں:",
      userJoined: "{username} {role} کے طور پر شامل ہوئے",
      questioner: "سوال کرنے والا",
      responder: "جواب دینے والا"
  }
};

let currentLanguage = 'en';

// Add these lines at the beginning of the file, right after the variable declarations
document.addEventListener('DOMContentLoaded', () => {
  currentLanguage = detectLanguage();
  changeLanguage(currentLanguage);
});

function detectLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  const shortLang = browserLang.split('-')[0]; // Get the first part of the language code
  
  if (translations.hasOwnProperty(shortLang)) {
      return shortLang;
  }
  
  return 'en';
}

function changeLanguage(lang) {
  currentLanguage = lang;
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    if (translations[lang][key]) {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translations[lang][key];
      } else {
        element.textContent = translations[lang][key];
      }
    }
  });
  updateShareLink();
  
  document.getElementById('languageSelector').value = lang;

  // Update button text
  joinBtn.textContent = translations[lang].createChannel;
  askBtn.textContent = translations[lang].askButton;
  answerBtn.textContent = translations[lang].answerButton;

  // Update input placeholders
  usernameInput.placeholder = translations[lang].usernamePlaceholder;
  questionInput.placeholder = translations[lang].questionPlaceholder;
  answerInput.placeholder = translations[lang].answerPlaceholder;

  // Update other text elements
  document.querySelector('h1').textContent = translations[lang].title;
  document.querySelector('label[for="username"]').textContent = translations[lang].username;
  document.querySelector('#questionSection h3').textContent = translations[lang].askQuestion;
  document.querySelector('#answerSection h3').textContent = translations[lang].answerQuestion;
  document.querySelector('#displayQuestion').textContent = translations[lang].waitingQuestion;
  document.querySelector('#chat h3').textContent = translations[lang].chatLog;
}

function updateShareLink() {
  if (shareLink.innerHTML) {
      const linkText = translations[currentLanguage].shareLink;
      // const link = shareLink.querySelector('a').outerHTML;
      // shareLink.innerHTML = `${linkText} <br> ${link}`;
  }
}

// Modify the event listener for language selection
document.getElementById('languageSelector').addEventListener('change', (e) => {
  changeLanguage(e.target.value);
});