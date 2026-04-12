import React, { useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   TEMPLATE TYPES  — 5 distinct content types
═══════════════════════════════════════════════════════════ */
const TEMPLATE_TYPES = [
  {
    id: 'caption',
    emoji: '✍️',
    title: 'Caption Templates',
    description: 'Ready-to-use captions for any niche. Fill the blanks, publish.',
    color: '#6366f1',
    bg: '#eef2ff',
    count: 12,
    tags: ['Product', 'Lifestyle', 'Promo', 'Education'],
  },
  {
    id: 'hashtag',
    emoji: '#️⃣',
    title: 'Hashtag Sets',
    description: 'Curated hashtag bundles by niche and platform to maximize reach.',
    color: '#0ea5e9',
    bg: '#f0f9ff',
    count: 10,
    tags: ['Instagram', 'TikTok', 'LinkedIn', 'YouTube'],
  },
  {
    id: 'script',
    emoji: '🎬',
    title: 'Video Scripts',
    description: 'Full short-form video scripts — hook, body, CTA — ready to record.',
    color: '#f59e0b',
    bg: '#fffbeb',
    count: 8,
    tags: ['Tutorial', 'Story', 'Review', 'Viral'],
  },
  {
    id: 'hook',
    emoji: '🪝',
    title: 'Hook Lines',
    description: 'First-line hooks that stop the scroll. Use them as openers for any post.',
    color: '#ef4444',
    bg: '#fff1f2',
    count: 20,
    tags: ['Curiosity', 'Controversy', 'Question', 'Bold'],
  },
  {
    id: 'cta',
    emoji: '📣',
    title: 'Call-to-Actions',
    description: 'Proven CTAs that drive likes, saves, follows, link clicks, and DMs.',
    color: '#10b981',
    bg: '#ecfdf5',
    count: 15,
    tags: ['Engagement', 'Sales', 'Follow', 'DM'],
  },
];

/* ═══════════════════════════════════════════════════════════
   CAPTION templates
═══════════════════════════════════════════════════════════ */
const CAPTION_TEMPLATES = [
  {
    id: 'c1', label: '🛍️ Product', title: 'New Product Launch',
    preview: '✨ Introducing [Product Name] — the [adjective] way to [benefit].',
    body: `✨ Introducing [Product Name] — the [adjective] way to [benefit].

We've been working on this for [time], and we can't wait for you to try it.

🎯 What makes it special:
• [Feature 1]
• [Feature 2]
• [Feature 3]

👉 Shop now — link in bio.

[Hashtags]`,
    tags: ['#newproduct', '#launch', '#shopnow'],
  },
  {
    id: 'c2', label: '🌿 Lifestyle', title: 'Morning Routine',
    preview: '🌅 My [adjective] morning routine that changed my life.',
    body: `🌅 My [adjective] morning routine that changed my life.

⏰ [Time] — [Activity 1]
⏰ [Time] — [Activity 2]
⏰ [Time] — [Activity 3]
⏰ [Time] — [Activity 4]

The key? [Main tip].

What does YOUR morning look like? Tell me below 👇

[Hashtags]`,
    tags: ['#morningroutine', '#lifestyle', '#selfcare'],
  },
  {
    id: 'c3', label: '📚 Education', title: '3 Tips Format',
    preview: '3 tips to [goal] that nobody talks about 👇',
    body: `3 tips to [goal] that nobody talks about 👇

1️⃣ [Tip 1]
→ [Explanation]

2️⃣ [Tip 2]
→ [Explanation]

3️⃣ [Tip 3]
→ [Explanation]

Save this for later 🔖

Which tip was most helpful? Comment below!

[Hashtags]`,
    tags: ['#tips', '#howto', '#learneveryday'],
  },
  {
    id: 'c4', label: '🔥 Promo', title: 'Flash Sale',
    preview: '⚡ FLASH SALE — [X]% OFF for the next [time]!',
    body: `⚡ FLASH SALE — [X]% OFF for the next [time]!

This is your sign to finally grab [Product Name].

✅ [Benefit 1]
✅ [Benefit 2]
✅ [Benefit 3]

Use code [CODE] at checkout. Link in bio 🔗

Only [X] left — don't miss out!

[Hashtags]`,
    tags: ['#sale', '#discount', '#limitedtime'],
  },
  {
    id: 'c5', label: '💪 Motivation', title: 'Transformation Story',
    preview: '6 months ago I was [past]. Today I [present].',
    body: `6 months ago I was [past state].
Today I [current state].

Here's what changed:
🔑 [Key change 1]
🔑 [Key change 2]
🔑 [Key change 3]

It wasn't easy. But [motivating lesson].

If you're still in your [past state] era — keep going. 👊

[Hashtags]`,
    tags: ['#transformation', '#motivation', '#journey'],
  },
  {
    id: 'c6', label: '🎁 Giveaway', title: 'Giveaway Post',
    preview: '🎁 GIVEAWAY! Win [prize] — here\'s how to enter.',
    body: `🎁 GIVEAWAY! Win [prize] worth $[value]!

To enter:
1️⃣ Follow @[account]
2️⃣ Like this post
3️⃣ Tag [number] friends in the comments

🎉 Winner announced on [date].
Open to: [location/everyone]

Good luck! 🍀

[Hashtags]`,
    tags: ['#giveaway', '#win', '#contest'],
  },
  {
    id: 'c7', label: '🎬 Behind Scenes', title: 'Process Reveal',
    preview: '🎬 Here\'s how I make [thing] — from start to finish.',
    body: `🎬 Here's how I make [thing] — from start to finish.

Step 1: [Step description]
Step 2: [Step description]
Step 3: [Step description]
Final result: [Outcome] ✨

Total time: [Duration]
Hardest part: [Challenge]

Which step surprised you? 👇

[Hashtags]`,
    tags: ['#behindthescenes', '#process', '#howimade'],
  },
  {
    id: 'c8', label: '❓ Engagement', title: 'This or That',
    preview: '[Option A] or [Option B]? Drop your answer 👇',
    body: `[Option A] or [Option B]?

I'm a [your answer] person, but I get both sides.

[Option A] people: [trait/reason]
[Option B] people: [trait/reason]

Drop your answer below 👇 Let's see which side wins!

[Hashtags]`,
    tags: ['#thisor that', '#poll', '#debate'],
  },
  {
    id: 'c9', label: '🧠 Did You Know', title: 'Surprising Fact',
    preview: '🧠 Did you know that [surprising fact]?',
    body: `🧠 Did you know that [surprising fact]?

Most people think [common misconception], but the truth is [real fact].

Here's why it matters:
• [Reason 1]
• [Reason 2]

Share this if it blew your mind 🤯

[Hashtags]`,
    tags: ['#didyouknow', '#facts', '#mindblown'],
  },
  {
    id: 'c10', label: '🔥 Hot Take', title: 'Controversial Opinion',
    preview: '🔥 Unpopular opinion: [your opinion]. Hear me out 👇',
    body: `🔥 Unpopular opinion: [your opinion].

Hear me out 👇

[Argument 1]
[Argument 2]
[Argument 3]

Agree or disagree? Be honest — I can take it 😅

[Hashtags]`,
    tags: ['#unpopularopinion', '#hottake', '#debate'],
  },
  {
    id: 'c11', label: '📅 Day in Life', title: 'Day in My Life',
    preview: '📅 A day in my life as a [role/title].',
    body: `📅 A day in my life as a [role/title].

🌅 Morning: [Activity]
☀️ Afternoon: [Activity]
🌙 Evening: [Activity]

Funniest moment of the day: [funny thing]

Follow for more of my [theme] life! ✨

[Hashtags]`,
    tags: ['#dayinmylife', '#vlog', '#lifestyle'],
  },
  {
    id: 'c12', label: '💭 Mindset', title: 'Mindset Shift',
    preview: '💭 Stop saying "[negative]". Start saying "[positive]".',
    body: `💭 Stop saying "[negative phrase]".
Start saying "[positive phrase]".

The words you use shape the life you live.

❌ [Negative phrase] → [Negative consequence]
✅ [Positive phrase] → [Positive result]

Small shift. Big difference. 💥

Save this as a reminder 🔖

[Hashtags]`,
    tags: ['#mindset', '#affirmations', '#growthmindset'],
  },
];

/* ═══════════════════════════════════════════════════════════
   HASHTAG SETS
═══════════════════════════════════════════════════════════ */
const HASHTAG_SETS = [
  { id: 'h1', label: '📸 Instagram', title: 'General Lifestyle', tags: ['#lifestyle', '#dailylife', '#instagood', '#photooftheday', '#motivation', '#love', '#happy', '#inspiration', '#life', '#style', '#mood', '#vibes', '#instadaily', '#explore', '#trending'] },
  { id: 'h2', label: '🎵 TikTok', title: 'Viral / Trending', tags: ['#fyp', '#foryou', '#foryoupage', '#viral', '#trending', '#tiktokviral', '#tiktok', '#learnontiktok', '#trend', '#xyzbca'] },
  { id: 'h3', label: '🛍️ E-commerce', title: 'Product / Shop', tags: ['#shopnow', '#newproduct', '#productlaunch', '#smallbusiness', '#shoplocal', '#handmade', '#etsy', '#onlineshopping', '#deals', '#sale', '#discount', '#buynow', '#limitedoffer'] },
  { id: 'h4', label: '💼 LinkedIn', title: 'Business & Career', tags: ['#entrepreneur', '#business', '#leadership', '#career', '#networking', '#success', '#growth', '#innovation', '#startup', '#mindset', '#personaldevelopment', '#professionaldevelopment'] },
  { id: 'h5', label: '💪 Fitness', title: 'Health & Wellness', tags: ['#fitness', '#gym', '#workout', '#fitnessmotivation', '#health', '#healthy', '#training', '#bodybuilding', '#fitlife', '#exercise', '#gains', '#personaltrainer', '#nutrition', '#wellness'] },
  { id: 'h6', label: '🍕 Food', title: 'Food & Recipe', tags: ['#food', '#foodie', '#foodphotography', '#recipe', '#cooking', '#homemade', '#delicious', '#instafood', '#yummy', '#chef', '#foodblogger', '#eatwell', '#foodlover', '#mealprep'] },
  { id: 'h7', label: '✈️ Travel', title: 'Travel & Adventure', tags: ['#travel', '#wanderlust', '#travelgram', '#adventure', '#explore', '#vacation', '#travelphotography', '#instatravel', '#traveltheworld', '#travellife', '#roadtrip', '#backpacker'] },
  { id: 'h8', label: '🎓 Education', title: 'Learning & Tips', tags: ['#education', '#learning', '#tips', '#howto', '#tutorial', '#knowledge', '#studygram', '#learneveryday', '#facts', '#didyouknow', '#selfimprovement', '#growthmindset'] },
  { id: 'h9', label: '💄 Beauty', title: 'Beauty & Fashion', tags: ['#beauty', '#makeup', '#fashion', '#style', '#skincare', '#ootd', '#fashionblogger', '#beautytips', '#glam', '#selfcare', '#fashionista', '#model', '#outfitoftheday'] },
  { id: 'h10', label: '📱 Tech', title: 'Tech & AI', tags: ['#tech', '#technology', '#ai', '#artificialintelligence', '#startup', '#software', '#coding', '#developer', '#innovation', '#futuretech', '#machinelearning', '#programming', '#buildinpublic'] },
];

/* ═══════════════════════════════════════════════════════════
   VIDEO SCRIPTS
═══════════════════════════════════════════════════════════ */
const SCRIPT_TEMPLATES = [
  {
    id: 's1', label: '📖 Tutorial', title: 'How-To Tutorial',
    preview: 'Hook → teach 3 steps → recap → CTA',
    body: `🎬 HOOK (0–3s):
"[Bold statement OR question that creates curiosity]"

📌 INTRO (3–8s):
"In this video I'm going to show you exactly how to [result] in [timeframe]."

📚 STEP 1 (8–25s):
"First, [action]. The reason this works is [explanation]."

📚 STEP 2 (25–40s):
"Next, [action]. Most people skip this — don't. [Why it matters]."

📚 STEP 3 (40–55s):
"Finally, [action]. This is the step that ties everything together."

✅ RECAP (55–65s):
"So to recap: [Step 1], [Step 2], [Step 3]."

📣 CTA (65–75s):
"If this helped, follow for more [topic] content every week. Drop a 🔖 if you're saving this."`,
    tags: ['#tutorial', '#howto', '#learnontiktok'],
  },
  {
    id: 's2', label: '📣 Product Review', title: 'Honest Product Review',
    preview: 'First impression → test → verdict → CTA',
    body: `🎬 HOOK (0–3s):
"I bought [Product] so you don't have to. Here's my honest opinion."

📌 CONTEXT (3–10s):
"I've been using [Product] for [duration]. Here's what I expected vs what I actually got."

👀 FIRST IMPRESSION (10–25s):
"Out of the box: [what it looks/feels like]. My first thought was [reaction]."

🧪 REAL TEST (25–50s):
"After [duration] of real use: [specific result / issue / surprise].
The best part? [Highlight].
The worst part? [Honest downside]."

⭐ VERDICT (50–65s):
"Is it worth it? [Yes/No/Depends]. I'd recommend it if [condition]. Skip it if [condition]."

📣 CTA (65–75s):
"Have you tried it? Let me know in the comments. And follow for more honest reviews."`,
    tags: ['#review', '#honest', '#productreview'],
  },
  {
    id: 's3', label: '🔥 Viral Story', title: 'Story-Driven Viral Video',
    preview: 'Setup → conflict → resolution → lesson',
    body: `🎬 HOOK (0–3s):
"[Start mid-story] '...and that's when I realized I had made a huge mistake.'"

📖 SETUP (3–15s):
"So it started when [context — keep it simple]. I thought [assumption]."

⚡ CONFLICT (15–35s):
"But then [twist or problem happened]. I remember thinking [emotion/reaction].
[Add a relatable or funny detail here to keep engagement]."

💡 RESOLUTION (35–55s):
"Here's what I did: [action]. And honestly? [Outcome — surprising or satisfying]."

🎓 LESSON (55–65s):
"What I learned: [takeaway in one sentence]."

📣 CTA (65–75s):
"Has something like this ever happened to you? Comment below — I read every one."`,
    tags: ['#storytime', '#viral', '#relatable'],
  },
  {
    id: 's4', label: '💡 Tips Video', title: 'Quick Tips (Listicle)',
    preview: 'Hook → 5 fast tips → save CTA',
    body: `🎬 HOOK (0–3s):
"[Number] things about [topic] that changed everything for me."

📌 SETUP (3–7s):
"These are [quick/easy/free] and most people have no idea about them."

💡 TIP 1 (7–18s):
"[Tip 1]: [one-line explanation]. Why? [Brief reason]."

💡 TIP 2 (18–28s):
"[Tip 2]: [explanation]. This one alone [specific result]."

💡 TIP 3 (28–38s):
"[Tip 3]: [explanation]. Seriously underrated."

💡 TIP 4 (38–48s):
"[Tip 4]: [explanation]. Most people do the opposite."

💡 TIP 5 (48–58s):
"[Tip 5]: [explanation]. Save this one — you'll thank me later."

📣 CTA (58–68s):
"Which tip are you trying first? Comment the number below 👇 Follow for more."`,
    tags: ['#tips', '#hacks', '#quicktips'],
  },
  {
    id: 's5', label: '🪝 POV / Relatable', title: 'POV Relatable Moment',
    preview: 'Relatable POV setup → funny/real moment → tag someone CTA',
    body: `🎬 HOOK (0–3s):
"POV: You're [relatable situation]"

😂 SCENE (3–30s):
[Show or describe the relatable scenario — the more specific, the better]

"You know that feeling when [emotion]? That's exactly what [happened]."

[Add the twist, funny detail, or realness here — this is where engagement happens]

💬 CONNECTION (30–50s):
"If you've ever [relatable action], this is for you."

📣 CTA (50–60s):
"Tag someone who needs to see this 👇 And follow if you felt personally attacked by this video."`,
    tags: ['#pov', '#relatable', '#fyp'],
  },
  {
    id: 's6', label: '📣 Brand Promo', title: 'Product/Brand Promo',
    preview: 'Pain point → solution (your product) → offer → CTA',
    body: `🎬 HOOK (0–3s):
"If you're tired of [pain point], this is for you."

😩 PAIN POINT (3–12s):
"Most people dealing with [problem] try [common solution]. But here's the issue: [why it fails]."

✨ SOLUTION (12–35s):
"That's why we created [Product/Brand]. It [main benefit] without [the downside].
Here's how it works: [simple 1-2 sentence explanation]."

🏆 PROOF (35–50s):
"Since using it, [result/testimonial/stat]. [Specific outcome] in [timeframe]."

🎁 OFFER (50–62s):
"Right now you can get [offer/discount]. Link in bio — [urgency if any]."

📣 CTA (62–70s):
"Questions? Drop them below. Follow us for more [niche] content."`,
    tags: ['#ad', '#sponsored', '#promo'],
  },
  {
    id: 's7', label: '🎤 Talking Head', title: 'Opinion / Hot Take',
    preview: 'Bold claim → argument → counter → conclusion',
    body: `🎬 HOOK (0–3s):
"[Controversial or bold statement]. I said what I said."

📌 CONTEXT (3–10s):
"Here's why I think [opinion], and why it matters for [audience]."

💬 ARGUMENT 1 (10–25s):
"First: [Point]. Think about it — [supporting detail or example]."

💬 ARGUMENT 2 (25–40s):
"Second: [Point]. And before you say [common counter] — [rebuttal]."

💬 ARGUMENT 3 (40–55s):
"And finally: [Point]. This is the one most people miss."

🏁 CONCLUSION (55–65s):
"So yeah. [Restate opinion]. If you disagree, I want to hear it."

📣 CTA (65–73s):
"Drop your take in the comments. Follow if you like [unpopular/honest/real] takes."`,
    tags: ['#opinion', '#hottake', '#realtalk'],
  },
  {
    id: 's8', label: '🌱 Transformation', title: 'Before & After Journey',
    preview: 'Where I was → the turning point → where I am now',
    body: `🎬 HOOK (0–3s):
"[Time period] ago I was [past state]. This is what changed."

📖 BEFORE (3–18s):
"I was [honest description of past situation]. I felt [emotion]. I tried [what didn't work] and nothing stuck."

⚡ TURNING POINT (18–35s):
"Then [event/decision/discovery happened]. I decided to [action taken]. The first thing I did was [first step]."

🌟 THE JOURNEY (35–52s):
"It wasn't linear. There were days I [struggle]. But the thing that kept me going was [motivation]."

✅ AFTER (52–65s):
"Today, [current result]. I [what's different now]. And honestly? [Reflection]."

📣 CTA (65–75s):
"If you're at the start of your journey, drop ❤️ below. Follow for the full story."`,
    tags: ['#transformation', '#glow up', '#journey'],
  },
];

/* ═══════════════════════════════════════════════════════════
   HOOK LINES
═══════════════════════════════════════════════════════════ */
const HOOK_TEMPLATES = [
  { id: 'hk1',  label: '🤔 Curiosity',    title: 'The Curiosity Hook',    preview: 'I learned something about [topic] that completely changed how I think about it.',        body: 'I learned something about [topic] that completely changed how I think about it.' },
  { id: 'hk2',  label: '🤔 Curiosity',    title: 'Nobody Talks About',   preview: 'Nobody talks about the [fact/issue] with [topic]. So I will.',                            body: 'Nobody talks about the [fact/issue] with [topic]. So I will.' },
  { id: 'hk3',  label: '❓ Question',     title: 'Direct Question',       preview: 'What if I told you that [surprising claim]?',                                            body: 'What if I told you that [surprising claim]?' },
  { id: 'hk4',  label: '❓ Question',     title: 'Are You Making This?',  preview: 'Are you making this [topic] mistake without even knowing it?',                          body: 'Are you making this [topic] mistake without even knowing it?' },
  { id: 'hk5',  label: '🔥 Bold Claim',   title: 'Strong Statement',      preview: '[Controversial opinion]. And I\'m not sorry about it.',                                  body: '[Controversial opinion]. And I\'m not sorry about it.' },
  { id: 'hk6',  label: '🔥 Bold Claim',   title: 'The Hard Truth',        preview: 'The hard truth about [topic] that nobody wants to admit:',                              body: 'The hard truth about [topic] that nobody wants to admit:' },
  { id: 'hk7',  label: '😂 Funny',        title: 'Relatable Humor',       preview: 'Me before [thing] vs me after [thing] 😭',                                              body: 'Me before [thing] vs me after [thing] 😭' },
  { id: 'hk8',  label: '😂 Funny',        title: 'Self-Roast',            preview: 'Hiring a [role] vs doing it yourself. I was NOT prepared.',                            body: 'Hiring a [role] vs doing it yourself. I was NOT prepared.' },
  { id: 'hk9',  label: '😱 Shocking',     title: 'Surprising Number',     preview: '[Number]% of people don\'t know that [surprising fact]. Are you one of them?',          body: '[Number]% of people don\'t know that [surprising fact]. Are you one of them?' },
  { id: 'hk10', label: '😱 Shocking',     title: 'Story Mid-Start',       preview: 'So there I was, [dramatic situation], and I had [time] to fix it.',                    body: 'So there I was, [dramatic situation], and I had [time] to fix it.' },
  { id: 'hk11', label: '💡 Value',        title: 'The Payoff Promise',    preview: 'By the end of this, you\'ll know exactly how to [desired result]. Let\'s go.',          body: 'By the end of this, you\'ll know exactly how to [desired result]. Let\'s go.' },
  { id: 'hk12', label: '💡 Value',        title: 'The List Tease',        preview: '[Number] things I wish I knew about [topic] before I started.',                         body: '[Number] things I wish I knew about [topic] before I started.' },
  { id: 'hk13', label: '🎯 Specific',     title: 'For a Specific Person', preview: 'This is specifically for people who [specific situation].',                            body: 'This is specifically for people who [specific situation].' },
  { id: 'hk14', label: '🎯 Specific',     title: 'Time-Specific',         preview: 'If you\'re trying to [goal] in [timeframe], watch this.',                               body: 'If you\'re trying to [goal] in [timeframe], watch this.' },
  { id: 'hk15', label: '⚠️ Warning',      title: 'Stop Doing This',       preview: 'Stop doing [common thing]. Here\'s why it\'s [hurting/wasting/costing] you.',           body: 'Stop doing [common thing]. Here\'s why it\'s [hurting/wasting/costing] you.' },
  { id: 'hk16', label: '⚠️ Warning',      title: 'The Mistake',           preview: 'I made a $[amount] mistake with [topic] so you don\'t have to.',                        body: 'I made a $[amount] mistake with [topic] so you don\'t have to.' },
  { id: 'hk17', label: '✨ Aspiration',   title: 'Dream Outcome',         preview: 'Imagine [ideal outcome]. That\'s what [product/habit/skill] can do.',                   body: 'Imagine [ideal outcome]. That\'s what [product/habit/skill] can do.' },
  { id: 'hk18', label: '✨ Aspiration',   title: 'The Glow-Up',           preview: '[Timeframe] from now, you could [amazing result]. Here\'s the exact path.',             body: '[Timeframe] from now, you could [amazing result]. Here\'s the exact path.' },
  { id: 'hk19', label: '🔁 Pattern Break', title: 'Expectation Flip',     preview: 'Everyone says [common advice]. I tried it. Here\'s what actually happened.',           body: 'Everyone says [common advice]. I tried it. Here\'s what actually happened.' },
  { id: 'hk20', label: '🔁 Pattern Break', title: 'Counterintuitive',     preview: 'The MORE you [common action], the LESS you [desired result]. Here\'s why.',             body: 'The MORE you [common action], the LESS you [desired result]. Here\'s why.' },
];

/* ═══════════════════════════════════════════════════════════
   CALL-TO-ACTIONS
═══════════════════════════════════════════════════════════ */
const CTA_TEMPLATES = [
  { id: 'ct1',  label: '❤️ Engagement', title: 'Like + Save',         preview: 'Like this if it helped, and save it for when you need it later.',           body: 'Like this if it helped, and save it for when you need it later.' },
  { id: 'ct2',  label: '❤️ Engagement', title: 'Double Tap',          preview: 'Double tap if you needed to hear this today 💛',                           body: 'Double tap if you needed to hear this today 💛' },
  { id: 'ct3',  label: '❤️ Engagement', title: 'Comment Prompt',      preview: 'Drop a [emoji] in the comments if this resonated with you!',               body: 'Drop a [emoji] in the comments if this resonated with you!' },
  { id: 'ct4',  label: '👥 Follow',     title: 'Follow for More',     preview: 'Follow for more [topic] content every [frequency].',                        body: 'Follow for more [topic] content every [frequency].' },
  { id: 'ct5',  label: '👥 Follow',     title: 'Follow + Benefit',    preview: 'Follow @[handle] if you want [specific benefit] — I post every [day].',     body: 'Follow @[handle] if you want [specific benefit] — I post every [day].' },
  { id: 'ct6',  label: '🔗 Link in Bio', title: 'Shop Link',          preview: 'Get yours now — link in bio 🔗',                                           body: 'Get yours now — link in bio 🔗' },
  { id: 'ct7',  label: '🔗 Link in Bio', title: 'Resource Link',      preview: 'Full guide linked in my bio — it\'s free 👆',                               body: 'Full guide linked in my bio — it\'s free 👆' },
  { id: 'ct8',  label: '📩 DM',         title: 'DM for Info',         preview: 'DM me "[keyword]" and I\'ll send you the [resource/link/info] directly.',   body: 'DM me "[keyword]" and I\'ll send you the [resource/link/info] directly.' },
  { id: 'ct9',  label: '📩 DM',         title: 'DM to Chat',          preview: 'Want to chat about [topic]? DM me "let\'s talk" — I reply to everyone.',   body: 'Want to chat about [topic]? DM me "let\'s talk" — I reply to everyone.' },
  { id: 'ct10', label: '📤 Share',      title: 'Tag a Friend',        preview: 'Tag someone who needs to see this 👇',                                     body: 'Tag someone who needs to see this 👇' },
  { id: 'ct11', label: '📤 Share',      title: 'Send to Someone',     preview: 'Send this to a friend who is going through [situation] right now.',         body: 'Send this to a friend who is going through [situation] right now.' },
  { id: 'ct12', label: '💰 Sales',      title: 'Urgency Close',       preview: 'Only [X] spots left at this price. Link in bio before it\'s gone.',         body: 'Only [X] spots left at this price. Link in bio before it\'s gone.' },
  { id: 'ct13', label: '💰 Sales',      title: 'Free Trial CTA',      preview: 'Try [Product] free for [X] days — no credit card needed. Link in bio.',    body: 'Try [Product] free for [X] days — no credit card needed. Link in bio.' },
  { id: 'ct14', label: '💬 Comment',    title: 'Question to Comment', preview: 'What\'s your biggest struggle with [topic]? Drop it below 👇',              body: 'What\'s your biggest struggle with [topic]? Drop it below 👇' },
  { id: 'ct15', label: '💬 Comment',    title: 'Vote in Comments',    preview: 'Comment "A" for [option A] or "B" for [option B] — let\'s vote!',           body: 'Comment "A" for [option A] or "B" for [option B] — let\'s vote!' },
];

const TYPE_DATA = {
  caption: CAPTION_TEMPLATES,
  hashtag: HASHTAG_SETS,
  script:  SCRIPT_TEMPLATES,
  hook:    HOOK_TEMPLATES,
  cta:     CTA_TEMPLATES,
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function CaptionTemplates({ onBack, onUseTemplate }) {
  const [activeType, setActiveType] = useState(null); // null = home screen
  const [search,     setSearch]     = useState('');
  const [copiedId,   setCopiedId]   = useState(null);
  const [previewId,  setPreviewId]  = useState(null);

  const typeConfig = activeType ? TEMPLATE_TYPES.find(t => t.id === activeType) : null;
  const items      = activeType ? (TYPE_DATA[activeType] || []) : [];

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    return !q || item.title.toLowerCase().includes(q) || item.preview.toLowerCase().includes(q) || (item.tags || []).some(t => t.toLowerCase().includes(q));
  });

  const handleCopy = (item) => {
    const text = activeType === 'hashtag'
      ? item.tags.join(' ')
      : item.body || item.preview;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUse = (item) => {
    const text = activeType === 'hashtag'
      ? item.tags.join(' ')
      : (item.body || item.preview);
    if (onUseTemplate) onUseTemplate(text);
    if (onBack) onBack();
  };

  const goBack = () => {
    if (activeType) { setActiveType(null); setSearch(''); setPreviewId(null); }
    else if (onBack) onBack();
  };

  const previewItem = previewId != null ? items.find(i => i.id === previewId) : null;

  /* ── HOME ── */
  if (!activeType) {
    return (
      <div style={s.page}>
        <div style={s.headerRow}>
          <button type="button" onClick={onBack} style={s.backBtn}>← Back</button>
          <div>
            <h2 style={s.heading}>📋 Templates</h2>
            <p style={s.sub}>Choose a template type to get started</p>
          </div>
        </div>

        <div style={s.typeGrid}>
          {TEMPLATE_TYPES.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveType(t.id)}
              style={{ ...s.typeCard, borderColor: t.color + '33', '--hover-border': t.color }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.boxShadow = `0 4px 20px ${t.color}22`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.color + '33'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ ...s.typeEmoji, background: t.bg, color: t.color }}>{t.emoji}</div>
              <div style={s.typeTitle}>{t.title}</div>
              <div style={s.typeDesc}>{t.description}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, margin: '12px 0' }}>
                {t.tags.map(tg => (
                  <span key={tg} style={{ ...s.typePill, background: t.bg, color: t.color }}>{tg}</span>
                ))}
              </div>
              <div style={{ ...s.typeCount, color: t.color, background: t.bg }}>
                {t.count} templates →
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── TEMPLATE LIST ── */
  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.headerRow}>
        <button type="button" onClick={goBack} style={s.backBtn}>← Back</button>
        <div>
          <h2 style={s.heading}>{typeConfig?.emoji} {typeConfig?.title}</h2>
          <p style={s.sub}>{typeConfig?.description}</p>
        </div>
      </div>

      {/* Search */}
      <div style={s.searchWrap}>
        <span style={s.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search templates…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={s.searchInput}
        />
        {search && <button type="button" onClick={() => setSearch('')} style={s.clearBtn}>✕</button>}
      </div>

      {/* Grid */}
      <div style={activeType === 'hook' || activeType === 'cta' ? s.listGrid : s.grid}>
        {filtered.length === 0 && (
          <div style={s.empty}>No templates match your search.</div>
        )}

        {filtered.map(item => {
          const isHashtag = activeType === 'hashtag';
          const isHookCta = activeType === 'hook' || activeType === 'cta';
          const tc = typeConfig;

          if (isHookCta) {
            /* ── Compact row for hooks / CTAs ── */
            return (
              <div key={item.id} style={{ ...s.rowCard, borderLeftColor: tc.color }}>
                <span style={{ ...s.rowBadge, background: tc.bg, color: tc.color }}>{item.label}</span>
                <div style={s.rowTitle}>{item.title}</div>
                <div style={s.rowPreview}>"{item.preview}"</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="button" onClick={() => handleCopy(item)} style={{ ...s.smBtn, ...s.smGhost }}>
                    {copiedId === item.id ? '✅ Copied' : '📋 Copy'}
                  </button>
                  <button type="button" onClick={() => handleUse(item)} style={{ ...s.smBtn, background: tc.color, color: '#fff', border: 'none' }}>
                    Use →
                  </button>
                </div>
              </div>
            );
          }

          if (isHashtag) {
            /* ── Hashtag card ── */
            return (
              <div key={item.id} style={s.card}>
                <span style={{ ...s.rowBadge, background: tc.bg, color: tc.color, marginBottom: 6, display: 'inline-block' }}>{item.label}</span>
                <div style={s.cardTitle}>{item.title}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '10px 0 14px' }}>
                  {item.tags.map(tg => (
                    <span key={tg} style={s.hashTag}>{tg}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button type="button" onClick={() => handleCopy(item)} style={{ ...s.smBtn, ...s.smGhost, flex: 1 }}>
                    {copiedId === item.id ? '✅ Copied' : '📋 Copy All'}
                  </button>
                  <button type="button" onClick={() => handleUse(item)} style={{ ...s.smBtn, flex: 1, background: tc.color, color: '#fff', border: 'none' }}>
                    Use →
                  </button>
                </div>
              </div>
            );
          }

          /* ── Caption / Script card ── */
          return (
            <div key={item.id} style={s.card}>
              <span style={{ ...s.rowBadge, background: tc.bg, color: tc.color, marginBottom: 8, display: 'inline-block' }}>{item.label}</span>
              <div style={s.cardTitle}>{item.title}</div>
              <div style={s.cardPreview}>{item.preview}</div>

              {item.tags && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0 12px' }}>
                  {item.tags.map(tg => <span key={tg} style={s.hashTag}>{tg}</span>)}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                <button type="button" onClick={() => setPreviewId(previewId === item.id ? null : item.id)} style={{ ...s.smBtn, ...s.smGhost, flex: 1 }}>
                  {previewId === item.id ? 'Hide' : '👁 Preview'}
                </button>
                <button type="button" onClick={() => handleCopy(item)} style={{ ...s.smBtn, ...s.smGhost, flex: 1 }}>
                  {copiedId === item.id ? '✅ Copied' : '📋 Copy'}
                </button>
                <button type="button" onClick={() => handleUse(item)} style={{ ...s.smBtn, flex: 1, background: tc.color, color: '#fff', border: 'none' }}>
                  Use →
                </button>
              </div>

              {previewId === item.id && (
                <pre style={s.previewBox}>{item.body}</pre>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal preview */}
      {previewItem && (
        <div style={s.overlay} onClick={() => setPreviewId(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{previewItem.title}</h3>
              <button type="button" onClick={() => setPreviewId(null)} style={s.closeBtn}>✕</button>
            </div>
            <pre style={{ ...s.previewBox, maxHeight: '58vh', overflowY: 'auto', marginBottom: 14 }}>
              {previewItem.body}
            </pre>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => handleCopy(previewItem)} style={{ ...s.smBtn, ...s.smGhost, flex: 1, padding: '10px' }}>
                {copiedId === previewItem.id ? '✅ Copied!' : '📋 Copy'}
              </button>
              <button type="button" onClick={() => handleUse(previewItem)} style={{ ...s.smBtn, flex: 1, padding: '10px', background: typeConfig?.color, color: '#fff', border: 'none' }}>
                Use This Template →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const s = {
  page:       { maxWidth: 1100, margin: '0 auto', padding: '24px 20px 60px', fontFamily: 'inherit' },
  headerRow:  { display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 },
  backBtn:    { padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', marginTop: 2 },
  heading:    { margin: 0, fontSize: 22, fontWeight: 800, color: '#1e293b' },
  sub:        { margin: '4px 0 0', fontSize: 13, color: '#64748b' },

  /* Type cards (home) */
  typeGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 },
  typeCard:   { background: '#fff', border: '2px solid #e2e8f0', borderRadius: 16, padding: '22px 20px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s, box-shadow 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  typeEmoji:  { width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 14 },
  typeTitle:  { fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 6 },
  typeDesc:   { fontSize: 13, color: '#64748b', lineHeight: 1.5 },
  typePill:   { fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999 },
  typeCount:  { fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 8, display: 'inline-block', marginTop: 4 },

  /* Template grids */
  grid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 18 },
  listGrid: { display: 'flex', flexDirection: 'column', gap: 12 },

  /* Cards */
  card:     { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  cardTitle:  { fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 6 },
  cardPreview:{ fontSize: 13, color: '#475569', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },

  /* Row cards (hooks/CTAs) */
  rowCard:   { background: '#fff', border: '1.5px solid #e2e8f0', borderLeft: '4px solid', borderRadius: 10, padding: '14px 16px' },
  rowBadge:  { fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999 },
  rowTitle:  { fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '4px 0 4px' },
  rowPreview:{ fontSize: 13, color: '#475569', fontStyle: 'italic', lineHeight: 1.5 },

  hashTag:   { fontSize: 11, color: '#6366f1', background: '#eef2ff', padding: '2px 7px', borderRadius: 5, fontWeight: 600 },
  previewBox:{ marginTop: 12, padding: '14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12, color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontFamily: 'inherit' },

  smBtn:     { padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.12s', textAlign: 'center' },
  smGhost:   { border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569' },

  searchWrap:  { position: 'relative', marginBottom: 20 },
  searchIcon:  { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' },
  searchInput: { width: '100%', padding: '10px 36px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#f8fafc', boxSizing: 'border-box' },
  clearBtn:    { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 13, padding: '2px 4px' },
  empty:       { textAlign: 'center', color: '#94a3b8', padding: '48px 0', fontSize: 14 },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 },
  modal:   { background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 540, boxShadow: '0 20px 50px rgba(0,0,0,0.25)' },
  closeBtn:{ padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#64748b', fontSize: 14, cursor: 'pointer' },
};
