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
import VideoPublisher from './components/VideoPublisher';
import SocialConnect from './components/SocialConnect';

const PAGE_TITLES = {
  null: 'Dashboard',
  'chat': 'Ask AI',
  'image-generator': 'Image Generator',
  'recipe-generator': 'Recipe Generator',
  'analyzer': 'DocuWizard',
  'transcription': 'EchoScribe',
  'Content': 'Reply Enchanter',
  'Resume': 'Resume Worlock',
  'account': 'Account',
  'video-publisher': 'Video Publisher',
  'social-connect': 'Connected Accounts',
};

/* ─── NavItem ─────────────────────────────────────────────── */
function NavItem({ emoji, label, active, onClick, hasArrow }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{
        ...nav.item,
        ...(active ? nav.active : hovered ? nav.hover : {}),
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={nav.emoji}>{emoji}</span>
      <span style={nav.label}>{label}</span>
      {hasArrow && <span style={nav.arrow}>›</span>}
    </button>
  );
}

/* ─── App ─────────────────────────────────────────────────── */
function App() {
  const [activeTab, setActiveTab] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, loading } = useAuth();

  const go = (tab) => setActiveTab(tab);
  const pageTitle = PAGE_TITLES[activeTab] ?? 'Dashboard';
  const userInitials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??';

  return (
    <div style={s.shell}>

      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <aside style={{ ...s.sidebar, ...(sidebarOpen ? {} : s.sidebarCollapsed) }}>

        {/* Logo */}
        <div style={s.logoArea}>
          <div style={s.logoIconBg}>🤖</div>
          {sidebarOpen && <span style={s.logoText}>Wintaibot</span>}
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          <NavItem emoji="🏠" label="Dashboard" active={activeTab === null} onClick={() => go(null)} />

          <div style={s.groupLabel}>AI Tools</div>
          <NavItem emoji="💬" label="Ask AI"           active={activeTab === 'chat'}             onClick={() => go('chat')}             hasArrow />
          <NavItem emoji="🖼️" label="Image Generator"  active={activeTab === 'image-generator'}  onClick={() => go('image-generator')} />
          <NavItem emoji="🍲" label="Recipe Generator" active={activeTab === 'recipe-generator'} onClick={() => go('recipe-generator')} />

          <div style={s.groupLabel}>Documents</div>
          <NavItem emoji="🧙‍♂️" label="DocuWizard" active={activeTab === 'analyzer'}     onClick={() => go('analyzer')} />
          <NavItem emoji="🎙️" label="EchoScribe"  active={activeTab === 'transcription'} onClick={() => go('transcription')} />

          <div style={s.groupLabel}>Social Media</div>
          <NavItem emoji="📲" label="Video Publisher" active={activeTab === 'video-publisher'} onClick={() => go('video-publisher')} hasArrow />
          <NavItem emoji="🔗" label="Connected Accounts" active={activeTab === 'social-connect'} onClick={() => go('social-connect')} />

          <div style={s.groupLabel}>Writing Tools</div>
          <NavItem emoji="✉️" label="Reply Enchanter" active={activeTab === 'Content'} onClick={() => go('Content')} />
          <NavItem emoji="📝" label="Resume Worlock"  active={activeTab === 'Resume'}  onClick={() => go('Resume')} />

          {user && (
            <>
              <div style={s.groupLabel}>Settings</div>
              <NavItem emoji="⚙️" label="Account" active={activeTab === 'account'} onClick={() => go('account')} hasArrow />
            </>
          )}
        </nav>

        {/* Explore Tools */}
        <div style={s.sidebarFooter}>
          <button style={s.exploreBtn}>
            <span style={{ fontSize: '15px' }}>⊞</span>
            {sidebarOpen && <><span style={{ flex: 1 }}>Explore Tools</span><span style={{ opacity: 0.5, fontSize: '13px' }}>›</span></>}
          </button>
        </div>
      </aside>

      {/* ═══════════════ MAIN ═══════════════ */}
      <div style={s.main}>

        {/* Top Bar - Wintaibot logo left, search center, icons + user right */}
        <header style={s.topBar}>
          <div style={s.topLeft}>
            <button style={s.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">☰</button>
            <span style={s.topBarLogo}>Wintaibot</span>
          </div>

          <div style={s.searchBox}>
            <span style={{ opacity: 0.4, fontSize: '14px' }}>🔍</span>
            <input style={s.searchInput} type="text" placeholder="Search..." />
          </div>

          <div style={s.topRight}>
            {loading ? (
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>...</span>
            ) : user ? (
              <>
                <button style={s.iconBtn} title="Messages">💬</button>
                <button style={s.iconBtn} title="Notifications">
                  <span style={s.bellWrap}>🔔<span style={s.redDot} /></span>
                </button>
                <button style={s.iconBtn} onClick={() => go('account')} title="Settings">
                  <span style={s.bellWrap}>⚙️<span style={s.redDot} /></span>
                </button>
                <button style={s.avatarBtn} onClick={() => go('account')} title={user.email}>
                  <div style={s.avatar}>{userInitials}</div>
                </button>
                <span style={s.topEmail} title={user.email}>{user.email}</span>
                {user?.membershipType === 'MEMBER' && (
                  <span style={s.memberBadge}>✓ Member</span>
                )}
                <button onClick={logout} style={s.logoutBtn}>Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} style={s.loginBtn}>Login</button>
                <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} style={s.signupBtn}>Sign Up</button>
              </>
            )}
          </div>
        </header>

        {/* Page Header Bar */}
        <div style={s.pageBar}>
          <h2 style={s.pageTitle}>{pageTitle}</h2>
          {user && (
            <div style={s.pageRight}>
              <span style={s.pageEmail}>{user.email}</span>
              {user?.membershipType === 'MEMBER' && (
                <span style={s.pageMemberBadge}>✓ Member</span>
              )}
              <button style={s.settingsBtn} onClick={() => go('account')} title="Account Settings">⚙️</button>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={s.content}>
          {!activeTab && (
            <LandingSection onGetStarted={() => go('chat')} />
          )}
          {activeTab === 'image-generator'  && <MemberGate featureName="Image Generator"><ImageGenerator /></MemberGate>}
          {activeTab === 'chat'             && <AskAIGate  featureName="Ask AI"><ChatComponent /></AskAIGate>}
          {activeTab === 'analyzer'         && <MemberGate featureName="DocuWizard"><SpendingAnalyzer /></MemberGate>}
          {activeTab === 'recipe-generator' && <AskAIGate  featureName="Recipe Generator"><ReceipeGenerator /></AskAIGate>}
          {activeTab === 'transcription'    && <MemberGate featureName="EchoScribe"><Transcription /></MemberGate>}
          {activeTab === 'Content'          && <MemberGate featureName="Reply Enchanter"><Content /></MemberGate>}
          {activeTab === 'Resume'           && <MemberGate featureName="Resume Worlock"><Resume /></MemberGate>}
          {activeTab === 'account'          && <AccountSettings />}
          {activeTab === 'video-publisher'  && <MemberGate featureName="Video Publisher"><VideoPublisher /></MemberGate>}
          {activeTab === 'social-connect'   && <MemberGate featureName="Connected Accounts"><SocialConnect /></MemberGate>}
        </div>
      </div>

      {/* ═══════════════ AUTH MODAL ═══════════════ */}
      {showAuthModal && !user && (
        <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <button onClick={() => setShowAuthModal(false)} className="auth-modal-close" aria-label="Close">✕</button>
            {authMode === 'login'
              ? <Login  onSuccess={() => setShowAuthModal(false)} onSwitchToSignup={() => setAuthMode('signup')} />
              : <Signup onSuccess={() => setShowAuthModal(false)} onSwitchToLogin={() => setAuthMode('login')} />
            }
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

/* ─── Styles ──────────────────────────────────────────────── */
const nav = {
  item: {
    display: 'flex', alignItems: 'center', gap: '10px',
    width: '100%', padding: '9px 12px', borderRadius: '10px',
    border: 'none', background: 'transparent',
    color: '#94a3b8', fontSize: '13.5px', fontWeight: '500',
    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
    marginBottom: '2px', transition: 'all 0.15s',
  },
  active: {
    background: '#2563eb',
    color: '#ffffff',
    fontWeight: '700',
  },
  hover: {
    background: 'rgba(255,255,255,0.08)',
    color: '#ffffff',
  },
  emoji: { fontSize: '16px', flexShrink: 0, width: '20px', textAlign: 'center' },
  label: { flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  arrow: { opacity: 0.45, fontSize: '17px', marginLeft: 'auto' },
};

const s = {
  shell: {
    display: 'flex', height: '100vh', overflow: 'hidden',
    fontFamily: "'Inter', -apple-system, sans-serif",
    background: '#f0f4f8',
  },

  /* Sidebar */
  sidebar: {
    width: '224px', minWidth: '224px', height: '100vh',
    background: '#1a2547',
    borderRight: '1px solid rgba(0,0,0,0.12)',
    display: 'flex', flexDirection: 'column',
    transition: 'width 0.2s, min-width 0.2s',
    flexShrink: 0, overflow: 'hidden',
  },
  sidebarCollapsed: { width: '60px', minWidth: '60px' },

  logoArea: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '20px 16px 18px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '10px', flexShrink: 0,
  },
  logoIconBg: {
    width: '34px', height: '34px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', flexShrink: 0,
  },
  logoText: {
    color: '#f1f5f9', fontSize: '16px', fontWeight: '800',
    letterSpacing: '-0.3px', whiteSpace: 'nowrap',
  },

  nav: {
    flex: 1, overflowY: 'auto', overflowX: 'hidden',
    padding: '4px 8px',
    scrollbarWidth: 'none',
  },
  groupLabel: {
    fontSize: '10.5px', fontWeight: '700',
    color: 'rgba(255,255,255,0.32)',
    textTransform: 'uppercase', letterSpacing: '1px',
    padding: '16px 12px 6px',
    whiteSpace: 'nowrap',
  },
  sidebarFooter: {
    padding: '10px 8px 16px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    flexShrink: 0,
  },
  exploreBtn: {
    display: 'flex', alignItems: 'center', gap: '10px',
    width: '100%', padding: '10px 12px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#94a3b8', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'inherit',
  },

  /* Main */
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    overflow: 'hidden', background: '#f1f5f9',
  },

  /* Top Bar */
  topBar: {
    height: '58px', flexShrink: 0,
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center',
    padding: '0 20px', gap: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  topLeft: {
    display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0,
  },
  topBarLogo: {
    color: '#1a2547', fontSize: '16px', fontWeight: '800',
    letterSpacing: '-0.3px',
  },
  menuBtn: {
    background: 'none', border: 'none', color: '#64748b',
    fontSize: '18px', cursor: 'pointer', padding: '4px 6px',
    borderRadius: '6px', flexShrink: 0, lineHeight: 1,
  },
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '18px', padding: '6px', borderRadius: '8px',
    color: '#64748b', lineHeight: 1, position: 'relative',
  },
  bellWrap: { position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  redDot: {
    position: 'absolute', top: '-2px', right: '-2px',
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#ef4444', border: '1.5px solid #fff',
  },
  avatarBtn: {
    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '24px', padding: '8px 16px',
    flex: 1, maxWidth: '360px',
  },
  searchInput: {
    border: 'none', background: 'transparent',
    outline: 'none', fontSize: '13px',
    color: '#0f172a', width: '100%', fontFamily: 'inherit',
  },
  topRight: {
    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px',
  },
  topEmail: {
    fontSize: '13px', color: '#64748b',
    maxWidth: '180px', overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  memberBadge: {
    fontSize: '11.5px', fontWeight: '700', color: '#16a34a',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap',
  },
  logoutBtn: {
    padding: '6px 14px', borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff', color: '#64748b',
    fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
  },
  loginBtn: {
    padding: '7px 16px', borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff', color: '#0f172a',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
  },
  signupBtn: {
    padding: '7px 16px', borderRadius: '8px', border: 'none',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    color: '#fff', fontSize: '13px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: '12px', fontWeight: '700', flexShrink: 0,
    boxShadow: '0 0 0 2px rgba(102,126,234,0.3)',
  },

  /* Page Header */
  pageBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 28px 0', flexShrink: 0,
  },
  pageTitle: {
    margin: 0, fontSize: '22px', fontWeight: '800',
    color: '#0f172a', letterSpacing: '-0.4px',
  },
  pageRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  pageEmail: { fontSize: '13px', color: '#64748b' },
  pageMemberBadge: {
    fontSize: '11.5px', fontWeight: '700', color: '#16a34a',
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    padding: '3px 10px', borderRadius: '20px',
  },
  settingsBtn: {
    background: '#f1f5f9', border: '1px solid #e2e8f0',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '16px', padding: '6px 8px', lineHeight: 1,
  },

  /* Content */
  content: {
    flex: 1, overflowY: 'auto', overflowX: 'hidden',
    padding: '20px 28px 32px',
  },
};
