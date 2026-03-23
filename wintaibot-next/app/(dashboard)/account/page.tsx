import AskAIGate from '@/components/AskAIGate';
import AccountSettings from '@/components/AccountSettings';

export default function AccountPage() {
  return (
    <AskAIGate featureName="Account">
      <AccountSettings />
    </AskAIGate>
  );
}
