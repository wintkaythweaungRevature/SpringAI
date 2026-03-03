import React, { useState } from 'react';
import './App.css';
import ImageGenerator from './components/ImageGenerator';
import ChatComponent from './components/ChatComponent';
import ReceipeGenerator from './components/ReceipeGenerator';
import SpendingAnalyzer from './components/Analyzer';
import Transcription from './components/Transcription'; // Or whatever your filename is
import Content from './components/Content'; // Importing the new Content component

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
        <button className={`tab-btn ${activeTab === 'analyzer' ? 'active' : ''}`}
          onClick={() => handleTabChange('analyzer')}> 
         DocuWizard 
        </button>
        <button className={`tab-btn ${activeTab === 'transcription' ? 'active' : ''}`}
          onClick={() => handleTabChange('transcription')}> 
         EchoScribe 
        </button>
        <button className={`tab-btn ${activeTab === 'Content' ? 'active' : ''}`}
          onClick={() => handleTabChange('Content')}> 
         Reply Enchanter
        </button>
       
        
        
      </div>
      
      <div className="content">
        {activeTab === 'image-generator' && <ImageGenerator />}
        {activeTab === 'chat' && <ChatComponent />}
         {activeTab === 'analyzer' && <SpendingAnalyzer />}
        {activeTab === 'recipe-generator' && <ReceipeGenerator />}
        
        {activeTab === 'transcription' && <Transcription />}
        {activeTab === 'Content' && <Content />}
        {activeTab}

       
      </div>
      
    </div>
  );
}

export default App;