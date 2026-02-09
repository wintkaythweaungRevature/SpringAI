import React, { useState } from 'react';
import './App.css';
import ImageGenerator from './components/ImageGenerator';
import ChatComponent from './components/ChatComponent';
import ReceipeGenerator from './components/ReceipeGenerator';

function App() {
  const [activeTab, setActiveTab] = useState('image-generator');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="App">
      <header className="portfolio-header">
        <h1>WINT KAY THWE AUNG</h1>
        <p>AI Developer Portfolio</p>
      </header>

      <div className="tab-buttons">
        <button className={activeTab === 'image-generator' ? 'active' : ''} 
          onClick={() => handleTabChange('image-generator')}> 
          Image Generator
        </button>
        <button className={activeTab === 'chat' ? 'active' : ''}
          onClick={() => handleTabChange('chat')}>
          Ask AI
        </button>
        <button className={activeTab === 'recipe-generator' ? 'active' : ''}
          onClick={() => handleTabChange('recipe-generator')}> 
          Recipe Generator 
        </button>
      </div>
      
      <div className="content">
        {activeTab === 'image-generator' && <ImageGenerator />}
        {activeTab === 'chat' && <ChatComponent />}
        {activeTab === 'recipe-generator' && <ReceipeGenerator />}
      </div>
    </div>
  );
}

export default App;