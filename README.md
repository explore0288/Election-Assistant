# 🇮🇳 Amrita: India Election Assistant 

Amrita is an AI-powered, voice-enabled web application designed to help Indian citizens navigate the electoral process. By acting as a friendly, knowledgeable assistant, Amrita provides real-time, factual information based on the Election Commission of India (ECI) guidelines.

## 🎯 Chosen Vertical
**Civic Technology & E-Governance**
Navigating election dates, voter registration, and candidate information can be overwhelming. This project falls under Civic Tech, aiming to bridge the information gap between the government (ECI) and the citizens. By providing an interactive, bilingual (English & Hinglish), and voice-enabled assistant, it makes democratic participation more accessible.

## 🧠 Approach and Logic
The core logic of the application revolves around combining a lightweight frontend with a powerful, real-time AI backend:
1. **Secure Client-Side Architecture:** To ensure security and ease of deployment, the app does not hardcode API keys. Instead, it uses a secure UI modal to accept the user's Gemini API key and stores it temporarily in the browser's `localStorage`.
2. **Prompt Engineering & Persona:** The AI is strictly instructed via `systemInstruction` to adopt the persona of "Amrita". It is restricted to answering *only* election-related queries to prevent misuse.
3. **Language Constraint Logic:** To prevent browser-level Text-to-Speech (TTS) glitches associated with Devanagari fonts, the logic strictly forces the AI to reply in **English** or **Hinglish** (Hindi written in the English alphabet). 
4. **Real-Time Data Grounding:** Elections are time-sensitive. The logic utilizes the Gemini API's `google_search` tool, allowing the AI to browse the live internet to fetch current election dates and news before responding, eliminating AI hallucinations.

## ⚙️ How the Solution Works
The application is built using **HTML5, CSS3, and Vanilla JavaScript**.

* **The Brain (AI):** It connects to the **Google Gemini 2.5 Flash API**. When a user sends a message, the app packages the chat history and the user's query into a JSON payload and fetches a response.
* **Voice Input (Speech-to-Text):** Using the browser's native `Web Speech API (SpeechRecognition)`, users can click the microphone icon to speak their questions. The app captures the audio, transcribes it using the `en-IN` (Indian English/Hinglish) language model, and auto-sends the text to the AI.
* **Voice Output (Text-to-Speech):** Once the AI replies, the `window.speechSynthesis` API scans the user's operating system for high-quality female voices (prioritizing Indian English voices like Heera, Neerja, or Aditi). It then reads the AI's response out loud with an adjusted pitch for a friendly, natural tone.
* **UI/UX:** A responsive, mobile-friendly chat interface styled with CSS flexbox, featuring typing indicators, auto-scrolling, and a clean, official-looking theme (Saffron, White, and Green).

## 📌 Assumptions Made
During the development of this project, the following assumptions were made:
1. **Modern Browser Availability:** It is assumed the user is operating on a modern web browser (Google Chrome or Microsoft Edge) that fully supports the `Web Speech API` for voice interactions.
2. **HTTPS/Localhost Environment:** Microphone permissions require a secure context. It is assumed the app is run via a local server (like VS Code Live Server) or hosted on an HTTPS domain (like GitHub Pages).
3. **Valid API Key:** The user must have their own active Google Gemini API key from Google AI Studio.
4. **Language Preference:** It is assumed the target demographic interacts comfortably in either English or Hinglish, avoiding native regional scripts to ensure maximum compatibility with screen readers and TTS engines.

---
**Tech Stack:** Vanilla JavaScript, HTML, CSS, Google Gemini 2.5 Flash API.