import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { useMediaQuery } from './hooks/useMediaQuery';

// Icons — react-icons/hi2 (Heroicons v2, solid style)
import { HiHome, HiChatBubbleLeftRight, HiPhoto, HiSparkles } from 'react-icons/hi2';
import { HiDocumentText, HiMicrophone } from 'react-icons/hi2';
import { HiChatBubbleOvalLeft, HiArrowTrendingUp, HiCpuChip } from 'react-icons/hi2';
import { HiPencilSquare, HiDocumentMagnifyingGlass } from 'react-icons/hi2';
import { HiCog6Tooth, HiCreditCard, HiQuestionMarkCircle } from 'react-icons/hi2';
import HelpPanel from './components/HelpPanel';
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
import GrowthGate from './components/GrowthGate';
import ContentCalendar from './components/ContentCalendar';

const BRAND_LOGO_SRC = '/android-chrome-192x192.png';

/** Sidebar section titles — single source of truth for the logged-in nav. */
const SIDEBAR_GROUPS = {
  smartHub: 'Smart Hub',
  digitalVault: 'Digital Vault',
  socialHq: 'Social HQ',
  theForge: 'The Forge',
  settings: 'Settings',
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

const marketingNavLinkBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'rgba(255,255,255,0.78)',
  fontSize: '14px',
  fontWeight: 500,
  padding: '0',
  fontFamily: 'inherit',
  transition: 'color 0.15s',
};

function MarketingNav({ go, onLogin, onSignup }) {
  const [resourcesOpen, setResourcesOpen] = useState(false);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: '58px',
        boxShadow: '0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        onClick={() => go(null)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(null); } }}
        role="button"
        tabIndex={0}
      >
        <img src={BRAND_LOGO_SRC} alt="W!ntAi logo" width={34} height={34} style={{ display: 'block', flexShrink: 0, borderRadius: '7px' }} />
        <span style={{ color: '#fff', fontWeight: 800, fontSize: '17px', letterSpacing: '-0.01em' }}>W!ntAi</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        {[
          { label: 'Home', action: () => go(null) },
          { label: 'Features', action: () => go(null) },
          { label: 'Pricing', action: () => go('pricing') },
        ].map(({ label, action }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            style={marketingNavLinkBtn}
            onMouseEnter={(e) => { e.target.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.target.style.color = 'rgba(255,255,255,0.78)'; }}
          >
            {label}
          </button>
        ))}
        <div
          style={{ position: 'relative' }}
          onMouseEnter={() => setResourcesOpen(true)}
          onMouseLeave={() => setResourcesOpen(false)}
        >
          <button
            type="button"
            style={marketingNavLinkBtn}
            aria-expanded={resourcesOpen}
            aria-haspopup="true"
            onClick={() => setResourcesOpen((o) => !o)}
            onMouseEnter={(e) => { e.target.style.color = '#fff'; }}
            onMouseLeave={(e) => { if (!resourcesOpen) e.target.style.color = 'rgba(255,255,255,0.78)'; }}
          >
            Resources <span style={{ opacity: 0.65 }} aria-hidden="true">▾</span>
          </button>
          {resourcesOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 8,
                background: '#1e293b',
                border: '1px solid rgba(148,163,184,0.25)',
                borderRadius: 8,
                padding: '8px 0',
                minWidth: 168,
                boxShadow: '0 12px 24px rgba(0,0,0,0.35)',
              }}
            >
              <a
                href="/tutorial"
                role="menuitem"
                style={{ display: 'block', padding: '10px 16px', color: 'rgba(255,255,255,0.92)', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}
                onClick={() => setResourcesOpen(false)}
              >
                Tutorials
              </a>
              <a
                href="/blog"
                role="menuitem"
                style={{ display: 'block', padding: '10px 16px', color: 'rgba(255,255,255,0.92)', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}
                onClick={() => setResourcesOpen(false)}
              >
                Blog
              </a>
              <div
                role="separator"
                style={{ borderTop: '1px solid rgba(148,163,184,0.22)', margin: '6px 0 4px' }}
              />
              <a
                href="/privacy-policy"
                role="menuitem"
                style={{ display: 'block', padding: '10px 16px', color: 'rgba(255,255,255,0.92)', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}
                onClick={() => setResourcesOpen(false)}
              >
                Privacy Policy
              </a>
              <a
                href="/terms-of-service"
                role="menuitem"
                style={{ display: 'block', padding: '10px 16px', color: 'rgba(255,255,255,0.92)', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}
                onClick={() => setResourcesOpen(false)}
              >
                Terms of Service
              </a>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={onLogin}
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
          type="button"
          onClick={onSignup}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '9px 20px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 12px rgba(99,102,241,0.4)',
          }}
        >
          Try Free Trial →
        </button>
      </div>
    </nav>
  );
}

/* ─── App ─────────────────────────────────────────────────── */
function App() {
  const [activeTab, setActiveTab] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  // authMode: 'login' | 'signup' | 'forgot-password' | 'forgot-username'
  const [authMode, setAuthMode] = useState('login');
  const [verifiedBanner, setVerifiedBanner] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, loading, token, apiBase, refetchUser } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const navStackRef = useRef([]);

  const go = useCallback((tab) => {
    setActiveTab((prev) => {
      if (tab === null) {
        navStackRef.current = [];
      } else if (tab !== prev) {
        navStackRef.current.push(prev);
      }
      return tab;
    });
  }, []);

  const goBack = useCallback(() => {
    const stack = navStackRef.current;
    if (stack.length > 0) {
      const prev = stack.pop();
      setActiveTab(prev ?? null);
    } else {
      setActiveTab(null);
    }
  }, []);
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
      go('video-publisher');
    }
    // Email verified → show success banner + open login
    if (params.get('verified') === 'true') {
      setVerifiedBanner(true);
      setAuthMode('login');
      setShowAuthModal(true);
      window.history.replaceState({}, '', '/');
    }
    if (params.get('verified') === 'false') {
      setVerifiedBanner('error');
      window.history.replaceState({}, '', '/');
    }
  }, [go]);

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
  }, [go]);

  useEffect(() => {
    const handler = () => { setAuthMode('login'); setShowAuthModal(true); };
    window.addEventListener('wintaibot:openLogin', handler);
    return () => window.removeEventListener('wintaibot:openLogin', handler);
  }, []);
  const userDisplayName = user?.firstName || user?.lastName
    ? [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
    : (user?.email || '').split('@')[0] || '';
  const userInitials = user?.firstName && user?.lastName
    ? (user.firstName[0] + user.lastName[0]).toUpperCase()
    : (user?.email ? user.email.slice(0, 2).toUpperCase() : '??');

  const openLogin = () => { setAuthMode('login'); setShowAuthModal(true); };
  const openSignup = () => { setAuthMode('signup'); setShowAuthModal(true); };

  return (
    <div style={s.shell}>

      {/* Marketing Nav — fixed at top for logged-out visitors, above everything */}
      {!user && <MarketingNav go={go} onLogin={openLogin} onSignup={openSignup} />}

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
            <img src={BRAND_LOGO_SRC} alt="W!ntAi logo" width={34} height={34} style={{ display: 'block', borderRadius: '7px' }} />
          </div>
          {sidebarOpen && <span style={s.logoText}>W!ntAi</span>}
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          <NavItem icon={<HiHome size={17} />} label="Dashboard" active={activeTab === null || activeTab === 'analytics'} onClick={() => go(null)} />

          <div style={s.navDivider} role="separator" aria-hidden="true" />
          <div style={s.groupLabel}>{SIDEBAR_GROUPS.smartHub}</div>
          <NavItem icon={<HiChatBubbleLeftRight size={17} />} label="Ask AI"           active={activeTab === 'chat'}             onClick={() => go('chat')}             hasArrow />
          <NavItem icon={<HiPhoto size={17} />}               label="Image Generator"  active={activeTab === 'image-generator'}  onClick={() => go('image-generator')} />
          <NavItem icon={<HiSparkles size={17} />}            label="Recipe Generator" active={activeTab === 'recipe-generator'} onClick={() => go('recipe-generator')} />

          <div style={s.navDivider} role="separator" aria-hidden="true" />
          <div style={s.groupLabel}>{SIDEBAR_GROUPS.digitalVault}</div>
          <NavItem icon={<HiDocumentMagnifyingGlass size={17} />} label="DocuWizard" active={activeTab === 'analyzer'}     onClick={() => go('analyzer')} />
          <NavItem icon={<HiMicrophone size={17} />}              label="EchoScribe"  active={activeTab === 'transcription'} onClick={() => go('transcription')} />

          <div style={s.navDivider} role="separator" aria-hidden="true" />
          <div style={s.groupLabel}>{SIDEBAR_GROUPS.socialHq}</div>
          <NavItem icon={<HiPhoto size={17} />}                    label="Content Calendar"   active={activeTab === 'calendar'}         onClick={() => go('calendar')} />
          <NavItem icon={<HiChatBubbleOvalLeft size={17} />}       label="Inbox"           active={activeTab === 'messages'}         onClick={() => go('messages')} />
          <NavItem icon={<HiArrowTrendingUp size={17} />}          label="Growth Planner"     active={activeTab === 'trends'}           onClick={() => go('trends')} />
          <NavItem icon={<HiCpuChip size={17} />}                  label="Social AI"          active={activeTab === 'social-ai'}        onClick={() => go('social-ai')} />

          <div style={s.navDivider} role="separator" aria-hidden="true" />
          <div style={s.groupLabel}>{SIDEBAR_GROUPS.theForge}</div>
          <NavItem icon={<HiChatBubbleLeftRight size={17} />} label="Reply Enchanter" active={activeTab === 'Content'} onClick={() => go('Content')} />
          <NavItem icon={<HiDocumentText size={17} />}        label="Career Alchemist"  active={activeTab === 'Resume'}  onClick={() => go('Resume')} />

          <div style={s.navFooterBlock}>
            <div style={s.navDividerStrong} role="separator" aria-hidden="true" />
            <div style={s.groupLabelFooter}>{SIDEBAR_GROUPS.settings}</div>
            {user && <NavItem icon={<HiCog6Tooth size={17} />} label="Account" active={activeTab === 'account'} onClick={() => go('account')} hasArrow />}
            {user && <NavItem icon={<HiCreditCard size={17} />} label="Pricing" active={activeTab === 'pricing'} onClick={() => go('pricing')} />}
            <NavItem icon={<HiQuestionMarkCircle size={17} />} label="Help & Support" active={activeTab === 'help'} onClick={() => go('help')} />
          </div>
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
        {!user && <MarketingNav go={go} onLogin={openLogin} onSignup={openSignup} />}

        {/* Top Bar — only shown when logged in (MarketingNav handles logged-out state) */}
        {user && (
          <header style={s.topBar}>
            <button style={s.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            {activeTab != null && (
              <button
                type="button"
                style={s.backBtn}
                onClick={goBack}
                aria-label="Go back to previous page"
                title="Back"
              >
                ←
              </button>
            )}

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

        {/* Content */}
        <div style={{
          ...s.content,
          paddingTop: !user ? '58px' : undefined,
        }}>
          {!activeTab && !user && (
            <LandingSection onGetStarted={() => go('chat')} onChoosePlan={handleChoosePlan} />
          )}
          {user && (!activeTab || activeTab === 'analytics') && (
            <MemberGate featureName="Analytics">
              <AnalyticsDashboard />
            </MemberGate>
          )}
          {activeTab === 'image-generator'  && <MemberGate featureName="Image Generator"><ImageGenerator /></MemberGate>}
          {activeTab === 'chat'             && <AskAIGate  featureName="Ask AI"><ChatComponent /></AskAIGate>}
          {activeTab === 'analyzer'         && <MemberGate featureName="DocuWizard"><SpendingAnalyzer /></MemberGate>}
          {activeTab === 'recipe-generator' && <AskAIGate  featureName="Recipe Generator"><ReceipeGenerator /></AskAIGate>}
          {activeTab === 'transcription'    && <MemberGate featureName="EchoScribe"><ProGate featureName="EchoScribe"><Transcription /></ProGate></MemberGate>}
          {activeTab === 'Content'          && <MemberGate featureName="Reply Enchanter"><Content /></MemberGate>}
          {activeTab === 'Resume'           && <MemberGate featureName="Career Alchemist"><Resume /></MemberGate>}
          {activeTab === 'account'          && <AskAIGate  featureName="Account"><AccountSettings /></AskAIGate>}
          {activeTab === 'video-publisher'  && <MemberGate featureName="Video Publisher"><VideoPublisher onNavigateToSocialConnect={() => go('social-connect')} /></MemberGate>}
          {activeTab === 'messages'         && <MemberGate featureName="Messages"><ProGate featureName="Messages"><MessagesInbox onOpenConnectedAccounts={() => go('social-connect')} onOpenAutoReply={() => go('auto-reply')} /></ProGate></MemberGate>}
          {activeTab === 'social-connect'   && <MemberGate featureName="Connected Accounts"><SocialConnect /></MemberGate>}
          {activeTab === 'bio'              && <MemberGate featureName="Link in Bio"><LinkInBioBuilder /></MemberGate>}
          {activeTab === 'trends'          && <MemberGate featureName="Growth Planner"><ProGate featureName="Growth Planner"><DeepAnalytics /></ProGate></MemberGate>}
          {activeTab === 'social-ai'       && <MemberGate featureName="Social AI"><ProGate featureName="Social AI"><SocialAIChat /></ProGate></MemberGate>}
          {activeTab === 'pricing'         && <PricingPage onClose={() => go(null)} />}
          {activeTab === 'help'            && <HelpPanel />}
          {activeTab === 'auto-reply'      && <MemberGate featureName="Auto Reply"><ProGate featureName="Auto Reply"><AutoReplySettings /></ProGate></MemberGate>}
          {activeTab === 'calendar'        && <MemberGate featureName="Content Calendar"><ContentCalendar onOpenVideoPublisher={() => go('video-publisher')} /></MemberGate>}
        </div>
      </div>

      {/* ═══════════════ EMAIL VERIFIED BANNER ═══════════════ */}
      {verifiedBanner && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 99999, borderRadius: 14, padding: '14px 24px',
          background: verifiedBanner === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1.5px solid ${verifiedBanner === 'error' ? '#fca5a5' : '#86efac'}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 12, minWidth: 300,
        }}>
          <span style={{ fontSize: 22 }}>{verifiedBanner === 'error' ? '❌' : '✅'}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: verifiedBanner === 'error' ? '#dc2626' : '#15803d' }}>
              {verifiedBanner === 'error' ? 'Verification failed' : 'Email verified!'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {verifiedBanner === 'error' ? 'Link may have expired. Try registering again.' : 'Your account is confirmed. Sign in below.'}
            </div>
          </div>
          <button onClick={() => setVerifiedBanner(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16 }}>✕</button>
        </div>
      )}

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
    color: '#cbd5e1', fontSize: '13.5px', fontWeight: '500',
    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
    marginBottom: '2px', transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
  },
  active: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 52%, #7c3aed 100%)',
    color: '#ffffff',
    fontWeight: '700',
    boxShadow: '0 2px 14px rgba(99, 102, 241, 0.35)',
  },
  hover: {
    background: 'rgba(255,255,255,0.08)',
    color: '#f8fafc',
  },
  icon: { fontSize: '0px', flexShrink: 0, width: '20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  arrow: { opacity: 0.45, fontSize: '17px', marginLeft: 'auto' },
};

const APP_MAIN_GRAD =
  'linear-gradient(165deg, #060a14 0%, #0f172a 35%, #111d36 50%, #0a1020 100%)';

const s = {
  shell: {
    display: 'flex', height: '100vh', overflow: 'hidden',
    fontFamily: "'Inter', -apple-system, sans-serif",
    background: APP_MAIN_GRAD,
  },

  /* Sidebar */
  sidebar: {
    width: '224px', minWidth: '224px', maxWidth: '280px', height: '100vh',
    background: 'linear-gradient(180deg, #0c1222 0%, #0f172a 42%, #151e35 100%)',
    borderRight: '1px solid rgba(148, 163, 184, 0.14)',
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
    fontSize: '11px', fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'none',
    letterSpacing: '0.02em',
    padding: '10px 12px 6px',
    whiteSpace: 'nowrap',
  },
  groupLabelFooter: {
    fontSize: '10.5px', fontWeight: '800',
    color: 'rgba(255,255,255,0.38)',
    textTransform: 'none',
    letterSpacing: '0.06em',
    padding: '4px 12px 6px',
    whiteSpace: 'nowrap',
  },
  navDivider: {
    height: 0,
    border: 'none',
    borderTop: '1px solid rgba(255,255,255,0.07)',
    margin: '8px 14px 2px',
  },
  navDividerStrong: {
    height: 0,
    border: 'none',
    borderTop: '1px solid rgba(148,163,184,0.55)',
    margin: '0 0 8px',
    boxShadow: '0 1px 0 rgba(255,255,255,0.08)',
  },
  /** Settings + Pricing: visually separated from tool sections (divider + inset panel). */
  navFooterBlock: {
    marginTop: 10,
    marginLeft: 2,
    marginRight: 2,
    padding: '8px 6px 6px',
    borderRadius: 12,
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  sidebarFooter: {
    padding: '10px 8px 16px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    flexShrink: 0,
  },
  exploreBtn: {
    display: 'flex', alignItems: 'center', gap: '10px',
    width: '100%', padding: '10px 12px', borderRadius: '10px',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    background: 'rgba(255,255,255,0.06)',
    color: '#cbd5e1', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'inherit',
  },

  /* Main */
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    overflow: 'hidden', background: APP_MAIN_GRAD,
    minWidth: 0,
  },

  /* Top Bar */
  topBar: {
    height: '58px', flexShrink: 0,
    background: 'rgba(15, 23, 42, 0.72)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center',
    padding: '0 12px 0 16px', gap: '10px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
    flexWrap: 'wrap', minWidth: 0,
  },
  menuBtn: {
    background: 'none', border: 'none', color: '#cbd5e1',
    fontSize: '18px', cursor: 'pointer', padding: '4px 6px',
    borderRadius: '6px', flexShrink: 0, lineHeight: 1,
  },
  backBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    color: '#e2e8f0',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px 10px',
    borderRadius: '8px',
    flexShrink: 0,
    lineHeight: 1,
    fontWeight: 600,
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '24px', padding: '8px 16px',
    flex: 1, maxWidth: '360px', minWidth: 0,
  },
  searchInput: {
    border: 'none', background: 'transparent',
    outline: 'none', fontSize: '13px',
    color: '#f1f5f9', width: '100%', fontFamily: 'inherit',
  },
  topRight: {
    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px',
  },
  topEmail: {
    fontSize: '13px', color: '#94a3b8',
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
    padding: '6px 14px', borderRadius: '10px',
    border: '1px solid rgba(148, 163, 184, 0.35)',
    background: 'rgba(255,255,255,0.06)', color: '#e2e8f0',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
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

  /* Content */
  content: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
    WebkitOverflowScrolling: 'touch',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
  },
};
