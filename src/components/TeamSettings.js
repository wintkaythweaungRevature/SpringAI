import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/* ─── Seat limits per plan ─────────────────────────────────── */
const SEAT_LIMITS = { FREE: 1, STARTER: 1, PRO: 3, GROWTH: 5, MEMBER: 3 };

function seatLimit(membershipType) {
  return SEAT_LIMITS[String(membershipType || '').toUpperCase()] ?? 1;
}

function isTeamPlan(membershipType) {
  const m = String(membershipType || '').toUpperCase();
  return m === 'PRO' || m === 'GROWTH' || m === 'MEMBER';
}

/* ─── Avatar initials ──────────────────────────────────────── */
function Avatar({ firstName, lastName, email, size = 36 }) {
  const initials = firstName
    ? `${(firstName[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`
    : (email?.[0] || '?').toUpperCase();
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#0ea5e9', '#10b981', '#f59e0b'];
  const color = colors[(initials.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 800, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

/* ─── Seat usage badge ─────────────────────────────────────── */
function SeatBadge({ used, total }) {
  const full = used >= total;
  return (
    <span style={{
      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
      background: full ? '#fef2f2' : '#f0fdf4',
      color: full ? '#b91c1c' : '#15803d',
      border: `1.5px solid ${full ? '#fecaca' : '#bbf7d0'}`,
    }}>
      {used} / {total} seats used
    </span>
  );
}

/* ─── Main component ───────────────────────────────────────── */
export default function TeamSettings() {
  const { user, token, apiBase, fetchTeam, createTeam, inviteMember, removeMember, leaveTeam } = useAuth();

  const [team, setTeam] = useState(null);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [teamErr, setTeamErr] = useState('');

  const [teamName, setTeamName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteErr, setInviteErr] = useState('');

  const [removingId, setRemovingId] = useState(null);
  const [leaving, setLeaving] = useState(false);

  const base = (apiBase || 'https://api.wintaibot.com').replace(/\/$/, '');
  const authH = useCallback(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token]);

  /* ── Load team ── */
  const loadTeam = useCallback(async () => {
    setLoadingTeam(true);
    setTeamErr('');
    try {
      const res = await fetch(`${base}/api/team`, { headers: authH() });
      // Treat any non-2xx (including 404, 500 — endpoint not yet live) as "no team"
      if (!res.ok) { setTeam(null); return; }
      const data = await res.json().catch(() => ({}));
      // If the response body is empty or falsy, also treat as no team
      const t = data?.team ?? data ?? null;
      setTeam(t && (t.id || t.name) ? t : null);
    } catch {
      // Network error — silently treat as no team so the UI isn't broken
      setTeam(null);
    } finally {
      setLoadingTeam(false);
    }
  }, [base, authH]);

  useEffect(() => { if (token) loadTeam(); }, [token, loadTeam]);

  /* ── Create team ── */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) { setCreateErr('Please enter a team name.'); return; }
    setCreating(true); setCreateErr('');
    try {
      const fn = createTeam || (async (name) => {
        const res = await fetch(`${base}/api/team`, {
          method: 'POST', headers: authH(), body: JSON.stringify({ name }),
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(d.error || d.message || 'Failed to create team');
        return d?.team ?? d;
      });
      const newTeam = await fn(teamName.trim());
      setTeam(newTeam);
      setTeamName('');
    } catch (err) {
      setCreateErr(err?.message || 'Failed to create team.');
    } finally {
      setCreating(false);
    }
  };

  /* ── Invite member ── */
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) { setInviteErr('Enter an email address.'); return; }
    setInviting(true); setInviteErr(''); setInviteMsg('');
    try {
      const fn = inviteMember || (async (email) => {
        const res = await fetch(`${base}/api/team/invite`, {
          method: 'POST', headers: authH(), body: JSON.stringify({ email }),
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(d.error || d.message || 'Invite failed');
        return d;
      });
      await fn(inviteEmail.trim());
      setInviteMsg(`✅ Invite sent to ${inviteEmail.trim()}`);
      setInviteEmail('');
      await loadTeam();
    } catch (err) {
      setInviteErr(err?.message || 'Failed to send invite.');
    } finally {
      setInviting(false);
    }
  };

  /* ── Remove member ── */
  const handleRemove = async (memberId, memberEmail) => {
    if (!window.confirm(`Remove ${memberEmail} from the team?`)) return;
    setRemovingId(memberId);
    try {
      const fn = removeMember || (async (id) => {
        const res = await fetch(`${base}/api/team/members/${encodeURIComponent(id)}`, {
          method: 'DELETE', headers: authH(),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || d.message || 'Remove failed');
        }
      });
      await fn(memberId);
      await loadTeam();
    } catch (err) {
      setTeamErr(err?.message || 'Failed to remove member.');
    } finally {
      setRemovingId(null);
    }
  };

  /* ── Leave team ── */
  const handleLeave = async () => {
    if (!window.confirm('Leave this team? You will lose access to shared features.')) return;
    setLeaving(true);
    try {
      const fn = leaveTeam || (async () => {
        const res = await fetch(`${base}/api/team/leave`, {
          method: 'DELETE', headers: authH(),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || d.message || 'Failed to leave team');
        }
      });
      await fn();
      setTeam(null);
    } catch (err) {
      setTeamErr(err?.message || 'Failed to leave team.');
    } finally {
      setLeaving(false);
    }
  };

  /* ───────── Derived values ───────── */
  const plan = String(user?.membershipType || 'FREE').toUpperCase();
  const limit = seatLimit(plan);
  const members = team?.members || [];
  const activeMembers = members.filter(m => m.status !== 'REMOVED');
  const seatsUsed = activeMembers.length;
  const isOwner = team ? (String(team.ownerId) === String(user?.id)) : true;
  const canInvite = isOwner && seatsUsed < limit;

  /* ─── Loading state ─── */
  if (loadingTeam) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
        <div>Loading team…</div>
      </div>
    );
  }

  /* ─── Lock wall for Starter / Free ─── */
  if (!isTeamPlan(user?.membershipType)) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
            Team Seats
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
            Invite teammates to collaborate under your plan — no extra charge per seat.
          </p>
        </div>

        <div style={{
          background: '#f8fafc', borderRadius: 16, border: '1.5px solid #e2e8f0',
          padding: '28px 24px', marginBottom: 20,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { plan: 'Pro', seats: 3, color: '#8b5cf6', price: '$39/mo' },
              { plan: 'Growth', seats: 5, color: '#f59e0b', price: '$79/mo' },
            ].map(({ plan: pName, seats, color, price }) => (
              <div key={pName} style={{
                borderRadius: 12, border: `2px solid ${color}30`,
                background: `${color}08`, padding: '16px 14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color, marginBottom: 4 }}>{pName}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{seats}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>team seats</div>
                <div style={{ fontSize: 11, color, fontWeight: 700, marginTop: 6 }}>{price}</div>
              </div>
            ))}
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 13, lineHeight: 2 }}>
            <li>One owner manages billing &amp; invites</li>
            <li>Members get full access to the owner's plan</li>
            <li>Revoke access instantly from the dashboard</li>
          </ul>
        </div>

        <a
          href="/?tab=pricing"
          onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'pricing' })); }}
          style={{
            display: 'block', width: '100%', boxSizing: 'border-box',
            padding: '14px 20px', borderRadius: 12, textAlign: 'center',
            background: '#8b5cf6', color: '#fff', fontWeight: 800, fontSize: 15,
            textDecoration: 'none', cursor: 'pointer',
          }}
        >
          Upgrade to Pro →
        </a>
      </div>
    );
  }

  /* ─── No team yet — create flow (owner only, Pro/Growth) ─── */
  if (!team) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
            Create Your Team
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
            Your <strong>{plan === 'GROWTH' ? 'Growth' : 'Pro'}</strong> plan includes{' '}
            <strong>{limit} seats</strong>. Give your team a name to get started.
          </p>
        </div>

        {teamErr && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13, fontWeight: 600 }}>
            ⚠️ {teamErr}
          </div>
        )}

        <form onSubmit={handleCreate}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Team name
          </div>
          <input
            type="text"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            placeholder="e.g. Acme Marketing Team"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '12px 14px', borderRadius: 10,
              border: '1.5px solid #cbd5e1', fontSize: 14, marginBottom: 8,
            }}
          />
          {createErr && <div style={{ fontSize: 12, color: '#b91c1c', marginBottom: 8 }}>{createErr}</div>}
          <button
            type="submit"
            disabled={creating}
            style={{
              width: '100%', padding: '13px 20px', borderRadius: 10,
              border: 'none', background: creating ? '#a5b4fc' : '#6366f1',
              color: '#fff', fontWeight: 800, fontSize: 15, cursor: creating ? 'wait' : 'pointer',
              marginTop: 4,
            }}
          >
            {creating ? 'Creating…' : 'Create Team'}
          </button>
        </form>
      </div>
    );
  }

  /* ─── Team dashboard ─── */
  return (
    <div style={{ padding: '32px 24px', maxWidth: 600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
            👥 {team.name || 'Your Team'}
          </h2>
          {isOwner && (
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
              You are the <strong style={{ color: '#6366f1' }}>Owner</strong>
            </div>
          )}
        </div>
        <SeatBadge used={seatsUsed} total={limit} />
      </div>

      {/* Error banner */}
      {teamErr && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13, fontWeight: 600 }}>
          ⚠️ {teamErr}
          <button onClick={() => setTeamErr('')} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', fontWeight: 800 }}>×</button>
        </div>
      )}

      {/* Members list */}
      <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
        Members
      </div>
      <div style={{ borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 24 }}>
        {activeMembers.length === 0 ? (
          <div style={{ padding: '20px 16px', color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
            No members yet. Invite someone below.
          </div>
        ) : (
          activeMembers.map((m, i) => {
            const isMe = String(m.id) === String(user?.id);
            const isMemberOwner = String(m.id) === String(team.ownerId);
            return (
              <div
                key={m.id || m.email}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px',
                  borderTop: i === 0 ? 'none' : '1px solid #f1f5f9',
                  background: isMe ? '#f8f7ff' : '#fff',
                }}
              >
                <Avatar firstName={m.firstName} lastName={m.lastName} email={m.email} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.firstName || m.lastName ? `${m.firstName || ''} ${m.lastName || ''}`.trim() : m.email}
                    {isMe && <span style={{ marginLeft: 6, fontSize: 11, color: '#94a3b8' }}>(you)</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.email}
                    {m.status === 'PENDING' && (
                      <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: '#d97706', background: '#fffbeb', padding: '1px 6px', borderRadius: 6, border: '1px solid #fde68a' }}>
                        Invite pending
                      </span>
                    )}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 12,
                  background: isMemberOwner ? '#eef2ff' : '#f1f5f9',
                  color: isMemberOwner ? '#4338ca' : '#64748b',
                  textTransform: 'uppercase', flexShrink: 0,
                }}>
                  {isMemberOwner ? 'Owner' : 'Member'}
                </span>
                {isOwner && !isMemberOwner && (
                  <button
                    onClick={() => handleRemove(m.id, m.email)}
                    disabled={removingId === m.id}
                    title={`Remove ${m.email}`}
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      border: '1px solid #fecaca', background: '#fef2f2',
                      color: '#b91c1c', fontSize: 14, fontWeight: 800,
                      cursor: removingId === m.id ? 'wait' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                  >
                    {removingId === m.id ? '…' : '×'}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Invite form (owner only) */}
      {isOwner && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Invite a member
            </div>
            {!canInvite && seatsUsed >= limit && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c' }}>Seats full</span>
            )}
            {canInvite && (
              <span style={{ fontSize: 11, color: '#64748b' }}>{limit - seatsUsed} seat{limit - seatsUsed !== 1 ? 's' : ''} remaining</span>
            )}
          </div>

          {inviteMsg && (
            <div style={{ marginBottom: 10, padding: '10px 14px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: 13, fontWeight: 600 }}>
              {inviteMsg}
            </div>
          )}
          {inviteErr && (
            <div style={{ marginBottom: 10, padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13, fontWeight: 600 }}>
              ⚠️ {inviteErr}
            </div>
          )}

          <form onSubmit={handleInvite} style={{ display: 'flex', gap: 8 }}>
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              disabled={!canInvite || inviting}
              placeholder={canInvite ? 'colleague@example.com' : 'Upgrade plan for more seats'}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 10,
                border: '1.5px solid #cbd5e1', fontSize: 13,
                background: canInvite ? '#fff' : '#f8fafc',
                color: canInvite ? '#1e293b' : '#94a3b8',
                minWidth: 0,
              }}
            />
            <button
              type="submit"
              disabled={!canInvite || inviting}
              style={{
                padding: '10px 18px', borderRadius: 10, border: 'none',
                background: !canInvite ? '#e2e8f0' : inviting ? '#a5b4fc' : '#6366f1',
                color: !canInvite ? '#94a3b8' : '#fff',
                fontWeight: 700, fontSize: 13,
                cursor: !canInvite || inviting ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {inviting ? 'Sending…' : 'Send Invite'}
            </button>
          </form>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
            Invited users receive an email with an accept link. They get full access under your {plan === 'GROWTH' ? 'Growth' : 'Pro'} plan.
          </div>
        </div>
      )}

      {/* Leave team (member only) */}
      {!isOwner && (
        <div style={{ paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={handleLeave}
            disabled={leaving}
            style={{
              padding: '10px 18px', borderRadius: 10,
              border: '1.5px solid #fecaca', background: '#fef2f2',
              color: '#b91c1c', fontWeight: 700, fontSize: 13,
              cursor: leaving ? 'wait' : 'pointer',
            }}
          >
            {leaving ? 'Leaving…' : 'Leave Team'}
          </button>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#94a3b8' }}>
            Leaving will revoke your access to this team's shared features.
          </p>
        </div>
      )}
    </div>
  );
}
