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
  shareLink.innerHTML = `Share this link with the questioner: <br> <a href="${shareableLink}">${shareableLink}</a>`;

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
