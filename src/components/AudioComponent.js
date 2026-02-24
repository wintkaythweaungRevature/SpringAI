import React, { useState } from "react";
import axios from "axios"; // Make sure to npm install axios

function AudioComponent() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

 const transcribeAudio = async () => {
  if (!file) return alert("Please select an audio file!");

  setLoading(true);
  setTranscript(""); 
  
  const formData = new FormData();
  formData.append("file", file); // Ensure this matches @RequestParam("file") in Java

  try {
        const response = await axios.post("https://api.wintaibot.com/api/audio/transcribe", formData, {
            // 💡 Header ကို လုံးဝ ဖြုတ်လိုက်ပါ (Axios က auto သတ်မှတ်ပါလိမ့်မယ်)
            onUploadProgress: (progressEvent) => {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setProgress(percent);
            }
        });
        setTranscript(response.data);
    } catch (error) {
        console.error("Full Error:", error);
    }

  return (
    <div className="chat-container"> {/* Reusing your chat-container class */}
      <h2>Audio Transcriber</h2>
      <div className="input-area">
        <input
          type="file"
          accept="audio/mp3,audio/wav"
          onChange={(e) => setFile(e.target.files[0])}
          disabled={loading}
          className="file-input"
        />
        <button onClick={transcribeAudio} disabled={loading || !file}>
          {loading ? `Uploading ${progress}%` : "Transcribe"}
        </button>
      </div>

      <div className="output">
        <strong>Transcript:</strong>
        <p style={{ whiteSpace: "pre-wrap" }}>
          {transcript || (loading ? "AI is listening..." : "Your text will appear here")}
        </p>
      </div>
    </div>
  );
}

export default AudioComponent;