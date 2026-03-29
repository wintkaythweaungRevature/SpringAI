import React, { useState, useEffect } from 'react';
import './App.css';
import { useMediaQuery } from './hooks/useMediaQuery';

// Icons — react-icons/hi2 (Heroicons v2, solid style)
import { HiHome, HiChatBubbleLeftRight, HiPhoto, HiSparkles } from 'react-icons/hi2';
import { HiDocumentText, HiMicrophone } from 'react-icons/hi2';
import { HiVideoCamera, HiChartBar, HiChatBubbleOvalLeft, HiArrowPathRoundedSquare,
         HiLink, HiGlobeAlt, HiArrowTrendingUp, HiCpuChip } from 'react-icons/hi2';
import { HiPencilSquare, HiDocumentMagnifyingGlass } from 'react-icons/hi2';
import { HiCog6Tooth, HiCreditCard } from 'react-icons/hi2';
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
import ForgotPassword from './components/ForgotPassword';
import { useAuth } from './context/AuthContext';
import MemberGate from './components/MemberGate';
import AskAIGate from './components/AskAIGate';
import LandingSection from './components/LandingSection';
import VideoPublisher from './components/VideoPublisher';
import SocialConnect from './components/SocialConnect';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import MessagesInbox from './components/MessagesInbox';
import LinkInBioBuilder from './components/LinkInBioBuilder';
import DeepAnalytics from './components/DeepAnalytics';
import SocialAIChat from './components/SocialAIChat';
import PricingPage from './components/PricingPage';
import AutoReplySettings from './components/AutoReplySettings';
import ProGate from './components/ProGate';
import ContentCalendar from './components/ContentCalendar';

const BRAND_LOGO_SRC = '/android-chrome-192x192.png';

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
  'analytics': 'Analytics Dashboard',
  'messages':  'Messages & Comments',
  'bio':       'Link in Bio',
  'trends':    'Trends',
  'social-ai': 'Social AI',
  'pricing':      'Pricing & Plans',
  'auto-reply':   'Auto Reply',
  'calendar':     'Content Calendar',
};

/* ─── NavItem ─────────────────────────────────────────────── */
function NavItem({ icon, label, active, onClick, hasArrow }) {
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
      <span style={nav.icon}>{icon}</span>
      <span style={nav.label}>{label}</span>
      {hasArrow && <span style={nav.arrow}>›</span>}
    </button>
  );
}

/* ─── App ─────────────────────────────────────────────────── */
function App() {
  const [activeTab, setActiveTab] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  // authMode: 'login' | 'signup' | 'forgot-password' | 'forgot-username'
  const [authMode, setAuthMode] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, loading, token, apiBase, refetchUser } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const go = (tab) => setActiveTab(tab);
  const pageTitle = PAGE_TITLES[activeTab ?? 'null'] ?? 'Dashboard';
  const handleChoosePlan = async (plan) => {
    if (!user) { setAuthMode('signup'); setShowAuthModal(true); return; }
    const base = apiBase || 'https://api.wintaibot.com';
    try {
      const res = await fetch(`${base}/api/subscription/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan, billingInterval: 'MONTHLY' }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Checkout failed. Please try again.'); return; }
      if (data.updated) {
        alert(data.message || 'Your subscription was updated.');
        if (typeof refetchUser === 'function') refetchUser();
        return;
      }
      if (data.url || data.checkoutUrl) window.location.href = data.url || data.checkoutUrl;
      else alert(data.error || 'Checkout failed. Please try again.');
    } catch { alert('Checkout failed. Please try again.'); }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('social_connect') === 'success' && params.get('platform')) {
      setActiveTab('video-publisher');
    }
    // Reset flow uses /reset-password?token= (handled by Root)
  }, []);

  useEffect(() => {
    if (loading || user) return;
    const params = new URLSearchParams(window.location.search);
    const auth = params.get('auth');
    if (auth === 'login' || auth === 'signup') {
      setAuthMode(auth);
      setShowAuthModal(true);
    }
  }, [loading, user]);

  useEffect(() => {
    const handler = (e) => go(e.detail);
    window.addEventListener('wintaibot:go', handler);
    return () => window.removeEventListener('wintaibot:go', handler);
  }, []);
  const userDisplayName = user?.firstName || user?.lastName
    ? [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
    : (user?.email || '').split('@')[0] || '';
  const userInitials = user?.firstName && user?.lastName
    ? (user.firstName[0] + user.lastName[0]).toUpperCase()
    : (user?.email ? user.email.slice(0, 2).toUpperCase() : '??');

  // Marketing navbar — shown only when not logged in
  const MarketingNav = () => (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: '#0f172a', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 32px', height: '58px',
      boxShadow: '0 1px 0 rgba(255,255,255,0.06)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
           onClick={() => go(null)}>
        <img src={BRAND_LOGO_SRC} alt="Wintaibot logo" width={34} height={34} style={{ display: 'block', flexShrink: 0, borderRadius: '7px' }} />
        <span style={{ color: '#fff', fontWeight: 800, fontSize: '17px', letterSpacing: '-0.01em' }}>Wintaibot</span>
      </div>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        {[
          { label: 'Home',      action: () => go(null) },
          { label: 'Features',  action: () => go(null) },
          { label: 'Pricing',   action: () => go('pricing') },
          { label: 'Use Cases', action: () => go(null) },
        ].map(({ label, action }) => (
          <button key={label} onClick={action} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.78)', fontSize: '14px', fontWeight: 500,
            padding: '0', fontFamily: 'inherit',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.target.style.color = '#fff'}
          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.78)'}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Auth actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
          style={{
            background: 'transparent',
            color: '#e2e8f0',
            border: '1px solid rgba(148,163,184,0.6)',
            borderRadius: '8px',
            padding: '9px 16px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Login
        </button>
        <button
          onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', border: 'none', borderRadius: '8px',
            padding: '9px 20px', fontWeight: 700, fontSize: '14px',
            cursor: 'pointer', whiteSpace: 'nowrap',
            boxShadow: '0 2px 12px rgba(99,102,241,0.4)',
          }}
        >
          Get Started Free →
        </button>
      </div>
    </nav>
  );

  return (
    <div style={s.shell}>

      {/* Marketing Nav — fixed at top for logged-out visitors, above everything */}
      {!user && <MarketingNav />}

      {/* ═══════════════ SIDEBAR ═══════════════ */}
      {user && ((isMobile || isTablet) && sidebarOpen) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}
      {user && <aside style={{
        ...s.sidebar,
        ...(sidebarOpen ? {} : s.sidebarCollapsed),
        ...((isMobile || isTablet) ? {
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
          width: sidebarOpen ? '280px' : '0',
          minWidth: sidebarOpen ? '280px' : '0',
          overflow: 'hidden',
          transition: 'width 0.25s ease, min-width 0.25s ease',
          boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
        } : {}),
      }}>

        {/* Logo */}
        <div style={s.logoArea}>
          <div style={s.logoIconBg}>
            <img src={BRAND_LOGO_SRC} alt="Wintaibot logo" width={34} height={34} style={{ display: 'block', borderRadius: '7px' }} />
          </div>
          {sidebarOpen && <span style={s.logoText}>Wintaibot</span>}
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          <NavItem icon={<HiHome size={17} />} label="Dashboard" active={activeTab === null} onClick={() => go(null)} />

          <div style={s.groupLabel}>AI Tools</div>
          <NavItem icon={<HiChatBubbleLeftRight size={17} />} label="Ask AI"           active={activeTab === 'chat'}             onClick={() => go('chat')}             hasArrow />
          <NavItem icon={<HiPhoto size={17} />}               label="Image Generator"  active={activeTab === 'image-generator'}  onClick={() => go('image-generator')} />
          <NavItem icon={<HiSparkles size={17} />}            label="Recipe Generator" active={activeTab === 'recipe-generator'} onClick={() => go('recipe-generator')} />

          <div style={s.groupLabel}>Documents</div>
          <NavItem icon={<HiDocumentMagnifyingGlass size={17} />} label="DocuWizard" active={activeTab === 'analyzer'}     onClick={() => go('analyzer')} />
          <NavItem icon={<HiMicrophone size={17} />}              label="EchoScribe"  active={activeTab === 'transcription'} onClick={() => go('transcription')} />

          <div style={s.groupLabel}>Social Media</div>
          <NavItem icon={<HiVideoCamera size={17} />}              label="Video Publisher"    active={activeTab === 'video-publisher'} onClick={() => go('video-publisher')} hasArrow />
          <NavItem icon={<HiChartBar size={17} />}                 label="Analytics"          active={activeTab === 'analytics'}       onClick={() => go('analytics')} />
          <NavItem icon={<HiChatBubbleOvalLeft size={17} />}       label="Messages"           active={activeTab === 'messages'}         onClick={() => go('messages')} />
          <NavItem icon={<HiArrowPathRoundedSquare size={17} />}   label="Auto Reply"         active={activeTab === 'auto-reply'}       onClick={() => go('auto-reply')} />
          <NavItem icon={<HiLink size={17} />}                     label="Connected Accounts" active={activeTab === 'social-connect'}   onClick={() => go('social-connect')} />
          <NavItem icon={<HiGlobeAlt size={17} />}                 label="Link in Bio"        active={activeTab === 'bio'}              onClick={() => go('bio')} />
          <NavItem icon={<HiArrowTrendingUp size={17} />}          label="Trends"             active={activeTab === 'trends'}           onClick={() => go('trends')} />
          <NavItem icon={<HiCpuChip size={17} />}                  label="Social AI"          active={activeTab === 'social-ai'}        onClick={() => go('social-ai')} />
          <NavItem icon={<HiPhoto size={17} />}                    label="Content Calendar"   active={activeTab === 'calendar'}         onClick={() => go('calendar')} />

          <div style={s.groupLabel}>Writing Tools</div>
          <NavItem icon={<HiChatBubbleLeftRight size={17} />} label="Reply Enchanter" active={activeTab === 'Content'} onClick={() => go('Content')} />
          <NavItem icon={<HiDocumentText size={17} />}        label="Resume Worlock"  active={activeTab === 'Resume'}  onClick={() => go('Resume')} />

          {user && (
            <>
              <div style={s.groupLabel}>Settings</div>
              <NavItem icon={<HiCog6Tooth size={17} />} label="Account" active={activeTab === 'account'} onClick={() => go('account')} hasArrow />
              <NavItem icon={<HiCreditCard size={17} />} label="Pricing" active={activeTab === 'pricing'} onClick={() => go('pricing')} />
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
      </aside>}

      {/* ═══════════════ MAIN ═══════════════ */}
      <div style={s.main}>

        {/* Marketing Nav for logged-out visitors */}
        {!user && <MarketingNav />}

        {/* Top Bar — only shown when logged in (MarketingNav handles logged-out state) */}
        {user && (
          <header style={s.topBar}>
            <button style={s.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

            <div style={{ flex: 1 }} />

            <div style={s.topRight}>
              {loading ? (
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>...</span>
              ) : (
                <>
                  <span style={s.topEmail} title={user.email}>{user.email}</span>
                  {(() => {
                    const mt = user?.membershipType;
                    /** Same brand colors as PricingPage / UpgradeModal — white label on solid tier color. */
                    const planColors = { STARTER: '#6366f1', PRO: '#8b5cf6', GROWTH: '#0ea5e9', MEMBER: '#6366f1' };
                    const planLabel = { STARTER: 'Starter', PRO: 'Pro', GROWTH: 'Growth', MEMBER: 'Starter' };
                    if (!mt || mt === 'FREE') return null;
                    const bg = planColors[mt] || '#6366f1';
                    return (
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: '700',
                          padding: '4px 11px',
                          borderRadius: '20px',
                          whiteSpace: 'nowrap',
                          background: bg,
                          color: '#ffffff',
                          border: `1px solid ${bg}`,
                          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
                        }}
                      >
                        ✓ {planLabel[mt] || mt}
                      </span>
                    );
                  })()}
                  <button onClick={logout} style={s.logoutBtn}>Logout</button>
                  <div style={s.avatar}>{userInitials}</div>
                </>
              )}
            </div>
          </header>
        )}

        {/* Page title (account email / member badge stay in the top bar only) */}
        <div style={s.pageBar}>
          <h2 style={s.pageTitle}>{pageTitle}</h2>
          {user && (
            <button type="button" style={s.settingsBtn} onClick={() => go('account')} title="Account settings" aria-label="Account settings">
              ⚙️
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ ...s.content, paddingTop: !user ? '58px' : undefined }}>
          {!activeTab && (
            <LandingSection onGetStarted={() => go('chat')} onChoosePlan={handleChoosePlan} />
          )}
          {activeTab === 'image-generator'  && <MemberGate featureName="Image Generator"><ImageGenerator /></MemberGate>}
          {activeTab === 'chat'             && <AskAIGate  featureName="Ask AI"><ChatComponent /></AskAIGate>}
          {activeTab === 'analyzer'         && <MemberGate featureName="DocuWizard"><SpendingAnalyzer /></MemberGate>}
          {activeTab === 'recipe-generator' && <AskAIGate  featureName="Recipe Generator"><ReceipeGenerator /></AskAIGate>}
          {activeTab === 'transcription'    && <MemberGate featureName="EchoScribe"><ProGate featureName="EchoScribe"><Transcription /></ProGate></MemberGate>}
          {activeTab === 'Content'          && <MemberGate featureName="Reply Enchanter"><Content /></MemberGate>}
          {activeTab === 'Resume'           && <MemberGate featureName="Resume Worlock"><Resume /></MemberGate>}
          {activeTab === 'account'          && <AskAIGate  featureName="Account"><AccountSettings /></AskAIGate>}
          {activeTab === 'video-publisher'  && <MemberGate featureName="Video Publisher"><VideoPublisher onNavigateToSocialConnect={() => go('social-connect')} /></MemberGate>}
          {activeTab === 'analytics'        && <MemberGate featureName="Analytics"><AnalyticsDashboard /></MemberGate>}
          {activeTab === 'messages'         && <MemberGate featureName="Messages"><ProGate featureName="Messages"><MessagesInbox /></ProGate></MemberGate>}
          {activeTab === 'social-connect'   && <MemberGate featureName="Connected Accounts"><SocialConnect /></MemberGate>}
          {activeTab === 'bio'              && <MemberGate featureName="Link in Bio"><LinkInBioBuilder /></MemberGate>}
          {activeTab === 'trends'          && <MemberGate featureName="Trends"><ProGate featureName="Trends"><DeepAnalytics /></ProGate></MemberGate>}
          {activeTab === 'social-ai'       && <MemberGate featureName="Social AI"><ProGate featureName="Social AI"><SocialAIChat /></ProGate></MemberGate>}
          {activeTab === 'pricing'         && <PricingPage onClose={() => go(null)} />}
          {activeTab === 'auto-reply'      && <MemberGate featureName="Auto Reply"><ProGate featureName="Auto Reply"><AutoReplySettings /></ProGate></MemberGate>}
          {activeTab === 'calendar'        && <MemberGate featureName="Content Calendar"><ContentCalendar /></MemberGate>}
        </div>
      </div>

      {/* ═══════════════ AUTH MODAL ═══════════════ */}
      {showAuthModal && !user && (
        <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <button onClick={() => setShowAuthModal(false)} className="auth-modal-close" aria-label="Close">✕</button>
            {authMode === 'login' && (
              <Login
                onSuccess={() => setShowAuthModal(false)}
                onSwitchToSignup={() => setAuthMode('signup')}
                onForgotPassword={(mode) => setAuthMode(mode === 'username' ? 'forgot-username' : 'forgot-password')}
              />
            )}
            {authMode === 'signup' && (
              <Signup onSuccess={() => setShowAuthModal(false)} onSwitchToLogin={() => setAuthMode('login')} />
            )}
            {(authMode === 'forgot-password' || authMode === 'forgot-username') && (
              <ForgotPassword mode={authMode === 'forgot-username' ? 'username' : 'password'} onBack={() => setAuthMode('login')} />
            )}
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
  icon: { fontSize: '0px', flexShrink: 0, width: '20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
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
    width: '224px', minWidth: '224px', maxWidth: '280px', height: '100vh',
    background: '#1a2547',
    borderRight: '1px solid rgba(0,0,0,0.12)',
    display: 'flex', flexDirection: 'column',
    transition: 'width 0.25s ease, min-width 0.25s ease',
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
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, overflow: 'hidden', lineHeight: 0,
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
    overflow: 'hidden', background: '#f0f4f8',
    minWidth: 0,
  },

  /* Top Bar */
  topBar: {
    height: '58px', flexShrink: 0,
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center',
    padding: '0 12px 0 16px', gap: '10px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    flexWrap: 'wrap', minWidth: 0,
  },
  menuBtn: {
    background: 'none', border: 'none', color: '#94a3b8',
    fontSize: '18px', cursor: 'pointer', padding: '4px 6px',
    borderRadius: '6px', flexShrink: 0, lineHeight: 1,
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '24px', padding: '8px 16px',
    flex: 1, maxWidth: '360px', minWidth: 0,
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
    fontSize: '11.5px', fontWeight: '700', color: '#ffffff',
    background: '#6366f1',
    border: '1px solid #6366f1',
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
    padding: '12px 16px 0', flexShrink: 0,
    flexWrap: 'wrap', gap: '8px',
  },
  pageTitle: {
    margin: 0, fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: '800',
    color: '#0f172a', letterSpacing: '-0.4px',
  },
  settingsBtn: {
    background: '#f1f5f9', border: '1px solid #e2e8f0',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '16px', padding: '6px 8px', lineHeight: 1,
  },

  /* Content */
  content: {
    flex: 1, overflowY: 'auto', overflowX: 'hidden',
    padding: '16px',
    minWidth: 0,
  },
};
