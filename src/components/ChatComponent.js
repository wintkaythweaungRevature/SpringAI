import React, { useState } from "react";

function ChatComponent() {
  const [prompt, setPrompt] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [loading, setLoading] = useState(false); // Loading state ထည့်ထားခြင်း

  const askAI = async () => {
    if (!prompt) return alert("Please enter a prompt!");

    setLoading(true);
    try {
      // ၁။ Localhost အစား AWS Backend URL ကို အသုံးပြုခြင်း
      const AWS_BACKEND_URL = "https://www.wintkaythweaung.com";
      
      // ၂။ သင်၏ Java Controller ရှိ RequestMapping (/api/ai) ကို ထည့်သွင်းခြင်း
      const response = await fetch(`${AWS_BACKEND_URL}/api/ai/ask-ai?prompt=${encodeURIComponent(prompt)}`, {
        method: 'GET', // သင်၏ Java ဘက်တွင် GetMapping သုံးထားပါက
        headers: {
          'Accept': 'text/plain',
        },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.text();
      console.log("AI Response:", data);
      setChatResponse(data);
    } catch (error) {
      console.error("Error generating Response:", error);
      setChatResponse("Error: Could not connect to AI backend. Check CORS or AWS status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h2>Talk To AI</h2>
      <div className="input-area">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt for AI..."
          disabled={loading}
        />
        <button onClick={askAI} disabled={loading}>
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </div>

      <div className="output">
        <strong>Response:</strong>
        <p>{chatResponse}</p>
      </div>
    </div>
  );
}

export default ChatComponent;