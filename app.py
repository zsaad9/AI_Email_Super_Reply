from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the model and tokenizer from Hugging Face
model_name = "gpt2"  # You can choose a different pre-trained model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

@app.route('/generate-reply', methods=['POST'])
def generate_reply():
    data = request.json
    email_thread = data.get('email_thread')
    
    # Build the prompt for the AI/ML model
    prompt = f"Generate a reply for the following email thread:\n{email_thread}"
    
    # Encode the input text
    inputs = tokenizer.encode(prompt, return_tensors='pt')
    attention_mask = torch.ones(inputs.shape, dtype=torch.long)  # Create an attention mask
    pad_token_id = tokenizer.eos_token_id  # Set the pad token id to the eos token id

    # Generate a response
    outputs = model.generate(
        inputs, 
        attention_mask=attention_mask,
        pad_token_id=pad_token_id,
        max_length=350,  # Adjust the max length as needed
        do_sample=True, 
        temperature=0.7,  # Control the creativity of the response
        top_p=0.9,  # Nucleus sampling
        num_return_sequences=1  # Generate only one response
    )
    
    # Decode the generated text
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Post-process the response to clean up any unnecessary repetition
    response = response.replace(prompt, "").strip()
    
    return jsonify({'reply': response})

if __name__ == '__main__':
    app.run(debug=True)
