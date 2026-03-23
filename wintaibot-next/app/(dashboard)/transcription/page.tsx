import MemberGate from '@/components/MemberGate';
import Transcription from '@/components/Transcription';

export default function TranscriptionPage() {
  return (
    <MemberGate featureName="EchoScribe">
      <Transcription />
    </MemberGate>
  );
}
