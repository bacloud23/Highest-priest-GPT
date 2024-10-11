let messageCount = 0;
const messageLimit = 5;
const timeFrame = 60000;
let startTime = Date.now();

function resetMessageCount() {
    messageCount = 0;
    startTime = Date.now();
}

function sendMessage(callback) {
    const currentTime = Date.now();
    if (currentTime - startTime > timeFrame) {
        resetMessageCount();
    }

    if (messageCount < messageLimit) {
        messageCount++;
        callback();
    } else {
        const waitTime = Math.ceil((timeFrame - (currentTime - startTime)) / 1000);
        alert(`Please wait ${waitTime} seconds before sending more messages.`);
    }
}
