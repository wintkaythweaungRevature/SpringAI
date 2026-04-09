'use client';

import { AuthProvider } from '@/context/AuthContext';
import SocialOAuthPopupHandler from '@/components/SocialOAuthPopupHandler';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SocialOAuthPopupHandler />
      {children}
    </AuthProvider>
  );
}
