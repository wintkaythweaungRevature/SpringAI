'use client';

import React, { useState } from "react";
import "./Content.css";
import { useAuth } from "@/context/AuthContext";

function Content() {
  const { token, apiBase } = useAuth();
  const [emailInput, setEmailInput] = useState("");
  const [tone, setTone] = useState("Professional");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!emailInput) return alert("Please enter the email content!");
    setLoading(true);
    
    try {
      const url = `${apiBase || 'https://api.wintaibot.com'}/api/ai/reply`;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          emailContent: emailInput, 
          tone: tone.toLowerCase() 
        }),
      });
      const data = await response.text();
      setResult(data);
    } catch (error) {
      setResult("Error generating reply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    alert("Copied to clipboard!");
  };

  return (
    <div className="enchanter-container">
      <div className="enchanter-card">
        {/* Input Section */}
        <div className="section-block">
          <h3 className="section-label">Paste Original Email</h3>
          <textarea
            className="email-input-box"
            placeholder="What email are we replying to?"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
        </div>

        {/* Configuration Row */}
        <div className="config-bar">
          <div className="tone-group">
            <span className="mini-label">Tone</span>
            <select 
              className="tone-dropdown" 
              value={tone} 
              onChange={(e) => setTone(e.target.value)}
            >
              <option>Professional</option>
              <option>Friendly</option>
              <option>Casual</option>
              <option>Urgent</option>
            </select>
          </div>
          <button 
            className="action-button" 
            onClick={handleGenerate} 
            disabled={loading}
          >
            {loading ? "Drafting..." : "Generate Magic Reply"}
          </button>
        </div>

        {/* Result Area */}
        {result && (
          <div className="result-block">
            <div className="result-header">
              <h3 className="section-label">AI Drafted Reply</h3>
              <button className="text-copy-btn" onClick={copyToClipboard}>
                📋 Copy
              </button>
            </div>
            <div className="output-display">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Content;