// ... inside btn.onclick ...
btn.onclick = async () => {
  btn.innerHTML = '⌛ Processing...';
  try {
    // 1. Scrape email content
    const emailBody = document.querySelector('.a3s')?.innerText || "No content found"; 
    
    // 2. Call your Backend (Fixed URL to /reply)
    const url = `https://api.wintaibot.com/api/ai/reply?content=${encodeURIComponent(emailBody)}`;
    
    const response = await fetch(url);
    const text = await response.text();
    
    // 3. Paste into Gmail reply box
    const replyBox = document.querySelector('[contenteditable="true"][role="textbox"]');
    if (replyBox) {
      replyBox.innerText = text;
    }
  } catch (error) {
    console.error("AI Error:", error);
  }
  btn.innerHTML = '✨ AI Apply';
};