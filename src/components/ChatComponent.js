import React, { useState } from "react";

function ChatComponent() {
  const [prompt, setPrompt] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!prompt) return alert("Please enter a prompt!");

    setLoading(true);
    setChatResponse(""); 
    
    try {
      // ✅ URL ကို စနစ်တကျ ပြင်ဆင်ထားသည်
      const fullUrl = `http://api.wintkaythweaung.com/api/ai/ask-ai?prompt=${encodeURIComponent(prompt)}`;
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        },
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.text();
      setChatResponse(data);
    } catch (error) {
      console.error("Error:", error);
      setChatResponse("Error: Backend သို့ ချိတ်ဆက်၍မရပါ။ Tunnel ကို စစ်ဆေးပါ။");
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
        <p style={{ whiteSpace: "pre-wrap" }}>{chatResponse}</p>
      </div>
    </div>
  );
}

export default ChatComponent;