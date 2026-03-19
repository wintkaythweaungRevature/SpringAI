import AskAIGate from '@/components/AskAIGate';
import RecipeGenerator from '@/components/RecipeGenerator';

export default function RecipeGeneratorPage() {
  return (
    <AskAIGate featureName="Recipe Generator">
      <RecipeGenerator />
    </AskAIGate>
  );
}
