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
        <h1>Wint's AI Bot</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {loading ? (
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>...</span>
          ) : user ? (
            <>
              <span style={{ fontSize: '14px', color: '#fff' }}>
                {user.email}
                {user?.membershipType === 'MEMBER' && <span style={{ color: '#7cff7c', marginLeft: '6px' }}>✓ Member</span>}
              </span>
              <button onClick={logout} style={{ padding: '6px 12px', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '6px', cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                style={{ padding: '6px 14px', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '6px', cursor: 'pointer' }}
              >
                Login
              </button>
              <button
                onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                style={{ padding: '6px 14px', fontSize: '14px', backgroundColor: '#fff', color: '#0070f3', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && !user && (
        <div
          onClick={() => setShowAuthModal(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '8px', maxWidth: '400px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 8px 0' }}>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✕</button>
            </div>
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
        {activeTab === 'chat' && <AskAIGate featureName="Ask AI"><ChatComponent /></AskAIGate>}
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