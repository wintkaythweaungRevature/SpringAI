import MemberGate from '@/components/MemberGate';
import Content from '@/components/Content';

export default function ContentPage() {
  return (
    <MemberGate featureName="Reply Enchanter">
      <Content />
    </MemberGate>
  );
}
