import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UpgradeWall } from './ProGate';

/**
 * Blocks FREE, STARTER, and PRO users from Growth-only features.
 * Must be nested inside MemberGate.
 * Shows Growth plan upgrade card for Pro users.
 */
export default function GrowthGate({ featureName = 'this feature', children }) {
  const { user, apiBase, authHeaders } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetch(`${apiBase}/api/subscription/current`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setPlan(d?.plan?.toUpperCase()))
      .catch(() => setPlan(null))
      .finally(() => setLoading(false));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: 14 }}>
      Loading...
    </div>
  );

  // Only GROWTH passes through
  if (plan === 'GROWTH') return children;

  // Everyone else sees the upgrade wall
  return <UpgradeWall featureName={featureName} currentPlan={plan || 'STARTER'} />;
}
