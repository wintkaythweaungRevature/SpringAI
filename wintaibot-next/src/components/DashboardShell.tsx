'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAuth } from '@/context/AuthContext';
import Login from './Login';
import Signup from './Signup';

const SIDEBAR_GROUPS = {
  smartHub: 'Smart Hub',
  digitalVault: 'Digital Vault',
  socialHq: 'Social HQ',
  theForge: 'The Forge',
  settings: 'Settings',
} as const;

function NavItem({
  emoji,
  label,
  href,
  active,
  hasArrow,
}: {
  emoji: string;
  label: string;
  href: string;
  active: boolean;
  hasArrow?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      style={{
        ...nav.item,
        ...(active ? nav.active : hovered ? nav.hover : {}),
      } as React.CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={nav.emoji}>{emoji}</span>
      <span style={nav.label}>{label}</span>
      {hasArrow && <span style={nav.arrow}>›</span>}
    </Link>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
    else if (isTablet) setSidebarOpen(false);
    else setSidebarOpen(true);
  }, [isMobile, isTablet]);

  useEffect(() => {
    if (loading || user) return;
    const auth = new URLSearchParams(window.location.search).get('auth');
    if (auth === 'login' || auth === 'signup') {
      setAuthMode(auth);
      setShowAuthModal(true);
    }
  }, [loading, user, pathname]);

  const userInitials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??';
  const showDashboardChrome = Boolean(user);

  const mainShellBg =
    'linear-gradient(165deg, #060a14 0%, #0f172a 35%, #111d36 50%, #0a1020 100%)';

  return (
    <div
      style={{
        ...s.shell,
        ...(showDashboardChrome ? { background: mainShellBg } : {}),
      } as React.CSSProperties}
    >
      {showDashboardChrome && ((isMobile || isTablet) && sidebarOpen) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 40,
          }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      {showDashboardChrome && <aside
        style={{
          ...s.sidebar,
          ...(sidebarOpen ? {} : s.sidebarCollapsed),
          ...((isMobile || isTablet)
            ? {
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 50,
                width: sidebarOpen ? '280px' : '0',
                minWidth: sidebarOpen ? '280px' : '0',
                overflow: 'hidden',
                transition: 'width 0.25s ease, min-width 0.25s ease',
                boxShadow: sidebarOpen ? '4px 0 28px rgba(0,0,0,0.45)' : 'none',
              }
            : {}),
        } as React.CSSProperties}
      >
        <div style={s.logoArea}>
          <div style={s.logoIconBg}>🤖</div>
          {sidebarOpen && (
            <Link href="/" style={s.logoText}>
              W!ntAi
            </Link>
          )}
        </div>

        <nav style={s.nav}>
          <NavItem emoji="🏠" label="Dashboard" href="/" active={pathname === '/' || pathname === '/analytics'} />

          <div style={s.navDivider} role="separator" aria-hidden="true" />
          <div style={s.groupLabel}>{SIDEBAR_GROUPS.smartHub}</div>
          <NavItem emoji="💬" label="Ask AI" href="/chat" active={pathname === '/chat'} hasArrow />
          <NavItem
            emoji="🖼️"
            label="Image Generator"
            href="/image-generator"
            active={pathname === '/image-generator'}
          />
          <NavItem
            emoji="🍲"
            label="Recipe Generator"
            href="/recipe-generator"
            active={pathname === '/recipe-generator'}
          />

          <div style={s.navDivider} role="separator" aria-hidden="true" />
          <div style={s.groupLabel}>{SIDEBAR_GROUPS.digitalVault}</div>
          <NavItem emoji="🧙‍♂️" label="DocuWizard" href="/analyzer" active={pathname === '/analyzer'} />
          <NavItem
            emoji="🎙️"
            label="EchoScribe"
            href="/transcription"
            active={pathname === '/transcription'}
          />

          <div style={s.navDivider} role="separator" aria-hidden="true" />
          <div style={s.groupLabel}>{SIDEBAR_GROUPS.socialHq}</div>
          <NavItem
            emoji="💬"
            label="Inbox"
            href="/messages"
            active={pathname === '/messages'}
          />
          <NavItem emoji="📈" label="Growth Planner" href="/trends" active={pathname === '/trends'} />
          <NavItem emoji="🧠" label="Social AI" href="/social-ai" active={pathname === '/social-ai'} />
          <NavItem emoji="🗓️" label="Content Calendar" href="/calendar" active={pathname === '/calendar'} />

          <div style={s.navDivider} role="separator" aria-hidden="true" />
          <div style={s.groupLabel}>{SIDEBAR_GROUPS.theForge}</div>
          <NavItem emoji="✉️" label="Reply Enchanter" href="/Content" active={pathname === '/Content'} />
          <NavItem emoji="⚗️" label="Career Alchemist" href="/Resume" active={pathname === '/Resume'} />

          {user && (
            <div style={s.navFooterBlock}>
              <div style={s.navDividerStrong} role="separator" aria-hidden="true" />
              <div style={s.groupLabelFooter}>{SIDEBAR_GROUPS.settings}</div>
              <NavItem emoji="⚙️" label="Account" href="/account" active={pathname === '/account'} hasArrow />
              <NavItem emoji="💳" label="Pricing" href="/pricing" active={pathname === '/pricing'} />
            </div>
          )}
        </nav>

        <div style={s.sidebarFooter}>
          <button style={s.exploreBtn}>
            <span style={{ fontSize: '15px' }}>⊞</span>
            {sidebarOpen && (
              <>
                <span style={{ flex: 1 }}>Explore Tools</span>
                <span style={{ opacity: 0.5, fontSize: '13px' }}>›</span>
              </>
            )}
          </button>
        </div>
      </aside>}

      <main
        style={{
          ...s.main,
          ...(showDashboardChrome ? { background: mainShellBg } : {}),
        } as React.CSSProperties}
      >
        {showDashboardChrome ? (
          <header style={s.topBar}>
          <button style={s.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>

          <div style={s.searchBox}>
            <span style={{ opacity: 0.4, fontSize: '14px' }}>🔍</span>
            <input
              className="dashboard-search-input"
              style={s.searchInput}
              type="text"
              placeholder="Search..."
            />
          </div>

          <div style={s.topRight}>
            {loading ? <span style={{ color: '#94a3b8', fontSize: '13px' }}>...</span> : (
              <>
                <span style={s.topEmail} title={user?.email || ''}>
                  {user?.email || ''}
                </span>
                {user?.membershipType === 'MEMBER' && (
                  <span style={s.memberBadge}>✓ Member</span>
                )}
                <button onClick={logout} style={s.logoutBtn}>
                  Logout
                </button>
                <div style={s.avatar}>{userInitials}</div>
              </>
            )}
          </div>
          </header>
        ) : (
          <header style={s.publicTopBar}>
            <Link href="/" style={s.publicBrand}>W!ntAi</Link>
            <nav style={s.publicNav}>
              <Link href="/features" style={s.publicNavLink}>Features</Link>
              <Link href="/pricing" style={s.publicNavLink}>Pricing</Link>
              <Link href="/docs" style={s.publicNavLink}>Docs</Link>
            </nav>
            <div style={s.publicActions}>
              <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} style={s.loginBtn}>Login</button>
              <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} style={s.signupBtn}>Sign Up</button>
            </div>
          </header>
        )}

        <div style={s.content}>{children}</div>
      </main>

      {showAuthModal && !user && (
        <div
          className="auth-modal-overlay"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="auth-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative' }}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="auth-modal-close"
              aria-label="Close"
            >
              ✕
            </button>
            {authMode === 'login' ? (
              <Login
                onSuccess={() => setShowAuthModal(false)}
                onSwitchToSignup={() => setAuthMode('signup')}
              />
            ) : (
              <Signup
                onSuccess={() => setShowAuthModal(false)}
                onSwitchToLogin={() => setAuthMode('login')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const nav: Record<string, React.CSSProperties | Record<string, unknown>> = {
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '9px 12px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: '13.5px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
    marginBottom: '2px',
    transition: 'all 0.15s',
    textDecoration: 'none',
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
  emoji: { fontSize: '16px', flexShrink: 0, width: '20px', textAlign: 'center' as const },
  label: { flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  arrow: { opacity: 0.45, fontSize: '17px', marginLeft: 'auto' },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const s: Record<string, any> = {
  shell: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    fontFamily: "'Inter', -apple-system, sans-serif",
    background: '#f0f4f8',
  },
  sidebar: {
    width: '224px',
    minWidth: '224px',
    maxWidth: '280px',
    height: '100vh',
    background: 'linear-gradient(180deg, #0c1222 0%, #0f172a 42%, #151e35 100%)',
    borderRight: '1px solid rgba(148, 163, 184, 0.14)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.25s ease, min-width 0.25s ease',
    flexShrink: 0,
    overflow: 'hidden',
  },
  sidebarCollapsed: { width: '60px', minWidth: '60px' },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 16px 18px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '10px',
    flexShrink: 0,
  },
  logoIconBg: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
  },
  logoText: {
    color: '#f1f5f9',
    fontSize: '16px',
    fontWeight: '800',
    letterSpacing: '-0.3px',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '4px 8px',
    scrollbarWidth: 'none',
  },
  groupLabel: {
    fontSize: '11px',
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'none',
    letterSpacing: '0.02em',
    padding: '10px 12px 6px',
    whiteSpace: 'nowrap',
  },
  groupLabelFooter: {
    fontSize: '10.5px',
    fontWeight: '800',
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
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: '#f0f4f8',
    minWidth: 0,
  },
  topBar: {
    height: '58px',
    flexShrink: 0,
    background: 'rgba(15, 23, 42, 0.72)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px 0 16px',
    gap: '10px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
    flexWrap: 'wrap',
    minWidth: 0,
  },
  publicTopBar: {
    height: '64px',
    flexShrink: 0,
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    gap: '10px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    flexWrap: 'wrap',
  },
  publicBrand: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: '18px',
    textDecoration: 'none',
  },
  publicNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  publicNavLink: {
    color: '#475569',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'none',
  },
  publicActions: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    color: '#cbd5e1',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: '6px',
    flexShrink: 0,
    lineHeight: 1,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '24px',
    padding: '8px 16px',
    flex: 1,
    maxWidth: '360px',
    minWidth: 0,
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '13px',
    color: '#f1f5f9',
    width: '100%',
    fontFamily: 'inherit',
  },
  topRight: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  topEmail: {
    fontSize: '13px',
    color: '#64748b',
    maxWidth: '180px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  memberBadge: {
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#16a34a',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    padding: '3px 10px',
    borderRadius: '20px',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  quickTopBtn: {
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#334155',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  loginBtn: {
    padding: '7px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#0f172a',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  signupBtn: {
    padding: '7px 16px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0,
    boxShadow: '0 0 0 2px rgba(102,126,234,0.3)',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '16px',
    minWidth: 0,
  },
};
