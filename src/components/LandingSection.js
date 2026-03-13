import React from "react";
import "./LandingSection.css";

const features = [
  {
    icon: "🤖",
    title: "AI Chatbot – Ask Anything",
    description:
      "Chat with a powerful AI assistant powered by Spring AI. Get instant answers, explanations, code help, and advice on any topic — available 24/7 with no downloads required.",
    keywords: "AI chatbot, ask AI questions, AI assistant online",
  },
  {
    icon: "📄",
    title: "DocuWizard – PDF & Document Data Extraction",
    description:
      "Upload PDF, Excel, or Word files and extract structured data instantly. Convert PDF tables to Excel, summarize documents, and analyze financial reports with AI accuracy.",
    keywords: "PDF data extraction, PDF to Excel, document analyzer AI",
  },
  {
    icon: "🎤",
    title: "EchoScribe – Voice Transcription",
    description:
      "Convert speech to text with high accuracy using AI transcription. Upload audio files or record live — EchoScribe transcribes meetings, lectures, and interviews in seconds.",
    keywords: "voice to text AI, speech transcription, audio transcription online",
  },
  {
    icon: "🖼️",
    title: "AI Image Generator",
    description:
      "Generate stunning images from text prompts using AI. Create digital art, product mockups, social media visuals, and more — no design skills needed.",
    keywords: "AI image generator, text to image AI, generate art with AI",
  },
  {
    icon: "✉️",
    title: "Reply Enchanter – AI Email Writer",
    description:
      "Paste any email and get a professional AI-drafted reply in seconds. Choose your tone — professional, friendly, casual, or urgent — and never struggle with email responses again.",
    keywords: "AI email reply generator, email writing AI, professional email writer",
  },
  {
    icon: "📝",
    title: "Resume Warlock – Interview Preparation AI",
    description:
      "Upload your resume and get AI-powered interview questions tailored to your experience. Practice answering, improve weak areas, and walk into your next interview fully prepared.",
    keywords: "interview preparation AI, resume AI tool, job interview practice",
  },
  {
    icon: "🍳",
    title: "Recipe Generator – AI Meal Planner",
    description:
      "Enter ingredients you have and let AI suggest delicious recipes with step-by-step instructions. Perfect for meal planning, reducing food waste, and discovering new dishes.",
    keywords: "AI recipe generator, meal planner AI, cook with what you have",
  },
];

function LandingSection({ onGetStarted }) {
  return (
    <section className="landing-section" aria-label="Wintaibot AI Platform Overview">
      {/* Hero */}
      <div className="landing-hero">
        <h2 className="landing-headline">
          All-in-One AI Platform for Productivity &amp; Automation
        </h2>
        <p className="landing-subheadline">
          Wintaibot gives you 7 powerful AI tools in one place — chatbot, PDF
          extraction, voice transcription, image generation, email writing,
          interview prep, and recipe planning. No installs. Start free today.
        </p>
        <button className="landing-cta" onClick={onGetStarted}>
          Try Wintaibot Free →
        </button>
      </div>

      {/* Feature Cards */}
      <div className="landing-features" role="list">
        {features.map((f) => (
          <article className="feature-card" key={f.title} role="listitem">
            <div className="feature-icon" aria-hidden="true">{f.icon}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.description}</p>
          </article>
        ))}
      </div>

      {/* Why Wintaibot */}
      <div className="landing-why">
        <h2>Why Use Wintaibot?</h2>
        <ul>
          <li>
            <strong>Save hours every week</strong> — automate repetitive tasks
            like email replies, document extraction, and transcription with AI.
          </li>
          <li>
            <strong>No technical skills required</strong> — every tool is
            designed to be simple and intuitive for anyone to use.
          </li>
          <li>
            <strong>All tools in one dashboard</strong> — no need to juggle
            multiple subscriptions or apps.
          </li>
          <li>
            <strong>Built on Spring AI</strong> — enterprise-grade AI backend
            for fast, reliable, and accurate results.
          </li>
          <li>
            <strong>Free to start</strong> — core features available without a
            credit card.
          </li>
        </ul>
      </div>

      {/* Use Cases */}
      <div className="landing-usecases">
        <h2>Who Is Wintaibot For?</h2>
        <div className="usecase-grid">
          <div className="usecase-item">
            <h3>Job Seekers</h3>
            <p>
              Prepare for interviews with AI-generated questions based on your
              resume. Land your dream job faster with targeted practice.
            </p>
          </div>
          <div className="usecase-item">
            <h3>Business Professionals</h3>
            <p>
              Extract data from invoices and reports, draft professional emails,
              and transcribe meeting recordings — all in one platform.
            </p>
          </div>
          <div className="usecase-item">
            <h3>Students &amp; Researchers</h3>
            <p>
              Summarize academic papers, transcribe lectures, ask the AI tutor
              questions, and generate study flashcards instantly.
            </p>
          </div>
          <div className="usecase-item">
            <h3>Content Creators</h3>
            <p>
              Generate AI images for thumbnails, transcribe video content, and
              get creative ideas from the AI chatbot to power your workflow.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingSection;
