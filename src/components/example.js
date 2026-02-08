import React, { useState } from 'react';
import './App.css';
import ImageGenerator from './components/ImageGenerator';
import ChatComponent from './components/ChatComponent';
import ReceipeGenerator from './components/ReceipeGenerator';

// ✅ ၁။ 'async' ကို function အရှေ့ကနေ ဖယ်ထုတ်လိုက်ပါ။ 
// React Component တွေကို async function ပေးလို့ မရပါဘူး။
function App() {
  const [activeTab, setActiveTab] = useState('image-generator');

  // ✅ ၂။ ဒီနေရာမှာ fetch ခေါ်ထားတာကို ဖယ်လိုက်ပါ။ 
  // API ခေါ်တာတွေကို Component တစ်ခုချင်းစီ (ဥပမာ- ChatComponent.js) ထဲမှာပဲ လုပ်ရမှာပါ။
  // App.js က Tab တွေကို ပြောင်းပေးဖို့နဲ့ UI structure အတွက်ပဲ သုံးတာ ပိုကောင်းပါတယ်။

  return (
    <div className="portfolio-container">
      {/* --- HEADER SECTION --- */}
      <header className="portfolio-header">
        <h1>WINT KAY THWE AUNG</h1>
        <p>Full Stack Developer & AI Enthusiast</p>
      </header>

      <main className="main-content">
        {/* --- LEFT SIDE: PROFILE --- */}
        <section className="profile-sidebar">
          <div className="profile-image-container">
            {/* မင်းရဲ့ပုံကို public folder ထဲမှာ my-profile.jpg နာမည်နဲ့ ထည့်ထားပါ */}
            <img src="/my-profile.jpg" alt="Wint Kay" className="circle-image" />
          </div>
          <div className="bio">
            <h3>About Me</h3>
            <p>Passionate about building AI applications and creative arts.</p>
            <a href="/my-cv.pdf" target="_blank" className="cv-button">
              Download My CV (PDF)
            </a>
          </div>
        </section>

        {/* --- RIGHT SIDE: PROJECTS (AI TOOLS) --- */}
        <section className="projects-section">
          <h2>My AI Projects</h2>
          <div className="tab-buttons">
            <button className={activeTab === 'image-generator' ? 'active' : ''} 
              onClick={() => setActiveTab('image-generator')}>Image Generator</button>
            <button className={activeTab === 'chat' ? 'active' : ''} 
              onClick={() => setActiveTab('chat')}>Ask AI</button>
            <button className={activeTab === 'recipe-generator' ? 'active' : ''} 
              onClick={() => setActiveTab('recipe-generator')}>Recipe Generator</button>
          </div>

          <div className="tab-content">
            {/* Component တစ်ခုချင်းစီထဲမှာ URL တွေ အမှန်ပြင်ထားဖို့ လိုပါတယ် */}
            {activeTab === 'image-generator' && <ImageGenerator />}
            {activeTab === 'chat' && <ChatComponent />}
            {activeTab === 'recipe-generator' && <ReceipeGenerator />}
          </div>
        </section>
      </main>

      {/* --- BOTTOM SECTION: HOBBIES, PAINTINGS & VIDEOS --- */}
      <footer className="hobbies-section">
        <hr />
        <h2>Hobbies & Creativity</h2>
        <div className="hobbies-grid">
          <div className="hobby-item">
            <h3>My Paintings</h3>
            <div className="gallery">
              <img src="/painting1.jpg" alt="Painting 1" />
              <img src="/painting2.jpg" alt="Painting 2" />
            </div>
          </div>
          <div className="hobby-item">
            <h3>My Videos</h3>
            <div className="video-container">
               <p>Video content goes here...</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;