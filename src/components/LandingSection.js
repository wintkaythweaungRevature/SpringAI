import React, { useState } from "react";
import "./LandingSection.css";

/* ─── Data ─────────────────────────────────────────────────── */

const features = [
  {
    icon: "🤖",
    title: "Ask AI – Instant Answers",
    description:
      "Chat with a powerful AI assistant 24/7. Get answers, explanations, code help, writing assistance, and advice on any topic — no downloads, no setup.",
    badge: "Free",
  },
  {
    icon: "🍳",
    title: "Recipe Generator",
    description:
      "Type the ingredients you have and get step-by-step recipes instantly. Reduce food waste, discover new dishes, and plan meals effortlessly.",
    badge: "Free",
  },
  {
    icon: "📄",
    title: "DocuWizard – PDF & Document AI",
    description:
      "Upload PDF, Excel, or Word files and extract structured data in seconds. Summarize reports, convert PDF tables to Excel, and analyze invoices with AI.",
    badge: "Member",
  },
  {
    icon: "🎤",
    title: "EchoScribe – Voice Transcription",
    description:
      "Convert audio recordings and live speech to accurate text. Transcribe meetings, lectures, and interviews — then summarize or translate the output.",
    badge: "Member",
  },
  {
    icon: "🖼️",
    title: "AI Image Generator",
    description:
      "Turn text prompts into stunning images in seconds. Create digital art, product mockups, social media graphics, and illustrations — no design skills needed.",
    badge: "Member",
  },
  {
    icon: "✉️",
    title: "Reply Enchanter – AI Email Writer",
    description:
      "Paste any email and get a polished AI-drafted reply instantly. Choose your tone — professional, friendly, casual, or urgent — and send with confidence.",
    badge: "Member",
  },
  {
    icon: "📝",
    title: "Resume Warlock – Interview Prep AI",
    description:
      "Upload your resume and receive AI-generated interview questions tailored to your experience. Practice answers, sharpen weak areas, and land your next role.",
    badge: "Member",
  },
];

const steps = [
  {
    num: "1",
    title: "Choose a Tool",
    desc: "Select from 7 AI-powered tools — chatbot, document analyzer, transcription, image generator, email writer, interview prep, or recipe planner.",
  },
  {
    num: "2",
    title: "Paste, Upload, or Type",
    desc: "Input your text, upload a document, record audio, or describe what you need. Wintaibot accepts multiple input formats.",
  },
  {
    num: "3",
    title: "Get Instant AI Results",
    desc: "Receive accurate, high-quality output in seconds. Copy, download, or use the result directly in your workflow.",
  },
];

const testimonials = [
  {
    name: "Sarah K.",
    role: "HR Manager",
    quote:
      "Resume Warlock helped me prep candidates before interviews. The AI-generated questions were spot-on for each resume. We cut interview prep time by half.",
  },
  {
    name: "James T.",
    role: "Freelance Developer",
    quote:
      "I use Ask AI and Reply Enchanter every day. It's like having an assistant who never sleeps. The email drafts are professional and save me 30 minutes daily.",
  },
  {
    name: "Mei L.",
    role: "Graduate Student",
    quote:
      "EchoScribe transcribes my lectures perfectly. I paste the transcript into Ask AI to get summaries and study notes. It's transformed how I study.",
  },
];

const techStack = [
  { label: "Spring AI", url: "https://spring.io/projects/spring-ai" },
  { label: "React 19", url: "https://react.dev" },
  { label: "Java 21", url: "https://openjdk.org" },
  { label: "Stripe Payments", url: "https://stripe.com" },
  { label: "Docker", url: "https://docker.com" },
  { label: "AWS EC2", url: "https://aws.amazon.com/ec2/" },
];

/* ─── Component ─────────────────────────────────────────────── */

export default function LandingSection({ onGetStarted }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <main className="ls-root" aria-label="Wintaibot – AI Platform">

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="ls-hero" aria-labelledby="hero-heading">
        <div className="ls-hero-badge">AI Assistant for PDFs, Documents &amp; Productivity</div>
        <h1 id="hero-heading" className="ls-hero-h1">
          Analyze PDFs, Transcribe Audio,<br />and Automate Your Work with AI
        </h1>
        <p className="ls-hero-sub">
          Wintaibot is an AI assistant that extracts data from PDFs and documents,
          transcribes audio, generates images, writes email replies, prepares you
          for job interviews, and answers any question — all in one platform,
          no installs required.
        </p>
        <div className="ls-hero-actions">
          <button className="ls-btn-primary" onClick={onGetStarted}>
            Try Free — No Credit Card
          </button>
          <a className="ls-btn-ghost" href="#features">See All Features →</a>
        </div>
        <p className="ls-hero-note">
          Free tier includes <strong>Ask AI</strong> and <strong>Recipe Generator</strong>.
          Full access from <strong>$5.99/month</strong>.
        </p>
      </section>

      {/* ── WHAT IS WINTAIBOT ───────────────────────────────── */}
      <section className="ls-section ls-what" aria-labelledby="what-heading">
        <h2 id="what-heading">What Is Wintaibot?</h2>
        <p>
          Wintaibot is an AI productivity platform built on{" "}
          <strong>Spring AI</strong> and <strong>React</strong>. It combines
          seven specialized AI tools into a single, easy-to-use dashboard — so
          you stop juggling multiple apps and subscriptions.
        </p>
        <p>
          Whether you are a <strong>job seeker</strong> preparing for interviews,
          a <strong>professional</strong> drowning in emails and documents, a{" "}
          <strong>student</strong> who needs lecture transcriptions, or a{" "}
          <strong>creator</strong> generating visuals — Wintaibot has a dedicated
          tool built for your workflow.
        </p>
        <div className="ls-stat-row">
          <div className="ls-stat"><span className="ls-stat-num">7</span><span>AI Tools</span></div>
          <div className="ls-stat"><span className="ls-stat-num">Free</span><span>To Start</span></div>
          <div className="ls-stat"><span className="ls-stat-num">$5.99</span><span>Full Access / mo</span></div>
          <div className="ls-stat"><span className="ls-stat-num">0</span><span>Installs Required</span></div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section className="ls-section" id="features" aria-labelledby="features-heading">
        <h2 id="features-heading">Everything You Need, Built In</h2>
        <p className="ls-section-sub">
          No more switching between ChatGPT, Whisper, DALL·E, and five other tools.
          Wintaibot puts them all in one place.
        </p>
        <div className="ls-features-grid" role="list">
          {features.map((f) => (
            <article className="ls-feature-card" key={f.title} role="listitem">
              <div className="ls-feature-top">
                <span className="ls-feature-icon" aria-hidden="true">{f.icon}</span>
                <span className={`ls-badge ls-badge--${f.badge.toLowerCase()}`}>{f.badge}</span>
              </div>
              <h3 className="ls-feature-title">{f.title}</h3>
              <p className="ls-feature-desc">{f.description}</p>
            </article>
          ))}
        </div>
        <p className="ls-features-note">
          <strong>Free</strong> tools are available immediately after signup.{" "}
          <strong>Member</strong> tools unlock with a $5.99/month subscription.
        </p>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className="ls-section ls-how" id="how-it-works" aria-labelledby="how-heading">
        <h2 id="how-heading">How It Works</h2>
        <p className="ls-section-sub">Start getting results in under 30 seconds.</p>
        <div className="ls-steps">
          {steps.map((s) => (
            <div className="ls-step" key={s.num}>
              <div className="ls-step-num" aria-hidden="true">{s.num}</div>
              <h3 className="ls-step-title">{s.title}</h3>
              <p className="ls-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── USE CASES ───────────────────────────────────────── */}
      <section className="ls-section" id="use-cases" aria-labelledby="usecases-heading">
        <h2 id="usecases-heading">Who Uses Wintaibot?</h2>
        <div className="ls-usecase-grid">
          <div className="ls-usecase">
            <h3>Job Seekers</h3>
            <p>
              Upload your resume to <strong>Resume Warlock</strong> and receive
              AI-tailored interview questions. Practice answers, identify gaps in your
              experience, and walk into every interview prepared and confident.
            </p>
          </div>
          <div className="ls-usecase">
            <h3>Business Professionals</h3>
            <p>
              Extract key data from invoices and reports with <strong>DocuWizard</strong>,
              draft polished email responses in seconds with <strong>Reply Enchanter</strong>,
              and transcribe client calls with <strong>EchoScribe</strong>.
            </p>
          </div>
          <div className="ls-usecase">
            <h3>Students &amp; Researchers</h3>
            <p>
              Transcribe lectures and podcasts with <strong>EchoScribe</strong>, then
              paste the text into <strong>Ask AI</strong> for instant summaries, study notes,
              and explanations of complex topics.
            </p>
          </div>
          <div className="ls-usecase">
            <h3>Content Creators</h3>
            <p>
              Generate custom thumbnails and artwork with the <strong>AI Image Generator</strong>,
              transcribe video scripts, and use <strong>Ask AI</strong> for content ideas,
              captions, and SEO copy.
            </p>
          </div>
          <div className="ls-usecase">
            <h3>Home Cooks</h3>
            <p>
              Open your fridge, list what you have, and let the <strong>Recipe Generator</strong>
              suggest delicious meals with full instructions. Reduce food waste and
              discover new cuisines every week.
            </p>
          </div>
          <div className="ls-usecase">
            <h3>Teams &amp; Small Businesses</h3>
            <p>
              Speed up document processing, automate repetitive email replies, and give
              every team member access to AI tools without expensive per-seat pricing.
            </p>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <section className="ls-section ls-pricing" id="pricing" aria-labelledby="pricing-heading">
        <h2 id="pricing-heading">Simple, Transparent Pricing</h2>
        <p className="ls-section-sub">Start free. Upgrade when you need more.</p>
        <div className="ls-plans">

          <div className="ls-plan">
            <div className="ls-plan-name">Free</div>
            <div className="ls-plan-price">$0 <span>/ forever</span></div>
            <ul className="ls-plan-features">
              <li>Ask AI chatbot (unlimited)</li>
              <li>Recipe Generator (unlimited)</li>
              <li>No credit card required</li>
              <li>—</li>
              <li>—</li>
              <li>—</li>
              <li>—</li>
            </ul>
            <button className="ls-btn-outline" onClick={onGetStarted}>Get Started Free</button>
          </div>

          <div className="ls-plan ls-plan--featured">
            <div className="ls-plan-popular">Most Popular</div>
            <div className="ls-plan-name">Member</div>
            <div className="ls-plan-price">$5.99 <span>/ month</span></div>
            <ul className="ls-plan-features">
              <li>Everything in Free</li>
              <li>DocuWizard (PDF &amp; Doc AI)</li>
              <li>EchoScribe (Voice Transcription)</li>
              <li>AI Image Generator</li>
              <li>Reply Enchanter (Email AI)</li>
              <li>Resume Warlock (Interview Prep)</li>
              <li>Cancel anytime</li>
            </ul>
            <button className="ls-btn-primary" onClick={onGetStarted}>Start Free Trial</button>
          </div>

        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section className="ls-section ls-testimonials" id="testimonials" aria-labelledby="testimonials-heading">
        <h2 id="testimonials-heading">What Users Are Saying</h2>
        <div className="ls-testimonial-grid">
          {testimonials.map((t) => (
            <blockquote className="ls-testimonial" key={t.name}>
              <p className="ls-testimonial-quote">"{t.quote}"</p>
              <footer className="ls-testimonial-author">
                <strong>{t.name}</strong> · {t.role}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* ── AUTHORITY / TECH STACK ──────────────────────────── */}
      <section className="ls-section ls-authority" id="about" aria-labelledby="authority-heading">
        <h2 id="authority-heading">Built with Trusted Technology</h2>
        <p className="ls-section-sub">
          Wintaibot is built on enterprise-grade open-source tools and hosted on
          AWS infrastructure — reliable, secure, and scalable.
        </p>
        <div className="ls-tech-row">
          {techStack.map((t) => (
            <a
              key={t.label}
              href={t.url}
              className="ls-tech-badge"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.label}
            </a>
          ))}
        </div>
        <div className="ls-authority-links">
          <a
            href="https://github.com/wintkaythweaungRevature"
            className="ls-authority-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub — View Source Code
          </a>
          <a
            href="https://api.wintaibot.com/swagger-ui.html"
            className="ls-authority-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            API Documentation (Swagger)
          </a>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="ls-section ls-faq" id="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Frequently Asked Questions</h2>
        {[
          {
            q: "Is Wintaibot really free to use?",
            a: "Yes. The Ask AI chatbot and Recipe Generator are completely free with no credit card required. Premium tools (DocuWizard, EchoScribe, Image Generator, Reply Enchanter, Resume Warlock) require a $5.99/month Member subscription.",
          },
          {
            q: "What file types does DocuWizard support?",
            a: "DocuWizard supports PDF, Excel (.xlsx, .xls), and Word (.docx) files. It can extract tables, summarize content, and answer questions about the document.",
          },
          {
            q: "How accurate is EchoScribe transcription?",
            a: "EchoScribe uses AI-powered speech recognition optimized for English. It performs well on clear recordings of meetings, lectures, and interviews. Accuracy may vary with heavy accents or background noise.",
          },
          {
            q: "Can I cancel my subscription anytime?",
            a: "Yes, absolutely. You can cancel your Member subscription at any time from your Account Settings. You keep full access until the end of your current billing period.",
          },
          {
            q: "Is my data secure?",
            a: "Files you upload are processed to generate your results and are not stored permanently. Payments are handled by Stripe — we never store your card details.",
          },
        ].map((item, i) => (
          <div className="ls-faq-item" key={i}>
            <button
              className="ls-faq-question"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              aria-expanded={openFaq === i}
            >
              <span>{item.q}</span>
              <span className="ls-faq-icon">{openFaq === i ? "−" : "+"}</span>
            </button>
            {openFaq === i && (
              <p className="ls-faq-answer">{item.a}</p>
            )}
          </div>
        ))}
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section className="ls-section ls-final-cta" aria-label="Get started with Wintaibot">
        <h2>Ready to Save Hours Every Week?</h2>
        <p>
          Join users who use Wintaibot to automate documents, emails, transcriptions,
          and more. Start free — no credit card needed.
        </p>
        <button className="ls-btn-primary ls-btn-lg" onClick={onGetStarted}>
          Get Started Free →
        </button>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="ls-footer">
        <p>
          © {new Date().getFullYear()} Wintaibot · Built by{" "}
          <a href="https://github.com/wintkaythweaungRevature" target="_blank" rel="noopener noreferrer">
            Wint Kay Thwe Aung
          </a>
          {" · "}
          <a href="mailto:contact@wintaibot.com">contact@wintaibot.com</a>
        </p>
        <nav className="ls-footer-nav" aria-label="Footer navigation">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#use-cases">Use Cases</a>
          <a href="#about">About</a>
          <a href="#faq">FAQ</a>
          <a href="https://github.com/wintkaythweaungRevature" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </footer>

    </main>
  );
}
