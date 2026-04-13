import React from "react";
import { useWorkspacePermission } from "../context/AuthContext";

/**
 * WorkspaceGate
 * Renders children only if the current user has the given workspace permission.
 * Solo users (no org) always pass through.
 * If blocked, shows a friendly "not available in this workspace" message.
 *
 * Usage:
 *   <WorkspaceGate permKey="contentCalendar">
 *     <ContentCalendar />
 *   </WorkspaceGate>
 */
export default function WorkspaceGate({ permKey, children }) {
  const allowed = useWorkspacePermission(permKey);

  if (!allowed) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 360,
          padding: 40,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h3
          style={{
            color: "#e0e0e0",
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Not enabled in this workspace
        </h3>
        <p style={{ color: "#888", fontSize: 14, maxWidth: 360 }}>
          This feature hasn't been enabled for you in the current workspace.
          Contact your organisation admin to request access.
        </p>
      </div>
    );
  }

  return children;
}
