const resources = {
  en: {
    translation: {
      title: "Highest priest GPT",
      username: "Username",
      enterName: "Enter your name",
      createChannel: "Create a new channel as a wizard ✨",
      askQuestion: "Ask a Question",
      typeQuestion: "Type your question here",
      askBtn: "Ask Question",
      answerQuestion: "Answer the Question",
      waitingQuestion: "Waiting for a question...",
      typeAnswer: "Type your answer here",
      sendAnswer: "Send Answer",
      chatLog: "Chat Log",
      shareLink: "Share this link with the questioner:",
    }
  },
  es: {
    translation: {
      title: "GPT Sumo Sacerdote",
      username: "Nombre de usuario",
      enterName: "Ingrese su nombre",
      createChannel: "Crear un nuevo canal como mago ✨",
      askQuestion: "Hacer una pregunta",
      typeQuestion: "Escriba su pregunta aquí",
      askBtn: "Preguntar",
      answerQuestion: "Responder la pregunta",
      waitingQuestion: "Esperando una pregunta...",
      typeAnswer: "Escriba su respuesta aquí",
      sendAnswer: "Enviar respuesta",
      chatLog: "Registro de chat",
      shareLink: "Comparte este enlace con el interrogador:",
    }
  },
  // Add more languages as needed
};

i18next
  .use(i18nextHttpBackend)
  .init({
    lng: 'en', // Default language
    fallbackLng: 'en',
    resources: resources,
  });

function updateContent() {
  $('body').localize();
}

$(function () {
  i18next.on('languageChanged', () => {
    updateContent();
  });

  updateContent();
});

function changeLanguage(lang) {
  i18next.changeLanguage(lang);
}
