import MemberGate from '@/components/MemberGate';
import SocialConnect from '@/components/SocialConnect';

export default function SocialConnectPage() {
  return (
    <MemberGate featureName="Connected Accounts">
      <SocialConnect />
    </MemberGate>
  );
}
