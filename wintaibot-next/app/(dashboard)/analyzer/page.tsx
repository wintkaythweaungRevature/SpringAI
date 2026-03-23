import MemberGate from '@/components/MemberGate';
import PdfAnalyzer from '@/components/Analyzer';

export default function AnalyzerPage() {
  return (
    <MemberGate featureName="DocuWizard">
      <PdfAnalyzer />
    </MemberGate>
  );
}
