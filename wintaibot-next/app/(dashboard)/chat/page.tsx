import type { Metadata } from 'next';
import AskAIGate from '@/components/AskAIGate';
import ChatComponent from '@/components/ChatComponent';

export const metadata: Metadata = {
  title: 'Ask AI',
  description:
    'Chat with a powerful AI assistant 24/7. Get answers, explanations, code help, writing assistance, and advice on any topic.',
  openGraph: {
    title: 'Ask AI – Instant Answers | W!ntAi',
    description: 'Chat with AI 24/7. Get answers, code help, writing assistance, and more. Free to use.',
  },
};

export default function ChatPage() {
  return (
    <AskAIGate featureName="Ask AI">
      <ChatComponent />
    </AskAIGate>
  );
}
