import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const PERMISSION_KEYS = [
  { key: "contentCalendar",  label: "Content Calendar" },
  { key: "videoPublisher",   label: "Video Publisher" },
  { key: "imageGenerator",   label: "Image Generator" },
  { key: "aiCaptions",       label: "AI Captions" },
  { key: "viralHooks",       label: "Viral Hooks" },
  { key: "analytics",        label: "Analytics" },
  { key: "connectAccounts",  label: "Connect Accounts" },
  { key: "publishDirectly",  label: "Publish Directly" },
  { key: "templates",        label: "Templates" },
  { key: "linkInBio",        label: "Link In Bio" },
];

const ROLES = ["ADMIN", "MEMBER", "CLIENT"];

export default function OrganizationSettings() {
  const { token, apiBase, activeOrg, fetchOrg, fetchWorkspaces, userWorkspaces, isOrgOwner } = useAuth();
  const [activeTab, setActiveTab] = useState("members");

  // ── Members tab ──────────────────────────────────────────────────────────
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null);

  // ── Workspaces tab ───────────────────────────────────────────────────────
  const [wsName, setWsName] = useState("");
  const [wsColor, setWsColor] = useState("#6366f1");
  const [wsLoading, setWsLoading] = useState(false);
  const [wsMsg, setWsMsg] = useState(null);

  // ── Permissions tab ──────────────────────────────────────────────────────
  const [selectedWsId, setSelectedWsId] = useState("");
  const [wsMembers, setWsMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [perms, setPerms] = useState({});
  const [permsLoading, setPermsLoading] = useState(false);
  const [permsSaving, setPermsSaving] = useState(false);
  const [permsMsg, setPermsMsg] = useState(null);

  const authH = useCallback(() => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }), [token]);

  // Load org on mount if not loaded
  useEffect(() => { if (!activeOrg && token) { fetchOrg(); fetchWorkspaces(); } }, []);// eslint-disable-line react-hooks/exhaustive-deps

  // ── Invite ───────────────────────────────────────────────────────────────
  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true); setInviteMsg(null);
    try {
      const res = await fetch(`${apiBase}/api/org/invite`, {
        method: "POST", headers: authH(),
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Invite failed");
      setInviteMsg({ type: "ok", text: `Invite sent to ${inviteEmail}` });
      setInviteEmail(""); fetchOrg();
    } catch (err) {
      setInviteMsg({ type: "err", text: err.message });
    } finally { setInviteLoading(false); }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      const res = await fetch(`${apiBase}/api/org/members/${memberId}`, {
        method: "DELETE", headers: authH(),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Failed"); }
      fetchOrg();
    } catch (err) { alert(err.message); }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const res = await fetch(`${apiBase}/api/org/members/${memberId}/role`, {
        method: "PATCH", headers: authH(), body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Failed"); }
      fetchOrg();
    } catch (err) { alert(err.message); }
  };

  // ── Create workspace ─────────────────────────────────────────────────────
  const handleCreateWs = async (e) => {
    e.preventDefault();
    setWsLoading(true); setWsMsg(null);
    try {
      const res = await fetch(`${apiBase}/api/workspace`, {
        method: "POST", headers: authH(),
        body: JSON.stringify({ name: wsName.trim(), color: wsColor, orgId: activeOrg?.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to create workspace");
      setWsMsg({ type: "ok", text: `Workspace "${wsName}" created` });
      setWsName(""); setWsColor("#6366f1"); fetchWorkspaces();
    } catch (err) {
      setWsMsg({ type: "err", text: err.message });
    } finally { setWsLoading(false); }
  };

  // ── Permissions tab helpers ───────────────────────────────────────────────
  const loadWsMembers = async (wsId) => {
    if (!wsId) return;
    setPermsLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/workspace/${wsId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setWsMembers([]); return; }
      const data = await res.json().catch(() => []);
      setWsMembers(Array.isArray(data) ? data : []);
      setSelectedMemberId(""); setPerms({});
    } catch { setWsMembers([]); }
    finally { setPermsLoading(false); }
  };

  const handleSelectWs = (wsId) => { setSelectedWsId(wsId); loadWsMembers(wsId); };

  const handleSelectMember = (userId) => {
    setSelectedMemberId(userId);
    const m = wsMembers.find((m) => String(m.userId) === String(userId));
    setPerms(m?.permissions ? { ...m.permissions } : {});
    setPermsMsg(null);
  };

  const handleSavePerms = async () => {
    if (!selectedWsId || !selectedMemberId) return;
    setPermsSaving(true); setPermsMsg(null);
    try {
      const res = await fetch(`${apiBase}/api/workspace/${selectedWsId}/members/${selectedMemberId}/permissions`, {
        method: "PUT", headers: authH(), body: JSON.stringify({ permissions: perms }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setPermsMsg({ type: "ok", text: "Permissions saved" });
      loadWsMembers(selectedWsId);
    } catch (err) {
      setPermsMsg({ type: "err", text: err.message });
    } finally { setPermsSaving(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const members = activeOrg?.members || [];

  const card = {
    background: "#161625",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    padding: 20,
    marginBottom: 16,
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)",
    background: "#0d0d1a", color: "#e0e0e0", fontSize: 14, outline: "none",
  };

  const btnPrimary = {
    padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer",
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 600, fontSize: 14,
  };

  const btnDanger = {
    padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
    background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: 12, fontWeight: 600,
  };

  const msg = (m) => m ? (
    <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500,
      background: m.type === "ok" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
      color: m.type === "ok" ? "#4ade80" : "#f87171", border: `1px solid ${m.type === "ok" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}` }}>
      {m.text}
    </div>
  ) : null;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px", fontFamily: "inherit" }}>
      <h2 style={{ color: "#e0e0e0", marginBottom: 4, fontSize: 22, fontWeight: 700 }}>
        🏢 Organization
      </h2>
      {activeOrg && (
        <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>{activeOrg.name}</p>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["members", "workspaces", "permissions"].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
            background: activeTab === t ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.06)",
            color: activeTab === t ? "#fff" : "#bbb",
          }}>
            {t === "members" ? "👥 Members" : t === "workspaces" ? "📁 Workspaces" : "🔐 Permissions"}
          </button>
        ))}
      </div>

      {/* ── MEMBERS TAB ── */}
      {activeTab === "members" && (
        <>
          {/* Invite form */}
          <div style={card}>
            <h3 style={{ color: "#e0e0e0", marginBottom: 12, fontSize: 15, fontWeight: 600 }}>Invite Member</h3>
            <form onSubmit={handleInvite} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="email" placeholder="Email address" value={inviteEmail} required
                onChange={(e) => setInviteEmail(e.target.value)}
                style={{ ...inputStyle, flex: "1 1 200px" }}
              />
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                style={{ ...inputStyle, width: "auto", flex: "0 0 120px" }}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <button type="submit" disabled={inviteLoading} style={{ ...btnPrimary, opacity: inviteLoading ? 0.7 : 1 }}>
                {inviteLoading ? "Sending…" : "Send Invite"}
              </button>
            </form>
            {msg(inviteMsg)}
          </div>

          {/* Member list */}
          <div style={card}>
            <h3 style={{ color: "#e0e0e0", marginBottom: 12, fontSize: 15, fontWeight: 600 }}>
              Members ({members.length})
            </h3>
            {members.length === 0 && (
              <p style={{ color: "#666", fontSize: 14 }}>No members yet.</p>
            )}
            {members.map((m) => (
              <div key={m.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", background: "rgba(99,102,241,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#a5b4fc", fontWeight: 700, fontSize: 14, flexShrink: 0,
                }}>
                  {(m.firstName?.[0] || m.email?.[0] || "?").toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 500 }}>
                    {m.firstName || ""} {m.lastName || ""}
                    {(!m.firstName && !m.lastName) && <span style={{ color: "#888" }}>{m.email}</span>}
                  </div>
                  {(m.firstName || m.lastName) && (
                    <div style={{ color: "#666", fontSize: 12 }}>{m.email}</div>
                  )}
                </div>
                <span style={{
                  padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700,
                  background: m.status === "ACTIVE" ? "rgba(34,197,94,0.12)" : "rgba(234,179,8,0.12)",
                  color: m.status === "ACTIVE" ? "#4ade80" : "#fbbf24",
                }}>
                  {m.status}
                </span>
                {/* Role selector — owner-only */}
                {isOrgOwner && m.role !== "OWNER" && (
                  <select
                    value={m.role} onChange={(e) => handleRoleChange(m.id, e.target.value)}
                    style={{ ...inputStyle, width: "auto", padding: "4px 8px", fontSize: 12 }}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                )}
                {m.role === "OWNER" && (
                  <span style={{ color: "#fbbf24", fontSize: 12, fontWeight: 700 }}>OWNER</span>
                )}
                {isOrgOwner && m.role !== "OWNER" && (
                  <button onClick={() => handleRemoveMember(m.id)} style={btnDanger}>Remove</button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── WORKSPACES TAB ── */}
      {activeTab === "workspaces" && (
        <>
          {isOrgOwner && (
            <div style={card}>
              <h3 style={{ color: "#e0e0e0", marginBottom: 12, fontSize: 15, fontWeight: 600 }}>Create Workspace</h3>
              <form onSubmit={handleCreateWs} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <input
                  type="text" placeholder="Workspace name" value={wsName} required
                  onChange={(e) => setWsName(e.target.value)}
                  style={{ ...inputStyle, flex: "1 1 200px" }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label style={{ color: "#888", fontSize: 13 }}>Color</label>
                  <input type="color" value={wsColor} onChange={(e) => setWsColor(e.target.value)}
                    style={{ width: 36, height: 36, border: "none", borderRadius: 6, cursor: "pointer", padding: 2, background: "transparent" }}
                  />
                </div>
                <button type="submit" disabled={wsLoading} style={{ ...btnPrimary, opacity: wsLoading ? 0.7 : 1 }}>
                  {wsLoading ? "Creating…" : "Create"}
                </button>
              </form>
              {msg(wsMsg)}
            </div>
          )}

          <div style={card}>
            <h3 style={{ color: "#e0e0e0", marginBottom: 12, fontSize: 15, fontWeight: 600 }}>
              Workspaces ({userWorkspaces.length})
            </h3>
            {userWorkspaces.length === 0 && (
              <p style={{ color: "#666", fontSize: 14 }}>No workspaces yet.</p>
            )}
            {userWorkspaces.map((ws) => (
              <div key={ws.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                <span style={{
                  width: 14, height: 14, borderRadius: "50%", background: ws.color || "#6366f1",
                  display: "inline-block", flexShrink: 0,
                }} />
                <span style={{ color: "#e0e0e0", fontSize: 14, flex: 1 }}>{ws.name}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── PERMISSIONS TAB ── */}
      {activeTab === "permissions" && (
        <div style={card}>
          <h3 style={{ color: "#e0e0e0", marginBottom: 16, fontSize: 15, fontWeight: 600 }}>
            Set Member Permissions per Workspace
          </h3>

          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {/* Workspace selector */}
            <select
              value={selectedWsId}
              onChange={(e) => handleSelectWs(e.target.value)}
              style={{ ...inputStyle, flex: "1 1 160px" }}
            >
              <option value="">-- Select workspace --</option>
              {userWorkspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>

            {/* Member selector */}
            <select
              value={selectedMemberId}
              onChange={(e) => handleSelectMember(e.target.value)}
              disabled={!selectedWsId || permsLoading}
              style={{ ...inputStyle, flex: "1 1 160px", opacity: !selectedWsId ? 0.5 : 1 }}
            >
              <option value="">-- Select member --</option>
              {wsMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.firstName || m.email} {m.lastName || ""}
                </option>
              ))}
            </select>
          </div>

          {permsLoading && <p style={{ color: "#888", fontSize: 13 }}>Loading members…</p>}

          {selectedMemberId && (
            <>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 16,
              }}>
                {PERMISSION_KEYS.map(({ key, label }) => (
                  <label key={key} style={{
                    display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                    background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}>
                    <div
                      onClick={() => setPerms((p) => ({ ...p, [key]: !p[key] }))}
                      style={{
                        width: 38, height: 22, borderRadius: 11, flexShrink: 0,
                        background: perms[key] ? "#6366f1" : "rgba(255,255,255,0.1)",
                        position: "relative", transition: "background 0.2s", cursor: "pointer",
                      }}
                    >
                      <div style={{
                        position: "absolute", top: 3, left: perms[key] ? 19 : 3,
                        width: 16, height: 16, borderRadius: "50%", background: "#fff",
                        transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                      }} />
                    </div>
                    <span style={{ color: "#ccc", fontSize: 13 }}>{label}</span>
                  </label>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={handleSavePerms} disabled={permsSaving} style={{ ...btnPrimary, opacity: permsSaving ? 0.7 : 1 }}>
                  {permsSaving ? "Saving…" : "Save Permissions"}
                </button>
              </div>
              {msg(permsMsg)}
            </>
          )}

          {!selectedMemberId && selectedWsId && !permsLoading && wsMembers.length === 0 && (
            <p style={{ color: "#666", fontSize: 14 }}>No members in this workspace yet. Add them via the workspace members API.</p>
          )}
        </div>
      )}
    </div>
  );
}
