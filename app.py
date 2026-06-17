from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
import requests
import os # 
app = Flask(__name__, static_folder='.', static_url_path='') 

# Set your Gemini API key here or via environment variable
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")

# Enable CORS with credentials support for session cookies
CORS(app, supports_credentials=True)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "kartikey_secret_session_key")

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/history', methods=['GET'])
def get_history():
    """Returns the chat history stored in the current session."""
    return jsonify(session.get('chat_history', []))

@app.route('/api/reset', methods=['POST'])
def reset():
    """Clears the chat history in the session."""
    session['chat_history'] = []
    return jsonify({"status": "cleared"})

@app.route('/api/chat', methods=['POST'])
def chat():
    user_data = request.json
    user_text = user_data.get('text')
    system_instruction = user_data.get('systemInstruction')

    if not GEMINI_API_KEY or "YOUR_GEMINI_API_KEY" in GEMINI_API_KEY:
        return jsonify({"error": "Backend API Key is not configured."}), 500

    # Manage conversation history
    history = session.get('chat_history', [])
    history.append({"role": "user", "parts": [{"text": user_text}]})

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    payload = {
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        },
        "contents": history,
        "tools": [
            {"google_search": {}}
        ]
    }

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()

        # Append the model's response to history if successful
        if "candidates" in data and data["candidates"]:
            model_content = data["candidates"][0]["content"]
            history.append(model_content)
            session['chat_history'] = history

        return jsonify(data)
    except requests.exceptions.RequestException as e:
        # Log the full error for debugging
        app.logger.error(f"Error calling Gemini API: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)