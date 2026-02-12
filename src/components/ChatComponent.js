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
      // POST request to the backend with JSON body
      const response = await fetch("https://api.wintkaythweaung.com/api/ai/ask-ai", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      setChatResponse(data.answer || data.error);
    } catch (error) {
      console.error("Error:", error);
      setChatResponse("Error: This server is currently in backend development.");
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
          onKeyPress={(e) => e.key === 'Enter' && askAI()} 
          placeholder="Enter a prompt for AI..."
          disabled={loading}
        />
        <button onClick={askAI} disabled={loading}>
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </div>

      <div className="output">
        <strong>Response:</strong>
        <p style={{ whiteSpace: "pre-wrap" }}>
          {chatResponse || "အဖြေကို ဤနေရာတွင် ပြသပေးမည်..."}
        </p>
      </div>
    </div>
  );
}

export default ChatComponent;
