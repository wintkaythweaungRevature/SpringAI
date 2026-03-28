'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import './LandingSection.css';

const features = [
  {
    icon: '🤖',
    title: 'Ask AI – Instant Answers',
    description:
      'Chat with a powerful AI assistant 24/7. Get answers, explanations, code help, writing assistance, and advice on any topic — no downloads, no setup.',
    badge: 'Free',
  },
  {
    icon: '🍳',
    title: 'Recipe Generator',
    description:
      'Type the ingredients you have and get step-by-step recipes instantly. Reduce food waste, discover new dishes, and plan meals effortlessly.',
    badge: 'Free',
  },
  {
    icon: '📄',
    title: 'DocuWizard – PDF & Document AI',
    description:
      'Upload PDF, Excel, or Word files and extract structured data in seconds. Summarize reports, convert PDF tables to Excel, and analyze invoices with AI.',
    badge: 'Member',
  },
  {
    icon: '🎤',
    title: 'EchoScribe – Voice Transcription',
    description:
      'Convert audio recordings and live speech to accurate text. Transcribe meetings, lectures, and interviews — then summarize or translate the output.',
    badge: 'Member',
  },
  {
    icon: '🖼️',
    title: 'AI Image Generator',
    description:
      'Turn text prompts into stunning images in seconds. Create digital art, product mockups, social media graphics, and illustrations — no design skills needed.',
    badge: 'Member',
  },
  {
    icon: '✉️',
    title: 'Reply Enchanter – AI Email Writer',
    description:
      'Paste any email and get a polished AI-drafted reply instantly. Choose your tone — professional, friendly, casual, or urgent — and send with confidence.',
    badge: 'Member',
  },
  {
    icon: '📝',
    title: 'Resume Warlock – Interview Prep AI',
    description:
      'Upload your resume and receive AI-generated interview questions tailored to your experience. Practice answers, sharpen weak areas, and land your next role.',
    badge: 'Member',
  },
  {
    icon: '🎬',
    title: 'Video Publisher – One Video, Every Platform',
    description:
      'Upload once, publish everywhere. Connect YouTube, Instagram, TikTok, and more. Get AI captions and hashtags per platform, schedule each post when you want.',
    badge: 'Member',
  },
];

const steps = [
  {
    num: '1',
    title: 'Choose a Tool',
    desc: 'Select from 8 AI-powered tools — chatbot, document analyzer, transcription, image generator, email writer, interview prep, recipe planner, or video publisher.',
  },
  {
    num: '2',
    title: 'Paste, Upload, or Type',
    desc: 'Input your text, upload a document, record audio, or describe what you need. Wintaibot accepts multiple input formats.',
  },
  {
    num: '3',
    title: 'Get Instant AI Results',
    desc: 'Receive accurate, high-quality output in seconds. Copy, download, or use the result directly in your workflow.',
  },
];

const testimonials = [
  {
    name: 'Sarah K.',
    role: 'HR Manager',
    quote:
      'Resume Warlock helped me prep candidates before interviews. The AI-generated questions were spot-on for each resume. We cut interview prep time by half.',
  },
  {
    name: 'James T.',
    role: 'Freelance Developer',
    quote:
      "I use Ask AI and Reply Enchanter every day. It's like having an assistant who never sleeps. The email drafts are professional and save me 30 minutes daily.",
  },
  {
    name: 'Mei L.',
    role: 'Graduate Student',
    quote:
      'EchoScribe transcribes my lectures perfectly. I paste the transcript into Ask AI to get summaries and study notes. It\'s transformed how I study.',
  },
];

const techStack = [
  { label: 'Spring AI', url: 'https://spring.io/projects/spring-ai' },
  { label: 'React 19', url: 'https://react.dev' },
  { label: 'Java 21', url: 'https://openjdk.org' },
  { label: 'Stripe Payments', url: 'https://stripe.com' },
  { label: 'Docker', url: 'https://docker.com' },
  { label: 'AWS EC2', url: 'https://aws.amazon.com/ec2/' },
];

export default function LandingSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="ls-root" aria-label="Wintaibot – AI Platform">
      <section className="ls-hero" aria-labelledby="hero-heading">
        <div className="ls-hero-badge">AI Assistant for PDFs, Documents &amp; Productivity</div>
        <h1 id="hero-heading" className="ls-hero-h1">
          Analyze PDFs, Transcribe Audio,
          <br />
          Publish Videos &amp; Automate Your Work with AI
        </h1>
        <p className="ls-hero-sub">
          Wintaibot is an AI assistant that extracts data from PDFs and documents, transcribes
          audio, generates images, writes email replies, prepares you for job interviews, publishes
          videos to YouTube and socials with smart scheduling and viral trends, and answers any
          question — all in one platform, no installs required.
        </p>
        <div className="ls-hero-actions">
          <Link href="/chat" className="ls-btn-primary">
            Try Free — No Credit Card
          </Link>
          <Link href="/#features" className="ls-btn-ghost">
            See All Features →
          </Link>
        </div>
        <p className="ls-hero-note">
          Free tier includes <strong>Ask AI</strong> and <strong>Recipe Generator</strong>. Paid
          plans from <strong>$19/month</strong> (or <strong>$15/mo</strong> billed annually).
        </p>
      </section>

      <section className="ls-section ls-what" aria-labelledby="what-heading">
        <h2 id="what-heading">What Is Wintaibot?</h2>
        <p>
          Wintaibot is an AI productivity platform built on <strong>Spring AI</strong> and{' '}
          <strong>React</strong>. It combines eight specialized AI tools into a single, easy-to-use
          dashboard — so you stop juggling multiple apps and subscriptions.
        </p>
        <p>
          Whether you are a <strong>job seeker</strong> preparing for interviews, a{' '}
          <strong>professional</strong> drowning in emails and documents, a{' '}
          <strong>student</strong> who needs lecture transcriptions, a{' '}
          <strong>creator</strong> publishing to YouTube and socials, or a{' '}
          <strong>content team</strong> scheduling posts per platform — Wintaibot has a dedicated
          tool built for your workflow.
        </p>
        <div className="ls-stat-row">
          <div className="ls-stat">
            <span className="ls-stat-num">8</span>
            <span>AI Tools</span>
          </div>
          <div className="ls-stat">
            <span className="ls-stat-num">Free</span>
            <span>To Start</span>
          </div>
          <div className="ls-stat">
            <span className="ls-stat-num">$19+</span>
            <span>Paid plans / mo</span>
          </div>
          <div className="ls-stat">
            <span className="ls-stat-num">0</span>
            <span>Installs Required</span>
          </div>
        </div>
      </section>

      <section className="ls-section" id="features" aria-labelledby="features-heading">
        <h2 id="features-heading">Everything You Need, Built In</h2>
        <p className="ls-section-sub">
          No more switching between ChatGPT, Whisper, DALL·E, and a dozen other tools. Wintaibot
          puts documents, audio, images, email, resumes, recipes, and video publishing in one place.
        </p>
        <div className="ls-features-grid" role="list">
          {features.map((f) => (
            <article className="ls-feature-card" key={f.title} role="listitem">
              <div className="ls-feature-top">
                <span className="ls-feature-icon" aria-hidden="true">
                  {f.icon}
                </span>
                <span className={`ls-badge ls-badge--${f.badge.toLowerCase()}`}>{f.badge}</span>
              </div>
              <h3 className="ls-feature-title">{f.title}</h3>
              <p className="ls-feature-desc">{f.description}</p>
              {f.title.startsWith('Video Publisher') && (
                <Link href="/video-publisher" className="ls-btn-outline ls-feature-cta">
                  Try Video Publisher →
                </Link>
              )}
            </article>
          ))}
        </div>
        <p className="ls-features-note">
          <strong>Free</strong> tools are available immediately after signup.{' '}
          <strong>Premium</strong> tools unlock on <strong>Starter</strong>, <strong>Pro</strong>, or{' '}
          <strong>Growth</strong> — see pricing for limits.
        </p>
      </section>

      <section className="ls-section ls-how" id="how-it-works" aria-labelledby="how-heading">
        <h2 id="how-heading">How It Works</h2>
        <p className="ls-section-sub">Start getting results in under 30 seconds.</p>
        <ol className="ls-steps" role="list">
          {steps.map((s) => (
            <li className="ls-step" key={s.num}>
              <article>
                <span className="ls-step-num" aria-hidden="true">
                  {s.num}
                </span>
                <h3 className="ls-step-title">{s.title}</h3>
                <p className="ls-step-desc">{s.desc}</p>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section className="ls-section" id="use-cases" aria-labelledby="usecases-heading">
        <h2 id="usecases-heading">Who Uses Wintaibot?</h2>
        <div className="ls-usecase-grid" role="list">
          <article className="ls-usecase">
            <h3>Job Seekers</h3>
            <p>
              Upload your resume to <strong>Resume Warlock</strong> and receive AI-tailored
              interview questions. Practice answers, identify gaps in your experience, and walk into
              every interview prepared and confident.
            </p>
          </article>
          <article className="ls-usecase">
            <h3>Business Professionals</h3>
            <p>
              Extract key data from invoices and reports with <strong>DocuWizard</strong>, draft
              polished email responses in seconds with <strong>Reply Enchanter</strong>, and
              transcribe client calls with <strong>EchoScribe</strong>.
            </p>
          </article>
          <article className="ls-usecase">
            <h3>Students &amp; Researchers</h3>
            <p>
              Transcribe lectures and podcasts with <strong>EchoScribe</strong>, then paste the
              text into <strong>Ask AI</strong> for instant summaries, study notes, and explanations
              of complex topics.
            </p>
          </article>
          <article className="ls-usecase">
            <h3>Content Creators &amp; Social Managers</h3>
            <p>
              Use <strong>Video Publisher</strong> to upload once and publish to YouTube, Instagram,
              TikTok, and more. Get AI captions and hashtags per platform, schedule each post when
              you want, and check viral trends and news to plan your next video.
            </p>
          </article>
          <article className="ls-usecase">
            <h3>Home Cooks</h3>
            <p>
              Open your fridge, list what you have, and let the <strong>Recipe Generator</strong>{' '}
              suggest delicious meals with full instructions. Reduce food waste and discover new
              cuisines every week.
            </p>
          </article>
          <article className="ls-usecase">
            <h3>Teams &amp; Small Businesses</h3>
            <p>
              Speed up document processing, automate repetitive email replies, and give every team
              member access to AI tools without expensive per-seat pricing.
            </p>
          </article>
        </div>
      </section>

      <section className="ls-section ls-pricing" id="pricing" aria-labelledby="pricing-heading">
        <h2 id="pricing-heading">Simple, Transparent Pricing</h2>
        <p className="ls-section-sub">Start free. Upgrade when you need more — annual billing saves up to ~21%.</p>

        <div className="ls-pricing-why" aria-labelledby="why-pricing-heading">
          <h3 id="why-pricing-heading">Why these numbers?</h3>
          <div className="ls-pricing-why-grid">
            <div className="ls-pricing-why-block">
              <h4>Starter — $19/mo</h4>
              <p>
                Buffer charges about <strong>$18/mo</strong> for fewer features. Staying <strong>under $20</strong> is a
                psychological anchor — cheap enough to try. Roughly <strong>7 paying users</strong> cover baseline AWS hosting.
              </p>
            </div>
            <div className="ls-pricing-why-block">
              <h4>Pro — $39/mo</h4>
              <p>
                About <strong>half the price of Hootsuite</strong> (~$99) with stronger <strong>video &amp; AI</strong> workflows.
                A sweet spot for small businesses; on the order of <strong>4 users</strong> covers a typical full AWS bill.
              </p>
            </div>
            <div className="ls-pricing-why-block">
              <h4>Growth — $79/mo</h4>
              <p>
                Still <strong>below many enterprise schedulers</strong>, with <strong>team seats</strong> (as you roll them out) and
                room for margin — roughly <strong>2 accounts</strong> can cover AWS plus profit at this tier.
              </p>
            </div>
          </div>
        </div>

        <div className="ls-plans">
          <article className="ls-plan">
            <div className="ls-plan-name">Free</div>
            <div className="ls-plan-price">
              $0 <span>/ forever</span>
            </div>
            <ul className="ls-plan-features">
              <li>Ask AI chatbot (unlimited)</li>
              <li>Recipe Generator (unlimited)</li>
              <li>No credit card required</li>
            </ul>
            <Link href="/chat" className="ls-btn-outline">
              Get Started Free
            </Link>
          </article>

          <article className="ls-plan">
            <div className="ls-plan-name">Starter</div>
            <div className="ls-plan-price">
              $19 <span>/ month</span>
            </div>
            <p className="ls-plan-annual">
              <strong>$15/mo</strong> billed annually (<strong>$180/yr</strong>)
            </p>
            <ul className="ls-plan-features">
              <li>Everything in Free</li>
              <li>Premium AI: DocuWizard, EchoScribe, Image Gen, Email, Resume</li>
              <li>Video Publisher: <strong>5</strong> connected platforms</li>
              <li>
                <strong>10</strong> videos / month · <strong>30</strong> scheduled posts / month
              </li>
              <li>AI captions, thumbnail picker, link-in-bio</li>
              <li className="ls-li-off">Deep analytics</li>
              <li className="ls-li-off">AI Social Chat (RAG)</li>
              <li>
                <strong>1</strong> seat
              </li>
            </ul>
            <Link href="/chat" className="ls-btn-outline">
              Choose Starter
            </Link>
          </article>

          <article className="ls-plan ls-plan--featured">
            <div className="ls-plan-popular">Most Popular</div>
            <div className="ls-plan-name">Pro</div>
            <div className="ls-plan-price">
              $39 <span>/ month</span>
            </div>
            <p className="ls-plan-annual">
              <strong>$32/mo</strong> billed annually (<strong>$384/yr</strong>)
            </p>
            <ul className="ls-plan-features">
              <li>Everything in Starter</li>
              <li>
                <strong>All 8</strong> platforms · <strong>30</strong> videos / month
              </li>
              <li>
                <strong>Unlimited</strong> scheduled posts
              </li>
              <li>Deep analytics</li>
              <li>AI Social Chat (RAG)</li>
              <li>AI captions, thumbnail picker, link-in-bio</li>
              <li>
                <strong>1</strong> seat
              </li>
            </ul>
            <Link href="/chat" className="ls-btn-primary">
              Choose Pro
            </Link>
          </article>

          <article className="ls-plan">
            <div className="ls-plan-name">Growth</div>
            <div className="ls-plan-price">
              $79 <span>/ month</span>
            </div>
            <p className="ls-plan-annual">
              <strong>$64/mo</strong> billed annually (<strong>$768/yr</strong>)
            </p>
            <ul className="ls-plan-features">
              <li>Everything in Pro</li>
              <li>
                <strong>Unlimited</strong> videos
              </li>
              <li>
                <strong>Priority</strong> processing queue
              </li>
              <li>
                <strong>3</strong> team seats <span style={{ color: '#64748b', fontWeight: 400 }}>(when enabled)</span>
              </li>
              <li>Deep analytics · AI Social Chat (RAG)</li>
            </ul>
            <Link href="/chat" className="ls-btn-outline">
              Choose Growth
            </Link>
          </article>
        </div>

        <div className="ls-comparison-wrap">
          <p className="ls-comparison-title">Video &amp; social — per-plan limits</p>
          <table className="ls-comparison-table">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col">Starter $19</th>
                <th scope="col">Pro $39</th>
                <th scope="col">Growth $79</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Platforms</td>
                <td>5</td>
                <td>All 8</td>
                <td>All 8</td>
              </tr>
              <tr>
                <td>Videos / month</td>
                <td>10</td>
                <td>30</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <td>AI captions</td>
                <td className="ls-ok">✓</td>
                <td className="ls-ok">✓</td>
                <td className="ls-ok">✓</td>
              </tr>
              <tr>
                <td>Thumbnail picker</td>
                <td className="ls-ok">✓</td>
                <td className="ls-ok">✓</td>
                <td className="ls-ok">✓</td>
              </tr>
              <tr>
                <td>Link-in-bio</td>
                <td className="ls-ok">✓</td>
                <td className="ls-ok">✓</td>
                <td className="ls-ok">✓</td>
              </tr>
              <tr>
                <td>Deep analytics</td>
                <td className="ls-no">—</td>
                <td className="ls-ok">✓</td>
                <td className="ls-ok">✓</td>
              </tr>
              <tr>
                <td>AI Social Chat (RAG)</td>
                <td className="ls-no">—</td>
                <td className="ls-ok">✓</td>
                <td className="ls-ok">✓</td>
              </tr>
              <tr>
                <td>Team seats</td>
                <td>1</td>
                <td>1</td>
                <td>3</td>
              </tr>
              <tr>
                <td>Scheduled posts</td>
                <td>30/mo</td>
                <td>Unlimited</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <td>Priority processing</td>
                <td className="ls-no">—</td>
                <td className="ls-no">—</td>
                <td className="ls-ok">✓</td>
              </tr>
              <tr>
                <td>Annual (effective / mo)</td>
                <td>$15 ($180/yr)</td>
                <td>$32 ($384/yr)</td>
                <td>$64 ($768/yr)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section
        className="ls-section ls-testimonials"
        id="testimonials"
        aria-labelledby="testimonials-heading"
      >
        <h2 id="testimonials-heading">What Users Are Saying</h2>
        <div className="ls-testimonial-grid">
          {testimonials.map((t) => (
            <blockquote className="ls-testimonial" key={t.name}>
              <p className="ls-testimonial-quote">&quot;{t.quote}&quot;</p>
              <footer className="ls-testimonial-author">
                <strong>{t.name}</strong> · {t.role}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="ls-section ls-authority" id="about" aria-labelledby="authority-heading">
        <h2 id="authority-heading">Built with Trusted Technology</h2>
        <p className="ls-section-sub">
          Wintaibot is built on enterprise-grade open-source tools and hosted on AWS
          infrastructure — reliable, secure, and scalable.
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

      <section className="ls-section ls-faq" id="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Frequently Asked Questions</h2>
        {[
          {
            q: 'Is Wintaibot really free to use?',
            a: 'Yes. The Ask AI chatbot and Recipe Generator are completely free with no credit card required. Premium tools unlock on Starter ($19/mo), Pro ($39/mo), or Growth ($79/mo), with annual discounts. See pricing for Video Publisher and analytics limits.',
          },
          {
            q: 'What file types does DocuWizard support?',
            a: 'DocuWizard supports PDF, Excel (.xlsx, .xls), and Word (.docx) files. It can extract tables, summarize content, and answer questions about the document.',
          },
          {
            q: 'How accurate is EchoScribe transcription?',
            a: 'EchoScribe uses AI-powered speech recognition optimized for English. It performs well on clear recordings of meetings, lectures, and interviews.',
          },
          {
            q: 'Can I cancel my subscription anytime?',
            a: 'Yes, absolutely. You can cancel any paid plan at any time from your Account Settings. You keep access until the end of your current billing period.',
          },
          {
            q: 'Is my data secure?',
            a: 'Files you upload are processed to generate your results and are not stored permanently. Payments are handled by Stripe — we never store your card details.',
          },
          {
            q: 'What does Video Publisher do?',
            a: 'Video Publisher lets you upload one video and publish it to YouTube, Instagram, TikTok, LinkedIn, and more. You get AI-generated captions and hashtags per platform, can schedule each platform at a different time, and see viral trends to plan your next content.',
          },
        ].map((item, i) => (
          <div className="ls-faq-item" key={i}>
            <button
              className="ls-faq-question"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              aria-expanded={openFaq === i}
            >
              <span>{item.q}</span>
              <span className="ls-faq-icon">{openFaq === i ? '−' : '+'}</span>
            </button>
            {openFaq === i && <p className="ls-faq-answer">{item.a}</p>}
          </div>
        ))}
      </section>

      <section className="ls-section ls-final-cta" aria-label="Get started with Wintaibot">
        <h2>Ready to Save Hours Every Week?</h2>
        <p>
          Join users who use Wintaibot to automate documents, emails, transcriptions, video
          publishing to socials, and more. Start free — no credit card needed.
        </p>
        <Link href="/chat" className="ls-btn-primary ls-btn-lg">
          Get Started Free →
        </Link>
      </section>

      <footer className="ls-footer">
        <p>
          © {new Date().getFullYear()} Wintaibot · Built by{' '}
          <a
            href="https://github.com/wintkaythweaungRevature"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wint Kay Thwe Aung
          </a>
          {' · '}
          <a href="mailto:contact@wintaibot.com">contact@wintaibot.com</a>
        </p>
        <nav className="ls-footer-nav" aria-label="Footer navigation">
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/use-cases">Use Cases</Link>
          <a href="/#about">About</a>
          <a href="/#faq">FAQ</a>
          <a
            href="https://github.com/wintkaythweaungRevature"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
      </footer>
    </main>
  );
}
