// ==========================================
// KARTIKEY: ELECTION ASSISTANT - ENGLISH ONLY
// ========================================== # Removed newline

// Fixed system instruction for English only
let SYSTEM_INSTRUCTION_TEXT = "You are Kartikey, a professional India Election Assistant. LANGUAGE RULES: Always reply in English regardless of the user's input. NEVER use Hinglish or Devanagari script. Keep answers concise. Provide neutral, factual info based on the Election Commission of India. Always use google_search to get current info.";

// --- CHAT & UI EVENT LISTENERS ---
document.getElementById('chat-form').addEventListener('submit', function (e) {
    e.preventDefault();
    sendMessage();
});

document.getElementById('reset-btn').addEventListener('click', async () => {
    if (confirm("Do you want to clear the chat history?")) {
        document.getElementById('chat-messages').innerHTML = '';
        window.speechSynthesis.cancel();
        try {
            await fetch('/api/reset', { method: 'POST', credentials: 'include' });
        } catch (err) {
            console.error("Failed to clear backend history", err);
        }
    }
});

// --- VOICE FEATURES (Male Voice + English Reading) ---
function speakKartikey(text) { // Renamed function
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        const cleanText = text.replace(/[*#]/g, ''); 
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        const voices = window.speechSynthesis.getVoices();
        let kartikeyVoice = null; // Renamed variable

        // Force the browser to look for male Indian/English voices
        const preferredMaleVoices = [
            "Microsoft David", "Google US English Male", "Alex", "Google UK English Male", "Microsoft Mark"
        ];
        
        for (let name of preferredMaleVoices) {
            kartikeyVoice = voices.find(v => v.name.includes(name));
            if (kartikeyVoice) break;
        }

        // Fallback to any voice with "male" in the name
        if (!kartikeyVoice) {
            kartikeyVoice = voices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man'));
        }
        
        if (kartikeyVoice) {
            utterance.voice = kartikeyVoice;
            console.log("Speaking with male voice: ", kartikeyVoice.name);
        }
        
        utterance.lang = 'en-IN'; // Sets Indian English accent (still appropriate for English)
        utterance.rate = 1.0; 
        utterance.pitch = 0.9; // Adjusted pitch for a male tone (original was 1.3 for female)
        
        window.speechSynthesis.speak(utterance);
    }
}
window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();

// --- MICROPHONE SETUP ---
const micBtn = document.getElementById('mic-btn');
const chatInput = document.getElementById('chat-input');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition && micBtn) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    let isListening = false;

    micBtn.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            try {
                recognition.start();
            } catch (err) {
                console.error("Mic start error:", err);
            }
        }
    });

    recognition.onstart = () => {
        isListening = true;
        micBtn.innerHTML = '🔴';
        chatInput.placeholder = "Listening...";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        sendMessage();
    };

    recognition.onerror = (event) => {
        console.error("Mic error:", event.error);
        if (event.error === 'not-allowed') {
            alert("Microphone permission denied. Please allow microphone access in your browser settings and ensure you are using a secure connection (localhost or HTTPS).");
        }
    };

    recognition.onend = () => {
        isListening = false;
        micBtn.innerHTML = '🎙️';
        chatInput.placeholder = "Type or speak a message…";
    };
} else if (micBtn) {
    micBtn.style.display = 'none'; 
}

// --- MESSAGE ELEMENT CREATION ---
function createMessageElement(isUser, content, useHTML=false) {
    const group = document.createElement('div');
    group.className = 'msg-group ' + (isUser ? 'user' : 'bot');

    const row = document.createElement('div');
    row.className = 'msg-row';

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = isUser ? 'Y' : 'K';
    row.appendChild(avatar);

    const msg = document.createElement('div');
    msg.className = 'message';
    if (useHTML) msg.innerHTML = content; else msg.textContent = content;
    row.appendChild(msg);

    const time = document.createElement('div');
    time.className = 'msg-time';
    const now = new Date();
    time.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    row.appendChild(time);

    group.appendChild(row);
    return group;
}

// --- MAIN CHAT LOGIC ---
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const history = document.getElementById('chat-messages');
    const userText = input.value.trim();

    if (!userText) return;

    const userEl = createMessageElement(true, userText, false);
    history.appendChild(userEl);
    input.value = "";

    const loadingId = "loading-" + Date.now();
    const loadingGroup = document.createElement('div');
    loadingGroup.className = 'msg-group bot';
    loadingGroup.id = loadingId;
    const typingWrap = document.createElement('div');
    typingWrap.className = 'typing-indicator';
    typingWrap.innerHTML = '<span></span><span></span><span></span>';
    loadingGroup.appendChild(typingWrap);
    history.appendChild(loadingGroup);
    history.scrollTop = history.scrollHeight;

    try {
        const response = await fetch('/api/chat', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({
                systemInstruction: SYSTEM_INSTRUCTION_TEXT,
                text: userText
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message || "API Error");
        if (!data.candidates || data.candidates.length === 0) throw new Error("No response from AI. Please try a different query.");

        const aiReply = data.candidates[0].content.parts[0].text;
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();

        const formattedReply = aiReply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        const botEl = createMessageElement(false, formattedReply, true);
        history.appendChild(botEl);
        history.scrollTop = history.scrollHeight;

        speakKartikey(aiReply); // Changed function call

    } catch (error) {
        console.error(error);
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) {
            loadingEl.innerHTML = '';
            const err = document.createElement('div');
            err.className = 'message';
            err.style.color = 'red';
            err.style.borderColor = 'red';
            err.textContent = 'Error: ' + error.message;
            loadingEl.appendChild(err);
        }
    }
}

// --- PERSISTENCE: LOAD HISTORY ON START ---
async function loadChatHistory() {
    try {
        const response = await fetch('/api/history', { credentials: 'include' });
        const chatHistory = await response.json();
        const historyContainer = document.getElementById('chat-messages');

        chatHistory.forEach(msg => {
            const isUser = msg.role === 'user';
            const text = msg.parts[0].text;
            const formattedText = isUser ? text : text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            const msgEl = createMessageElement(isUser, formattedText, !isUser);
            historyContainer.appendChild(msgEl);
        });
        historyContainer.scrollTop = historyContainer.scrollHeight;
    } catch (err) {
        console.error("Could not load history", err);
    }
}
window.addEventListener('DOMContentLoaded', loadChatHistory);