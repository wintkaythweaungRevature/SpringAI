import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * WorkspaceSwitcher
 * Compact dropdown in the sidebar that shows the active workspace and lets the
 * user switch between workspaces in their organisation.
 * Only renders when the user belongs to an organisation with ≥1 workspace.
 */
export default function WorkspaceSwitcher() {
  const { activeOrg, userWorkspaces, activeWorkspace, switchWorkspace } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Only show when the user is part of an org and there are workspaces
  if (!activeOrg || !userWorkspaces || userWorkspaces.length === 0) return null;

  const handleSelect = (wsId) => {
    switchWorkspace(wsId);
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        margin: "0 0 8px 0",
        userSelect: "none",
      }}
    >
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          background: "rgba(99,102,241,0.12)",
          border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: 8,
          padding: "7px 10px",
          cursor: "pointer",
          color: "#e0e0e0",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {/* Colour dot */}
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: activeWorkspace?.color || "#6366f1",
            flexShrink: 0,
          }}
        />
        <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {activeWorkspace?.name || "Select workspace"}
        </span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#1e1e2e",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 8,
            overflow: "hidden",
            zIndex: 1000,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          {/* Org name header */}
          <div
            style={{
              padding: "6px 12px",
              fontSize: 10,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#888",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {activeOrg.name}
          </div>

          {/* Workspace list */}
          {userWorkspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => handleSelect(ws.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                background: ws.id === activeWorkspace?.id ? "rgba(99,102,241,0.18)" : "transparent",
                border: "none",
                padding: "9px 12px",
                cursor: "pointer",
                color: "#e0e0e0",
                fontSize: 13,
                textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (ws.id !== activeWorkspace?.id) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { if (ws.id !== activeWorkspace?.id) e.currentTarget.style.background = "transparent"; }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: ws.color || "#6366f1",
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {ws.name}
              </span>
              {ws.id === activeWorkspace?.id && (
                <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 700 }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
