// ==========================================
// KARTIKEY: ELECTION ASSISTANT - ENGLISH & HINGLISH
// ==========================================

// --- API KEY & LANGUAGE HANDLING ---
let API_KEY = localStorage.getItem('gemini_api_key') || "";
let LANG_PREF = localStorage.getItem('kartikey_lang') || 'en';
const langSelect = document.getElementById('lang-select');

function getSystemInstructionFor(lang) {
    if (lang === 'en-hinglish') {
        return "You are Kartikey, a professional India Election Assistant. LANGUAGE RULES: Prefer English but allow Hinglish (Hindi written in Latin letters) when the user uses it. NEVER use Devanagari script. Keep answers concise and neutral, based on Election Commission of India guidance. Always use google_search to get current info.";
    }
    return "You are Kartikey, a professional India Election Assistant. LANGUAGE RULES: Always reply in English regardless of the user's input. NEVER use Hinglish or Devanagari script. Keep answers concise. Provide neutral, factual info based on the Election Commission of India. Always use google_search to get current info.";
}

let SYSTEM_INSTRUCTION_TEXT = getSystemInstructionFor(LANG_PREF);

if (langSelect) {
    langSelect.value = LANG_PREF;
    langSelect.addEventListener('change', (e) => {
        LANG_PREF = e.target.value;
        localStorage.setItem('kartikey_lang', LANG_PREF);
        SYSTEM_INSTRUCTION_TEXT = getSystemInstructionFor(LANG_PREF);
    });
}

const modal = document.getElementById('api-key-modal');
const saveKeyBtn = document.getElementById('save-key-btn');
const keyInput = document.getElementById('api-key-input');

// --- LANDING PAGE <-> CHAT APP NAVIGATION ---
const landingPage = document.getElementById('landing-page');
const appWrapper = document.getElementById('app-wrapper');

function openChatApp() {
    landingPage.classList.add('hidden');
    appWrapper.classList.remove('hidden');
    if (!API_KEY) {
        modal.classList.remove('hidden');
    }
    if (document.getElementById('chat-messages').childElementCount === 0) {
        renderQuickReplies(DEFAULT_QUICK_REPLIES);
    }
}

function goHome() {
    appWrapper.classList.add('hidden');
    modal.classList.add('hidden');
    landingPage.classList.remove('hidden');
}

const startChatBtn = document.getElementById('start-chat-btn');
const startChatBtn2 = document.getElementById('start-chat-btn-2');
const homeBtn = document.getElementById('home-btn');

if (startChatBtn) startChatBtn.addEventListener('click', openChatApp);
if (startChatBtn2) startChatBtn2.addEventListener('click', openChatApp);
if (homeBtn) homeBtn.addEventListener('click', goHome);
if (saveKeyBtn) {
    saveKeyBtn.addEventListener('click', () => {
        const key = keyInput.value.trim();
        if (key.length > 20) {
            API_KEY = key;
            localStorage.setItem('gemini_api_key', API_KEY);
            if (modal) modal.classList.add('hidden');
        } else {
            alert("Please enter a valid Google Gemini API Key.");
        }
    });
}

// --- CHAT & UI EVENT LISTENERS ---
const chatForm = document.getElementById('chat-form');
if (chatForm) {
    chatForm.addEventListener('submit', function (e) {
        e.preventDefault();
        sendMessage();
    });
}

const resetBtn = document.getElementById('reset-btn');
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        if (confirm("Do you want to clear the chat and change the API key?")) {
            const msgs = document.getElementById('chat-messages');
            if (msgs) msgs.innerHTML = '';
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            localStorage.removeItem('gemini_api_key');
            API_KEY = "";
            if (modal) modal.classList.remove('hidden');
            renderQuickReplies(DEFAULT_QUICK_REPLIES);
        }
    });
}

// --- VOICE FEATURES (Male Voice + English/Hinglish Reading) ---
function speakKartikey(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        const cleanText = text.replace(/[*#]/g, ''); 
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        const voices = window.speechSynthesis.getVoices();
        let kartikeyVoice = null;

        const preferredMaleVoices = [
            "Microsoft Ravi", "Microsoft David", "Microsoft Prabhat",
            "Google UK English Male", "Microsoft Mark", "Daniel", "Alex", "Fred"
        ];
        
        for (let name of preferredMaleVoices) {
            kartikeyVoice = voices.find(v => v.name.includes(name));
            if (kartikeyVoice) break;
        }

        if (!kartikeyVoice) {
            kartikeyVoice = voices.find(v => {
                const n = v.name.toLowerCase();
                return (n.includes('male') && !n.includes('female')) || (n.includes('man') && !n.includes('woman'));
            });
        }
        
        if (kartikeyVoice) {
            utterance.voice = kartikeyVoice;
            console.log("Speaking with male voice: ", kartikeyVoice.name);
        }
        
        utterance.lang = 'en';
        utterance.rate = 1.0; 
        utterance.pitch = 0.85;
        
        window.speechSynthesis.speak(utterance);
    }
}
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

// --- MICROPHONE SETUP ---
const micBtn = document.getElementById('mic-btn');
const chatInput = document.getElementById('chat-input');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition && micBtn) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en';
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

// --- QUICK REPLIES ---
const DEFAULT_QUICK_REPLIES = [
    "How do I register to vote?",
    "Am I eligible to vote?",
    "When are the next elections?",
    "How do I find my polling booth?"
];

const FOLLOW_UP_QUICK_REPLIES = [
    "Tell me more",
    "What documents do I need?",
    "How do I check my status?",
    "What's the Voter Helpline number?"
];

function renderQuickReplies(options) {
    const container = document.getElementById('quick-replies');
    if (!container) return;
    container.innerHTML = '';
    options.forEach((text) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quick-reply-btn';
        btn.textContent = text;
        btn.addEventListener('click', () => {
            const input = document.getElementById('chat-input');
            input.value = text;
            sendMessage();
        });
        container.appendChild(btn);
    });
}

function clearQuickReplies() {
    const container = document.getElementById('quick-replies');
    if (container) container.innerHTML = '';
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
    if (!API_KEY) {
        if (modal) modal.classList.remove('hidden');
        alert('Please enter your Google Gemini API key to continue.');
        return;
    }

    if (!history) return;

    clearQuickReplies();

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
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: SYSTEM_INSTRUCTION_TEXT }]
                },
                contents: [{
                    parts: [{ text: userText }]
                }],
                tools: [
                    { google_search: {} }
                ]
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
        const asOf = document.createElement('div');
        asOf.className = 'msg-as-of';
        asOf.textContent = 'Info current as of ' + new Date().toLocaleString();
        botEl.appendChild(asOf);
        history.appendChild(botEl);
        history.scrollTop = history.scrollHeight;

        speakKartikey(aiReply);
        renderQuickReplies(FOLLOW_UP_QUICK_REPLIES);

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

window.addEventListener('DOMContentLoaded', () => {});