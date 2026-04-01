import MemberGate from '@/components/MemberGate';
import Resume from '@/components/Resume';

export default function ResumePage() {
  return (
    <MemberGate featureName="Career Alchemist">
      <Resume />
    </MemberGate>
  );
}
