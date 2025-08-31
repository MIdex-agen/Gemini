const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list")
const toggleThemeButton = document.getElementById("toggle-therme-button")

let userMessage = null;

// API configuration
const API_KEY = "AIzaSyBDJQwvXhmva-7SIhNNRWO8sDQk7bztL1Y";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/\
gemini-2.5-flash:generateContent=${API_KEY}`;

const loadLoadLocalStorageData = () => {
    const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

    // apply the store theme when webpage is refreshed
    document.body.classList.toggle("light_mode", isLightMode)
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode"
}

loadLoadLocalStorageData();

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}
// showing typing efect by displaying it one by one
const showTypingEfect = (text, textElement, incomingMessageDiv) => {
    const words = text.split(' ');
    let currentWordIndex = 0;

    const typingInterval = setInterval(() => {
        // Append each word to the text element with a space
        textElement.innerText += (currentWordIndex === 0 ?  '' : ' ') + words[currentWordIndex++]
        incomingMessageDiv.querySelector(".icon").classList.add("hide");

        // if all words are displayed
        if(currentWordIndex === words.length) {
            clearInterval(typingInterval);
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
        }
    }, 75);
}

const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            
            body: JSON.stringify({
                                contents: [{
                    role: "user",
                    parts: [{ text: userMessage }]
                }]
            })
        });

        const data = await response.json();

        const apiResonse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, `$1`);
        showTypingEfect(apiResonse, textElement, incomingMessageDiv);
        // 
    } catch (error) {
        console.log(error);
    }finally {
        incomingMessageDiv.classList.remove("loading");
    }
}

// Show A loading Animation While Waiting For The Apis
const ShowLoadingAnimation = () => {
    const html = ` <div class="message-content">
                <img src="./img/gemini.svg" alt="User Image" class="avatar">
                <p class="text"></p>
                <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                </div>
            </div>
            <span onclick="copyMessage(this)" class="icon material-symbols-rounded">
                content_copy
            </span>`;

     const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatList.appendChild(incomingMessageDiv);

    generateAPIResponse(incomingMessageDiv);
}

// copymessage text to clipboard
const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done";
    setTimeout(() => copyIcon.innerText = "content_copy", 1000);
}

const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim();
    if(!userMessage) return;

    const html = ` <div class="message-content">
                <p class="text"></p>
            </div>`;

    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset();
    setTimeout(ShowLoadingAnimation, 500);
}

// toggle button between light an ddark mode.....
toggleThemeButton.addEventListener("click", () => {
   const isLightMode = document.body.classList.toggle("light_mode");
   localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode")
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode"
});

typingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    handleOutgoingChat();

});



