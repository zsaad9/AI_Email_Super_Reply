import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as gemini

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get the API key from the environment variable
api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY environment variable not set")
gemini.configure(api_key=api_key)

@app.route('/generate-reply', methods=['POST'])
def generate_reply():
    data = request.json
    email_thread = data.get('email_thread')

    if not email_thread:
        return jsonify({'error': 'Email thread is missing'}), 400

    prompt = (
        f"You are a professional assistant. Reply to the following email in a helpful and polite manner:\n\n"
        f"Email Thread:\n{email_thread}\n\n"
        f"Response:"
    )

    try:
        # Make the request to the Gemini API
        response = gemini.generate_text(
            model="models/text-bison-001",
            prompt=prompt,
            max_output_tokens=350
        )

        # Extract the generated text from the response
        if response.candidates and len(response.candidates) > 0:
            reply = response.candidates[0]['output'].strip()
        else:
            reply = "No text found"

        return jsonify({'reply': reply})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

