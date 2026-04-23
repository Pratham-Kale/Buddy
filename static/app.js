// ===== GLOBAL =====
const API_URL = "";
let currentMood = "";
let currentSessionId = localStorage.getItem("currentSessionId") || null;
let allChats = []; // Now fetched from backend
let currentChat = [];

// ===== AUTH HEADERS =====
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

// ===== SIGNUP =====
async function signup() {
    let inputs = document.querySelectorAll("input");

    let name = inputs[0].value;
    let email = inputs[1].value;
    let pass = inputs[2].value;
    let confirm = inputs[3].value;

    if (!name || !email || !pass || !confirm) {
        alert("Please fill all fields");
        return;
    }

    if (pass !== confirm) {
        alert("Passwords do not match");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password: pass })
        });

        if (response.ok) {
            alert("Account Created!");
            window.location.href = "login.html";
        } else {
            const error = await response.json();
            alert(error.detail || "Signup failed");
        }
    } catch (err) {
        console.error(err);
        alert("Server error. Is the backend running?");
    }
}

// ===== LOGIN =====
async function login() {
    let inputs = document.querySelectorAll("input");

    let email = inputs[0].value;
    let pass = inputs[1].value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: pass, name: "Login" }) // name is not used in backend for login but schemas.UserCreate expects it
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.access_token);
            
            // Get user info
            const userRes = await fetch(`${API_URL}/me`, {
                headers: { "Authorization": `Bearer ${data.access_token}` }
            });
            const user = await userRes.json();
            localStorage.setItem("currentUser", JSON.stringify(user));

            window.location.href = "home.html";
        } else {
            alert("Invalid Credentials");
        }
    } catch (err) {
        console.error(err);
        alert("Server error. Is the backend running?");
    }
}

// ===== GOOGLE LOGIN =====
function googleLogin() {
    alert("Google login will be added later");
}

// ===== ADD MESSAGE =====
function addMessage(text, sender) {
    let chatBox = document.getElementById("chatBox");

    let div = document.createElement("div");
    div.className = sender === "user" ? "user-msg" : "bot-msg";
    div.innerText = text;

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;

    currentChat.push({ text, sender });
}

// ===== SEND MESSAGE =====
async function sendMessage() {
    let input = document.getElementById("userInput");
    let message = input.value.trim();

    if (message === "" || !currentSessionId) {
        if (!currentSessionId) alert("Please start a new chat first!");
        return;
    }

    addMessage(message, "user");
    input.value = "";

    // Save user message to backend
    await fetch(`${API_URL}/chats/${currentSessionId}/messages`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ text: message, sender: "user" })
    });

    let chatBox = document.getElementById("chatBox");

    // ⌨️ Typing indicator
    let typingDiv = document.createElement("div");
    typingDiv.className = "bot-msg typing";
    typingDiv.innerText = "Buddy is typing...";
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    let lower = message.toLowerCase();
    let reply = "";

    if (lower.includes("sad")) {
        currentMood = "sad";
        reply = "I'm really sorry 💛 What happened?";
    } 
    else if (lower.includes("stress")) {
        currentMood = "stress";
        reply = "That sounds stressful 😣 Do you feel this often?";
    } 
    else if (lower.includes("happy")) {
        currentMood = "happy";
        reply = "That's great 😊 What made you happy?";
    } 
    else if (lower.includes("anxious") || lower.includes("worry")) {
        currentMood = "anxious";
        reply = "I understand. Anxiety can be tough. Take a deep breath with me. 🧘‍♂️ What's on your mind?";
    }
    else if (lower.includes("angry") || lower.includes("mad")) {
        currentMood = "angry";
        reply = "It's okay to feel angry. 😤 Do you want to talk about what triggered it?";
    }
    else if (lower.includes("lonely")) {
        currentMood = "lonely";
        reply = "I'm here with you now. 💛 You're not alone. Tell me what's going on.";
    }
    else if (lower.includes("tired") || lower.includes("exhausted")) {
        currentMood = "tired";
        reply = "You've been working hard. 😴 Make sure to give yourself some rest. What's draining you?";
    }
    else if (lower.includes("excited")) {
        currentMood = "excited";
        reply = "That's amazing! 🤩 Tell me everything!";
    }
    else if (lower.includes("hello") || lower.includes("hi")) {
        reply = "Hello! I'm Buddy. How are you feeling today? 😊";
    }
    else {
        reply = "Tell me more 💬 I'm here to listen.";
    }

    setTimeout(async () => {
        typingDiv.remove();
        addMessage(reply, "bot");
        
        // Save bot message to backend
        await fetch(`${API_URL}/chats/${currentSessionId}/messages`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ text: reply, sender: "bot" })
        });

        renderHistory(); // Refresh sidebar titles
    }, 1000);
}

// ===== NEW CHAT =====
async function newChat() {
    try {
        const response = await fetch(`${API_URL}/chats`, {
            method: "POST",
            headers: getAuthHeaders()
        });
        const session = await response.json();
        currentSessionId = session.id;
        localStorage.setItem("currentSessionId", currentSessionId);
        
        currentChat = [];
        document.getElementById("chatBox").innerHTML = `
            <div class="bot-msg">
                Hello 😊 I'm Buddy. How are you feeling today?
            </div>
        `;
        renderHistory();
    } catch (err) {
        console.error(err);
    }
}

// ===== RENDER HISTORY =====
async function renderHistory() {
    const list = document.getElementById("historyList");
    if (!list) return;

    try {
        const response = await fetch(`${API_URL}/chats`, {
            headers: getAuthHeaders()
        });
        allChats = await response.json();
        
        list.innerHTML = "";
        allChats.forEach((chat) => {
            let div = document.createElement("div");
            div.className = "history-item";
            if (chat.id == currentSessionId) div.classList.add("active");

            // TITLE
            div.innerText = chat.title || "New Chat";

            // DELETE BUTTON
            let del = document.createElement("span");
            del.innerText = " ✖";
            del.style.float = "right";
            del.style.cursor = "pointer";

            del.onclick = (e) => {
                e.stopPropagation();
                deleteChat(chat.id);
            };

            // LOAD CHAT CLICK
            div.onclick = () => loadChat(chat.id);

            div.appendChild(del);
            list.appendChild(div);
        });
    } catch (err) {
        console.error(err);
    }
}

// ===== LOAD OLD CHAT =====
async function loadChat(id) {
    currentSessionId = id;
    localStorage.setItem("currentSessionId", id);

    let chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = "";

    try {
        const response = await fetch(`${API_URL}/chats/${id}`, {
            headers: getAuthHeaders()
        });
        const session = await response.json();
        currentChat = session.messages;

        if (currentChat.length === 0) {
            chatBox.innerHTML = `<div class="bot-msg">Hello 😊 I'm Buddy. How are you feeling today?</div>`;
        }

        currentChat.forEach(msg => {
            let div = document.createElement("div");
            div.className = msg.sender === "user" ? "user-msg" : "bot-msg";
            div.innerText = msg.text;
            chatBox.appendChild(div);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
        renderHistory(); // Refresh active state
    } catch (err) {
        console.error(err);
    }
}

async function deleteChat(id) {
    try {
        await fetch(`${API_URL}/chats/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        if (currentSessionId == id) {
            currentSessionId = null;
            localStorage.removeItem("currentSessionId");
            document.getElementById("chatBox").innerHTML = "";
        }
        renderHistory();
    } catch (err) {
        console.error(err);
    }
}
function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("collapsed");
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentSessionId");
    window.location.href = "login.html";
}
