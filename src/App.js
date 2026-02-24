import React, { useState } from 'react';
import './App.css';
import ImageGenerator from './components/ImageGenerator';
import ChatComponent from './components/ChatComponent';
import ReceipeGenerator from './components/ReceipeGenerator';
import AudioUploader from './components/AudioComponent';

function App() {
  const [activeTab, setActiveTab] = useState('image-generator');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Wint's AI Bot</h1>
     
      </header>

      <div className="tab-buttons">
         <button 
         className={`tab-btn ${activeTab === 'image-generator' ? 'active' : ''}`} 
        onClick={() => handleTabChange('image-generator')}>
         Image Generator
        </button>
        <button className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`} 
          onClick={() => handleTabChange('chat')}>
          Ask AI
        </button>
        <button className={`tab-btn ${activeTab === 'recipe-generator' ? 'active' : ''}`}
          onClick={() => handleTabChange('recipe-generator')}> 
          Recipe Generator 
        </button>
        <button className={`tab-btn ${activeTab === 'Audio-Transcript' ? 'active' : ''}`}
          onClick={() => handleTabChange('Audio-Transcript')}> 
          Audio Transcript 
        </button>
        
        
      </div>
      
      <div className="content">
        {activeTab === 'image-generator' && <ImageGenerator />}
        {activeTab === 'chat' && <ChatComponent />}
        {activeTab === 'recipe-generator' && <ReceipeGenerator />}
        {activeTab === 'Audio-Transcript' && <AudioUploader />}
      </div>
    </div>
  );
}

export default App;