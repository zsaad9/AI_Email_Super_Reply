document.getElementById('generate-reply-button').addEventListener('click', () => {
  generateReply();
});

document.getElementById('generate-new-reply-button').addEventListener('click', () => {
  document.getElementById('new-prompt-container').style.display = 'block';
});

document.getElementById('submit-new-prompt-button').addEventListener('click', () => {
  const newPrompt = document.getElementById('new-prompt').value;
  if (newPrompt.trim() === '') {
    alert('Please enter a prompt.');
    return;
  }
  generateReply(false, newPrompt);
});

function generateReply(isInitial = true, userPrompt = '') {
  if (isInitial) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        console.error("No active tabs found.");
        document.getElementById('reply').innerText = "No active tab found.";
        document.getElementById('reply-container').style.display = 'block';
        return;
      }

      console.log("Sending message to content script to get email thread...");
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getEmailThread' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError.message);
          document.getElementById('reply').innerText = "Failed to get email thread.";
          document.getElementById('reply-container').style.display = 'block';
          return;
        }
        if (!response || !response.emailThread) {
          console.error("Invalid response or email thread:", response);
          document.getElementById('reply').innerText = "Failed to get email thread.";
          document.getElementById('reply-container').style.display = 'block';
          return;
        }

        console.log("Email thread received:", response.emailThread);
        sendGenerateRequest(response.emailThread);
      });
    });
  } else {
    sendGenerateRequest(userPrompt);
  }
}

function sendGenerateRequest(prompt) {
  fetch('http://localhost:5000/generate-reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email_thread: prompt })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Reply generated:", data.reply);
    document.getElementById('reply').innerText = data.reply;
    document.getElementById('reply-container').style.display = 'block';
    document.getElementById('new-prompt-container').style.display = 'none';
  })
  .catch(error => {
    console.error('Error:', error);
    document.getElementById('reply').innerText = "Failed to generate reply.";
    document.getElementById('reply-container').style.display = 'block';
    document.getElementById('new-prompt-container').style.display = 'none';
  });
}
