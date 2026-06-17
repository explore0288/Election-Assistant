# 🇮🇳 Kartikey: India Election Assistant

Kartikey is an AI-powered, voice-enabled web application designed to help Indian citizens navigate the electoral process. By acting as a friendly, knowledgeable assistant, Kartikey provides real-time, factual information based on the Election Commission of India (ECI) guidelines.

## 🎯 Chosen Vertical
**Civic Technology & E-Governance**
Navigating election dates, voter registration, and candidate information can be overwhelming. This project falls under Civic Tech, aiming to bridge the information gap between the government (ECI) and the citizens. By providing an interactive, English-only, and voice-enabled assistant, it makes democratic participation more accessible.

## 🧠 Approach and Logic
The application uses a client-server architecture to ensure security and performance:
1. **Backend Proxy:** A Python (Flask) backend handles the Gemini API key securely, preventing exposure on the client side.
2. **Prompt Engineering:** The system is hardcoded to the "Kartikey" persona, focusing strictly on Indian election queries in English.
3. **Real-Time Data Grounding:** The backend utilizes Gemini's `google_search` tool to fetch live election data from the internet.

## ⚙️ How the Solution Works
The application is built using **HTML5, CSS3, Vanilla JavaScript, and Python (Flask)**.

* **The Brain (AI):** The Python (Flask) backend (`app.py`) serves the frontend and communicates with the **Google Gemini 2.5 Flash API**.
* **Voice Input (Speech-to-Text):** Using the browser's native `Web Speech API (SpeechRecognition)`, users can click the microphone icon to speak their questions. The app captures the audio, transcribes it using the `en-IN` (Indian English) language model, and auto-sends the text to the AI.
* **Voice Output (Text-to-Speech):** Once the AI replies, the `window.speechSynthesis` API scans the user's operating system for high-quality male voices (prioritizing Indian English voices like David, Mark, or Alex). It then reads the AI's response out loud with an adjusted pitch for a friendly, natural tone.
* **UI/UX:** A responsive, mobile-friendly chat interface styled with CSS flexbox, featuring typing indicators, auto-scrolling, and a clean, official-looking theme (Saffron, White, and Green).

## 📌 Assumptions Made
During the development of this project, the following assumptions were made:
1. **Modern Browser Availability:** It is assumed the user is operating on a modern web browser (Google Chrome or Microsoft Edge) that fully supports the `Web Speech API` for voice interactions.
2. **HTTPS/Localhost Environment:** Microphone permissions require a secure context. It is assumed the app is run via a local server (like VS Code Live Server) or hosted on an HTTPS domain (like GitHub Pages).
3. **Server Configuration:** The backend `app.py` must be running and configured with a valid `GEMINI_API_KEY` environment variable.
4. **Language Preference:** It is assumed the target demographic interacts comfortably in English, avoiding native regional scripts to ensure maximum compatibility with screen readers and TTS engines.

---
**Tech Stack:** Vanilla JavaScript, HTML, CSS, Flask, Google Gemini 2.5 Flash API.