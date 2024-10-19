const pubnub = new PubNub({
	publishKey: "pub-c-52bbf37f-54cb-4a10-8e5b-16f185f80b43", // Replace with your PubNub publish key
	subscribeKey: "sub-c-ec8c91d7-5ac8-4f0f-bd3f-cb01e071aba8", // Replace with your PubNub subscribe key
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
let initStorage = {
	role: "",
	username: "",
	messageLog: [],
	latestMessage: 0, // latestMessage will be use to check if the storage is expired
};
let storage = null;
let currentChannel = "";
let role = "res";

let lastMessageTimestamp = 0;
const MESSAGE_RATE_LIMIT_MS = 30000;
const EXPIRE_TIME = 86400000;

// If the URL contains a channel and role, handle the questioner's flow
const queryParams = new URLSearchParams(window.location.search);
const isQuestioner = queryParams.has("channel") && queryParams.get("role") === "ques";

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

	// reset storage for new channel
	storage = {...initStorage};

	messageLog.innerText = ""; // clear message log
	shareLink.innerHTML = getShareableLink(currentChannel);
	history.replaceState(null, "", `?channel=${currentChannel}&role=res`);
	// Add event listener for the copy button
	document.getElementById("copyLinkBtn").addEventListener("click", copyShareableLink);

	// save the username and role to storage
	storage.username = username;
	storage.role = role;

	// Notify the channel that the responder has joined
	pubnub.publish({
		channel: currentChannel,
		message: { type: "user_connected", username: username, role: role },
	});
});

// Generate and display shareable link for questioner
function getShareableLink(currentChannel) {
	const shareableLink = `${window.location.origin}?channel=${currentChannel}&role=ques`;
	return `
	<div>
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M10.046 14c-1.506-1.512-1.37-4.1.303-5.779l4.848-4.866c1.673-1.68 4.25-1.816 5.757-.305s1.37 4.1-.303 5.78l-2.424 2.433"/><path d="M13.954 10c1.506 1.512 1.37 4.1-.303 5.779l-2.424 2.433l-2.424 2.433c-1.673 1.68-4.25 1.816-5.757.305s-1.37-4.1.303-5.78l2.424-2.433" opacity=".5"/></g></svg>
		<span data-translate="shareLink">${translations[currentLanguage].shareLink}</span>
	</div>
	<div class="share-link-container">
		<a class="shlink" target="_blank" href="${shareableLink}">${shareableLink}</a>
		<button id="copyLinkBtn" class="btn copy-btn" data-translate="copyButton">${translations[currentLanguage].copyButton}</button>
	</div>
`;
}

function isRateLimited() {
	const currentTime = Date.now();
	return currentTime - lastMessageTimestamp < MESSAGE_RATE_LIMIT_MS;
}

// Ask a question (for questioner)
askBtn.addEventListener("click", () => {
	if (isRateLimited()) {
		alert("Please wait before sending another message.");
		return;
	}
	const question = questionInput.value;
	if (!question) {
		alert("Please enter a question.");
		return;
	}

	// send message
	pubnub.publish({
		channel: currentChannel,
		message: { type: "ask_question", question: question },
	});

	lastMessageTimestamp = Date.now();
});

// Send an answer (for responder)
answerBtn.addEventListener("click", () => {
	if (isRateLimited()) {
		alert("Please wait before sending another message.");
		return;
	}
	const answer = answerInput.value;
	if (!answer) {
		alert("Please enter an answer.");
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
		const lang = currentLanguage;

		if (msg.type === "ask_question") {
			document.getElementById("displayQuestion").innerText = msg.question;
			if (!isQuestioner) lastMessageTimestamp = 0; // responder can answer the question
			return;
		}

		// send responder answer
		if (msg.type === "send_answer") {
			const answer = msg.answer;
			const answerMessage = `Answer: ${answer}\n`;
			messageLog.innerText += answerMessage;
			// save message log using key for later translation
			storage.messageLog.push(msg);
			if (isQuestioner) lastMessageTimestamp = 0; // questioner can ask more questions
		}

		// user connected
		if (msg.type === "user_connected" && !isQuestioner) {
			const { username, role } = msg;
			const connectedMessage =
				translations[lang].userJoined
					.replace("{username}", username)
					.replace("{role}", role === "ques" ? translations[lang].questioner : translations[lang].responder) + "\n";
			messageLog.innerText += connectedMessage;
			// save message log using key for later translation
			storage.messageLog.push(msg);
		}

		// store lastestMessage
		storage.latestMessage = Date.now();
		localStorage.setItem(currentChannel, JSON.stringify(storage));
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

// Initialize language on page load
document.addEventListener("DOMContentLoaded", () => {
	// clear every local storage key that expired
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (!key.startsWith("channel")) continue; // skip non channel keys
		const storage = JSON.parse(localStorage.getItem(key));
		if (storage.latestMessage == null || Date.now() - storage.latestMessage > EXPIRE_TIME) {
			localStorage.removeItem(key);
		}
	}
	// get storage logs
	const channelId = queryParams.get("channel");
	storage = JSON.parse(localStorage.getItem(channelId)) ??  {...initStorage};

	if (storage) {
		usernameInput.value = storage.username;
		answerSection.style.display = !isQuestioner ? "block" : "none";
		questionSection.style.display = isQuestioner ? "block" : "none";
		// Append shareable link
		shareLink.innerHTML = getShareableLink(channelId);
		document.getElementById("copyLinkBtn").addEventListener("click", copyShareableLink); // Add event listener for the copy button

		updateMessages();
		// Reconnect to the channel
		currentChannel = channelId;
	}
});
// Append messages from storage
function updateMessages() {
	if (!storage) return;
	messageLog.innerText = ""; // clear message log
	storage.messageLog.forEach((message) => {
		if (message.type === "user_connected") {
			const lang = document.documentElement.lang;
			const connectedMessage =
				translations[lang].userJoined
					.replace("{username}", message.username)
					.replace("{role}", message.role === "ques" ? translations[lang].questioner : translations[lang].responder) + "\n";
			messageLog.innerText += connectedMessage;
		}
		if (message.type === "send_answer") {
			const answer = message.answer;
			const answerMessage = `Answer: ${answer}\n`;
			messageLog.innerText += answerMessage;
		}
	});
}
// Add this new function to handle copying the link
function copyShareableLink() {
	const linkElement = document.querySelector("#shareLink .shlink");
	const link = linkElement.href;

	navigator.clipboard
		.writeText(link)
		.then(() => {
			const copyBtn = document.getElementById("copyLinkBtn");
			const originalText = copyBtn.textContent;
			copyBtn.textContent = translations[currentLanguage].copied || "Copied!";
			setTimeout(() => {
				copyBtn.textContent = originalText;
			}, 2000);
		})
		.catch((err) => {
			console.error("Failed to copy text: ", err);
		});
}

// Expose necessary functions and variables to the global scope
window.storage = storage;
window.updateMessages = updateMessages;
