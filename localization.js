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
        responder: "उत्तरदाता"
    }
};

let currentLanguage = 'en'; // Default to English

function changeLanguage(lang) {
    if (lang !== 'en' && lang !== 'hi') {
        lang = 'en'; // Default to English if an invalid language is selected
    }
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

    // Update button text
    if (document.getElementById('joinBtn')) document.getElementById('joinBtn').textContent = translations[lang].createChannel;
    if (document.getElementById('askBtn')) document.getElementById('askBtn').textContent = translations[lang].askButton;
    if (document.getElementById('answerBtn')) document.getElementById('answerBtn').textContent = translations[lang].answerButton;

    // Update input placeholders
    if (document.getElementById('username')) document.getElementById('username').placeholder = translations[lang].usernamePlaceholder;
    if (document.getElementById('question')) document.getElementById('question').placeholder = translations[lang].questionPlaceholder;
    if (document.getElementById('answer')) document.getElementById('answer').placeholder = translations[lang].answerPlaceholder;

    // Update other text elements
    const title = document.querySelector('h1');
    if (title) title.textContent = translations[lang].title;
    
    const usernameLabel = document.querySelector('label[for="username"]');
    if (usernameLabel) usernameLabel.textContent = translations[lang].username;
    
    const questionSectionH3 = document.querySelector('#questionSection h3');
    if (questionSectionH3) questionSectionH3.textContent = translations[lang].askQuestion;
    
    const answerSectionH3 = document.querySelector('#answerSection h3');
    if (answerSectionH3) answerSectionH3.textContent = translations[lang].answerQuestion;
    
    const displayQuestion = document.querySelector('#displayQuestion');
    if (displayQuestion) displayQuestion.textContent = translations[lang].waitingQuestion;
    
    const chatH3 = document.querySelector('#chat h3');
    if (chatH3) chatH3.textContent = translations[lang].chatLog;

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update language selector
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
        languageSelector.value = lang;
    }
}

function updateShareLink() {
    const shareLink = document.getElementById('shareLink');
    if (shareLink.innerHTML) {
        const linkText = translations[currentLanguage].shareLink;
        const link = shareLink.querySelector('a');
        if (link) {
            shareLink.innerHTML = `${linkText} <br> ${link.outerHTML}`;
        }
    }
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    const userLang = navigator.language || navigator.userLanguage;
    const initialLang = userLang.startsWith('hi') ? 'hi' : 'en';
    changeLanguage(initialLang);
    
    // Set initial value of language selector
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
        languageSelector.value = initialLang;
    }
});

// Expose necessary functions and variables to the global scope
window.changeLanguage = changeLanguage;
window.currentLanguage = currentLanguage;
window.translations = translations;
