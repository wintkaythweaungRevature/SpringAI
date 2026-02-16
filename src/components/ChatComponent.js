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
      // ✅ Port 5000 ကို URL မှာ ထည့်ပေးထားပါ (AWS မှာ Port 5000 သုံးထားရင်)
      // ✅ AWS က Port 80 ဆိုရင်တော့ :5000 ကို ဖြုတ်လိုက်ပါ
      const fullUrl = `https://api.wintbotai.com/api/ai/ask-ai?prompt=${encodeURIComponent(prompt)}`;
      
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
      // ✅ Error message ကို ပြင်လိုက်ပါတယ်
      setChatResponse("Error: Backend သို့ ချိတ်ဆက်၍မရပါ။ AWS Server နှင့် DNS ကို စစ်ဆေးပါ။");
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
          onKeyPress={(e) => e.key === 'Enter' && askAI()} // Enter နှိပ်ရင်လည်း အလုပ်လုပ်အောင်
          placeholder="Enter a prompt for AI..."
          disabled={loading}
        />
        <button onClick={askAI} disabled={loading}>
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </div>

      <div className="output">
        <strong>Response:</strong>
        <p style={{ whiteSpace: "pre-wrap" }}>{chatResponse || "အဖြေကို ဤနေရာတွင် ပြသပေးမည်..."}</p>
      </div>
    </div>
  );
}

export default ChatComponent;