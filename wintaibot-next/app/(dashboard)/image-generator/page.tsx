import MemberGate from '@/components/MemberGate';
import ImageGenerator from '@/components/ImageGenerator';

export default function ImageGeneratorPage() {
  return (
    <MemberGate featureName="Image Generator">
      <ImageGenerator />
    </MemberGate>
  );
}
