console.log("Content script loaded");

function getEmailThread() {
  console.log("Extracting email thread...");
  let emailElements = document.querySelectorAll(".a3s.aiL"); 
  let emailThread = Array.from(emailElements).map(element => element.innerText).join("\n");
  console.log("Email thread extracted:", emailThread);
  return emailThread;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request);
  if (request.action === 'getEmailThread') {
    const emailThread = getEmailThread();
    console.log("Email thread extracted:", emailThread);
    sendResponse({ emailThread: emailThread });
  }
});
