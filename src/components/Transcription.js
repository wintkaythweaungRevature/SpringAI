import React, { useState } from "react";
import "./Transcription.css"; 

function Transcription() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");

  const handleProcess = async () => {
    if (!file) return alert("Please upload an audio file!");
    
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setTranscript(""); 

    try {
      // Points to your new transcription endpoint
      const url = `https://api.wintaibot.com/transcribe`;
      const response = await fetch(url, {
        method: "POST",
        body: formData, // No headers needed for FormData; Fetch sets them automatically
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error (${response.status}): ${errorText || "Error"}`);
      }

      // Since your Java backend returns response.getResult().getOutput() as a String:
      const data = await response.text(); 
      setTranscript(data);
    } catch (error) {
      setTranscript(`Transcription failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyzer-card">
      <div className="analyzer-header-container">
        <span style={{ fontSize: '32px' }}>🎙️</span>
        <h2 className="analyzer-main-title">AI Voice Transcriber</h2>
      </div>
      <p className="analyzer-sub-title">Convert MP3/WAV Audio to Text Instantly</p>
      
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])} 
        accept="audio/*"  // Changed to accept audio files
        className="analyzer-input"
      />
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button onClick={handleProcess} disabled={loading} className="analyzer-button">
          {loading ? "⌛ Transcribing..." : "Start Transcription"}
        </button>
        
        {transcript && (
          <button onClick={() => { setTranscript(""); setFile(null); }} className="analyzer-clear-button">
            Clear
          </button>
        )}
      </div>

      {transcript && (
        <div className="analyzer-summary-card">
          <h4 className="analyzer-card-header">📝 Transcript</h4>
          <div className="analyzer-summary-text" style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            {transcript}
          </div>
          <button 
            className="analyzer-export-button" 
            style={{ marginTop: '15px' }}
            onClick={() => navigator.clipboard.writeText(transcript)}
          >
            📋 Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}

export default Transcription;