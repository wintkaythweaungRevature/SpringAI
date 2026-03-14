import React, { useState } from 'react';
import './App.css';
import ImageGenerator from './components/ImageGenerator';
import ChatComponent from './components/ChatComponent';
import ReceipeGenerator from './components/ReceipeGenerator';
import SpendingAnalyzer from './components/Analyzer';
import Transcription from './components/Transcription';
import Content from './components/Content';
import Resume from './components/Resume';
import AccountSettings from './components/AccountSettings';
import Login from './components/Login';
import Signup from './components/Signup';
import { useAuth } from './context/AuthContext';
import MemberGate from './components/MemberGate';
import AskAIGate from './components/AskAIGate';
import LandingSection from './components/LandingSection';

function App() {
  const [activeTab, setActiveTab] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const { user, logout, loading } = useAuth();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Wintaibot</h1>
        <div className="auth-btns">
          {loading ? (
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>...</span>
          ) : user ? (
            <>
              <span className="user-info">
                {user.email}
                {user?.membershipType === 'MEMBER' && <span className="member-badge">✓ Member</span>}
              </span>
              <button onClick={logout} className="btn-logout">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="btn-login">Login</button>
              <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} className="btn-signup">Sign Up</button>
            </>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && !user && (
        <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <button onClick={() => setShowAuthModal(false)} className="auth-modal-close" aria-label="Close">✕</button>
            {authMode === 'login' ? (
              <Login onSuccess={() => setShowAuthModal(false)} onSwitchToSignup={() => setAuthMode('signup')} />
            ) : (
              <Signup onSuccess={() => setShowAuthModal(false)} onSwitchToLogin={() => setAuthMode('login')} />
            )}
          </div>
        </div>
      )}

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
        <button className={`tab-btn ${activeTab === 'Resume' ? 'active' : ''}`}
          onClick={() => handleTabChange('Resume')}> 
         Resume Worlock
        </button>
        {user && (
          <button className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => handleTabChange('account')}>
            Account
          </button>
        )}
      </div>
      
      <div className="content">
        {!activeTab && (
          <LandingSection onGetStarted={() => handleTabChange('chat')} />
        )}
        {activeTab === 'image-generator' && <MemberGate featureName="Image Generator"><ImageGenerator /></MemberGate>}
        {activeTab === 'chat' && <ChatComponent />}
        {activeTab === 'analyzer' && <MemberGate featureName="DocuWizard"><SpendingAnalyzer /></MemberGate>}
        {activeTab === 'recipe-generator' && <AskAIGate featureName="Recipe Generator"><ReceipeGenerator /></AskAIGate>}
        {activeTab === 'transcription' && <MemberGate featureName="EchoScribe"><Transcription /></MemberGate>}
        {activeTab === 'Content' && <MemberGate featureName="Reply Enchanter"><Content /></MemberGate>}
        {activeTab === 'Resume' && <MemberGate featureName="Resume Worlock"><Resume /></MemberGate>}
        {activeTab === 'account' && <AskAIGate featureName="Account"><AccountSettings /></AskAIGate>}
      </div>
      
    </div>
  );
}

export default App;