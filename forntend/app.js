// ===== GLOBAL =====
let currentMood = "";
let allChats = JSON.parse(localStorage.getItem("allChats")) || [];
let currentChat = [];

// ===== SIGNUP =====
function signup() {
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

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let exist = users.find(user => user.email === email);

    if (exist) {
        alert("User already exists!");
        return;
    }

    users.push({ name, email, password: pass });

    localStorage.setItem("users", JSON.stringify(users));

    alert("Account Created!");
    window.location.href = "login.html";
}

// ===== LOGIN =====
function login() {
    let inputs = document.querySelectorAll("input");

    let email = inputs[0].value;
    let pass = inputs[1].value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let user = users.find(u => u.email === email && u.password === pass);

    if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        window.location.href = "home.html";
    } else {
        alert("Invalid Credentials");
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
function sendMessage() {
    let input = document.getElementById("userInput");
    let message = input.value.trim();

    if (message === "") return;

    addMessage(message, "user");
    input.value = "";

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
    else {
        reply = "Tell me more 💬";
    }

    setTimeout(() => {
        typingDiv.remove();
        addMessage(reply, "bot");
        saveChat();
    }, 1000);
}

// ===== SAVE CHAT =====
function saveChat() {
    if (currentChat.length === 0) return;

    allChats.push([...currentChat]);
    localStorage.setItem("allChats", JSON.stringify(allChats));

    renderHistory();
}

// ===== NEW CHAT =====
function newChat() {
    if (currentChat.length > 0) {
        saveChat();
    }

    currentChat = [];

    document.getElementById("chatBox").innerHTML = `
        <div class="bot-msg">
            Hello 😊 I'm Buddy. How are you feeling today?
        </div>
    `;
}

// ===== RENDER HISTORY =====
function renderHistory() {
    let list = document.getElementById("historyList");
    list.innerHTML = "";

    allChats.forEach((chat, index) => {
        let div = document.createElement("div");
        div.className = "history-item";

        // TITLE
        let title = chat.find(m => m.sender === "user")?.text || "New Chat";
        div.innerText = title.substring(0, 20);

        // DELETE BUTTON
        let del = document.createElement("span");
        del.innerText = "✖";
        del.style.float = "right";
        del.style.cursor = "pointer";
        del.style.color = "red";
        del.style.marginLeft = "10px";

        // ❗ FIX: use addEventListener instead
        del.addEventListener("click", function(e) {
            e.stopPropagation();
            deleteChat(index);
        });

        // LOAD CHAT CLICK
        div.addEventListener("click", function() {
            loadChat(index);
        });

        div.appendChild(del);
        list.appendChild(div);
    });
}

// ===== LOAD OLD CHAT =====
function loadChat(index) {
    let chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = "";

    currentChat = [...allChats[index]];

    currentChat.forEach(msg => {
        let div = document.createElement("div");
        div.className = msg.sender === "user" ? "user-msg" : "bot-msg";
        div.innerText = msg.text;
        chatBox.appendChild(div);
    });
}
function renderHistory() {
    let list = document.getElementById("historyList");
    list.innerHTML = "";

    allChats.forEach((chat, index) => {
        let div = document.createElement("div");
        div.className = "history-item";

        // 🧠 AUTO TITLE (first user message)
        let title = chat.find(m => m.sender === "user")?.text || "New Chat";
        div.innerText = title.substring(0, 20);

        // CLICK TO LOAD
        div.onclick = () => loadChat(index);

        // ❌ DELETE BUTTON
        let del = document.createElement("span");
        del.innerText = " ✖";
        del.style.float = "right";
        del.style.cursor = "pointer";

        del.onclick = (e) => {
            e.stopPropagation();
            deleteChat(index);
        };

        div.appendChild(del);
        list.appendChild(div);
    });
}
function deleteChat(index) {
    allChats.splice(index, 1);
    localStorage.setItem("allChats", JSON.stringify(allChats));

    renderHistory(); // refresh UI
}
function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("collapsed");
}
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}