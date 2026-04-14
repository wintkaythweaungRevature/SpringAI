import React from "react";
import { useWorkspacePermission, useAuth } from "../context/AuthContext";

/**
 * WorkspaceGate
 * Renders children only if the current user has the given workspace permission.
 * Solo users (no org) always pass through.
 *
 * CLIENT blocked → friendly "your agency handles this" message.
 * Others blocked → generic "not enabled in this workspace" message.
 *
 * Usage:
 *   <WorkspaceGate permKey="contentCalendar">
 *     <ContentCalendar />
 *   </WorkspaceGate>
 */
export default function WorkspaceGate({ permKey, children }) {
  const allowed = useWorkspacePermission(permKey);
  const { myOrgRole } = useAuth();

  if (!allowed) {
    const isClient = myOrgRole === "CLIENT";
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
        <div style={{ fontSize: 48, marginBottom: 16 }}>{isClient ? "🤝" : "🔒"}</div>
        <h3
          style={{
            color: "#e0e0e0",
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          {isClient ? "Your agency handles this for you" : "Not enabled in this workspace"}
        </h3>
        <p style={{ color: "#888", fontSize: 14, maxWidth: 360 }}>
          {isClient
            ? "This feature is managed by your agency on your behalf. Reach out to them if you have questions."
            : "This feature hasn't been enabled for you in the current workspace. Contact your organisation admin to request access."}
        </p>
      </div>
    );
  }

  return children;
}
