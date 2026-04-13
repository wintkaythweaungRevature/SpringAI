import React, { useState } from 'react';

/* ─── Brand ──────────────────────────────────────────────────── */
const BRAND   = 'WintAI';
const WEBSITE = 'www.wintaibot.com';
const AUTHOR  = 'Wint Kay Thwe Aung';
const DATE    = 'April 12, 2026';

/* ─── Blog data ──────────────────────────────────────────────── */
const BLOGS = [
  {
    id: 1,
    slug: 'create-stunning-content',
    category: 'Getting Started',
    readTime: '5 min',
    title: 'How to Create Stunning Social Media Content in Minutes — Without a Designer',
    excerpt: 'You have a great product but spend hours fighting with layouts. Here\'s the exact 4-minute workflow to go from zero to post-ready.',
    emoji: '🎨',
    color: '#6366f1',
    sections: [
      {
        heading: 'The Problem Every Business Owner Knows Too Well',
        body: `You have a great product. You have a story worth telling. But every time you sit down to create a social media post, you spend hours tweaking fonts, fighting with layouts, and still end up with something that doesn't look professional.\n\nSound familiar? You're not alone. 83% of small business owners say creating consistent visual content is their biggest marketing challenge — not because they lack ideas, but because they lack time and design skills.\n\nThat's exactly why we built ${BRAND}.`,
      },
      {
        heading: `What Is ${BRAND}?`,
        body: `${BRAND} is an all-in-one social media content platform that lets you choose from 84+ professionally designed templates, customize every word in the design, auto-generate captions with AI, download in PNG, JPG, or PDF — ready to post instantly, and apply 12 colour themes to match your brand palette.\n\nNo design skills needed. No subscription to five different tools. Just open, customize, and post.`,
      },
      {
        heading: 'A Real Workflow — From Zero to Post-Ready in 4 Minutes',
        body: `Step 1 — Pick your template. Browse by category — Business, Product, Sale, Quote, Event, Holiday, Content, and more.\n\nStep 2 — Fill in your brand info. Enter your business name, handle, email, and website once. ${BRAND} populates them across the entire design automatically.\n\nStep 3 — Edit the design text. Change every headline, subtitle, and button label. Type your words, see them appear live in the preview.\n\nStep 4 — Generate your caption. Hit generate and get a ready-to-post caption for Instagram, Facebook, or LinkedIn — with your placeholders pre-filled.\n\nStep 5 — Download and post. Export as PNG, JPG, or PDF. Professional, branded, ready in under 4 minutes.`,
      },
      {
        heading: 'Who Is It For?',
        body: `Whether you're a freelancer, consultant, course creator, e-commerce store owner, or marketing manager — ${BRAND} helps you show up consistently without burning out.`,
      },
    ],
  },
  {
    id: 2,
    slug: '7-reasons-not-growing',
    category: 'Strategy',
    readTime: '6 min',
    title: '7 Reasons Your Social Media Isn\'t Growing (And How to Fix All of Them)',
    excerpt: 'You\'re posting. You\'re showing up. But the followers aren\'t coming. Here are the 7 most common reasons — and the exact fixes.',
    emoji: '📈',
    color: '#22c55e',
    sections: [
      { heading: 'Reason 1: Inconsistent Posting', body: `The problem: You post 5 times one week, then disappear for 3 weeks. The algorithm punishes inconsistency and so does your audience.\n\nThe fix: Batch-create content once a week using templates. With ${BRAND}, you can create 7 posts in under 30 minutes and schedule them out. Consistency beats perfection every time.` },
      { heading: 'Reason 2: Your Visuals Don\'t Stop the Scroll', body: `The problem: Bland, low-contrast, or generic visuals get scrolled past in milliseconds.\n\nThe fix: ${BRAND}'s templates are designed by professionals to maximise visual impact and stop the scroll.` },
      { heading: 'Reason 3: Your Captions Have No CTA', body: `The problem: You tell people what you do but never tell them what to DO. No call-to-action = no engagement.\n\nThe fix: ${BRAND}'s AI-generated captions automatically include the right CTA for each content type.` },
      { heading: 'Reason 4: You\'re Talking AT People, Not WITH Them', body: `The problem: One-way broadcasting kills community. People follow accounts that make them feel seen and heard.\n\nThe fix: Use ${BRAND}'s Ask the Audience, Story Poll, and This or That templates to spark real conversations.` },
      { heading: 'Reason 5: Your Branding is All Over the Place', body: `The problem: Every post looks different. People can't recognise your brand at a glance.\n\nThe fix: Pick 1–2 templates and stick to them. Apply the same colour theme every week. Brand recognition builds trust.` },
      { heading: 'Reason 6: You\'re Ignoring Your Best Content', body: `The problem: That post that got 3× your normal engagement? You never talked about that topic again.\n\nThe fix: Check your analytics monthly. Double down on what works. Repurpose your top posts into new formats.` },
      { heading: 'Reason 7: You\'re Making Content Creation Too Hard', body: `The problem: If creating a post takes 2 hours, you'll procrastinate until you stop posting altogether.\n\nThe fix: Use ${BRAND} to generate captions and skip the design phase. When it's easy, you do it consistently.` },
    ],
  },
  {
    id: 3,
    slug: 'product-launch-guide',
    category: 'Product Launch',
    readTime: '7 min',
    title: 'The Complete Guide to Launching a Product on Social Media (Step-by-Step)',
    excerpt: 'A great product launch doesn\'t happen by accident. It follows a proven sequence: build anticipation, reveal, convert. Here\'s the exact playbook.',
    emoji: '🚀',
    color: '#f59e0b',
    sections: [
      { heading: 'Phase 1: The Tease — 2 Weeks Before Launch', body: `Your goal before launch is to make your audience curious. Don't reveal everything — just enough to hook them.\n\nContent to create:\n• Waitlist teaser post — "Something big is coming. Join the waitlist for early access."\n• Mystery hint post — Drop a single feature without naming the product.\n• Poll post — "What's your biggest struggle with [topic]?" — gives you market research too.\n\n${BRAND} templates: Waitlist Teaser, Story Poll` },
      { heading: 'Phase 2: The Countdown — Launch Week', body: `Create urgency. Your audience knows something is coming — now make them feel like they can't miss it.\n\nContent to create:\n• 5-day countdown posts — "5 days until launch. Here's one thing it does..."\n• Feature reveal posts — One post per key feature. Build excitement daily.\n• Early bird announcement — "First 50 customers get [bonus]. Waitlist gets 24-hour early access."\n\n${BRAND} templates: Launch Countdown, Feature Drop` },
      { heading: 'Phase 3: Launch Day', body: `This is your Super Bowl Sunday. Post 3–5 times across platforms.\n\nContent to create:\n• The hero launch post — Your best visual, your best copy, your strongest CTA.\n• Stories countdown — "We go live in 2 hours!"\n• Behind-the-scenes — Show the team, the product, the emotion.\n• "We're live!" post — The moment it goes live, post immediately.\n\n${BRAND} templates: New Product Launch, Big Announcement` },
      { heading: 'Phase 4: The Follow-Up — First 2 Weeks After', body: `Most brands stop after launch day. Big mistake. The follow-up is where you capture people who were on the fence.\n\nContent to create:\n• First customer testimonials — Social proof converts sceptics.\n• Results stats — "500 people signed up in the first 24 hours!"\n• FAQ post — Answer the top 5 questions you've been getting.\n• Last chance posts — If early bird pricing ends, remind people with urgency.\n\n${BRAND} templates: Testimonial Card, Flash Sale` },
    ],
  },
  {
    id: 4,
    slug: 'instagram-vs-facebook-vs-linkedin',
    category: 'Platform Strategy',
    readTime: '6 min',
    title: 'Instagram vs Facebook vs LinkedIn: Which Platform Should Your Business Focus On?',
    excerpt: 'You can\'t be everywhere. And trying to be everywhere means being mediocre everywhere. Here\'s how to choose the right platform and dominate it.',
    emoji: '📱',
    color: '#0A66C2',
    sections: [
      { heading: 'Instagram: Best for Visual Brands & Consumer Products', body: `Who it's for: E-commerce, fashion, food, fitness, beauty, lifestyle, coaches, creators.\n\nAverage user: 18–34 years old, discovers brands through explore and reels.\n\nContent strategy: Post 4–6x per week. Mix Reels (for reach), carousels (for saves), and Stories (for engagement). Instagram rewards aesthetic consistency and entertainment.\n\nBest ${BRAND} templates: Quote Cards, Product Launch, Flash Sale, Before & After, Giveaway, Tip Tuesday` },
      { heading: 'Facebook: Best for Local Businesses & Community Building', body: `Who it's for: Local businesses, service providers, B2C brands with older demographics.\n\nAverage user: 35–55 years old, uses Facebook to stay connected and discover local services.\n\nContent strategy: Post 3–4x per week. Focus on events, promotions, testimonials, and educational content.\n\nBest ${BRAND} templates: Event Countdown, Testimonial Card, Holiday Sale, Limited Time Offer` },
      { heading: 'LinkedIn: Best for B2B, Consultants & Personal Brands', body: `Who it's for: B2B companies, consultants, coaches, recruiters, thought leaders, SaaS.\n\nAverage user: 28–45 years old, professional mindset, looking for insights and opportunities.\n\nContent strategy: Post 3–5x per week. Lead with a strong first line. Carousels perform extremely well.\n\nBest ${BRAND} templates: Brand Values, Founder Friday, Service Packages, Big Number, Year in Review` },
      { heading: 'The Smart Move: Master One First', body: `Pick the platform where your ideal customer spends the most time. Go all-in for 90 days. Master the format, grow an audience, build a content system — then expand.\n\nQuick guide:\n• E-commerce / physical product → Instagram + Facebook\n• Service / consulting → LinkedIn + Instagram\n• Local brick & mortar → Facebook + Instagram\n• SaaS / tech → LinkedIn\n• Personal brand / creator → Instagram + LinkedIn\n• Course / education → Instagram + LinkedIn` },
    ],
  },
  {
    id: 5,
    slug: 'write-captions-that-engage',
    category: 'Copywriting',
    readTime: '5 min',
    title: 'How to Write Captions That Actually Get Engagement (The Formula That Works Every Time)',
    excerpt: 'Great visuals stop the scroll. Great captions drive the action. Here\'s the exact 4-part formula top creators use.',
    emoji: '✍️',
    color: '#ec4899',
    sections: [
      { heading: 'The 4-Part Caption Formula', body: `Every high-performing caption follows this structure:\n\n[HOOK] → [VALUE] → [STORY / PROOF] → [CTA]\n\nMaster this and every caption you write will outperform what you wrote before.` },
      { heading: 'Part 1: The Hook (First Line = Everything)', body: `On most platforms, users only see the first 1–2 lines before "...more." Your hook is the only thing standing between a scroll and a stop.\n\nHook formulas that work:\n• The bold claim: "I grew from 0 to 10,000 followers in 90 days. Here's what nobody tells you."\n• The counterintuitive take: "Posting every day is killing your Instagram growth."\n• The question: "What if you could create a week's worth of content in 30 minutes?"\n• The number: "7 caption mistakes you're making right now."\n• The relatable struggle: "Nobody told me running a business would mean becoming a full-time content creator too."\n\nRule: Never start with your brand name. Never start with "We are excited to..."` },
      { heading: 'Part 2: The Value', body: `After the hook, deliver what you promised. This is where you share the tips, the story, the insight, or the offer details. Be specific. Be useful. Be clear.\n\nDO: "Here are the 3 mistakes I made..."\nDON'T: "There are so many things to consider..."` },
      { heading: 'Part 3: Social Proof or Story', body: `People trust people. A short story or a piece of social proof builds credibility and keeps readers reading.\n\nExamples:\n• "One of my clients used this exact template and booked 3 new clients in a week."\n• "When I first started, I made this mistake every single week. Then I..."\n• "Over 2,000 creators are already using ${BRAND}."` },
      { heading: 'Part 4: The CTA (One Clear Action)', body: `Every caption must end with ONE clear call to action. Not two. Not three. One.\n\nBest CTAs by goal:\n• Engagement: "Drop your answer below 👇"\n• Saves: "Save this for later 🔖"\n• Traffic: "Full guide → link in bio"\n• Shares: "Tag someone who needs this"\n• Followers: "Follow for daily tips"\n• Sales: "DM me the word READY to get started"\n\nHashtag strategy: Use 5–15 targeted hashtags. Mix sizes — large, medium, and niche.` },
    ],
  },
  {
    id: 6,
    slug: '30-day-content-calendar',
    category: 'Planning',
    readTime: '7 min',
    title: 'The 30-Day Social Media Content Calendar for Small Businesses',
    excerpt: 'Stop staring at a blank screen every morning. Here\'s a complete 30-day content calendar — with WintAI templates for every single day.',
    emoji: '📅',
    color: '#14b8a6',
    sections: [
      { heading: 'Week 1: Introduce & Educate', body: `Day 1: Brand intro / who we are — Navy Business Cover\nDay 2: Educational tip #1 — Tip Tuesday\nDay 3: Behind-the-scenes — Story Poll\nDay 4: Client testimonial — Testimonial Card\nDay 5: Product highlight — New Product Launch\nDay 6: Question for audience — Ask the Audience\nDay 7: Motivational quote — Bold Quote Card` },
      { heading: 'Week 2: Build Trust & Authority', body: `Day 8: Myth vs Fact — Myth Fact Listicle\nDay 9: How-to tutorial — How-To Thread\nDay 10: Founder story — Founder Friday\nDay 11: Big number stat — Big Number Ideas\nDay 12: This or That poll — This or That\nDay 13: Resource stack — Resource Stack Share\nDay 14: Weekly quote — Micro-Affirmation` },
      { heading: 'Week 3: Promote & Convert', body: `Day 15: Service overview — Service Packages Menu\nDay 16: Limited time offer — Limited Time Offer\nDay 17: Case study — Client Win Spotlight\nDay 18: Before & After — Before & After\nDay 19: Flash sale — Flash Sale\nDay 20: Giveaway — Giveaway Post\nDay 21: CTA-heavy post — Course Launch` },
      { heading: 'Week 4: Engage & Retain', body: `Day 22: Community question — Community Question\nDay 23: Trending topic — Trending Topics\nDay 24: Lead magnet — Free Lead Magnet\nDay 25: Brand values — Brand Values Post\nDay 26: Event promo — Event Countdown\nDay 27: Referral program — Refer & Earn\nDay 28: Thank you post — Thank You Milestone\nDay 29: Month recap — Year in Review Stats\nDay 30: Tease next month — Waitlist Teaser` },
      { heading: 'How to Use This Calendar', body: `1. Open ${BRAND} and batch-create all 30 visuals in one sitting (takes ~2 hours)\n2. Generate captions for each post using the AI caption tool\n3. Schedule posts using your preferred scheduler (Buffer, Later, Hootsuite, Meta Business Suite)\n4. Engage daily — reply to every comment in the first hour after posting\n\nThat's it. Thirty days of professional, branded, engaging content — done.` },
    ],
  },
  {
    id: 7,
    slug: 'flash-sales-giveaways-promos',
    category: 'Sales & Marketing',
    readTime: '5 min',
    title: 'Flash Sales, Giveaways & Promos: The Exact Templates That Drive Sales on Social Media',
    excerpt: 'A single promotional post can generate more revenue than weeks of regular content — when done right. Here\'s how.',
    emoji: '⚡',
    color: '#ef4444',
    sections: [
      { heading: 'The Psychology of a Successful Promo Post', body: `People don't buy because they see a sale. They buy because they trust you, want what you're selling, feel urgency, and see social proof. Your content calendar should be 70% value, 30% promotion for promos to actually work.` },
      { heading: 'Promo Type 1: The Flash Sale', body: `A deep discount for 24–72 hours only. Urgency forces decisions.\n\nBest practices:\n• State the exact end time ("Ends midnight tonight")\n• Show the original price crossed out\n• Lead with the discount amount (e.g., "70% OFF")\n• ONE link in bio\n\n${BRAND} template: Flash Sale — bold design built for maximum urgency\n\nCaption formula: ⚡ [DISCOUNT]% OFF — TODAY ONLY! [Product] + [Benefit] ⏰ Ends at [time] 🛒 Link in bio` },
      { heading: 'Promo Type 2: The Giveaway', body: `Give away your product in exchange for follows, likes, and tags. Tags bring qualified new eyeballs to your profile for free.\n\nBest practices:\n• Prize must be highly relevant to your target audience (not a generic iPad)\n• Keep entry requirements simple (max 3 steps)\n• Set a clear end date\n• Announce the winner publicly for trust\n\n${BRAND} templates: Giveaway Post, Flash Giveaway` },
      { heading: 'Promo Type 3: The Bundle Deal', body: `Package two or more products together at a saving. Higher average order value + customers feel they're getting more for less.\n\nBest practices:\n• Show the individual prices + bundle price\n• Highlight the saving amount clearly\n• Bundle items that naturally go together\n\n${BRAND} template: Bundle Deal` },
      { heading: 'Promo Type 4: The Referral Programme', body: `Reward existing customers for bringing in new ones. Word-of-mouth is the most trusted form of marketing.\n\nBest practices:\n• Make both rewards clear: "YOU get X, THEY get Y"\n• Make sharing as easy as one tap\n• Run it for at least 30 days for momentum\n\n${BRAND} template: Refer & Earn\n\nPromo calendar: Week 1 — value only. Week 2 — soft tease. Week 3 — flash sale. Week 4 — giveaway. Monthly — bundle or referral push.` },
    ],
  },
  {
    id: 8,
    slug: 'personal-branding-101',
    category: 'Branding',
    readTime: '6 min',
    title: 'Personal Branding 101: How to Build a Brand People Remember and Trust',
    excerpt: 'In a world where everyone has a social media account, your personal brand is the reason someone chooses YOU over someone who does exactly the same thing.',
    emoji: '💡',
    color: '#8b5cf6',
    sections: [
      { heading: 'What Is a Personal Brand (Really)?', body: `Your personal brand is not your logo. It's not your Instagram theme. It's what people say about you when you're not in the room. It's the combination of your expertise, your personality, your values, and the consistent way you show up — online and offline.` },
      { heading: 'Step 1: Define Your Brand Pillars', body: `Pick 3–5 topics you'll consistently talk about. They should be things you genuinely know and care about, things your target audience wants to learn, and things that differentiate you from others in your space.\n\nExample pillars for a business coach: Entrepreneurship mindset, Marketing strategy, Work-life balance, Client case studies, Tools & productivity\n\nEvery piece of content you create should touch at least one pillar.` },
      { heading: 'Step 2: Define Your Brand Voice', body: `Your voice is how you sound. It should be consistent across every caption, every comment, every story.\n\nAsk yourself:\n• Are you educational or entertaining (or both)?\n• Are you formal or casual?\n• Are you motivational or practical?\n• Do you use humour? Warmth? Boldness?\n\nWrite 3 words that describe your brand voice and paste them somewhere you can see them.` },
      { heading: 'Step 3: Create a Visual Identity', body: `You don't need a full brand guide. You need:\n• 2 fonts (one for headlines, one for body)\n• 2–3 colours (your brand palette)\n• 1–2 template styles you use consistently\n\nWhen someone scrolls past your post, they should recognise it as yours before they read a word. ${BRAND} makes this easy — pick your templates and apply the same colour theme every week.` },
      { heading: 'Step 4: Tell Your Story', body: `People don't connect with businesses. They connect with people. Share:\n• How you started and why\n• The struggles and failures (these build connection faster than wins)\n• The wins and lessons learned\n• Where you're going and why it matters\n\nUse ${BRAND}'s Founder Friday and Founder's Note templates to build this habit into your weekly content.` },
      { heading: 'Step 5: Show Up Consistently', body: `A personal brand is not built in a week. It's built in showing up week after week, sharing your perspective, helping your audience, and being reliably YOU.\n\nThe biggest mistake people make? Stopping after 30 days because "it's not working." Personal branding is a long game. Play it.` },
    ],
  },
  {
    id: 9,
    slug: 'why-small-businesses-fail',
    category: 'Strategy',
    readTime: '5 min',
    title: 'Why Most Small Businesses Fail at Social Media (And the Simple System That Fixes It)',
    excerpt: 'Every year, thousands of small businesses give up on social media within 6 months. Not because it doesn\'t work. Because they\'re using the wrong system.',
    emoji: '🔧',
    color: '#f97316',
    sections: [
      { heading: 'The 3 Mistakes That Kill Small Business Social Media', body: `Mistake 1: Creating Content From Scratch Every Day\nWhen there's no system, every post is a new creative challenge. You stare at a blank screen and either post something mediocre or don't post at all. The professionals use templates, frameworks, and repeatable content formats.\n\nMistake 2: Treating Every Platform the Same\nCopying the same post to Instagram, Facebook, LinkedIn, and Twitter doesn't work. Each platform has a different audience, algorithm, and content format. One size fits none.\n\nMistake 3: Focusing on Vanity Metrics\n"We got 200 likes!" means nothing if none of those people became customers. Social media should drive real outcomes — leads, email sign-ups, sales, bookings.` },
      { heading: 'Part 1: The Weekly Content Batch (Sundays, 90 minutes)', body: `Every Sunday, create next week's content in one sitting:\n1. Open ${BRAND}\n2. Pick 4–5 templates from your content calendar\n3. Customise all text and brand info\n4. Generate captions with AI\n5. Export all images\n6. Schedule in advance\n\nDone. Your whole week is set before Monday morning.` },
      { heading: 'Part 2: The Content Mix Formula', body: `Every week, post a mix of:\n• 40% Education — Tips, how-tos, myth-busting, resources\n• 30% Connection — Stories, behind-the-scenes, opinions, questions\n• 20% Promotion — Products, services, offers, CTAs\n• 10% Entertainment — Humour, polls, this-or-that, trending topics\n\nThis mix builds trust, grows your audience, AND converts followers into customers.` },
      { heading: 'Part 3: The Daily Engagement Block (15 minutes)', body: `Within the first hour of posting:\n• Reply to every comment\n• Reply to every DM\n• Comment on 5–10 posts in your niche\n\nThe algorithm rewards early engagement. More importantly, real people feel seen — and that builds loyalty that no ad can buy.` },
      { heading: 'What This System Produces in 90 Days', body: `• 2–4× increase in organic reach\n• 3–5× more comments and DMs\n• Steady lead flow from social to email list\n• Regular sales from social media (not just likes)\n\nIt's not magic. It's just showing up with the right system.` },
    ],
  },
  {
    id: 10,
    slug: 'future-of-ai-social-media',
    category: 'Trends & Insights',
    readTime: '6 min',
    title: 'The Future of Social Media Content: How AI Is Changing Everything for Creators & Businesses',
    excerpt: 'The way content is created, distributed, and consumed is changing faster than at any point in history. Here\'s what it means for your business.',
    emoji: '🤖',
    color: '#06b6d4',
    sections: [
      { heading: 'Trend 1: AI-Assisted Creation Is the New Normal', body: `In 2022, using AI to write captions felt like cheating. In 2026, brands that aren't using AI are falling behind. AI tools don't replace creativity — they eliminate the blank page problem.\n\nThe businesses winning on social media today use AI to generate first-draft captions in seconds, repurpose one piece of content into multiple formats, and test multiple hooks simultaneously.\n\nThe businesses losing? Still spending 3 hours writing one caption from scratch.` },
      { heading: 'Trend 2: Visual Templates Have Democratised Great Design', body: `Custom graphic design for every post is dead for small businesses. Professionally designed templates have levelled the playing field.\n\nToday, a solo creator with ${BRAND} can produce content that looks identical to what a major brand produces with a 5-person design team. What matters now is consistency, not custom design.` },
      { heading: 'Trend 3: Authenticity Beats Perfection', body: `Audiences have a finely tuned radar for generic, soulless content. They can feel when something was generated without intention.\n\nThe winning formula in 2026: use AI for efficiency, add humanity for connection. Use ${BRAND} to create your visual in 2 minutes. Then spend 10 minutes adding your real story, your actual opinion, your genuine voice to the caption. That combination is unbeatable.` },
      { heading: 'Trend 4: Short-Form Video Dominates, But Graphics Still Convert', body: `Everyone says "video is king." For reach and discovery, that's true. But here's what the data actually shows:\n\n• Graphics and carousels get saved and shared more than videos\n• Quote cards and infographics get bookmarked as reference material\n• Promotional graphics drive more direct clicks to purchase than promotional videos\n\nThe smart strategy: use video for reach, use ${BRAND} graphics for conversion.` },
      { heading: 'Trend 5: Niche Communities Over Mass Audiences', body: `The era of chasing millions of followers is over. In 2026, 1,000 highly engaged, highly targeted followers are worth more than 100,000 passive ones.\n\n${BRAND}'s 84+ templates cover every niche — from e-commerce to coaching to SaaS to local business — so you can always find content that speaks directly to your specific audience.\n\nThe businesses that will dominate social media in the next 3 years are using AI tools, maintaining consistent visual brands, adding authentic human voice, posting consistently to niche communities, and measuring real business outcomes — not vanity metrics.` },
    ],
  },
];

/* ─── Blog List Page ─────────────────────────────────────────── */
export default function BlogPage() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(BLOGS.map(b => b.category)))];
  const filtered = BLOGS.filter(b => {
    const matchCat  = catFilter === 'All' || b.category === catFilter;
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (selected) return <BlogPost blog={selected} onBack={() => { setSelected(null); window.scrollTo(0, 0); }} />;

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroBadge}>📝 Blog</div>
        <h1 style={s.heroTitle}>Insights, Tips & Guides</h1>
        <p style={s.heroSub}>Grow your social media presence with expert strategies from the {BRAND} team.</p>
        {/* Search */}
        <div style={s.searchWrap}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles..."
            style={s.searchInput}
          />
          <span style={s.searchIcon}>🔍</span>
        </div>
      </div>

      {/* Category pills */}
      <div style={s.cats}>
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{ ...s.catBtn, ...(catFilter === c ? s.catBtnActive : {}) }}>
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={s.grid}>
        {filtered.map(blog => (
          <div key={blog.id} style={s.card} onClick={() => { setSelected(blog); window.scrollTo(0, 0); }}>
            {/* Card top colour banner */}
            <div style={{ ...s.cardBanner, background: `linear-gradient(135deg, ${blog.color}22, ${blog.color}11)`, borderBottom: `3px solid ${blog.color}` }}>
              <span style={{ fontSize: 40 }}>{blog.emoji}</span>
            </div>
            <div style={s.cardBody}>
              <div style={s.cardMeta}>
                <span style={{ ...s.cardCat, color: blog.color, background: blog.color + '15' }}>{blog.category}</span>
                <span style={s.cardTime}>⏱ {blog.readTime}</span>
              </div>
              <h2 style={s.cardTitle}>{blog.title}</h2>
              <p style={s.cardExcerpt}>{blog.excerpt}</p>
              <div style={{ ...s.cardCta, color: blog.color }}>Read article →</div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 20px' }}>
          No articles found for "{search}". <button onClick={() => { setSearch(''); setCatFilter('All'); }} style={{ color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Clear filters</button>
        </div>
      )}

      {/* Footer CTA */}
      <div style={s.footerCta}>
        <h3 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#f8fafc' }}>
          Ready to create content that converts?
        </h3>
        <p style={{ color: '#94a3b8', marginBottom: 20 }}>Try {BRAND} free — no credit card required.</p>
        <a href="/?auth=signup" style={s.ctaBtn}>Try Free Trial →</a>
      </div>
    </div>
  );
}

/* ─── Single Blog Post View ──────────────────────────────────── */
function BlogPost({ blog, onBack }) {
  return (
    <div style={s.page}>
      {/* Back */}
      <button onClick={onBack} style={s.backBtn}>← Back to Blog</button>

      {/* Post header */}
      <div style={{ ...s.postHero, background: `linear-gradient(135deg, ${blog.color}22, transparent)`, borderBottom: `4px solid ${blog.color}` }}>
        <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>{blog.emoji}</span>
        <div style={s.postMeta}>
          <span style={{ ...s.cardCat, color: blog.color, background: blog.color + '15' }}>{blog.category}</span>
          <span style={s.cardTime}>⏱ {blog.readTime} read</span>
          <span style={s.cardTime}>📅 {DATE}</span>
          <span style={s.cardTime}>✍️ {AUTHOR}</span>
        </div>
        <h1 style={s.postTitle}>{blog.title}</h1>
        <p style={s.postExcerpt}>{blog.excerpt}</p>
      </div>

      {/* Sections */}
      <div style={s.postContent}>
        {blog.sections.map((sec, i) => (
          <div key={i} style={s.section}>
            <h2 style={{ ...s.sectionTitle, color: blog.color }}>{sec.heading}</h2>
            <div style={s.sectionBody}>
              {sec.body.split('\n').map((line, j) => (
                line.trim() === ''
                  ? <div key={j} style={{ height: 10 }} />
                  : <p key={j} style={s.para}>{line}</p>
              ))}
            </div>
          </div>
        ))}

        {/* CTA box */}
        <div style={{ ...s.postCta, background: `linear-gradient(135deg, ${blog.color}22, #1e293b)`, borderColor: blog.color + '44' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🚀</div>
          <h3 style={{ color: '#f8fafc', margin: '0 0 6px', fontWeight: 800 }}>Ready to put this into practice?</h3>
          <p style={{ color: '#94a3b8', margin: '0 0 16px', fontSize: 14 }}>
            Create professional social media content in minutes with {BRAND}.
          </p>
          <a href="/?auth=signup" style={{ ...s.ctaBtn, fontSize: 13 }}>Try {BRAND} Free →</a>
        </div>

        {/* Footer */}
        <div style={s.postFooter}>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            {BRAND} · <a href={`https://${WEBSITE}`} style={{ color: '#6366f1' }}>{WEBSITE}</a>
          </div>
          <button onClick={onBack} style={s.backBtn}>← More articles</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */
const s = {
  page:       { background: '#0f172a', minHeight: '100vh', fontFamily: "'Inter',-apple-system,sans-serif", paddingBottom: 60 },
  hero:       { textAlign: 'center', padding: '72px 20px 48px', background: 'linear-gradient(180deg,#1e293b 0%,#0f172a 100%)' },
  heroBadge:  { display: 'inline-block', background: '#6366f122', color: '#818cf8', border: '1px solid #6366f144', padding: '6px 18px', borderRadius: 30, fontSize: 13, fontWeight: 700, marginBottom: 16 },
  heroTitle:  { fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, color: '#f8fafc', margin: '0 0 14px', lineHeight: 1.15 },
  heroSub:    { fontSize: 16, color: '#94a3b8', maxWidth: 540, margin: '0 auto 28px', lineHeight: 1.7 },
  searchWrap: { position: 'relative', maxWidth: 440, margin: '0 auto' },
  searchInput:{ width: '100%', padding: '12px 44px 12px 16px', borderRadius: 30, border: '1.5px solid #334155', background: '#1e293b', color: '#f8fafc', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  searchIcon: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' },
  cats:       { display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 20px 32px', justifyContent: 'center', maxWidth: 900, margin: '0 auto' },
  catBtn:     { padding: '7px 16px', borderRadius: 30, border: '1.5px solid #334155', background: '#1e293b', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  catBtnActive:{ background: '#6366f1', color: '#fff', border: '1.5px solid #6366f1' },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20, padding: '0 20px', maxWidth: 980, margin: '0 auto' },
  card:       { background: '#1e293b', borderRadius: 16, overflow: 'hidden', border: '1px solid #334155', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', display: 'flex', flexDirection: 'column' },
  cardBanner: { height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardBody:   { padding: '16px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' },
  cardMeta:   { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  cardCat:    { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  cardTime:   { fontSize: 11, color: '#64748b' },
  cardTitle:  { fontSize: 15, fontWeight: 800, color: '#f8fafc', margin: '0 0 8px', lineHeight: 1.4 },
  cardExcerpt:{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65, margin: '0 0 16px', flex: 1 },
  cardCta:    { fontSize: 13, fontWeight: 700 },
  footerCta:  { maxWidth: 520, margin: '60px auto 0', background: 'linear-gradient(135deg,#1e293b,#0f172a)', borderRadius: 20, padding: '40px', textAlign: 'center', border: '1px solid #334155' },
  ctaBtn:     { display: 'inline-block', padding: '12px 28px', borderRadius: 30, background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' },
  backBtn:    { background: 'none', border: 'none', color: '#6366f1', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '16px 20px', display: 'block' },
  postHero:   { padding: '48px 20px 40px', maxWidth: 760, margin: '0 auto', textAlign: 'center' },
  postMeta:   { display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 },
  postTitle:  { fontSize: 'clamp(22px,4vw,38px)', fontWeight: 900, color: '#f8fafc', margin: '0 0 14px', lineHeight: 1.2 },
  postExcerpt:{ fontSize: 16, color: '#94a3b8', maxWidth: 620, margin: '0 auto', lineHeight: 1.7 },
  postContent:{ maxWidth: 720, margin: '0 auto', padding: '0 20px' },
  section:    { marginBottom: 36 },
  sectionTitle:{ fontSize: 20, fontWeight: 800, margin: '0 0 10px', lineHeight: 1.3 },
  sectionBody:{ },
  para:       { fontSize: 15, color: '#94a3b8', lineHeight: 1.75, margin: '0 0 6px' },
  postCta:    { borderRadius: 16, padding: '32px', textAlign: 'center', border: '1px solid', marginBottom: 40 },
  postFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid #1e293b', paddingTop: 20 },
};
