import React, { useState } from "react";
import axios from "axios";

function AudioComponent() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const transcribeAudio = async () => {
    if (!file) return alert("Please select an audio file first!");

    setLoading(true);
    setTranscript(""); 
    setProgress(0);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      // ✅ Matches your existing API domain pattern
      const fullUrl = `https://api.wintaibot.com/api/audio/transcribe`;
      
      const response = await axios.post(fullUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      // Spring AI returns the raw string; axios puts it in response.data
      setTranscript(response.data);
    } catch (error) {
      console.error("Error:", error);
      setTranscript("Failed to transcribe. Please check the file format (MP3/WAV) and try again.");
    } finally {
      setLoading(false);
      setFile(null); // Reset file after upload
    }
  };

  return (
    <div className="chat-container">
      <h2>Audio Transcriber</h2>
      
      <div className="input-area" style={{ flexDirection: 'column', gap: '10px' }}>
        {/* Custom File Selector */}
        <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
            <input
              type="file"
              id="audio-upload"
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="audio-upload" className="tab-btn" style={{ 
                flex: 1, 
                cursor: 'pointer', 
                textAlign: 'center',
                border: '1px solid #555',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
              {file ? `📄 ${file.name}` : "📁 Choose MP3 File"}
            </label>

            <button onClick={transcribeAudio} disabled={loading || !file}>
              {loading ? `Uploading ${progress}%` : "Transcribe"}
            </button>
        </div>

        {/* Loading Bar (Senior Touch) */}
        {loading && (
          <div style={{ width: '100%', height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#007bff', transition: 'width 0.3s' }} />
          </div>
        )}
      </div>

      <div className="output">
        <strong>Transcript:</strong>
        <p style={{ whiteSpace: "pre-wrap" }}>
            {transcript || (loading ? "AI is processing your audio..." : "Transcription will appear here")}
        </p>
      </div>
    </div>
  );
}

export default AudioComponent;