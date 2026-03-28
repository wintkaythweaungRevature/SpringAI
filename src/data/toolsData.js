export const TOOLS = [
  {
    slug: 'ask-ai',
    tab: 'chat',
    name: 'Ask AI',
    fullName: 'Ask AI – Instant Answers',
    icon: '🤖',
    badge: 'Free',
    color: '#2563eb',
    headline: 'Get instant answers to any question — 24/7 AI chat, no setup required.',
    description:
      'Ask AI is your always-on AI assistant. Get answers, explanations, code help, writing assistance, summaries, and advice on any topic — instantly and for free.',
    metaTitle: 'Ask AI – Free AI Chatbot for Instant Answers',
    metaDescription:
      'Chat with a powerful AI assistant 24/7. Get answers, explanations, code help, writing assistance, and advice on any topic — free, no downloads.',
    keywords: 'AI chatbot, free AI assistant, AI Q&A, ChatGPT alternative, AI answers',
    useCases: [
      { icon: '💡', title: 'Quick Explanations', desc: 'Understand complex topics in plain language — from science to finance to coding.' },
      { icon: '✍️', title: 'Writing Help', desc: 'Draft essays, reports, social posts, or any written content with AI assistance.' },
      { icon: '💻', title: 'Code & Debug', desc: 'Get working code snippets, fix bugs, and understand programming concepts.' },
    ],
    examplePrompts: [
      'Explain how compound interest works in simple terms',
      'Write a professional LinkedIn summary for a software engineer',
      'Debug this Python function: def add(a, b): return a - b',
    ],
  },
  {
    slug: 'recipe-generator',
    tab: 'recipe-generator',
    name: 'Recipe Generator',
    fullName: 'Recipe Generator',
    icon: '🍳',
    badge: 'Free',
    color: '#f59e0b',
    headline: 'Type your ingredients. Get a step-by-step recipe instantly.',
    description:
      'Stop wasting food. Enter whatever ingredients you have at home and get creative, detailed recipes in seconds — with instructions, prep time, and serving suggestions.',
    metaTitle: 'AI Recipe Generator – Cook with What You Have',
    metaDescription:
      'Enter your ingredients and get instant AI-generated recipes. Reduce food waste, discover new dishes, and plan meals effortlessly — free.',
    keywords: 'AI recipe generator, recipe from ingredients, meal planner AI, food waste reducer, cooking AI',
    useCases: [
      { icon: '🥗', title: 'Use What You Have', desc: 'Enter leftover ingredients and get full recipes — no grocery run needed.' },
      { icon: '🍽️', title: 'Meal Planning', desc: 'Plan your week\'s meals around what\'s already in your fridge and pantry.' },
      { icon: '🥘', title: 'Discover New Dishes', desc: 'Explore global cuisines and cooking styles you\'ve never tried before.' },
    ],
    examplePrompts: [
      'Chicken, garlic, lemon, spinach — what can I make?',
      'Quick 15-minute dinner with pasta and canned tomatoes',
      'High-protein breakfast with eggs, oats, and Greek yogurt',
    ],
  },
  {
    slug: 'docuwizard',
    tab: 'analyzer',
    name: 'DocuWizard',
    fullName: 'DocuWizard – PDF & Document AI',
    icon: '📄',
    badge: 'Member',
    color: '#7c3aed',
    headline: 'Upload any PDF, Excel, or Word file — extract data and insights in seconds.',
    description:
      'DocuWizard uses AI to read and analyze your documents. Summarize lengthy reports, convert PDF tables to Excel, extract key facts from contracts, and answer questions about any uploaded file.',
    metaTitle: 'DocuWizard – AI PDF Analyzer & Document Data Extractor',
    metaDescription:
      'Upload PDF, Excel, or Word files and extract structured data instantly. Summarize reports, convert tables, and analyze contracts with AI. On paid plans from $19/mo.',
    keywords: 'AI PDF analyzer, PDF data extraction, document AI, PDF to Excel, contract analyzer, AI document reader',
    useCases: [
      { icon: '📊', title: 'Extract Tables & Data', desc: 'Convert PDF tables into structured Excel or CSV data automatically.' },
      { icon: '📋', title: 'Summarize Reports', desc: 'Get concise summaries of long research reports, financial statements, or legal docs.' },
      { icon: '🔍', title: 'Q&A on Documents', desc: 'Ask any question about your uploaded file and get precise, cited answers.' },
    ],
    examplePrompts: [
      'Summarize this 50-page annual report in 5 bullet points',
      'Extract all invoice line items into a table',
      'What are the key obligations in this contract?',
    ],
  },
  {
    slug: 'echoscribe',
    tab: 'transcription',
    name: 'EchoScribe',
    fullName: 'EchoScribe – Voice Transcription',
    icon: '🎤',
    badge: 'Member',
    color: '#0891b2',
    headline: 'Convert audio and speech to accurate text — then summarize, translate, or analyze.',
    description:
      'EchoScribe transcribes meetings, lectures, interviews, and podcasts with high accuracy. After transcription, use AI to summarize, create action items, or translate to another language.',
    metaTitle: 'EchoScribe – AI Audio Transcription & Speech-to-Text',
    metaDescription:
      'Convert audio recordings and live speech to accurate text. Transcribe meetings, lectures, and interviews — then summarize or translate the output.',
    keywords: 'audio transcription AI, speech to text, meeting transcription, lecture transcription, podcast transcription, AI transcriber',
    useCases: [
      { icon: '🎓', title: 'Lecture Notes', desc: 'Record lectures and get accurate transcripts + AI-generated study notes.' },
      { icon: '📅', title: 'Meeting Minutes', desc: 'Transcribe meetings automatically and extract action items and decisions.' },
      { icon: '🌐', title: 'Translation', desc: 'Transcribe audio in one language and translate the output to another.' },
    ],
    examplePrompts: [
      'Transcribe this 1-hour lecture recording',
      'Summarize this meeting and list action items',
      'Transcribe and translate this interview from Spanish to English',
    ],
  },
  {
    slug: 'image-generator',
    tab: 'image-generator',
    name: 'AI Image Generator',
    fullName: 'AI Image Generator',
    icon: '🖼️',
    badge: 'Member',
    color: '#db2777',
    headline: 'Turn any text description into stunning AI-generated images in seconds.',
    description:
      'Create digital art, product mockups, social media graphics, illustrations, and more — just describe what you want. No design skills or software required.',
    metaTitle: 'AI Image Generator – Create Art & Graphics from Text',
    metaDescription:
      'Turn text prompts into stunning images instantly. Create digital art, product mockups, social media graphics, and illustrations — no design skills needed.',
    keywords: 'AI image generator, text to image AI, AI art generator, DALL-E alternative, AI graphic design, image AI tool',
    useCases: [
      { icon: '📱', title: 'Social Media Graphics', desc: 'Create eye-catching visuals for Instagram, LinkedIn, and Facebook posts.' },
      { icon: '🛍️', title: 'Product Mockups', desc: 'Visualize product concepts, packaging, and branding ideas instantly.' },
      { icon: '🎨', title: 'Digital Art', desc: 'Generate illustrations, concept art, and creative visuals for any project.' },
    ],
    examplePrompts: [
      'A futuristic city skyline at sunset in cyberpunk style',
      'Minimalist logo concept for a coffee brand, flat design',
      'Professional headshot background: modern office with soft lighting',
    ],
  },
  {
    slug: 'reply-enchanter',
    tab: 'Content',
    name: 'Reply Enchanter',
    fullName: 'Reply Enchanter – AI Email Writer',
    icon: '✉️',
    badge: 'Member',
    color: '#16a34a',
    headline: 'Paste any email. Get a polished AI reply — in your tone, instantly.',
    description:
      'Reply Enchanter reads any email you paste and drafts a professional, friendly, or assertive reply in seconds. Choose your tone and send with confidence — no more staring at a blank screen.',
    metaTitle: 'Reply Enchanter – AI Email Writer & Reply Generator',
    metaDescription:
      'Paste any email and get a polished AI-drafted reply instantly. Choose your tone — professional, friendly, casual, or urgent — and send with confidence.',
    keywords: 'AI email writer, email reply generator, AI reply tool, email assistant, professional email AI, email drafting tool',
    useCases: [
      { icon: '💼', title: 'Professional Replies', desc: 'Draft polished responses to clients, managers, and business partners.' },
      { icon: '⚡', title: 'Inbox Zero Faster', desc: 'Clear your inbox in half the time with instant AI-drafted replies.' },
      { icon: '🤝', title: 'Tone Control', desc: 'Set the exact tone — formal, friendly, firm, apologetic — for every reply.' },
    ],
    examplePrompts: [
      'Reply professionally declining this meeting invitation',
      'Write a firm but polite follow-up for an unpaid invoice',
      'Draft a friendly response to this customer complaint',
    ],
  },
  {
    slug: 'resume-warlock',
    tab: 'Resume',
    name: 'Resume Warlock',
    fullName: 'Resume Warlock – Interview Prep AI',
    icon: '📝',
    badge: 'Member',
    color: '#ea580c',
    headline: 'Upload your resume. Get AI-tailored interview questions and model answers.',
    description:
      'Resume Warlock reads your resume and generates targeted interview questions based on your actual experience. Practice answers, identify weak spots, and walk into your next interview prepared.',
    metaTitle: 'Resume Warlock – AI Interview Prep from Your Resume',
    metaDescription:
      'Upload your resume and receive AI-generated interview questions tailored to your experience. Practice answers, sharpen weak areas, and land your next role.',
    keywords: 'AI interview prep, resume interview questions, job interview AI, interview practice tool, resume analyzer, AI job coach',
    useCases: [
      { icon: '🎯', title: 'Tailored Questions', desc: 'Get interview questions specific to your resume — not generic lists.' },
      { icon: '🏋️', title: 'Practice Answers', desc: 'Draft model answers and improve them with AI feedback.' },
      { icon: '🔎', title: 'Spot Weak Areas', desc: 'Identify experience gaps and prepare explanations before the interview.' },
    ],
    examplePrompts: [
      'Generate 10 behavioral interview questions for my software engineer resume',
      'What will they ask about my 2-year employment gap?',
      'Write a strong answer to "What is your greatest weakness?"',
    ],
  },
  {
    slug: 'video-publisher',
    tab: 'video-publisher',
    name: 'Video Publisher',
    fullName: 'Video Publisher – One Video, Every Platform',
    icon: '🎬',
    badge: 'Member',
    color: '#dc2626',
    headline: 'Upload once. Publish to YouTube, Instagram, TikTok & more — with AI captions.',
    description:
      'Upload your video, choose which platforms to publish to — Wintaibot fixes the file for each one you pick (aspect ratio, framing, quality). You do not re-edit per site. AI captions and hashtags per network, independent scheduling, and trending insights to plan what to post next.',
    metaTitle: 'Video Publisher – AI-Powered Multi-Platform Video Scheduler',
    metaDescription:
      'Pick your platforms; Wintaibot adapts your video for each destination automatically. No manual ratio fixes — AI captions, scheduling, and multi-platform publishing.',
    keywords: 'video publishing tool, multi-platform video scheduler, AI video captions, YouTube scheduler, Instagram video publisher, TikTok automation',
    useCases: [
      { icon: '🚀', title: 'Publish Everywhere', desc: 'One upload → YouTube, Instagram Reels, TikTok, Facebook, LinkedIn simultaneously.' },
      { icon: '🎞️', title: 'We fix it per platform', desc: 'You select Instagram, YouTube Shorts, TikTok, etc. — we generate the right variant for each; upscale, crop, or pad in the pipeline so you do not have to.' },
      { icon: '🤖', title: 'AI Captions & Hashtags', desc: 'AI writes platform-optimized captions and hashtag sets for each channel.' },
      { icon: '📅', title: 'Smart Scheduling', desc: 'Set different publish times per platform — YouTube at 4 AM, Instagram at 6 PM.' },
    ],
    examplePrompts: [
      'Publish my cooking tutorial to YouTube and Instagram with AI captions',
      'Schedule this product demo to TikTok on Monday and LinkedIn on Tuesday',
      'Generate hashtags for my travel vlog on Instagram and YouTube',
    ],
  },
];

export function getToolBySlug(slug) {
  return TOOLS.find(t => t.slug === slug);
}
