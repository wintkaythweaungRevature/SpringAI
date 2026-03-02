btn.onclick = async () => {
  btn.innerHTML = '⌛ Processing...';
  try {
    // 1. Scrape content
    const emailBody = document.querySelector('.a3s')?.innerText || "No content found"; 
    
    // 2. Call Backend using POST with JSON body
    const response = await fetch('https://api.wintaibot.com/api/ai/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        emailContent: emailBody,
        tone: 'professional' // You can make this dynamic later
      })
    });

    if (!response.ok) throw new Error('Network response was not ok');
    
    const text = await response.text();
    
    // 3. Paste into Gmail
    const replyBox = document.querySelector('[contenteditable="true"][role="textbox"]');
    if (replyBox) {
      replyBox.innerText = text;
    }
  } catch (error) {
    console.error("AI Error:", error);
    alert("AI Error: " + error.message);
  }
  btn.innerHTML = '✨ AI Apply';
};