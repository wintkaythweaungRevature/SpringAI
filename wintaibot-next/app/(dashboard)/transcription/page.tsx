import MemberGate from '@/components/MemberGate';
import Transcription from '@/components/Transcription';
import ProGate from '@/components/ProGate.js';

export default function TranscriptionPage() {
  return (
    <MemberGate featureName="EchoScribe">
      <ProGate featureName="EchoScribe">
        <Transcription />
      </ProGate>
    </MemberGate>
  );
}
