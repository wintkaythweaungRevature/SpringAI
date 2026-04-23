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

const ALL_TRUE = Object.fromEntries(PERMISSION_KEYS.map(({ key }) => [key, true]));

/** Default permissions for CLIENT members — mirrors Java WorkspaceService.CLIENT_PERMISSIONS */
const CLIENT_DEFAULTS = {
  contentCalendar: true,
  videoPublisher: false,   // agency handles publishing
  imageGenerator: true,
  aiCaptions: true,
  viralHooks: true,
  analytics: true,
  connectAccounts: true,
  publishDirectly: false,  // agency approves before going live
  templates: true,
  linkInBio: true,
};

const ROLE_BADGE_STYLE = (role) => ({
  padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700, flexShrink: 0,
  background: { OWNER: "rgba(251,191,36,0.15)", ADMIN: "rgba(165,180,252,0.15)", MEMBER: "rgba(156,163,175,0.15)", CLIENT: "rgba(251,146,60,0.15)" }[role] || "rgba(255,255,255,0.08)",
  color: { OWNER: "#fbbf24", ADMIN: "#a5b4fc", MEMBER: "#9ca3af", CLIENT: "#fb923c" }[role] || "#888",
});

const ROLES = ["ADMIN", "MEMBER", "CLIENT"];

export default function OrganizationSettings() {
  const { token, apiBase, activeOrg, fetchOrg, fetchWorkspaces, userWorkspaces, isOrgOwner, myOrgRole, user } = useAuth();

  // Derived role flags
  const canManageMembers = isOrgOwner || myOrgRole === "OWNER" || myOrgRole === "ADMIN";
  const isReadOnly = !canManageMembers; // MEMBER / CLIENT
  const [activeTab, setActiveTab] = useState("members");

  // ── Create org ────────────────────────────────────────────────────────────
  const [orgName, setOrgName] = useState("");
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgMsg, setOrgMsg] = useState(null);

  // ── Members tab ──────────────────────────────────────────────────────────
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null);

  // ── Import from Team ─────────────────────────────────────────────────────
  const [teamMembers, setTeamMembers] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importMsg, setImportMsg] = useState(null);
  const [showImport, setShowImport] = useState(false);

  // ── Workspaces tab ───────────────────────────────────────────────────────
  const [wsName, setWsName] = useState("");
  const [wsColor, setWsColor] = useState("#6366f1");
  const [wsLoading, setWsLoading] = useState(false);
  const [wsMsg, setWsMsg] = useState(null);
  // Expanded workspace for member management
  const [expandedWsId, setExpandedWsId] = useState(null);
  const [wsMembers, setWsMembers] = useState({}); // wsId → members[]
  const [wsMembersLoading, setWsMembersLoading] = useState({});
  const [addMemberWsId, setAddMemberWsId] = useState(null);
  const [addMemberUserId, setAddMemberUserId] = useState("");
  const [addMemberPreset, setAddMemberPreset] = useState("STAFF");   // "STAFF" | "CLIENT" | "CUSTOM"
  const [addMemberPerms, setAddMemberPerms] = useState({ ...ALL_TRUE });
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [addMemberMsg, setAddMemberMsg] = useState({});

  // ── Permissions tab ──────────────────────────────────────────────────────
  const [selectedWsId, setSelectedWsId] = useState("");
  const [permWsMembers, setPermWsMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [perms, setPerms] = useState({});
  const [permsLoading, setPermsLoading] = useState(false);
  const [permsSaving, setPermsSaving] = useState(false);
  const [permsMsg, setPermsMsg] = useState(null);
  // Set of permission keys the workspace owner's plan allows them to grant.
  // Toggles outside this set are hidden from the UI.
  const [availablePerms, setAvailablePerms] = useState(null);

  const authH = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }), [token]);

  useEffect(() => {
    if (token) { fetchOrg(); fetchWorkspaces(); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Create organization ───────────────────────────────────────────────────
  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setOrgLoading(true); setOrgMsg(null);
    try {
      const res = await fetch(`${apiBase}/api/org`, {
        method: "POST", headers: authH(),
        body: JSON.stringify({ name: orgName.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || "Failed to create organization");
      setOrgMsg({ type: "ok", text: `Organization "${orgName}" created!` });
      setOrgName("");
      fetchOrg(); fetchWorkspaces();
    } catch (err) {
      setOrgMsg({ type: "err", text: err.message });
    } finally { setOrgLoading(false); }
  };

  // ── Invite member ─────────────────────────────────────────────────────────
  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true); setInviteMsg(null);
    try {
      const res = await fetch(`${apiBase}/api/org/invite`, {
        method: "POST", headers: authH(),
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || "Invite failed");
      setInviteMsg({ type: "ok", text: `Invite sent to ${inviteEmail}` });
      setInviteEmail(""); fetchOrg();
    } catch (err) {
      setInviteMsg({ type: "err", text: err.message });
    } finally { setInviteLoading(false); }
  };

  // ── Import from Team ─────────────────────────────────────────────────────
  const fetchTeamMembers = async () => {
    setImportLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/team`, { headers: authH() });
      if (!res.ok) throw new Error("Could not load team");
      const data = await res.json().catch(() => ({}));
      // Team API returns { members: [...] } or array
      const list = Array.isArray(data) ? data : (data.members || []);
      // Filter out owner and get emails of non-owner team members
      const orgEmails = new Set((activeOrg?.members || []).map((m) => m.email?.toLowerCase()));
      const eligible = list.filter(
        (m) => m.role !== "OWNER" && m.email && m.status !== "REMOVED" && !orgEmails.has(m.email.toLowerCase())
      );
      setTeamMembers(eligible);
      setShowImport(true);
    } catch (err) {
      setImportMsg({ type: "err", text: err.message });
    } finally { setImportLoading(false); }
  };

  const handleImportAll = async () => {
    if (teamMembers.length === 0) return;
    setImportLoading(true); setImportMsg(null);
    let sent = 0; let failed = 0;
    for (const m of teamMembers) {
      try {
        const res = await fetch(`${apiBase}/api/org/invite`, {
          method: "POST", headers: authH(),
          body: JSON.stringify({ email: m.email, role: "MEMBER" }),
        });
        if (res.ok) sent++; else failed++;
      } catch { failed++; }
    }
    setImportMsg({
      type: sent > 0 ? "ok" : "err",
      text: `Sent ${sent} invite${sent !== 1 ? "s" : ""}${failed > 0 ? `, ${failed} failed` : ""}.`,
    });
    setShowImport(false);
    fetchOrg();
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

  // ── Create workspace ──────────────────────────────────────────────────────
  const handleCreateWs = async (e) => {
    e.preventDefault();
    setWsLoading(true); setWsMsg(null);
    try {
      const res = await fetch(`${apiBase}/api/workspace`, {
        method: "POST", headers: authH(),
        body: JSON.stringify({ name: wsName.trim(), color: wsColor, orgId: activeOrg?.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || "Failed to create workspace");
      setWsMsg({ type: "ok", text: `Workspace "${wsName}" created!` });
      setWsName(""); setWsColor("#6366f1"); fetchWorkspaces();
    } catch (err) {
      setWsMsg({ type: "err", text: err.message });
    } finally { setWsLoading(false); }
  };

  // ── Toggle visibility (owner-only) ─────────────────────────────────────────
  const handleToggleWsVisibility = async (ws) => {
    const currentlyVisible = ws.visible !== false;
    try {
      const res = await fetch(`${apiBase}/api/workspace/${ws.id}/visibility`, {
        method: "PUT", headers: authH(),
        body: JSON.stringify({ visible: !currentlyVisible }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update visibility");
      setWsMsg({ type: "ok", text: currentlyVisible
        ? `"${ws.name}" is now hidden from the workspace picker.`
        : `"${ws.name}" is visible again in the workspace picker.` });
      fetchWorkspaces();
    } catch (err) {
      setWsMsg({ type: "err", text: err.message });
    }
  };

  // ── Delete workspace (owner-only; only when empty) ─────────────────────────
  const handleDeleteWs = async (ws) => {
    if (!window.confirm(`Delete workspace "${ws.name}"?\n\nThis only works if the workspace has no posts or scheduled jobs. If the workspace still has content, you'll be asked to move it first.`)) return;
    try {
      const res = await fetch(`${apiBase}/api/workspace/${ws.id}`, {
        method: "DELETE", headers: authH(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to delete workspace");
      setWsMsg({ type: "ok", text: `Workspace "${ws.name}" deleted.` });
      fetchWorkspaces();
    } catch (err) {
      setWsMsg({ type: "err", text: err.message });
    }
  };

  // ── Workspace members ─────────────────────────────────────────────────────
  const loadWsMembers = async (wsId) => {
    setWsMembersLoading((p) => ({ ...p, [wsId]: true }));
    try {
      const res = await fetch(`${apiBase}/api/workspace/${wsId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setWsMembers((p) => ({ ...p, [wsId]: [] })); return; }
      const data = await res.json().catch(() => []);
      setWsMembers((p) => ({ ...p, [wsId]: Array.isArray(data) ? data : [] }));
    } catch { setWsMembers((p) => ({ ...p, [wsId]: [] })); }
    finally { setWsMembersLoading((p) => ({ ...p, [wsId]: false })); }
  };

  const toggleWs = (wsId) => {
    if (expandedWsId === wsId) { setExpandedWsId(null); return; }
    setExpandedWsId(wsId);
    loadWsMembers(wsId);
  };

  const handleAddMemberToWs = async (wsId) => {
    if (!addMemberUserId) return;
    setAddMemberLoading(true);
    setAddMemberMsg((p) => ({ ...p, [wsId]: null }));
    try {
      const res = await fetch(`${apiBase}/api/workspace/${wsId}/members`, {
        method: "POST", headers: authH(),
        body: JSON.stringify({ userId: Number(addMemberUserId), permissions: addMemberPerms }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || "Failed to add member");
      setAddMemberMsg((p) => ({ ...p, [wsId]: { type: "ok", text: "Member added!" } }));
      setAddMemberUserId(""); setAddMemberWsId(null);
      setAddMemberPreset("STAFF"); setAddMemberPerms({ ...ALL_TRUE });
      loadWsMembers(wsId);
    } catch (err) {
      setAddMemberMsg((p) => ({ ...p, [wsId]: { type: "err", text: err.message } }));
    } finally { setAddMemberLoading(false); }
  };

  const handleRemoveFromWs = async (wsId, userId) => {
    if (!window.confirm("Remove this member from workspace?")) return;
    try {
      const res = await fetch(`${apiBase}/api/workspace/${wsId}/members/${userId}`, {
        method: "DELETE", headers: authH(),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Failed"); }
      loadWsMembers(wsId);
    } catch (err) { alert(err.message); }
  };

  // ── Permissions tab ───────────────────────────────────────────────────────
  const loadPermWsMembers = async (wsId) => {
    if (!wsId) return;
    setPermsLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/workspace/${wsId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setPermWsMembers([]); return; }
      const data = await res.json().catch(() => []);
      setPermWsMembers(Array.isArray(data) ? data : []);
      setSelectedMemberId(""); setPerms({});
    } catch { setPermWsMembers([]); }
    finally { setPermsLoading(false); }
  };

  const handleSelectWs = (wsId) => {
    setSelectedWsId(wsId);
    loadPermWsMembers(wsId);
    loadAvailablePerms(wsId);
  };

  // Fetch the list of permission keys the workspace owner's plan can grant.
  // Toggles outside this set are hidden so admins/owners can't grant features
  // their own plan doesn't include.
  const loadAvailablePerms = async (wsId) => {
    if (!wsId) { setAvailablePerms(null); return; }
    try {
      const res = await fetch(`${apiBase}/api/workspace/${wsId}/available-permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setAvailablePerms(null); return; }
      const data = await res.json().catch(() => null);
      const list = Array.isArray(data?.availablePermissions) ? data.availablePermissions : null;
      setAvailablePerms(list ? new Set(list) : null);
    } catch { setAvailablePerms(null); }
  };

  const handleSelectMember = (userId) => {
    setSelectedMemberId(userId);
    const m = permWsMembers.find((m) => String(m.userId) === String(userId));
    setPerms(m?.permissions ? { ...m.permissions } : { ...ALL_TRUE });
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
      setPermsMsg({ type: "ok", text: "Permissions saved ✓" });
      loadPermWsMembers(selectedWsId);
    } catch (err) {
      setPermsMsg({ type: "err", text: err.message });
    } finally { setPermsSaving(false); }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const members = activeOrg?.members || [];

  // Active + pending org members not the owner (eligible to add to workspace)
  // PENDING members with a userId (existing account) can be pre-assigned
  const activeMembers = members.filter(
    (m) => (m.status === "ACTIVE" || m.status === "PENDING") && m.role !== "OWNER" && m.userId
  );

  // Members NOT yet in a given workspace
  const membersNotInWs = (wsId) => {
    const inWs = new Set((wsMembers[wsId] || []).map((m) => String(m.userId)));
    return activeMembers.filter((m) => m.userId && !inWs.has(String(m.userId)));
  };

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

  const btnSmall = {
    padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
    background: "rgba(99,102,241,0.18)", color: "#a5b4fc", fontSize: 12, fontWeight: 600,
  };

  const btnDanger = {
    padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
    background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: 12, fontWeight: 600,
  };

  const btnGhost = {
    padding: "5px 12px", borderRadius: 6, border: "1px solid rgba(148,163,184,0.25)",
    cursor: "pointer", background: "transparent", color: "#cbd5e1", fontSize: 12, fontWeight: 600,
  };

  const msgBox = (m) => m ? (
    <div style={{
      marginTop: 8, padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500,
      background: m.type === "ok" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
      color: m.type === "ok" ? "#4ade80" : "#f87171",
      border: `1px solid ${m.type === "ok" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
    }}>{m.text}</div>
  ) : null;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px", fontFamily: "inherit" }}>
      <h2 style={{ color: "#e0e0e0", marginBottom: 4, fontSize: 22, fontWeight: 700 }}>
        🏢 Organization
      </h2>
      {activeOrg
        ? <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>{activeOrg.name}</p>
        : <p style={{ color: "#f59e0b", fontSize: 13, marginBottom: 20 }}>No organization yet — create one below</p>
      }

      {/* ── Create org banner (if no org) ── */}
      {!activeOrg && (
        <div style={{ ...card, border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.06)" }}>
          <h3 style={{ color: "#fbbf24", marginBottom: 12, fontSize: 15, fontWeight: 600 }}>
            Create Your Organization
          </h3>
          <p style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>
            You need a PRO or GROWTH plan to create an organization. Give it a name — a default "General" workspace will be created automatically.
          </p>
          <form onSubmit={handleCreateOrg} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="text" placeholder="e.g. My Agency" value={orgName} required
              onChange={(e) => setOrgName(e.target.value)}
              style={{ ...inputStyle, flex: "1 1 200px" }}
            />
            <button type="submit" disabled={orgLoading} style={{ ...btnPrimary, opacity: orgLoading ? 0.7 : 1 }}>
              {orgLoading ? "Creating…" : "Create Organization"}
            </button>
          </form>
          {msgBox(orgMsg)}
        </div>
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
          {activeOrg && canManageMembers && (
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <h3 style={{ color: "#e0e0e0", margin: 0, fontSize: 15, fontWeight: 600 }}>Invite Member</h3>
                {/* Import from Team button */}
                <button
                  onClick={fetchTeamMembers}
                  disabled={importLoading}
                  style={{ ...btnSmall, display: "flex", alignItems: "center", gap: 6, opacity: importLoading ? 0.7 : 1 }}
                >
                  {importLoading ? "Loading…" : "📥 Import from Team"}
                </button>
              </div>
              <p style={{ color: "#666", fontSize: 13, marginBottom: 12 }}>
                Send an invite email. They'll receive a link to join your organization.
              </p>

              {/* Import from Team panel */}
              {showImport && (
                <div style={{
                  marginBottom: 14, padding: "12px 14px", borderRadius: 10,
                  background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#a5b4fc", fontSize: 13, fontWeight: 600 }}>
                      Team members not yet in this org ({teamMembers.length})
                    </span>
                    <button onClick={() => setShowImport(false)}
                      style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 16 }}>✕</button>
                  </div>
                  {teamMembers.length === 0 ? (
                    <p style={{ color: "#666", fontSize: 13 }}>All team members are already invited to this org.</p>
                  ) : (
                    <>
                      {teamMembers.map((m) => (
                        <div key={m.id || m.email} style={{ color: "#ccc", fontSize: 13, padding: "3px 0" }}>
                          • {m.email} <span style={{ color: "#666" }}>({m.status})</span>
                        </div>
                      ))}
                      <button
                        onClick={handleImportAll}
                        disabled={importLoading}
                        style={{ ...btnPrimary, marginTop: 10, padding: "8px 16px", fontSize: 13 }}
                      >
                        {importLoading ? "Sending…" : `Send Invites to All ${teamMembers.length} →`}
                      </button>
                    </>
                  )}
                </div>
              )}
              {msgBox(importMsg)}

              <form onSubmit={handleInvite} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  type="email" placeholder="Email address" value={inviteEmail} required
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={{ ...inputStyle, flex: "1 1 200px" }}
                />
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                  style={{ ...inputStyle, width: "auto", flex: "0 0 130px" }}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <button type="submit" disabled={inviteLoading} style={{ ...btnPrimary, opacity: inviteLoading ? 0.7 : 1 }}>
                  {inviteLoading ? "Sending…" : "Send Invite"}
                </button>
              </form>
              {msgBox(inviteMsg)}
            </div>
          )}

          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ color: "#e0e0e0", margin: 0, fontSize: 15, fontWeight: 600 }}>
                Members ({members.length})
              </h3>
              <button
                onClick={() => { fetchOrg(); fetchWorkspaces(); }}
                style={{ ...btnSmall, fontSize: 12 }}
                title="Refresh to see newly accepted members"
              >
                🔄 Refresh
              </button>
            </div>
            {members.length === 0 && (
              <p style={{ color: "#666", fontSize: 14 }}>No members yet. Invite someone above.</p>
            )}
            {members.map((m) => {
              const isMe = user && m.userId && String(m.userId) === String(user.id);
              return (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: isMe ? "10px 8px" : "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  background: isMe ? "rgba(99,102,241,0.05)" : "transparent",
                  borderRadius: isMe ? 8 : 0,
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: isMe ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#a5b4fc", fontWeight: 700, fontSize: 14, flexShrink: 0,
                  }}>
                    {(m.firstName?.[0] || m.email?.[0] || "?").toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 500 }}>
                      {m.firstName || ""} {m.lastName || ""}
                      {(!m.firstName && !m.lastName) && <span style={{ color: "#888" }}>{m.email}</span>}
                      {isMe && <span style={{ color: "#a5b4fc", fontSize: 11, marginLeft: 6 }}>(you)</span>}
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
                  {/* Role badge or selector — OWNER only can change roles */}
                  {m.role === "OWNER" ? (
                    <span style={{ color: "#fbbf24", fontSize: 12, fontWeight: 700 }}>OWNER</span>
                  ) : isOrgOwner ? (
                    <select
                      value={m.role} onChange={(e) => handleRoleChange(m.id, e.target.value)}
                      style={{ ...inputStyle, width: "auto", padding: "4px 8px", fontSize: 12 }}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <span style={{
                      padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700,
                      background: "rgba(99,102,241,0.12)", color: "#a5b4fc",
                    }}>{m.role}</span>
                  )}
                  {/* Remove — OWNER only, can't remove owner */}
                  {isOrgOwner && m.role !== "OWNER" && (
                    <button onClick={() => handleRemoveMember(m.id)} style={btnDanger}>Remove</button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Read-only member view — show own workspaces */}
          {isReadOnly && activeOrg && (
            <div style={{ ...card, border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.04)" }}>
              <h3 style={{ color: "#a5b4fc", marginBottom: 8, fontSize: 15, fontWeight: 600 }}>
                📁 My Workspaces
              </h3>
              <p style={{ color: "#666", fontSize: 13, marginBottom: 12 }}>
                You are a <strong style={{ color: "#e0e0e0" }}>{myOrgRole}</strong> in <strong style={{ color: "#e0e0e0" }}>{activeOrg.name}</strong>.
                The workspaces below are assigned to you.
              </p>
              {userWorkspaces.length === 0 ? (
                <p style={{ color: "#555", fontSize: 13 }}>No workspaces assigned yet. Ask your admin.</p>
              ) : (
                userWorkspaces.map((ws) => (
                  <div key={ws.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: ws.color || "#6366f1", display: "inline-block" }} />
                    <span style={{ color: "#ddd", fontSize: 14 }}>{ws.name}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* ── WORKSPACES TAB ── */}
      {activeTab === "workspaces" && (
        <>
          {/* Create workspace form — visible to org owners */}
          {activeOrg && isOrgOwner && (
            <div style={card}>
              <h3 style={{ color: "#e0e0e0", marginBottom: 8, fontSize: 15, fontWeight: 600 }}>
                Create Workspace
              </h3>
              <p style={{ color: "#666", fontSize: 13, marginBottom: 12 }}>
                Workspaces let you separate clients or projects. Each member can be assigned to specific workspaces.
              </p>
              <form onSubmit={handleCreateWs} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <input
                  type="text" placeholder="Workspace name (e.g. Nike, Client A)" value={wsName} required
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
              {msgBox(wsMsg)}
            </div>
          )}

          {/* Workspace list */}
          <div style={card}>
            <h3 style={{ color: "#e0e0e0", marginBottom: 12, fontSize: 15, fontWeight: 600 }}>
              Workspaces ({userWorkspaces.length})
            </h3>
            {userWorkspaces.length === 0 && (
              <p style={{ color: "#666", fontSize: 14 }}>No workspaces yet. Create one above.</p>
            )}
            {userWorkspaces.map((ws) => {
              const isExpanded = expandedWsId === ws.id;
              const membersInWs = wsMembers[ws.id] || [];
              const available = membersNotInWs(ws.id);
              const isAddingHere = addMemberWsId === ws.id;

              return (
                <div key={ws.id} style={{ marginBottom: 8 }}>
                  {/* Workspace row */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                    background: "rgba(255,255,255,0.03)", borderRadius: 10,
                    border: `1px solid ${isExpanded ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.06)"}`,
                    cursor: "pointer",
                  }} onClick={() => toggleWs(ws.id)}>
                    <span style={{
                      width: 14, height: 14, borderRadius: "50%", background: ws.color || "#6366f1",
                      display: "inline-block", flexShrink: 0,
                      opacity: ws.visible === false ? 0.4 : 1,
                    }} />
                    <span style={{
                      color: ws.visible === false ? "#888" : "#e0e0e0",
                      fontSize: 14, fontWeight: 600, flex: 1,
                      fontStyle: ws.visible === false ? "italic" : "normal",
                    }}>
                      {ws.name}
                      {ws.visible === false && (
                        <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: "#94a3b8", background: "rgba(148,163,184,0.15)", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>hidden</span>
                      )}
                    </span>
                    {/* Owner-only: show/hide + delete controls */}
                    {isOrgOwner && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleWsVisibility(ws); }}
                          title={ws.visible === false ? "Show in picker" : "Hide from picker"}
                          style={btnGhost}
                        >
                          {ws.visible === false ? "👁 Show" : "👁‍🗨 Hide"}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteWs(ws); }}
                          title="Delete workspace (only if empty)"
                          style={btnDanger}
                        >
                          🗑 Delete
                        </button>
                      </>
                    )}
                    <span style={{ color: "#666", fontSize: 12 }}>
                      {wsMembersLoading[ws.id] ? "…" : isExpanded ? `${membersInWs.length} member${membersInWs.length !== 1 ? "s" : ""} ▲` : "Manage Members ▼"}
                    </span>
                  </div>

                  {/* Expanded member management panel */}
                  {isExpanded && (
                    <div style={{
                      margin: "4px 0 4px 24px", padding: "14px 16px",
                      background: "rgba(99,102,241,0.05)", borderRadius: "0 0 10px 10px",
                      border: "1px solid rgba(99,102,241,0.15)", borderTop: "none",
                    }}>
                      <p style={{ color: "#888", fontSize: 12, marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Workspace Members
                      </p>

                      {wsMembersLoading[ws.id] && <p style={{ color: "#666", fontSize: 13 }}>Loading…</p>}

                      {!wsMembersLoading[ws.id] && membersInWs.length === 0 && (
                        <p style={{ color: "#555", fontSize: 13, marginBottom: 10 }}>No members in this workspace yet.</p>
                      )}

                      {membersInWs.map((m) => (
                        <div key={m.userId} style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%", background: "rgba(99,102,241,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#a5b4fc", fontWeight: 700, fontSize: 12, flexShrink: 0,
                          }}>
                            {(m.firstName?.[0] || m.email?.[0] || "?").toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: "#ddd", fontSize: 13, fontWeight: 500 }}>
                              {m.firstName || ""} {m.lastName || ""}
                              {(!m.firstName && !m.lastName) && m.email}
                            </div>
                            {(m.firstName || m.lastName) && <div style={{ color: "#555", fontSize: 11 }}>{m.email}</div>}
                          </div>
                          {/* Org role badge */}
                          {m.orgRole && <span style={ROLE_BADGE_STYLE(m.orgRole)}>{m.orgRole}</span>}
                          {/* Remove — OWNER only */}
                          {isOrgOwner && (
                            <button onClick={() => handleRemoveFromWs(ws.id, m.userId)} style={btnDanger}>
                              Remove
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Add member to workspace — OWNER or ADMIN can add */}
                      {(isOrgOwner || myOrgRole === "ADMIN") && (
                        <div style={{ marginTop: 12 }}>
                          {/* No invitable members at all */}
                          {members.filter((m) => m.role !== "OWNER").length === 0 && (
                            <div style={{
                              padding: "10px 14px", borderRadius: 8, fontSize: 13,
                              background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
                              color: "#fbbf24",
                            }}>
                              ⚠️ No members in your organization yet. Go to the{" "}
                              <button onClick={() => setActiveTab("members")}
                                style={{ background: "none", border: "none", color: "#a5b4fc", cursor: "pointer", fontWeight: 700, fontSize: 13, padding: 0 }}>
                                Members tab
                              </button>{" "}
                              to invite people first.
                            </div>
                          )}

                          {/* Has org members but none with accounts yet */}
                          {members.filter((m) => m.role !== "OWNER").length > 0 && activeMembers.length === 0 && (
                            <div style={{
                              padding: "10px 14px", borderRadius: 8, fontSize: 13,
                              background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
                              color: "#fbbf24",
                            }}>
                              ⏳ Invited members haven't accepted yet or don't have a W!ntAi account. They'll appear here once they sign up.
                            </div>
                          )}

                          {/* Has addable members */}
                          {activeMembers.length > 0 && !isAddingHere && available.length > 0 && (
                            <button
                              onClick={() => { setAddMemberWsId(ws.id); setAddMemberUserId(""); setAddMemberPreset("STAFF"); setAddMemberPerms({ ...ALL_TRUE }); }}
                              style={btnSmall}
                            >
                              + Add Member
                            </button>
                          )}

                          {/* All org members already in workspace */}
                          {activeMembers.length > 0 && !isAddingHere && available.length === 0 && (
                            <div style={{
                              padding: "9px 13px", borderRadius: 8, fontSize: 13,
                              background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)",
                              color: "#4ade80",
                            }}>
                              ✓ All organization members are already in this workspace. To add someone new, invite them from the{" "}
                              <button onClick={() => setActiveTab("members")}
                                style={{ background: "none", border: "none", color: "#a5b4fc", cursor: "pointer", fontWeight: 700, fontSize: 13, padding: 0 }}>
                                Members tab
                              </button>{" "}first.
                            </div>
                          )}

                          {isAddingHere && (
                            <div>
                              {available.length === 0 ? (
                                /* All org members already added — clear message instead of empty dropdown */
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <p style={{ color: "#4ade80", fontSize: 13, margin: 0 }}>
                                    ✓ All org members are already in this workspace.
                                  </p>
                                  <button
                                    onClick={() => { setAddMemberWsId(null); }}
                                    style={{ ...btnSmall, background: "rgba(255,255,255,0.06)", color: "#888" }}
                                  >
                                    Close
                                  </button>
                                </div>
                              ) : (
                                /* Dropdown + preset pills */
                                <div>
                                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
                                    <select
                                      value={addMemberUserId}
                                      onChange={(e) => {
                                        const uid = e.target.value;
                                        setAddMemberUserId(uid);
                                        const sel = available.find((m) => String(m.userId || m.id) === uid);
                                        const preset = sel?.role === "CLIENT" ? "CLIENT" : "STAFF";
                                        setAddMemberPreset(preset);
                                        setAddMemberPerms(preset === "CLIENT" ? { ...CLIENT_DEFAULTS } : { ...ALL_TRUE });
                                      }}
                                      style={{ ...inputStyle, flex: "1 1 180px", fontSize: 13 }}
                                    >
                                      <option value="">-- Select org member --</option>
                                      {available.map((m) => (
                                        <option key={m.userId || m.id} value={m.userId || m.id}>
                                          {m.firstName || m.email} {m.lastName || ""}
                                          {m.status === "PENDING" ? " (pending)" : ""} — {m.role}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => handleAddMemberToWs(ws.id)}
                                      disabled={!addMemberUserId || addMemberLoading}
                                      style={{ ...btnPrimary, padding: "8px 14px", fontSize: 13, opacity: (!addMemberUserId || addMemberLoading) ? 0.6 : 1 }}
                                    >
                                      {addMemberLoading ? "Adding…" : "Add"}
                                    </button>
                                    <button
                                      onClick={() => { setAddMemberWsId(null); setAddMemberPreset("STAFF"); setAddMemberPerms({ ...ALL_TRUE }); }}
                                      style={{ ...btnDanger, background: "rgba(255,255,255,0.06)", color: "#888" }}
                                    >
                                      Cancel
                                    </button>
                                  </div>

                                  {/* Preset pills + permission summary */}
                                  {addMemberUserId && (
                                    <div style={{ marginBottom: 8 }}>
                                      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                                        {[{ id: "STAFF", label: "Staff (Full)" }, { id: "CLIENT", label: "Client (View)" }, { id: "CUSTOM", label: "Custom" }].map(({ id, label }) => (
                                          <button key={id} onClick={() => {
                                            setAddMemberPreset(id);
                                            if (id === "STAFF") setAddMemberPerms({ ...ALL_TRUE });
                                            else if (id === "CLIENT") setAddMemberPerms({ ...CLIENT_DEFAULTS });
                                          }} style={{
                                            padding: "4px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                                            background: addMemberPreset === id ? (id === "CLIENT" ? "rgba(251,146,60,0.25)" : "rgba(99,102,241,0.3)") : "rgba(255,255,255,0.06)",
                                            color: addMemberPreset === id ? (id === "CLIENT" ? "#fb923c" : "#a5b4fc") : "#888",
                                          }}>{label}</button>
                                        ))}
                                      </div>
                                      {addMemberPreset === "STAFF" && (
                                        <p style={{ color: "#4ade80", fontSize: 12, margin: "0 0 4px" }}>✓ All 10 features enabled</p>
                                      )}
                                      {addMemberPreset === "CLIENT" && (
                                        <p style={{ color: "#f59e0b", fontSize: 12, margin: "0 0 4px" }}>⚠ 2 features restricted: Video Publisher, Publish Directly</p>
                                      )}
                                      {addMemberPreset === "CUSTOM" && (
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 6 }}>
                                          {PERMISSION_KEYS.map(({ key, label }) => (
                                            <label key={key} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12 }}>
                                              <input type="checkbox" checked={!!addMemberPerms[key]}
                                                onChange={(e) => setAddMemberPerms((p) => ({ ...p, [key]: e.target.checked }))}
                                                style={{ accentColor: "#6366f1" }} />
                                              <span style={{ color: "#ccc" }}>{label}</span>
                                            </label>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {msgBox(addMemberMsg[ws.id])}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── PERMISSIONS TAB ── */}
      {activeTab === "permissions" && (
        <div style={card}>
          <h3 style={{ color: "#e0e0e0", marginBottom: 6, fontSize: 15, fontWeight: 600 }}>
            Set Member Permissions per Workspace
          </h3>
          <p style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>
            Choose a workspace, then a member, and toggle which features they can access.
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
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

            <select
              value={selectedMemberId}
              onChange={(e) => handleSelectMember(e.target.value)}
              disabled={!selectedWsId || permsLoading}
              style={{ ...inputStyle, flex: "1 1 160px", opacity: !selectedWsId ? 0.5 : 1 }}
            >
              <option value="">-- Select member --</option>
              {permWsMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.firstName || m.email} {m.lastName || ""}
                </option>
              ))}
            </select>
          </div>

          {permsLoading && <p style={{ color: "#888", fontSize: 13 }}>Loading members…</p>}

          {!selectedWsId && (
            <p style={{ color: "#555", fontSize: 13 }}>Select a workspace to start.</p>
          )}

          {selectedWsId && !permsLoading && permWsMembers.length === 0 && (
            <p style={{ color: "#666", fontSize: 13 }}>
              No members in this workspace yet. Go to the <strong style={{ color: "#a5b4fc" }}>Workspaces</strong> tab to add members first.
            </p>
          )}

          {selectedMemberId && (
            <>
              <div style={{ marginBottom: 8 }}>
                <button onClick={() => {
                  const next = {};
                  PERMISSION_KEYS.forEach(({ key }) => {
                    next[key] = !availablePerms || availablePerms.has(key);
                  });
                  setPerms(next);
                }} style={{ ...btnSmall, marginRight: 8 }}>Enable All</button>
                <button onClick={() => setPerms(Object.fromEntries(PERMISSION_KEYS.map(({ key }) => [key, false])))}
                  style={{ ...btnSmall, background: "rgba(239,68,68,0.15)", color: "#f87171" }}>Disable All</button>
              </div>

              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 16,
              }}>
                {PERMISSION_KEYS
                  .filter(({ key }) => !availablePerms || availablePerms.has(key))
                  .map(({ key, label }) => (
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
              {msgBox(permsMsg)}
            </>
          )}
        </div>
      )}
    </div>
  );
}
