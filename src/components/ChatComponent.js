import React, { useState } from "react";

function ChatComponent() {
  const [prompt, setPrompt] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!prompt) return alert("Please enter a prompt!");

    setLoading(true);
    setChatResponse(""); // အဖြေအသစ်အတွက် နေရာလွတ်အရင်လုပ်ပါ
    
    try {
      // ✅ URL ကို api. subdomain သို့ အမှန်ကန်ဆုံး ပြင်ထားသည်
      const fullUrl = `https://api.wintkaythweaung.com/api/ai/ask-ai?prompt=${encodeURIComponent(prompt)}`;
      
      console.log("Fetching from:", fullUrl);

      const response = await fetch(fullUrl, {
        method: 'GET',
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
      setChatResponse("Error: Backend သို့ ချိတ်ဆက်မရပါ။ Tunnel နှင့် Spring Boot ကို စစ်ဆေးပါ။");
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
          style={{ padding: "10px", width: "70%", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button 
          onClick={askAI} 
          disabled={loading}
          style={{ padding: "10px 20px", marginLeft: "10px", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </div>

      <div className="output" style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "5px" }}>
        <strong>Response:</strong>
        <p style={{ whiteSpace: "pre-wrap" }}>{chatResponse}</p>
      </div>
    </div>
  );
}

export default ChatComponent;