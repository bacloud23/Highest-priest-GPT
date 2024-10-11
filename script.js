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

let lastMessageTimestamp = 0;
const MESSAGE_RATE_LIMIT_MS = 30000; 

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

function isRateLimited(){
  const currentTime = Date.now();
  return (currentTime - lastMessageTimestamp) < MESSAGE_RATE_LIMIT_MS;
}

// Ask a question (for questioner)
askBtn.addEventListener("click", () => {
  if(isRateLimited()) {
    alert('Please wait before sending another message.');
    return;
}
  const question = questionInput.value;
  if(!question) {
    alert('Please enter a question.');
    return;
}
  pubnub.publish({
    channel: currentChannel,
    message: { type: "ask_question", question: question },
  });

  lastMessageTimestamp = Date.now();
});

// Send an answer (for responder)
answerBtn.addEventListener("click", () => {
  if(isRateLimited()) {
    alert('Please wait before sending another message.');
    return;
}
  const answer = answerInput.value;
  if(!answer) {
    alert('Please enter an answer.');
    return;
}
  pubnub.publish({
    channel: currentChannel,
    message: { type: "send_answer", answer: answer },
  });

  lastMessageTimestamp = Date.now();
});

// Listen for incoming messages
pubnub.addListener({
  message: function (event) {
    const msg = event.message;

    if (msg.type === "ask_question") {
      document.getElementById("displayQuestion").innerText = msg.question;
    } else if (msg.type === "send_answer") {
      messageLog.innerText += `उत्तर: ${msg.answer}\n`;
    } else if (msg.type === "user_connected" && !isQuestioner) {
      messageLog.innerText += translations.hi.userJoined
        .replace('{username}', msg.username)
        .replace('{role}', msg.role === 'ques' ? translations.hi.questioner : translations.hi.responder) + '\n';
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

// Call changeLanguage when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.changeLanguage();
});
