import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { useMediaQuery } from './hooks/useMediaQuery';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';

// Icons — react-icons/hi2 (Heroicons v2, solid style)
import { HiHome, HiChatBubbleLeftRight, HiPhoto, HiSparkles } from 'react-icons/hi2';
import { HiDocumentText, HiMicrophone } from 'react-icons/hi2';
import { HiChatBubbleOvalLeft, HiArrowTrendingUp, HiLink } from 'react-icons/hi2';
import { HiDocumentMagnifyingGlass, HiRectangleGroup, HiFilm, HiArrowPath, HiShieldCheck } from 'react-icons/hi2';
import { HiCog6Tooth, HiCreditCard, HiQuestionMarkCircle } from 'react-icons/hi2';
import PlatformIcon from './components/PlatformIcon';
import ProfileAvatar from './components/ProfileAvatar';
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
import CaptionTemplates from './components/CaptionTemplates';
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
import NotificationBell from './components/NotificationBell';
import { ToastHost } from './components/Toast';
import TeamSettings from './components/TeamSettings';
import BrandKitSettings from './components/BrandKitSettings';
import OrganizationSettings from './components/OrganizationSettings';
import WorkspaceSwitcher from './components/WorkspaceSwitcher';
import WorkspaceGate from './components/WorkspaceGate';
import SEO from './components/SEO';
import UrlRepurposer from './components/UrlRepurposer';
import VideoRecycler from './components/VideoRecycler';
import Repurposer from './components/Repurposer';
import TrendAlerts from './components/TrendAlerts';
import ClientApprovalPage from './components/ClientApprovalPage';
import SelfHealDashboard from './components/SelfHealDashboard';
import BrandGuardian from './components/BrandGuardian';
import MediaLibrary from './components/MediaLibrary';
import AiWorkspace from './components/AiWorkspace';

const BRAND_LOGO_SRC = '/android-chrome-192x192.png';

/**
 * Growth Planner uses in-page links (#trends-growth, #trends-besttime, …).
 * The app maps URL hash → activeTab, so the full string must not replace the
 * `trends` tab id, or the main panel unmounts. These hashes all mean tab "trends".
 * (Do not use a blind `startsWith("trends-")` — e.g. `trends-live` is a different tab.)
 */
const GROWTH_PLANNER_ANCHOR_HASHES = new Set([
  'trends',
  'trends-growth',
  'trends-besttime',
  'trends-breakdown',
  'trends-competitor',
  'trends-calendar',
]);

function parseAppTabFromHash() {
  const raw = (window.location.hash || '').replace('#', '').trim().split('?')[0];
  if (!raw) return null;
  if (GROWTH_PLANNER_ANCHOR_HASHES.has(raw)) return 'trends';
  return raw;
}

/** Short document titles for social / publishing tabs (cleaner browser tab label). */
const PUBLISHING_TAB_SEO = {
  'video-publisher': { title: 'Publish', description: 'Upload and publish to connected social accounts.' },
  'social-connect': { title: 'Accounts', description: 'Connect social accounts for publishing.' },
  calendar: { title: 'Calendar', description: 'Scheduled and published posts.' },
  messages: { title: 'Inbox', description: 'Comments and messages from connected accounts.' },
  trends: { title: 'Growth', description: 'Follower trends and posting insights.' },
  'social-ai': { title: 'Social AI', description: 'AI chat for social content.' },
  Content: { title: 'Replies', description: 'AI-assisted replies.' },
  brand: { title: 'Brand Kit', description: 'Your brand colors and logo for templates.' },
  team: { title: 'Team', description: 'Manage your team seats and members.' },
  organization: { title: 'Organization', description: 'Manage your organization, workspaces and member permissions.' },
  'auto-reply': { title: 'Auto Reply', description: 'Automated comment and message replies.' },
  bio: { title: 'Link in Bio', description: 'Your public link page.' },
};

/** Sidebar section titles — single source of truth for the logged-in nav. */
const SIDEBAR_GROUPS = {
  socialHq: 'Social HQ',
  socialHerbs: 'Social Herbs',
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


function MarketingNav({ go, onLogin, onSignup }) {
  const isMobile = useMediaQuery('(max-width: 900px)');
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const scrollToSection = (id) => {
    // If not on the landing page, go home first then scroll
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Navigate to landing then scroll after render
      go(null);
      setTimeout(() => {
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  };

  const linkStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.72)',
    fontSize: '14px',
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: '6px',
    fontFamily: 'inherit',
    transition: 'color 0.12s, background 0.12s',
    textDecoration: 'none',
    display: 'inline-block',
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(6, 10, 20, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 16px' : '0 40px',
        height: isMobile ? '54px' : '60px',
        gap: isMobile ? '8px' : 0,
      }}
    >
      {/* Logo */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer', flexShrink: 0 }}
        onClick={() => go(null)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(null); } }}
        role="button"
        tabIndex={0}
      >
        <img src={BRAND_LOGO_SRC} alt="W!ntAi logo" width={32} height={32} style={{ display: 'block', flexShrink: 0, borderRadius: '8px' }} />
        <span style={{ color: '#f1f5f9', fontWeight: 800, fontSize: isMobile ? '15px' : '17px', letterSpacing: '-0.02em' }}>
          <span style={{ color: '#ffffff' }}>W!</span>ntAi
        </span>
      </div>

      {/* Centre links */}
      {!isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {[
            { label: 'Features',     action: () => scrollToSection('features') },
            { label: 'How it works', action: () => scrollToSection('how-it-works') },
            { label: 'Use cases',    action: () => scrollToSection('use-cases') },
            { label: 'Pricing',      action: () => scrollToSection('pricing') },
          ].map(({ label, action }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              style={linkStyle}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; e.currentTarget.style.background = 'none'; }}
            >
              {label}
            </button>
          ))}
          {/* Resources dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
          >
            <button
              type="button"
              style={linkStyle}
              aria-expanded={resourcesOpen}
              aria-haspopup="true"
              onClick={() => setResourcesOpen((o) => !o)}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; e.currentTarget.style.background = 'none'; }}
            >
              Resources <span style={{ opacity: 0.55, fontSize: 11 }} aria-hidden="true">▾</span>
            </button>
            {resourcesOpen && (
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 6,
                  background: 'rgba(15,23,42,0.97)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: '6px 0',
                  minWidth: 168,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                }}
              >
                {[
                  { label: 'Tutorials',       href: '/tutorial' },
                  { label: 'Blog',            href: '/blog' },
                ].map(({ label, href }) => (
                  <a key={label} href={href} role="menuitem" onClick={() => setResourcesOpen(false)}
                    style={{ display: 'block', padding: '9px 16px', color: 'rgba(255,255,255,0.85)', fontSize: '13.5px', fontWeight: 500, textDecoration: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
                  >{label}</a>
                ))}
                <div role="separator" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '5px 0' }} />
                {[
                  { label: 'Privacy Policy',  href: '/privacy-policy' },
                  { label: 'Terms of Service',href: '/terms-of-service' },
                ].map(({ label, href }) => (
                  <a key={label} href={href} role="menuitem" onClick={() => setResourcesOpen(false)}
                    style={{ display: 'block', padding: '9px 16px', color: 'rgba(255,255,255,0.55)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                  >{label}</a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right: Login + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={onLogin}
          style={{
            background: 'rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.88)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            padding: isMobile ? '7px 12px' : '8px 18px',
            fontWeight: 600,
            fontSize: isMobile ? '12px' : '14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
            transition: 'background 0.13s, border-color 0.13s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
        >
          Login
        </button>
        <button
          type="button"
          onClick={onSignup}
          style={{
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: isMobile ? '7px 12px' : '8px 20px',
            fontWeight: 700,
            fontSize: isMobile ? '12px' : '14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
            boxShadow: '0 2px 14px rgba(99,102,241,0.45)',
            transition: 'background 0.13s, transform 0.13s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {isMobile ? 'Try Free' : 'Start free trial'}
        </button>
      </div>
    </nav>
  );
}

/* ─── App ─────────────────────────────────────────────────── */
function App() {
  // Restore activeTab from URL hash on load (e.g. #inbox → 'inbox')
  // so F5 refresh stays on the current page instead of resetting to Dashboard.
  const [activeTab, setActiveTab] = useState(() => parseAppTabFromHash());
  const [showAuthModal, setShowAuthModal] = useState(false);
  // authMode: 'login' | 'signup' | 'forgot-password'
  const [authMode, setAuthMode] = useState('login');
  const [verifiedBanner, setVerifiedBanner] = useState(false);
  const [templateCaption, setTemplateCaption] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTopNav, setShowTopNav] = useState(false);
  const topNavRef = useRef(null);
  const [aiDockOpen, setAiDockOpen] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  // Full account pool grouped by platform — used to show real profile avatars in
  // the top-bar icons. Populated alongside connectedPlatforms from /social/accounts.
  // Shape: { youtube: [{id, username, profileImageUrl, ...}, ...], facebook: [], ... }
  const [accountsByPlatform, setAccountsByPlatform] = useState({});
  const [pendingInviteToken, setPendingInviteToken] = useState(null);
  const [pendingOrgInviteToken, setPendingOrgInviteToken] = useState(null);
  const [orgInviteHint, setOrgInviteHint] = useState(null); // { email, orgName } or null
  const { user, logout, loading, token, apiBase, refetchUser, fetchOrg, fetchWorkspaces } = useAuth();

  // Platform metadata used for topbar icons
  const ALL_PLATFORMS = [
    { id: 'youtube',   label: 'YouTube',    color: '#FF0000', logo: 'youtube',   emoji: '▶️' },
    { id: 'instagram', label: 'Instagram',  color: '#E1306C', logo: 'instagram', emoji: '📸' },
    { id: 'tiktok',    label: 'TikTok',     color: '#010101', logo: 'tiktok',    emoji: '🎵' },
    { id: 'linkedin',  label: 'LinkedIn',   color: '#0A66C2', logo: 'linkedin',  emoji: '💼' },
    { id: 'facebook',  label: 'Facebook',   color: '#1877F2', logo: 'facebook',  emoji: '👍' },
    { id: 'x',         label: 'X',          color: '#000000', logo: 'x',         emoji: '🐦' },
    { id: 'threads',   label: 'Threads',    color: '#101010', logo: 'threads',   emoji: '🧵' },
    { id: 'pinterest', label: 'Pinterest',  color: '#E60023', logo: 'pinterest', emoji: '📌' },
  ];
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
    // Push a real browser history entry so the back arrow navigates
    // between tabs: Inbox → Templates → [back] → Inbox.
    // F5 also works because the URL hash reflects the active tab.
    const newHash = tab ? `#${tab}` : window.location.pathname;
    if (window.location.hash !== (tab ? `#${tab}` : '')) {
      window.history.pushState({ tab }, '', newHash);
    }
  }, []);

  // Browser back/forward + in-page #anchors: keep the tab id in sync with the hash
  // (e.g. #trends-growth must still mean Growth Planner, not a bogus tab name).
  useEffect(() => {
    const syncFromHash = () => setActiveTab(parseAppTabFromHash());
    window.addEventListener('popstate', syncFromHash);
    window.addEventListener('hashchange', syncFromHash);
    return () => {
      window.removeEventListener('popstate', syncFromHash);
      window.removeEventListener('hashchange', syncFromHash);
    };
  }, []);

  const goBack = useCallback(() => {
    // Use the browser's native back — popstate handler will update activeTab
    if (navStackRef.current.length > 0) {
      window.history.back();
    } else {
      setActiveTab(null);
    }
  }, []);

  // Fetch connected social accounts for topbar icons.
  // /accounts returns the full pool — derives both the connected-platforms list
  // (for button enabled/disabled state) AND the per-account profile avatars.
  useEffect(() => {
    if (!user || !token) { setConnectedPlatforms([]); setAccountsByPlatform({}); return; }
    const base = apiBase || 'https://api.wintaibot.com';
    fetch(`${base}/api/social/accounts`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const pool = data.accounts || {};
        setAccountsByPlatform(pool);
        const connected = Object.entries(pool)
          .filter(([, list]) => (list || []).length > 0)
          .map(([p]) => p);
        setConnectedPlatforms(connected);
      })
      .catch(() => {});
  }, [user, token, apiBase]);

  // Disconnect a platform directly from the topbar
  const [disconnectingId, setDisconnectingId] = useState(null);
  const handleTopbarDisconnect = async (platformId) => {
    if (disconnectingId) return;
    setDisconnectingId(platformId);
    try {
      const base = apiBase || 'https://api.wintaibot.com';
      const res = await fetch(`${base}/api/social/disconnect/${platformId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setConnectedPlatforms(prev => prev.filter(id => id !== platformId));
    } catch (_) {}
    finally { setDisconnectingId(null); }
  };

  // Connect a platform directly from the topbar (OAuth popup — no page navigation)
  const [connectingId, setConnectingId] = useState(null);
  const refreshTopbarStatus = useCallback(() => {
    const base = apiBase || 'https://api.wintaibot.com';
    fetch(`${base}/api/social/accounts`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        const pool = d.accounts || {};
        setAccountsByPlatform(pool);
        setConnectedPlatforms(Object.entries(pool).filter(([, l]) => (l || []).length > 0).map(([p]) => p));
      })
      .catch(() => {});
  }, [apiBase, token]);

  const handleTopbarConnect = useCallback(async (platformId) => {
    if (connectingId) return;
    setConnectingId(platformId);
    try {
      const base = apiBase || 'https://api.wintaibot.com';
      const res = await fetch(`${base}/api/social/connect/${platformId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setConnectingId(null); return; }
      const popup = window.open(data.url, 'oauth_popup', 'width=600,height=700,scrollbars=yes,resizable=yes');
      if (!popup || popup.closed) { window.location.href = data.url; return; }
      // Poll for popup close as fallback
      const interval = setInterval(() => {
        if (popup.closed) {
          clearInterval(interval);
          setConnectingId(null);
          refreshTopbarStatus();
        }
      }, 1000);
    } catch (_) { setConnectingId(null); }
  }, [connectingId, apiBase, token, refreshTopbarStatus]);

  // Listen for OAuth popup postMessage (primary signal — faster than poll)
  useEffect(() => {
    const handler = (event) => {
      const norm = (o) => o.replace(/^https?:\/\/(www\.)?/, '');
      if (norm(event.origin) !== norm(window.location.origin)) return;
      if (event.data?.type !== 'wintaibot:social_connect') return;
      if (event.data.result === 'success') {
        setConnectingId(null);
        refreshTopbarStatus();
      } else {
        setConnectingId(null);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [refreshTopbarStatus]);

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
    const connectResult = params.get('social_connect');
    const connectPlatform = params.get('platform');
    if (connectResult && connectPlatform) {
      // If this is an OAuth popup window — notify parent and close immediately
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage(
            { type: 'wintaibot:social_connect', result: connectResult, platform: connectPlatform, msg: params.get('msg') || '' },
            '*'
          );
        } catch (_) {}
        window.close();
        return;
      }
      // Main-window redirect (non-popup OAuth flow)
      if (connectResult === 'success') go('video-publisher');
      window.history.replaceState({}, '', '/');
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
    // Team invite link: ?team_invite=<token> or ?team_invite=accepted
    const inviteParam = params.get('team_invite');
    if (inviteParam) {
      window.history.replaceState({}, '', '/');
      setPendingInviteToken(inviteParam);
    }
    // Org invite link: ?org_invite=<token> or ?org_invite=accepted
    const orgInviteParam = params.get('org_invite');
    if (orgInviteParam) {
      window.history.replaceState({}, '', '/');
      setPendingOrgInviteToken(orgInviteParam);
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

  // Handle pending team invite after auth state resolves
  useEffect(() => {
    if (loading || !pendingInviteToken) return;
    // Backend redirect variant — just navigate to Team tab
    if (pendingInviteToken === 'accepted' || pendingInviteToken === 'already_accepted') {
      setPendingInviteToken(null);
      go('team');
      return;
    }
    if (user && token) {
      // Logged in — call accept endpoint now
      const base = apiBase || 'https://api.wintaibot.com';
      setPendingInviteToken(null);
      fetch(`${base}/api/team/accept?token=${pendingInviteToken}`, {
        headers: { Authorization: `Bearer ${token}` },
        redirect: 'manual',
      })
        .then(() => {
          go('team');
          if (typeof refetchUser === 'function') refetchUser();
        })
        .catch(() => {});
    } else {
      // Not logged in — open login modal; token stays in state until login completes
      setAuthMode('login');
      setShowAuthModal(true);
    }
  }, [loading, user, token, pendingInviteToken, go, apiBase, refetchUser]);

  // Handle pending org invite after auth state resolves
  useEffect(() => {
    if (loading || !pendingOrgInviteToken) return;
    if (pendingOrgInviteToken === 'accepted' || pendingOrgInviteToken === 'already_accepted') {
      setPendingOrgInviteToken(null);
      go('organization');
      if (typeof fetchOrg === 'function') { fetchOrg(); fetchWorkspaces(); }
      return;
    }
    if (pendingOrgInviteToken === 'error') {
      setPendingOrgInviteToken(null);
      return;
    }
    if (user && token) {
      const base = apiBase || 'https://api.wintaibot.com';
      const t = pendingOrgInviteToken;
      setPendingOrgInviteToken(null);
      fetch(`${base}/api/org/accept?token=${t}`, {
        headers: { Authorization: `Bearer ${token}` },
        redirect: 'manual',
      })
        .then(() => {
          go('organization');
          if (typeof refetchUser === 'function') refetchUser();
          if (typeof fetchOrg === 'function') { fetchOrg(); fetchWorkspaces(); }
        })
        .catch(() => {});
    } else {
      // Fetch invite info so we can show org name + pre-fill email
      const base = apiBase || 'https://api.wintaibot.com';
      const t = pendingOrgInviteToken;
      fetch(`${base}/api/org/invite-info?token=${t}`)
        .then(r => r.ok ? r.json() : null)
        .then(info => {
          setOrgInviteHint(info || { email: '', orgName: 'an organisation' });
        })
        .catch(() => setOrgInviteHint({ email: '', orgName: 'an organisation' }));
      setAuthMode('signup');   // likely a new user — show signup first
      setShowAuthModal(true);
    }
  }, [loading, user, token, pendingOrgInviteToken, go, apiBase, refetchUser, fetchOrg, fetchWorkspaces]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e) => go(e.detail);
    window.addEventListener('wintaibot:go', handler);
    return () => window.removeEventListener('wintaibot:go', handler);
  }, [go]);

  // Close top-nav dropdown when clicking outside
  useEffect(() => {
    if (!showTopNav) return;
    const handler = (e) => {
      if (topNavRef.current && !topNavRef.current.contains(e.target)) setShowTopNav(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTopNav]);

  useEffect(() => {
    const handler = () => { setAuthMode('login'); setShowAuthModal(true); };
    window.addEventListener('wintaibot:openLogin', handler);
    return () => window.removeEventListener('wintaibot:openLogin', handler);
  }, []);

  const userInitials = user?.firstName && user?.lastName
    ? (user.firstName[0] + user.lastName[0]).toUpperCase()
    : (user?.email ? user.email.slice(0, 2).toUpperCase() : '??');

  const openLogin = () => { setAuthMode('login'); setShowAuthModal(true); };
  const openSignup = () => { setAuthMode('signup'); setShowAuthModal(true); };

  // ── Public approval page route (no auth needed) ─────────────────────────
  const approvalMatch = window.location.pathname.match(/^\/approve\/([a-zA-Z0-9]+)$/);
  if (approvalMatch) {
    return <ClientApprovalPage token={approvalMatch[1]} />;
  }

  return (
    <div style={s.shell}>

      {/* Toast host — renders at top-right z-index: 100000, fired from anywhere via fireToast() */}
      <ToastHost />

      {/* Marketing Nav — fixed at top for logged-out visitors, above everything */}
      {!user && <MarketingNav go={go} onLogin={openLogin} onSignup={openSignup} />}

      {/* ═══════════════ SIDEBAR (MUI Drawer) ═══════════════ */}
      {user && (
        <Drawer
          variant={(isMobile || isTablet) ? 'temporary' : 'permanent'}
          open={(isMobile || isTablet) ? sidebarOpen : true}
          onClose={() => setSidebarOpen(false)}
          sx={{
            width: (!sidebarOpen && !(isMobile || isTablet)) ? 60 : 224,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: (!sidebarOpen && !(isMobile || isTablet)) ? 60 : 224,
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #0c1222 0%, #0f172a 42%, #151e35 100%)',
              border: 'none',
              borderRight: '1px solid rgba(148, 163, 184, 0.14)',
              overflowX: 'hidden',
              transition: 'width 0.25s ease',
            },
          }}
        >
          {/* Logo */}
          <div style={s.logoArea}>
            <div style={s.logoIconBg}>
              <img src={BRAND_LOGO_SRC} alt="W!ntAi logo" width={34} height={34} style={{ display: 'block', borderRadius: '7px' }} />
            </div>
            {(sidebarOpen || (isMobile || isTablet)) && <span style={s.logoText}><span style={{ color: '#ffffff' }}>W</span>!ntAi</span>}
          </div>

          {/* Nav */}
          <nav style={s.nav}>
            {/* Workspace switcher — shows only when user is in an org */}
            <WorkspaceSwitcher />

            <NavItem icon={<HiHome size={17} />} label="Dashboard" active={activeTab === null || activeTab === 'analytics'} onClick={() => { go(null); if (isMobile || isTablet) setSidebarOpen(false); }} />

            <div style={s.navDivider} role="separator" aria-hidden="true" />
            <div style={s.groupLabel}>{SIDEBAR_GROUPS.socialHq}</div>
            <NavItem icon={<HiPhoto size={17} />}                    label="Content Calendar"   active={activeTab === 'calendar'}          onClick={() => { go('calendar'); if (isMobile || isTablet) setSidebarOpen(false); }} />
            <NavItem icon={<HiArrowTrendingUp size={17} />}          label="Growth Planner"     active={activeTab === 'trends'}            onClick={() => { go('trends'); if (isMobile || isTablet) setSidebarOpen(false); }} />
            <NavItem icon={<HiRectangleGroup size={17} />}           label="Templates"          active={activeTab === 'caption-templates'} onClick={() => { go('caption-templates'); if (isMobile || isTablet) setSidebarOpen(false); }} />
            <NavItem icon={<HiLink size={17} />}                     label="Connected Accounts" active={activeTab === 'social-connect'}     onClick={() => { go('social-connect'); if (isMobile || isTablet) setSidebarOpen(false); }} />
            <NavItem icon={<HiChatBubbleOvalLeft size={17} />}       label="Inbox"              active={activeTab === 'messages'}         onClick={() => { go('messages'); if (isMobile || isTablet) setSidebarOpen(false); }} />

            <div style={s.navDivider} role="separator" aria-hidden="true" />
            <div style={s.groupLabel}>{SIDEBAR_GROUPS.socialHerbs}</div>
            <NavItem icon={<HiArrowPath size={17} />}                label="Repurposer"   active={activeTab === 'repurposer'} onClick={() => { go('repurposer'); if (isMobile || isTablet) setSidebarOpen(false); }} />
            <NavItem icon={<HiShieldCheck size={17} />}              label="Self-Healing" active={activeTab === 'self-heal'}  onClick={() => { go('self-heal'); if (isMobile || isTablet) setSidebarOpen(false); }} />

            <div style={s.navFooterBlock}>
              <div style={s.navDividerStrong} role="separator" aria-hidden="true" />
              <div style={s.groupLabelFooter}>{SIDEBAR_GROUPS.settings}</div>
              {user && <NavItem icon={<HiCog6Tooth size={17} />} label="Account" active={activeTab === 'account'} onClick={() => { go('account'); if (isMobile || isTablet) setSidebarOpen(false); }} hasArrow />}
              {user && <NavItem icon={<HiCreditCard size={17} />} label="Pricing" active={activeTab === 'pricing'} onClick={() => { go('pricing'); if (isMobile || isTablet) setSidebarOpen(false); }} />}
              <NavItem icon={<HiQuestionMarkCircle size={17} />} label="Help & Support" active={activeTab === 'help'} onClick={() => { go('help'); if (isMobile || isTablet) setSidebarOpen(false); }} />
            </div>
          </nav>

          {/* Explore Tools */}
          <div style={s.sidebarFooter}>
            <button style={s.exploreBtn}>
              <span style={{ fontSize: '15px' }}>⊞</span>
              {(sidebarOpen || (isMobile || isTablet)) && <><span style={{ flex: 1 }}>Explore Tools</span><span style={{ opacity: 0.5, fontSize: '13px' }}>›</span></>}
            </button>
          </div>
        </Drawer>
      )}

      {/* ═══════════════ MAIN ═══════════════ */}
      <Box
        component="div"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: APP_MAIN_GRAD,
          minWidth: 0,
        }}
      >
        {user && activeTab && PUBLISHING_TAB_SEO[activeTab] && (
          <SEO title={PUBLISHING_TAB_SEO[activeTab].title} description={PUBLISHING_TAB_SEO[activeTab].description} />
        )}

        {/* Marketing Nav for logged-out visitors */}
        {!user && <MarketingNav go={go} onLogin={openLogin} onSignup={openSignup} />}

        {/* Top Bar — only shown when logged in (MarketingNav handles logged-out state) */}
        {user && (
          <header style={{ ...s.topBar, position: 'relative', overflow: 'visible', zIndex: 1100 }}>
            <button style={s.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

            {/* Platform bar — left of back button (in document order) */}
            {!isMobile && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 12,
                padding: '5px 8px',
                flexShrink: 0,
                minWidth: 0,
                maxWidth: 'min(100%, 520px)',
                overflowX: 'auto',
              }}>
                {ALL_PLATFORMS.map(p => {
                  const isOn = connectedPlatforms.includes(p.id);
                  const isBusy = disconnectingId === p.id || connectingId === p.id;
                  const isConnecting = connectingId === p.id;
                  // Show the real connected-account photo when exactly one account
                  // is linked for this platform. With 0 or 2+ accounts the generic
                  // platform icon is clearer (the button represents the platform,
                  // not one particular account).
                  const pAccounts = accountsByPlatform[p.id] || [];
                  const singleAccount = isOn && pAccounts.length === 1 ? pAccounts[0] : null;
                  return (
                    <div key={p.id} style={{ position: 'relative' }}>
                      <button
                        onClick={() => {
                          if (isBusy) return;
                          if (isOn) handleTopbarDisconnect(p.id);
                          else handleTopbarConnect(p.id);
                        }}
                        title={isOn ? `${p.label} — click to disconnect` : `${p.label} — click to connect`}
                        disabled={isBusy}
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: isOn ? '#ffffff' : isConnecting ? '#1e3a5c' : '#181f2e',
                          border: isOn ? `2.5px solid ${p.color}` : isConnecting ? `2px solid ${p.color}` : '2px solid #2a3349',
                          boxShadow: isOn ? `0 0 0 3px ${p.color}30, 0 2px 8px ${p.color}40` : 'none',
                          cursor: isBusy ? 'wait' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: 0, flexShrink: 0,
                          opacity: isBusy ? 0.6 : isOn ? 1 : 0.35,
                          transition: 'all 0.25s',
                          filter: isOn || isConnecting ? 'none' : 'grayscale(1) brightness(0.6)',
                        }}
                        onMouseEnter={e => {
                          if (!isBusy) {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.filter = 'none';
                            e.currentTarget.style.borderColor = p.color;
                            e.currentTarget.style.background = isOn ? '#ffffff' : '#1e3a5c';
                            e.currentTarget.style.boxShadow = `0 0 0 3px ${p.color}40, 0 2px 10px ${p.color}50`;
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isBusy) {
                            e.currentTarget.style.opacity = isOn ? '1' : '0.35';
                            e.currentTarget.style.filter = isOn ? 'none' : 'grayscale(1) brightness(0.6)';
                            e.currentTarget.style.borderColor = isOn ? p.color : '#2a3349';
                            e.currentTarget.style.background = isOn ? '#ffffff' : '#181f2e';
                            e.currentTarget.style.boxShadow = isOn ? `0 0 0 3px ${p.color}30, 0 2px 8px ${p.color}40` : 'none';
                          }
                        }}
                      >
                        {isConnecting
                          ? <span style={{ fontSize: 10, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                          : singleAccount
                            ? <ProfileAvatar imageUrl={singleAccount.profileImageUrl} platform={p} size={26} ringWidth={0} />
                            : <PlatformIcon platform={p} size={15} />
                        }
                      </button>
                      {/* Green dot = connected */}
                      {isOn && !isBusy && (
                        <span style={{
                          position: 'absolute', bottom: 1, right: 1,
                          width: 7, height: 7, borderRadius: '50%',
                          background: '#22c55e',
                          border: '1.5px solid #0f172a',
                          pointerEvents: 'none',
                        }} />
                      )}
                      {/* Pulsing dot = connecting in progress */}
                      {isConnecting && (
                        <span style={{
                          position: 'absolute', bottom: 1, right: 1,
                          width: 7, height: 7, borderRadius: '50%',
                          background: '#f59e0b',
                          border: '1.5px solid #0f172a',
                          pointerEvents: 'none',
                        }} />
                      )}
                    </div>
                  );
                })}

                {/* + Connect button */}
                <button
                  onClick={() => go('social-connect')}
                  title="Connected Accounts — connect more platforms"
                  style={{
                    height: 28, borderRadius: 8,
                    background: 'transparent', border: '1.5px dashed #334155',
                    color: '#64748b', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 4, marginLeft: 4, padding: '0 10px', transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 15, lineHeight: 1 }}>+</span>
                  <span>Connect</span>
                </button>
              </div>
            )}

            {/* ── App Launcher ──
                Fixed to viewport (not the topbar) so it can't be clipped or covered
                by stacking-context boundaries from page content rendered below. */}
            <div ref={topNavRef} style={{ position: 'fixed', top: isMobile ? 50 : 56, left: 'calc(50% - 28px)', zIndex: 1250 }}>
              <button
                type="button"
                onClick={() => setShowTopNav(v => !v)}
                title="App Launcher"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 56, height: 22, borderRadius: '0 0 22px 22px',
                  background: showTopNav
                    ? 'linear-gradient(180deg, #4f46e5 0%, #6366f1 100%)'
                    : 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
                  border: showTopNav
                    ? '1.5px solid rgba(129,140,248,0.8)'
                    : '1.5px solid rgba(148,163,184,0.45)',
                  borderTop: 'none',
                  cursor: 'pointer', padding: 0,
                  transition: 'all 0.2s ease',
                  /* Always-visible ring — contrasts against any content bg */
                  boxShadow: showTopNav
                    ? '0 6px 20px rgba(99,102,241,0.55), 0 2px 8px rgba(0,0,0,0.6), 0 0 0 2px rgba(99,102,241,0.35)'
                    : '0 4px 14px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.12)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(180deg, #4f46e5 0%, #6366f1 100%)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.55), 0 2px 8px rgba(0,0,0,0.5), 0 0 0 2px rgba(99,102,241,0.4)';
                  e.currentTarget.style.borderColor = 'rgba(129,140,248,0.8)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = showTopNav
                    ? 'linear-gradient(180deg, #4f46e5 0%, #6366f1 100%)'
                    : 'linear-gradient(180deg, #1e293b 0%, #334155 100%)';
                  e.currentTarget.style.boxShadow = showTopNav
                    ? '0 6px 20px rgba(99,102,241,0.55), 0 2px 8px rgba(0,0,0,0.6), 0 0 0 2px rgba(99,102,241,0.35)'
                    : '0 4px 14px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.12)';
                  e.currentTarget.style.borderColor = showTopNav
                    ? 'rgba(129,140,248,0.8)'
                    : 'rgba(148,163,184,0.45)';
                }}
              >
                {/* 3×3 waffle / app-launcher dots */}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"
                  style={{ transition: 'opacity 0.2s' }}>
                  {[0,4,8].map(cy => [0,4,8].map(cx => (
                    <circle key={`${cx}-${cy}`} cx={cx + 2} cy={cy + 2} r="1.4"
                      fill={showTopNav ? '#fff' : '#c4cfe0'} />
                  )))}
                </svg>
              </button>

              {/* Mega-menu dropdown */}
              {showTopNav && (
                <div style={{
                  position: 'fixed',
                  top: 58, left: 0, right: 0,
                  zIndex: 1200,
                  background: 'linear-gradient(180deg, rgba(13,19,38,0.99) 0%, rgba(9,13,28,0.99) 100%)',
                  backdropFilter: 'blur(28px)',
                  WebkitBackdropFilter: 'blur(28px)',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
                  animation: 'topNavSlideDown 0.2s cubic-bezier(0.16,1,0.3,1)',
                }}>
                  {/* Top accent line */}
                  <div style={{ height: 2, background: 'linear-gradient(90deg, transparent 0%, #6366f1 30%, #818cf8 50%, #6366f1 70%, transparent 100%)' }} />

                  <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 40px 32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    {[
                      { label: 'Smart Hub',    icon: '🧠', color: '#f472b6', items: [
                        { icon: '🖼', label: 'Image Generator',  tab: 'image-generator'  },
                        { icon: '✨', label: 'Recipe Generator', tab: 'recipe-generator' },
                      ]},
                      { label: 'Digital Vault', icon: '🗄', color: '#22d3ee', items: [
                        { icon: '🔍', label: 'DocuWizard',  tab: 'analyzer'     },
                        { icon: '🎙', label: 'EchoScribe',  tab: 'transcription' },
                      ]},
                      { label: 'The Forge',    icon: '⚒', color: '#fb923c', items: [
                        { icon: '💬', label: 'Reply Enchanter',  tab: 'Content'        },
                        { icon: '📄', label: 'Career Alchemist', tab: 'Resume'         },
                        { icon: '🗂', label: 'Asset Library',    tab: 'asset-library'  },
                      ]},
                      { label: 'Social HQ',   icon: '📡', color: '#a78bfa', items: [
                        { icon: '🛡', label: 'Brand Guardian', tab: 'brand-guardian' },
                        { icon: '👥', label: 'Team',           tab: 'team'           },
                        { icon: '🏢', label: 'Organization',   tab: 'organization'   },
                      ]},
                    ].map((section, idx) => (
                      <div key={section.label} style={{
                        padding: idx === 0 ? '0 22px 0 0' : idx === 3 ? '0 0 0 22px' : '0 22px',
                        borderRight: idx < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      }}>
                        {/* Section header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                            background: `${section.color}18`,
                            border: `1px solid ${section.color}35`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                          }}>{section.icon}</div>
                          <span style={{ fontSize: 11, fontWeight: 800, color: section.color, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                            {section.label}
                          </span>
                        </div>

                        {/* Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {section.items.map(item => {
                            const isActive = activeTab === item.tab;
                            return (
                              <button
                                key={item.tab}
                                onClick={() => { go(item.tab); setShowTopNav(false); if (isMobile || isTablet) setSidebarOpen(false); }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 10,
                                  padding: '8px 10px', borderRadius: 10, width: '100%',
                                  background: isActive ? `${section.color}15` : 'transparent',
                                  border: `1px solid ${isActive ? section.color + '40' : 'transparent'}`,
                                  color: isActive ? section.color : '#94a3b8',
                                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                                  transition: 'all 0.13s',
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background = `${section.color}12`;
                                  e.currentTarget.style.color = '#f1f5f9';
                                  e.currentTarget.style.borderColor = `${section.color}30`;
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background = isActive ? `${section.color}15` : 'transparent';
                                  e.currentTarget.style.color = isActive ? section.color : '#94a3b8';
                                  e.currentTarget.style.borderColor = isActive ? `${section.color}40` : 'transparent';
                                }}
                              >
                                <span style={{
                                  width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                                  background: isActive ? `${section.color}20` : 'rgba(255,255,255,0.04)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                                  border: `1px solid ${isActive ? section.color + '30' : 'rgba(255,255,255,0.06)'}`,
                                }}>{item.icon}</span>
                                <span>{item.label}</span>
                                {isActive && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: section.color, flexShrink: 0 }} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ flex: 1 }} />
            <div style={s.topRight}>
              {loading ? (
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>...</span>
              ) : (
                <>
                  {!isMobile && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        onClick={() => go('trends-live')}
                        title="Trend Hijacker — live trending topics"
                        style={{
                          background: activeTab === 'trends-live' ? 'rgba(251,146,60,0.18)' : 'none',
                          border: activeTab === 'trends-live' ? '1px solid rgba(251,146,60,0.4)' : 'none',
                          cursor: 'pointer', padding: '3px 6px', borderRadius: 8,
                          fontSize: 16, lineHeight: 1, transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,146,60,0.18)'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = activeTab === 'trends-live' ? 'rgba(251,146,60,0.18)' : 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        🔥
                      </button>
                      <NotificationBell
                        onOpenPost={(postId) => {
                          // Open Content Calendar and hand off the post id via a window event
                          // so ContentCalendar can pop the feedback modal for that post.
                          go('calendar');
                          window.dispatchEvent(new CustomEvent('wintaibot:open-post', { detail: { postId } }));
                        }}
                      />
                      <span style={s.topEmail} title={user.email}>{user.email}</span>
                    </span>
                  )}
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
                  {!isMobile && <button onClick={logout} style={s.logoutBtn}>Logout</button>}
                  {isMobile && <button onClick={logout} style={{ ...s.logoutBtn, padding: '6px 10px', fontSize: '12px' }}>Out</button>}
                  <div style={s.avatar}>{userInitials}</div>
                </>
              )}
            </div>
          </header>
        )}

        {/* Content */}
        <Box
          component="div"
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            overscrollBehavior: 'contain',
            paddingTop: !user ? '58px' : undefined,
            px: { xs: 0, sm: 0 },
          }}
        >
          {!activeTab && !user && (
            <LandingSection onGetStarted={() => go('chat')} onChoosePlan={handleChoosePlan} />
          )}
          {user && (!activeTab || activeTab === 'analytics') && (
            <MemberGate featureName="Analytics">
              <WorkspaceGate permKey="analytics">
                <AnalyticsDashboard />
              </WorkspaceGate>
            </MemberGate>
          )}
          {activeTab === 'image-generator'  && <MemberGate featureName="Image Generator"><WorkspaceGate permKey="imageGenerator"><ImageGenerator /></WorkspaceGate></MemberGate>}
          {activeTab === 'chat'             && <AskAIGate  featureName="Ask AI"><ChatComponent /></AskAIGate>}
          {activeTab === 'analyzer'         && <MemberGate featureName="DocuWizard"><SpendingAnalyzer /></MemberGate>}
          {activeTab === 'recipe-generator' && <AskAIGate  featureName="Recipe Generator"><ReceipeGenerator /></AskAIGate>}
          {activeTab === 'transcription'    && <MemberGate featureName="EchoScribe"><ProGate featureName="EchoScribe"><Transcription /></ProGate></MemberGate>}
          {activeTab === 'Content'          && <MemberGate featureName="Reply Enchanter"><Content /></MemberGate>}
          {activeTab === 'Resume'           && <MemberGate featureName="Career Alchemist"><Resume /></MemberGate>}
          {activeTab === 'repurposer'        && <MemberGate featureName="Repurposer"><ProGate featureName="Repurposer"><Repurposer /></ProGate></MemberGate>}
          {activeTab === 'url-repurpose'    && <MemberGate featureName="URL Repurposer"><ProGate featureName="URL Repurposer"><UrlRepurposer /></ProGate></MemberGate>}
          {activeTab === 'video-recycler'   && <MemberGate featureName="Video Repurposer"><ProGate featureName="Video Repurposer"><VideoRecycler /></ProGate></MemberGate>}
          {activeTab === 'trends-live'      && <MemberGate featureName="Trend Hijacker"><ProGate featureName="Trend Hijacker"><TrendAlerts /></ProGate></MemberGate>}
          {activeTab === 'self-heal'        && <MemberGate featureName="Self-Healing Content"><ProGate featureName="Self-Healing Content"><SelfHealDashboard /></ProGate></MemberGate>}
          {activeTab === 'brand-guardian'   && <MemberGate featureName="Brand Guardian"><ProGate featureName="Brand Guardian"><BrandGuardian /></ProGate></MemberGate>}
          {activeTab === 'asset-library'    && <MemberGate featureName="Asset Library"><ProGate featureName="Asset Library"><MediaLibrary /></ProGate></MemberGate>}
          {activeTab === 'ai-workspace'     && <MemberGate featureName="AI Workspace"><ProGate featureName="AI Workspace"><AiWorkspace onCaptionApproved={(text) => { setTemplateCaption(text); go('video-publisher'); }} /></ProGate></MemberGate>}
          {activeTab === 'account'          && <AskAIGate  featureName="Account"><AccountSettings /></AskAIGate>}
          {activeTab === 'video-publisher'  && <MemberGate featureName="Video Publisher"><WorkspaceGate permKey="videoPublisher"><VideoPublisher onNavigateToSocialConnect={() => go('social-connect')} templateCaption={templateCaption} onTemplateCaptionUsed={() => setTemplateCaption(null)} /></WorkspaceGate></MemberGate>}
          {activeTab === 'caption-templates' && <MemberGate featureName="Templates"><WorkspaceGate permKey="templates"><CaptionTemplates onBack={() => go('video-publisher')} onUseTemplate={(text) => { setTemplateCaption(text); go('video-publisher'); }} /></WorkspaceGate></MemberGate>}
          {activeTab === 'messages'         && <MemberGate featureName="Messages"><ProGate featureName="Messages"><MessagesInbox onOpenConnectedAccounts={() => go('social-connect')} onOpenAutoReply={() => go('auto-reply')} /></ProGate></MemberGate>}
          {activeTab === 'social-connect'   && <MemberGate featureName="Connected Accounts"><WorkspaceGate permKey="connectAccounts"><SocialConnect onConnectionChange={setConnectedPlatforms} /></WorkspaceGate></MemberGate>}
          {activeTab === 'bio'              && <MemberGate featureName="Link in Bio"><WorkspaceGate permKey="linkInBio"><LinkInBioBuilder /></WorkspaceGate></MemberGate>}
          {activeTab === 'trends'          && <MemberGate featureName="Growth Planner"><WorkspaceGate permKey="analytics"><ProGate featureName="Growth Planner"><DeepAnalytics /></ProGate></WorkspaceGate></MemberGate>}
          {activeTab === 'social-ai'       && <MemberGate featureName="Social AI"><ProGate featureName="Social AI"><WorkspaceGate permKey="aiCaptions"><SocialAIChat /></WorkspaceGate></ProGate></MemberGate>}
          {activeTab === 'pricing'         && <PricingPage onClose={() => go(null)} />}
          {activeTab === 'brand'           && <MemberGate featureName="Brand Kit"><BrandKitSettings /></MemberGate>}
          {activeTab === 'team'            && <MemberGate featureName="Team"><ProGate featureName="Team"><TeamSettings /></ProGate></MemberGate>}
          {activeTab === 'organization'    && <MemberGate featureName="Organization"><ProGate featureName="Organization"><OrganizationSettings /></ProGate></MemberGate>}
          {activeTab === 'help'            && <HelpPanel />}
          {activeTab === 'auto-reply'      && <MemberGate featureName="Auto Reply"><ProGate featureName="Auto Reply"><AutoReplySettings /></ProGate></MemberGate>}
          {activeTab === 'calendar'        && <MemberGate featureName="Content Calendar"><WorkspaceGate permKey="contentCalendar"><ContentCalendar onOpenVideoPublisher={() => go('video-publisher')} /></WorkspaceGate></MemberGate>}
        </Box>
      </Box>

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
        <div className="auth-modal-overlay" onClick={() => { setShowAuthModal(false); setOrgInviteHint(null); }}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <button onClick={() => { setShowAuthModal(false); setOrgInviteHint(null); }} className="auth-modal-close" aria-label="Close">✕</button>
            {orgInviteHint && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))',
                border: '1px solid rgba(99,102,241,0.35)',
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>🏢</span>
                <div>
                  <div style={{ color: '#c4b5fd', fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
                    You've been invited to join <em>{orgInviteHint.orgName}</em>
                  </div>
                  <div style={{ color: '#a0a0b8', fontSize: 13 }}>
                    {orgInviteHint.email
                      ? <>Create a free account for <strong style={{ color: '#e0e0e0' }}>{orgInviteHint.email}</strong> or sign in to accept.</>
                      : 'Create a free account or sign in to accept your invitation.'}
                  </div>
                </div>
              </div>
            )}
            {authMode === 'login' && (
              <Login
                onSuccess={() => { setShowAuthModal(false); setOrgInviteHint(null); }}
                onSwitchToSignup={() => setAuthMode('signup')}
                onForgotPassword={() => setAuthMode('forgot-password')}
              />
            )}
            {authMode === 'signup' && (
              <Signup
                onSuccess={() => { setShowAuthModal(false); setOrgInviteHint(null); }}
                onSwitchToLogin={() => setAuthMode('login')}
                prefillEmail={orgInviteHint?.email || ''}
              />
            )}
            {authMode === 'forgot-password' && (
              <ForgotPassword onBack={() => setAuthMode('login')} />
            )}
          </div>
        </div>
      )}

      {user && (
        <div style={s.aiDockWrap}>
          {aiDockOpen && (
            <div style={s.aiDockPanel}>
              <button
                type="button"
                style={s.aiDockItem}
                onClick={() => { setAiDockOpen(false); go('chat'); }}
              >
                <span style={s.aiDockEmoji}>💬</span>
                <span style={{ flex: 1, textAlign: 'left' }}>Ask AI</span>
                <span style={s.aiDockItemArrow}>›</span>
              </button>
              <button
                type="button"
                style={s.aiDockItem}
                onClick={() => { setAiDockOpen(false); go('social-ai'); }}
              >
                <span style={s.aiDockEmoji}>🧠</span>
                <span style={{ flex: 1, textAlign: 'left' }}>Social AI</span>
                <span style={s.aiDockItemArrow}>›</span>
              </button>
              <button
                type="button"
                style={s.aiDockItem}
                onClick={() => { setAiDockOpen(false); go('ai-workspace'); }}
              >
                <span style={s.aiDockEmoji}>🤖</span>
                <span style={{ flex: 1, textAlign: 'left' }}>AI Workspace</span>
                <span style={s.aiDockItemArrow}>›</span>
              </button>
            </div>
          )}
          <button
            type="button"
            style={s.aiDockToggle}
            onClick={() => setAiDockOpen((v) => !v)}
            aria-expanded={aiDockOpen}
            aria-label={aiDockOpen ? 'Close AI menu' : 'Open AI assistants'}
            title={aiDockOpen ? 'Close AI menu' : 'Open AI assistants'}
          >
            <span style={{ fontSize: aiDockOpen ? 18 : 20 }}>{aiDockOpen ? '✕' : '✨'}</span>
          </button>
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
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '13px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 2px 12px rgba(99,102,241,0.4)',
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

  aiDockWrap: {
    position: 'fixed',
    right: 'max(16px, env(safe-area-inset-right, 0px))',
    bottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
    zIndex: 60,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  aiDockPanel: {
    width: 190,
    borderRadius: 12,
    border: '1px solid rgba(148, 163, 184, 0.35)',
    background: 'rgba(15, 23, 42, 0.96)',
    boxShadow: '0 14px 32px rgba(2, 6, 23, 0.45)',
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  aiDockItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 9,
    padding: '9px 10px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: 600,
  },
  aiDockEmoji: {
    width: 20,
    textAlign: 'center',
    flexShrink: 0,
  },
  aiDockItemArrow: {
    opacity: 0.6,
    fontSize: 15,
  },
  aiDockToggle: {
    width: 44,
    height: 44,
    borderRadius: '999px',
    border: '1px solid rgba(148, 163, 184, 0.4)',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 26px rgba(37, 99, 235, 0.45)',
    cursor: 'pointer',
    lineHeight: 1,
  },
};
