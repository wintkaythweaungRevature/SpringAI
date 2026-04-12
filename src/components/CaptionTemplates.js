import React, { useState } from 'react';

const CATS = ['All','Business','Sale','Content','Holiday','Product','Quote','Event','Announce'];
const PW = 780, PH = 440, CW = 300, CH = 170;
const SC = CW / PW; // ≈ 0.3846

/* ══════════════════════════════════════════════════════════
   PREVIEW COMPONENTS  — each renders at 780×440
══════════════════════════════════════════════════════════ */

function NavyBizCover() {
  return (
    <div style={{width:PW,height:PH,background:'#1a3a5c',display:'flex',alignItems:'center',padding:'0 64px',gap:48,fontFamily:'Arial,sans-serif',boxSizing:'border-box'}}>
      <div style={{flex:1,color:'#fff'}}>
        <div style={{color:'#8ecde8',fontSize:16,marginBottom:10}}>📱 yourhandle &nbsp;•&nbsp; 📧 yourbusiness@gmail.com</div>
        <div style={{fontSize:64,fontWeight:900,lineHeight:1,marginBottom:12,letterSpacing:-2}}>your<br/>business<br/>name</div>
        <div style={{color:'#8ecde8',fontSize:14,marginTop:18,letterSpacing:1}}>www.yourwebsite.com</div>
      </div>
      <div style={{width:190,height:310,background:'#243d5e',borderRadius:14,overflow:'hidden',flexShrink:0,display:'flex',alignItems:'flex-end',justifyContent:'center',position:'relative'}}>
        <div style={{width:95,height:250,background:'#4a80aa',borderRadius:'48px 48px 0 0'}}/>
        <div style={{position:'absolute',top:50,left:'50%',transform:'translateX(-50%)',width:64,height:64,background:'#3a6a90',borderRadius:'50%'}}/>
      </div>
    </div>
  );
}

function WhiteBrand() {
  return (
    <div style={{width:PW,height:PH,background:'#f8f9fc',display:'flex',alignItems:'center',padding:'0 64px',gap:48,fontFamily:'Arial,sans-serif',boxSizing:'border-box',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',right:-100,top:-100,width:460,height:460,borderRadius:'50%',background:'#dde8f5'}}/>
      <div style={{width:190,height:190,borderRadius:'50%',background:'#b8d0e8',flexShrink:0,zIndex:1,overflow:'hidden',display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
        <div style={{width:84,height:160,background:'#7fafd0',borderRadius:'42px 42px 0 0'}}/>
      </div>
      <div style={{flex:1,zIndex:1}}>
        <div style={{fontSize:15,color:'#8090a0',letterSpacing:3,textTransform:'uppercase',marginBottom:4}}>YOUR AMAZING</div>
        <div style={{fontSize:54,fontWeight:900,color:'#1a3a5c',lineHeight:1.05,marginBottom:8}}>Business<br/>Name</div>
        <div style={{fontSize:15,color:'#8090a0',marginBottom:20}}>by Your Name</div>
        <div style={{fontSize:13,color:'#555',marginBottom:16}}>📱 yourhandle &nbsp;&nbsp; 📧 youremail@gmail.com</div>
        <div style={{borderTop:'2px solid #1a3a5c',paddingTop:10,fontSize:13,color:'#1a3a5c',fontWeight:700,letterSpacing:1}}>www.yourwebsite.com</div>
      </div>
    </div>
  );
}

function DigitalExpert() {
  return (
    <div style={{width:PW,height:PH,display:'flex',fontFamily:'Arial,sans-serif',overflow:'hidden'}}>
      <div style={{flex:1,background:'#9ab5cc',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:190,height:370,background:'#7095b5',borderRadius:'95px 95px 0 0'}}/>
        <div style={{position:'absolute',bottom:240,left:'50%',transform:'translateX(-50%) translateY(-50%)',width:90,height:90,background:'#5c80a5',borderRadius:'50%'}}/>
      </div>
      <div style={{width:390,background:'#1a3a5c',padding:'60px 44px',display:'flex',flexDirection:'column',justifyContent:'center',color:'#fff',boxSizing:'border-box'}}>
        <div style={{fontSize:13,color:'#7fc4e8',letterSpacing:2,marginBottom:16}}>📱 YOURHANDLE &nbsp; 📧 EMAIL@GMAIL.COM</div>
        <div style={{fontSize:44,fontWeight:900,lineHeight:1.15,marginBottom:10}}>Digital<br/>Marketing<br/><span style={{color:'#7fc4e8'}}>Manager</span></div>
        <div style={{fontSize:16,color:'#c0d8ec',marginBottom:24}}>Business Development</div>
        <div style={{borderTop:'1px solid #2d5580',paddingTop:18,fontSize:13,color:'#7fc4e8'}}>www.yourwebsite.com</div>
      </div>
    </div>
  );
}

function ThanksgivingSale() {
  return (
    <div style={{width:PW,height:PH,display:'flex',fontFamily:'Arial,sans-serif',overflow:'hidden'}}>
      <div style={{width:270,background:'#3a8fa0',padding:'50px 36px',display:'flex',flexDirection:'column',justifyContent:'center',color:'#fff',boxSizing:'border-box',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',bottom:-60,right:-60,width:180,height:180,borderRadius:'50%',background:'rgba(255,255,255,0.07)'}}/>
        <div style={{fontSize:26,fontWeight:800,marginBottom:2}}>Thanksgiving</div>
        <div style={{fontSize:40,fontWeight:900,marginBottom:18}}>SALE</div>
        <div style={{fontSize:13,color:'#c8eef7',marginBottom:4}}>up to</div>
        <div style={{fontSize:90,fontWeight:900,lineHeight:0.85,color:'#fff'}}>30<span style={{fontSize:44}}>%</span></div>
        <div style={{fontSize:20,color:'#c8eef7',marginBottom:24}}>off</div>
        <div style={{fontSize:11,color:'#a0dded',borderTop:'1px solid rgba(255,255,255,0.25)',paddingTop:12}}>www.youramazingwebsite.com</div>
      </div>
      <div style={{flex:1,background:'#f5f0eb',padding:'50px 44px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:20,right:20,width:210,height:210,background:'#e0d5c8',borderRadius:'50%'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{fontSize:14,color:'#666',lineHeight:1.9,marginBottom:20}}>
            Croissant pastry dessert marzipan sesame snaps.<br/>
            Biscuit marzipan candy canes cotton candy icing.<br/>
            Tootsie roll jelly-o sweet roll.
          </div>
          <div style={{width:80,height:4,background:'#3a8fa0',borderRadius:2}}/>
        </div>
      </div>
    </div>
  );
}

function LimitedOffer() {
  return (
    <div style={{width:PW,height:PH,background:'#f5f8fc',fontFamily:'Arial,sans-serif',position:'relative',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:'60%',background:'#3a8fa0',borderRadius:'0 0 55% 55%'}}/>
      <div style={{position:'relative',zIndex:1,textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',width:'100%'}}>
        <div style={{color:'rgba(255,255,255,0.85)',fontSize:20,letterSpacing:4,marginBottom:4}}>LIMITED TIME</div>
        <div style={{color:'#fff',fontSize:96,fontWeight:900,lineHeight:0.9,marginBottom:0}}>OFFER</div>
        <div style={{marginTop:30,background:'#fff',borderRadius:'20px 20px 0 0',padding:'28px 52px 0',width:400,boxSizing:'border-box',boxShadow:'0 -8px 24px rgba(0,0,0,0.08)'}}>
          <div style={{fontSize:14,color:'#666',marginBottom:20,lineHeight:1.7}}>Croissant pastry dessert marzipan sesame snaps.<br/>Biscuit marzipan candy canes cotton candy icing.</div>
          <div style={{background:'#3a8fa0',color:'#fff',padding:'14px 36px',borderRadius:8,display:'inline-block',fontWeight:700,fontSize:16,letterSpacing:2}}>CTA GOES HERE</div>
        </div>
      </div>
    </div>
  );
}

function EasterSale() {
  return (
    <div style={{width:PW,height:PH,background:'#f5f0e8',fontFamily:'Arial,sans-serif',overflow:'hidden',display:'flex',alignItems:'center',position:'relative'}}>
      <div style={{position:'absolute',left:0,top:0,width:'52%',height:'100%',background:'#4a9bb5',clipPath:'polygon(0 0,85% 0,70% 100%,0 100%)'}}/>
      <div style={{position:'relative',zIndex:1,width:340,padding:'0 44px',color:'#fff',boxSizing:'border-box'}}>
        <div style={{fontSize:13,letterSpacing:4,marginBottom:10,opacity:0.8}}>COMING SOON</div>
        <div style={{fontSize:32,fontWeight:800,marginBottom:2}}>Easter Sunday</div>
        <div style={{fontSize:58,fontWeight:900,marginBottom:20,lineHeight:1}}>SALE</div>
        <div style={{fontSize:13,color:'#c8eaf7',marginBottom:22,lineHeight:1.7}}>Croissant pastry dessert marzipan sesame snaps. Biscuit marzipan candy canes.</div>
        <div style={{borderTop:'1px solid rgba(255,255,255,0.35)',paddingTop:14,fontSize:14,color:'#c8eaf7',fontWeight:600}}>Brush up on all our latest products →</div>
      </div>
      <div style={{position:'absolute',right:0,top:0,width:'43%',height:'100%',display:'grid',gridTemplateColumns:'1fr 1fr',gridTemplateRows:'1fr 1fr',gap:8,padding:8,boxSizing:'border-box'}}>
        <div style={{background:'#d4a890',borderRadius:10}}/>
        <div style={{background:'#7abdd9',borderRadius:10}}/>
        <div style={{background:'#a8c8b0',borderRadius:10}}/>
        <div style={{background:'#d4b8a0',borderRadius:10}}/>
      </div>
    </div>
  );
}

function BigNumber() {
  return (
    <div style={{width:PW,height:PH,background:'#fff',fontFamily:'Arial,sans-serif',overflow:'hidden',display:'flex',alignItems:'center',position:'relative'}}>
      <div style={{position:'absolute',top:0,right:0,width:'56%',height:'100%',background:'#e8f4f8',clipPath:'polygon(16% 0,100% 0,100% 100%,0 100%)'}}/>
      <div style={{paddingLeft:56,zIndex:1,position:'relative'}}>
        <div style={{fontSize:220,fontWeight:900,color:'#1a3a5c',lineHeight:0.85,opacity:0.1,position:'absolute',top:'50%',left:30,transform:'translateY(-50%)'}}>42</div>
        <div style={{fontSize:170,fontWeight:900,color:'#1a3a5c',lineHeight:0.9,position:'relative',zIndex:1}}>42</div>
      </div>
      <div style={{position:'absolute',right:48,zIndex:1,width:320}}>
        <div style={{fontSize:44,fontWeight:800,color:'#2e7d9e',lineHeight:1.2,marginBottom:14}}>Social Media<br/>Post Ideas</div>
        <div style={{fontSize:14,color:'#888',lineHeight:1.8}}>Biscuit lollipop jelly-o cake cookie caramels. Brownie donut muffin biscuit jelly is sweet.</div>
      </div>
    </div>
  );
}

function UltimateGuide() {
  return (
    <div style={{width:PW,height:PH,display:'flex',fontFamily:'Arial,sans-serif',overflow:'hidden'}}>
      <div style={{width:430,background:'#1a3a5c',padding:'56px 48px',display:'flex',flexDirection:'column',justifyContent:'center',color:'#fff',boxSizing:'border-box'}}>
        <div style={{fontSize:12,color:'#7fc4e8',letterSpacing:2,marginBottom:14}}>THE ULTIMATE GUIDE</div>
        <div style={{fontSize:46,fontWeight:900,lineHeight:1.1,marginBottom:10}}>Pinterest<br/><span style={{color:'#7fc4e8'}}>Marketing</span></div>
        <div style={{fontSize:18,color:'#c0d8ec',fontStyle:'italic',marginBottom:24}}>The Ultimate Guide</div>
        <div style={{fontSize:13,color:'#a0c8e0',lineHeight:1.8,marginBottom:24}}>Croissant pastry dessert marzipan sesame snaps. Biscuit marzipan candy canes cotton candy icing.</div>
        <div style={{fontSize:13,color:'#7fc4e8',fontWeight:600}}>www.youramazingwebsite.com</div>
      </div>
      <div style={{flex:1,background:'#e0cfc2',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-50,right:-50,width:220,height:220,borderRadius:'50%',background:'rgba(26,58,92,0.12)'}}/>
        <div style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:220,height:370,background:'#c4b0a0',borderRadius:'110px 110px 0 0'}}/>
        <div style={{position:'absolute',bottom:250,left:'50%',transform:'translateX(-50%)',width:84,height:84,background:'#a89080',borderRadius:'50%'}}/>
      </div>
    </div>
  );
}

function BloggingTips() {
  return (
    <div style={{width:PW,height:PH,background:'#fff',fontFamily:'Arial,sans-serif',overflow:'hidden',display:'flex'}}>
      <div style={{width:260,background:'#d4c8bc',position:'relative',overflow:'hidden',flexShrink:0}}>
        <div style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:160,height:330,background:'#c0b0a0',borderRadius:'80px 80px 0 0'}}/>
        <div style={{position:'absolute',bottom:230,left:'50%',transform:'translateX(-50%)',width:72,height:72,background:'#a89080',borderRadius:'50%'}}/>
      </div>
      <div style={{flex:1,padding:'52px 48px',boxSizing:'border-box'}}>
        <div style={{fontSize:30,fontWeight:800,color:'#1a3a5c',marginBottom:6}}>Blogging Tips</div>
        <div style={{fontSize:18,color:'#2e7d9e',marginBottom:24}}>for Beginners</div>
        <div style={{fontSize:13,color:'#666',lineHeight:1.9,marginBottom:24}}>
          Jelly-o cheesecake cookie donut soufflé.<br/>
          Biscuit marzipan candy canes tootsie roll.<br/>
          Sweet roll jelly-o candy is sweet.
        </div>
        {[1,2,3].map(i => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <div style={{width:26,height:26,borderRadius:'50%',background:'#2e7d9e',color:'#fff',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,flexShrink:0}}>{i}</div>
            <div style={{height:10,background:'#e8f4f8',borderRadius:5,flex:1}}/>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeDecorPost() {
  return (
    <div style={{width:PW,height:PH,background:'#f5f0eb',fontFamily:'Arial,sans-serif',overflow:'hidden',display:'flex',alignItems:'center',padding:'0 56px',gap:48,boxSizing:'border-box'}}>
      <div style={{flexShrink:0,textAlign:'center'}}>
        <div style={{fontSize:160,fontWeight:900,color:'#1a3a5c',lineHeight:1}}>15</div>
        <div style={{fontSize:24,fontWeight:700,color:'#2e7d9e',lineHeight:1.3,maxWidth:160}}>Home<br/>Decor<br/>Ideas</div>
        <div style={{fontSize:13,color:'#888',marginTop:10,maxWidth:160,lineHeight:1.5}}>The best ways to organize your space</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gridTemplateRows:'1fr 1fr',gap:10,width:260,height:260,flexShrink:0}}>
        <div style={{background:'#c8b8a8',borderRadius:10}}/>
        <div style={{background:'#9cc4b8',borderRadius:10}}/>
        <div style={{background:'#d4a880',borderRadius:10}}/>
        <div style={{background:'#b8c8d8',borderRadius:10}}/>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:14,color:'#666',lineHeight:1.9}}>Biscuit lollipop jelly muffin soufflé sweet roll toffee. Candy cotton candy canes icing bear claw.</div>
      </div>
    </div>
  );
}

function CourseLaunch() {
  return (
    <div style={{width:PW,height:PH,background:'#1a3a5c',fontFamily:'Arial,sans-serif',overflow:'hidden',display:'flex',alignItems:'center',padding:'0 56px',gap:48,boxSizing:'border-box'}}>
      <div style={{flex:1,color:'#fff'}}>
        <div style={{fontSize:13,color:'#7fc4e8',letterSpacing:2,marginBottom:10}}>✨ INTRODUCING</div>
        <div style={{fontSize:16,color:'#c0d8ec',marginBottom:2}}>Your Amazing</div>
        <div style={{fontSize:56,fontWeight:900,lineHeight:1,marginBottom:16}}>COURSE<br/><span style={{color:'#7fc4e8'}}>LAUNCH</span></div>
        <div style={{fontSize:13,color:'#a0c8e0',lineHeight:1.8,marginBottom:24}}>Everything you need to achieve your goal and transform your career or business.</div>
        <div style={{background:'#2e7d9e',color:'#fff',padding:'13px 28px',borderRadius:8,display:'inline-block',fontSize:14,fontWeight:700,letterSpacing:1}}>ENROLL NOW →</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:16,flexShrink:0}}>
        <div style={{width:220,height:140,background:'#4a7ab5',borderRadius:14,overflow:'hidden',display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
          <div style={{width:90,height:120,background:'#6a9ad5',borderRadius:'45px 45px 0 0'}}/>
        </div>
        <div style={{width:220,height:140,background:'#2d5a8a',borderRadius:14,overflow:'hidden',display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
          <div style={{width:90,height:120,background:'#4a7ab5',borderRadius:'45px 45px 0 0'}}/>
        </div>
      </div>
    </div>
  );
}

function NewProduct() {
  return (
    <div style={{width:PW,height:PH,fontFamily:'Arial,sans-serif',overflow:'hidden',position:'relative',background:'#0f2a45'}}>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#0f2a45 0%,#1e5080 55%,#0f2a45 100%)'}}/>
      <div style={{position:'absolute',top:-100,right:-100,width:360,height:360,borderRadius:'50%',background:'rgba(100,180,230,0.08)'}}/>
      <div style={{position:'absolute',bottom:-80,left:-80,width:290,height:290,borderRadius:'50%',background:'rgba(100,180,230,0.06)'}}/>
      <div style={{position:'relative',zIndex:1,display:'flex',alignItems:'center',height:'100%',padding:'0 64px',boxSizing:'border-box'}}>
        <div style={{color:'#fff',maxWidth:540}}>
          <div style={{fontSize:14,color:'#7fc4e8',letterSpacing:3,marginBottom:14}}>✦ NEW ARRIVAL ✦</div>
          <div style={{fontSize:76,fontWeight:900,lineHeight:0.88,marginBottom:14,background:'linear-gradient(90deg,#ffffff,#7fc4e8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Product<br/>Launch</div>
          <div style={{fontSize:16,color:'#a0c8e0',marginBottom:34,lineHeight:1.6}}>The perfect solution for your audience. Built to deliver real results.</div>
          <div style={{display:'flex',gap:16}}>
            <div style={{background:'#2e7d9e',color:'#fff',padding:'13px 32px',borderRadius:8,fontWeight:700,fontSize:14,letterSpacing:1}}>SHOP NOW</div>
            <div style={{border:'2px solid #4a9bc0',color:'#7fc4e8',padding:'13px 26px',borderRadius:8,fontWeight:600,fontSize:14}}>Learn More</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TEMPLATE DATA
══════════════════════════════════════════════════════════ */
const TEMPLATES = [
  {
    id:'nb1', name:'Navy Business Cover', category:'Business', Preview:NavyBizCover,
    caption:`✨ Elevating [Your Niche] one step at a time.\n\nBehind every great brand is a story worth telling — here's ours.\n\nWe help [target audience] achieve [goal] without [pain point].\n\n🔗 Link in bio\n\n#[yourniche] #business #branding #[yourname]`,
  },
  {
    id:'wb2', name:'Clean White Brand', category:'Business', Preview:WhiteBrand,
    caption:`Welcome to [Your Amazing Business Name] 🌟\n\nWe help [target audience] achieve [goal] without [pain point].\n\n👉 Follow for daily [topic] tips\n🔗 Link in bio for [your offer]\n\n#[yourniche] #[yourbrand] #business #[industry]`,
  },
  {
    id:'dm3', name:'Digital Expert Banner', category:'Business', Preview:DigitalExpert,
    caption:`Your go-to [role] for [niche] 💼\n\nHelping businesses grow through [strategy/service].\n\n📌 What I offer:\n• [Service 1]\n• [Service 2]\n• [Service 3]\n\nReady to level up? DM me or click the link in bio 🚀\n\n#digitalmarketing #business #marketing #[niche]`,
  },
  {
    id:'ts4', name:'Thanksgiving Sale', category:'Sale', Preview:ThanksgivingSale,
    caption:`🔥 [HOLIDAY] SALE — Up to 30% OFF!\n\n[Brief description of items on sale]\n\n⏰ Limited time only — ends [date]\n🛍️ Shop now → link in bio\n\nUse code SAVE30 at checkout!\n\n#sale #discount #shopping #[yourniche]`,
  },
  {
    id:'lo5', name:'Limited Time Offer', category:'Sale', Preview:LimitedOffer,
    caption:`⏰ LIMITED TIME OFFER — Don't miss this!\n\n[Product/Service Name] is [X]% off for the next [timeframe].\n\n✅ [Benefit 1]\n✅ [Benefit 2]\n✅ [Benefit 3]\n\n👉 Tap the link in bio to grab it now!\n\n#limitedoffer #sale #[yourniche] #deal`,
  },
  {
    id:'es6', name:'Easter / Holiday Sale', category:'Holiday', Preview:EasterSale,
    caption:`🎉 [HOLIDAY] SALE — Shop our biggest sale of the season!\n\nBrush up on all our latest products and treat yourself 🛍️\n\n[Top 3 products on sale]\n\n🔗 Shop link in bio\n\n#[holiday]sale #[yourniche] #sale #discount`,
  },
  {
    id:'bn7', name:'Big Number Ideas', category:'Content', Preview:BigNumber,
    caption:`✨ 42 Social Media Post Ideas you can use RIGHT NOW!\n\nSave this for later 🔖 — come back whenever you need fresh content inspiration.\n\nMy top 3 favorites:\n1️⃣ [Idea 1]\n2️⃣ [Idea 2]\n3️⃣ [Idea 3]\n\n👇 Drop your favorite content type below!\n\n#contentcreator #socialmediatips #contentideas #marketing`,
  },
  {
    id:'ug8', name:'Ultimate Guide', category:'Content', Preview:UltimateGuide,
    caption:`📖 The Ultimate [Topic] Guide — everything you need to know!\n\nI've compiled my best tips into this guide:\n\n📌 [Key Point 1]\n📌 [Key Point 2]\n📌 [Key Point 3]\n📌 [Key Point 4]\n\nSave this post and share with someone who needs it! 🔖\n\n#[topic]guide #tips #[niche] #education`,
  },
  {
    id:'bt9', name:'Blogging Tips', category:'Content', Preview:BloggingTips,
    caption:`✍️ Blogging Tips for Beginners 🖊️\n\nThe exact strategies I used to grow from 0 to [number] monthly readers:\n\n1. [Tip 1]\n2. [Tip 2]\n3. [Tip 3]\n4. [Tip 4]\n5. [Tip 5]\n\n📌 Save this post — you'll thank yourself later!\n\n#blogging #bloggingtips #contentcreator #writing`,
  },
  {
    id:'hd10', name:'Home Decor Ideas', category:'Content', Preview:HomeDecorPost,
    caption:`🏠 15 [Topic] Ideas to [transform/upgrade] your [life/home/routine]!\n\nMy absolute favorites:\n\n1. [Idea 1]\n2. [Idea 2]\n3. [Idea 3]\n\n📸 Which one will you try first? Comment below! 👇\n💾 Save this for later!\n\n#[topic]ideas #[niche] #tips #inspiration`,
  },
  {
    id:'cl11', name:'Course Launch', category:'Product', Preview:CourseLaunch,
    caption:`🎓 YOUR AMAZING COURSE LAUNCH IS HERE!\n\n[Course Name] — the complete [topic] course for [target audience].\n\n✅ [Module/Benefit 1]\n✅ [Module/Benefit 2]\n✅ [Module/Benefit 3]\n\n🔥 Enrollment NOW OPEN — limited spots available!\n👉 Tap the link in bio to join\n\n#course #[niche] #courselaunch #onlinelearning`,
  },
  {
    id:'np12', name:'New Product Launch', category:'Product', Preview:NewProduct,
    caption:`🚀 INTRODUCING [Product Name] — the [adjective] way to [key benefit]!\n\nWe've been working on this for [time] and can't wait for you to try it.\n\n⭐ [Feature 1]\n⭐ [Feature 2]\n⭐ [Feature 3]\n\n🛍️ Available now → link in bio\n\n#newproduct #productlaunch #[brand] #[niche]`,
  },
  {
    id:'mq13', name:'Motivational Quote', category:'Quote', Preview:MotivationalQuote,
    caption:`💫 "[Your motivational quote here]"\n\n— [Author / Your Name]\n\nSave this for when you need a reminder 🔖\n\nWhich part resonates with you most? Drop it in the comments 👇\n\n#motivation #mindset #quotes #inspiration #[yourniche]`,
  },
  {
    id:'bq14', name:'Bold Quote Card', category:'Quote', Preview:BoldQuoteCard,
    caption:`❝ [Your bold quote here] ❞\n\nThis is something I truly believe in. It changed how I approach [topic].\n\nDouble tap if this hit different 💛\nShare with someone who needs to hear this today!\n\n#quote #motivation #[niche] #mindset #dailyquote`,
  },
  {
    id:'wp15', name:'Webinar / Live Event', category:'Event', Preview:WebinarPromo,
    caption:`🎙️ FREE WEBINAR ALERT!\n\nJoin me LIVE for [Topic] — I'll be covering:\n\n✅ [Key Topic 1]\n✅ [Key Topic 2]\n✅ [Key Topic 3]\n\n📅 Date: [Date]\n⏰ Time: [Time] [Timezone]\n🔗 Register free → link in bio\n\nSpots are limited — grab yours now!\n\n#webinar #free #[niche] #livetraining #[topic]`,
  },
  {
    id:'gv16', name:'Giveaway Post', category:'Announce', Preview:GiveawayPost,
    caption:`🎁 GIVEAWAY TIME! We're giving away [prize]!\n\nTo enter:\n❤️ Like this post\n👥 Tag 2 friends in the comments\n🔔 Follow our page\n\n🏆 Winner announced on [date]!\n\nGood luck everyone! Share to spread the word 🎉\n\n#giveaway #win #free #[niche] #contest`,
  },
  {
    id:'ba17', name:'Before & After', category:'Content', Preview:BeforeAfter,
    caption:`The transformation is REAL 🔥\n\nBEFORE: [describe the before state]\nAFTER: [describe the amazing result]\n\nThis didn't happen overnight — it took [timeframe] of [effort/method].\n\nWant to know exactly how? Drop "INFO" in the comments and I'll DM you! 👇\n\n#beforeandafter #transformation #[niche] #results`,
  },
  {
    id:'tr18', name:'Testimonial / Review', category:'Business', Preview:TestimonialCard,
    caption:`⭐⭐⭐⭐⭐ Real results from a real client!\n\n"[Client testimonial quote]"\n— [Client Name], [Title]\n\nThis is WHY we do what we do. Helping [target audience] achieve [result] is our mission.\n\nWant results like this? 👇\n🔗 Link in bio to get started\n\n#testimonial #results #clientlove #[niche] #review`,
  },
  {
    id:'fs19', name:'Flash Sale', category:'Sale', Preview:FlashSale,
    caption:`⚡ FLASH SALE — TODAY ONLY!\n\nUp to 70% OFF — this deal disappears in [X] hours!\n\n🔥 [Product/Service 1] — [discount]% off\n🔥 [Product/Service 2] — [discount]% off\n🔥 [Product/Service 3] — [discount]% off\n\n⏰ Ends at midnight. No extensions.\n🛍️ Shop now → link in bio\n\n#flashsale #sale #limiteddeal #[niche] #todayonly`,
  },
  {
    id:'pa20', name:'Big Announcement', category:'Announce', Preview:ProductAnnounce,
    caption:`🎉 BIG ANNOUNCEMENT — Something amazing is coming!\n\nWe've been working on this for months and we're ALMOST ready.\n\nHere's a hint: it's going to help you [key benefit] faster than ever before.\n\n🔔 Turn on notifications so you don't miss the reveal!\n💬 Drop your guesses below 👇\n\n#announcement #comingsoon #[brand] #[niche] #excited`,
  },
  {
    id:'sv21', name:'Summer / Seasonal', category:'Holiday', Preview:SummerVibes,
    caption:`☀️ Summer is HERE and so are our deals!\n\nShop our summer collection and [key benefit] this season:\n\n🌊 [Product/Offer 1]\n🌺 [Product/Offer 2]\n🏖️ [Product/Offer 3]\n\nUse code SUMMER[XX] for [X]% off at checkout!\n🔗 Link in bio\n\n#summer #summervibes #[niche] #seasonal #sale`,
  },
  {
    id:'ec22', name:'Event Countdown', category:'Event', Preview:EventCountdown,
    caption:`🌟 [EVENT NAME] is happening and YOU'RE invited!\n\n📅 Date: [Month Day, Year]\n⏰ Time: [X:XX PM Timezone]\n📍 Where: [Location / Online]\n\nWhat to expect:\n✨ [Highlight 1]\n✨ [Highlight 2]\n✨ [Highlight 3]\n\n🎟️ Reserve your spot → link in bio\nSpots are filling up FAST!\n\n#event #[eventname] #[niche] #joinus #RSVP`,
  },
];

/* ══════════════════════════════════════════════════════════
   EXTRA PREVIEW COMPONENTS
══════════════════════════════════════════════════════════ */

function MotivationalQuote() {
  return (
    <div style={{width:PW,height:PH,background:'#0f172a',fontFamily:'Georgia,serif',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:-80,left:-80,width:320,height:320,borderRadius:'50%',background:'rgba(99,102,241,0.12)'}}/>
      <div style={{position:'absolute',bottom:-60,right:-60,width:260,height:260,borderRadius:'50%',background:'rgba(99,102,241,0.08)'}}/>
      <div style={{position:'relative',zIndex:1,textAlign:'center',padding:'0 80px',maxWidth:680}}>
        <div style={{fontSize:80,color:'#6366f1',lineHeight:0.6,marginBottom:16,fontFamily:'serif'}}>"</div>
        <div style={{fontSize:34,color:'#f1f5f9',lineHeight:1.5,fontStyle:'italic',marginBottom:24}}>The best time to start was yesterday. The next best time is right now.</div>
        <div style={{fontSize:80,color:'#6366f1',lineHeight:0.6,transform:'rotate(180deg)',display:'inline-block',marginBottom:20,fontFamily:'serif'}}>"</div>
        <div style={{borderTop:'1px solid rgba(99,102,241,0.4)',paddingTop:16,fontSize:16,color:'#94a3b8',letterSpacing:2}}>— [Your Name / Brand]</div>
      </div>
    </div>
  );
}

function BoldQuoteCard() {
  return (
    <div style={{width:PW,height:PH,display:'flex',fontFamily:'Arial,sans-serif',overflow:'hidden'}}>
      <div style={{width:16,background:'#f59e0b',flexShrink:0}}/>
      <div style={{flex:1,background:'#fffbeb',padding:'56px 64px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
        <div style={{fontSize:100,color:'#f59e0b',lineHeight:0.7,marginBottom:10,fontFamily:'Georgia,serif'}}>❝</div>
        <div style={{fontSize:36,fontWeight:800,color:'#1e293b',lineHeight:1.4,marginBottom:28}}>Done is better than perfect. Start before you feel ready.</div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{width:52,height:52,borderRadius:'50%',background:'#fde68a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>✨</div>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:'#1e293b'}}>[Your Name]</div>
            <div style={{fontSize:13,color:'#f59e0b',fontWeight:600}}>@[yourhandle]</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WebinarPromo() {
  return (
    <div style={{width:PW,height:PH,background:'#0f172a',fontFamily:'Arial,sans-serif',overflow:'hidden',position:'relative',display:'flex',alignItems:'center'}}>
      <div style={{position:'absolute',top:0,right:0,width:'45%',height:'100%',background:'linear-gradient(135deg,#312e81,#4f46e5)',clipPath:'polygon(20% 0,100% 0,100% 100%,0 100%)'}}/>
      <div style={{position:'absolute',right:60,top:'50%',transform:'translateY(-50%)',zIndex:1,textAlign:'center'}}>
        <div style={{width:160,height:160,borderRadius:'50%',background:'rgba(255,255,255,0.1)',border:'2px dashed rgba(255,255,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:60}}>📅</div>
      </div>
      <div style={{position:'relative',zIndex:1,padding:'0 60px',maxWidth:460,color:'#fff'}}>
        <div style={{fontSize:13,color:'#a5b4fc',letterSpacing:3,marginBottom:14}}>FREE WEBINAR</div>
        <div style={{fontSize:44,fontWeight:900,lineHeight:1.1,marginBottom:16}}>Join Us<br/><span style={{color:'#a5b4fc'}}>Live!</span></div>
        <div style={{fontSize:15,color:'#cbd5e1',marginBottom:24,lineHeight:1.6}}>[Topic] — Everything you need to know about [subject].</div>
        <div style={{display:'flex',gap:16,marginBottom:24}}>
          <div style={{background:'rgba(165,180,252,0.15)',border:'1px solid #a5b4fc',borderRadius:8,padding:'10px 18px',fontSize:13,color:'#a5b4fc',fontWeight:600}}>📅 [Date]</div>
          <div style={{background:'rgba(165,180,252,0.15)',border:'1px solid #a5b4fc',borderRadius:8,padding:'10px 18px',fontSize:13,color:'#a5b4fc',fontWeight:600}}>⏰ [Time]</div>
        </div>
        <div style={{background:'#4f46e5',color:'#fff',padding:'13px 28px',borderRadius:8,display:'inline-block',fontWeight:700,fontSize:14,letterSpacing:1}}>REGISTER FREE →</div>
      </div>
    </div>
  );
}

function GiveawayPost() {
  return (
    <div style={{width:PW,height:PH,background:'#fdf2f8',fontFamily:'Arial,sans-serif',overflow:'hidden',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'absolute',top:-100,left:'50%',transform:'translateX(-50%)',width:500,height:500,borderRadius:'50%',background:'rgba(236,72,153,0.08)'}}/>
      <div style={{position:'absolute',top:30,right:40,fontSize:60,opacity:0.15}}>🎁</div>
      <div style={{position:'absolute',bottom:30,left:40,fontSize:50,opacity:0.12}}>🎉</div>
      <div style={{position:'relative',zIndex:1,textAlign:'center',padding:'0 60px'}}>
        <div style={{fontSize:18,color:'#db2777',letterSpacing:4,fontWeight:700,marginBottom:8}}>✨ WE'RE CELEBRATING ✨</div>
        <div style={{fontSize:90,fontWeight:900,color:'#be185d',lineHeight:0.9,marginBottom:10,background:'linear-gradient(135deg,#db2777,#9333ea)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>GIVE<br/>AWAY</div>
        <div style={{fontSize:16,color:'#6b21a8',fontWeight:600,marginBottom:20}}>Prize: [What you're giving away]</div>
        <div style={{display:'flex',justifyContent:'center',gap:20,fontSize:14,color:'#9333ea',fontWeight:600}}>
          <span>❤️ Like this post</span>
          <span>👥 Tag a friend</span>
          <span>🔔 Follow us</span>
        </div>
      </div>
    </div>
  );
}

function BeforeAfter() {
  return (
    <div style={{width:PW,height:PH,fontFamily:'Arial,sans-serif',overflow:'hidden',display:'flex',position:'relative'}}>
      <div style={{flex:1,background:'#94a3b8',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',padding:'0 0 30px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{width:120,height:240,background:'#64748b',borderRadius:'60px 60px 0 0',marginTop:60}}/>
          <div style={{position:'absolute',top:60,width:60,height:60,background:'#475569',borderRadius:'50%'}}/>
        </div>
        <div style={{position:'relative',zIndex:1,background:'rgba(0,0,0,0.55)',color:'#fff',padding:'8px 28px',borderRadius:6,fontSize:18,fontWeight:800,letterSpacing:2}}>BEFORE</div>
      </div>
      <div style={{width:6,background:'#fff',zIndex:10,position:'relative'}}>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:36,height:36,background:'#fff',borderRadius:'50%',boxShadow:'0 2px 8px rgba(0,0,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#334155'}}>↔</div>
      </div>
      <div style={{flex:1,background:'#4a9bb5',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',padding:'0 0 30px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{width:130,height:260,background:'#2e7d9e',borderRadius:'65px 65px 0 0',marginTop:40}}/>
          <div style={{position:'absolute',top:50,width:65,height:65,background:'#1a5f7a',borderRadius:'50%'}}/>
        </div>
        <div style={{position:'relative',zIndex:1,background:'rgba(0,0,0,0.55)',color:'#fff',padding:'8px 28px',borderRadius:6,fontSize:18,fontWeight:800,letterSpacing:2}}>AFTER</div>
      </div>
    </div>
  );
}

function TestimonialCard() {
  return (
    <div style={{width:PW,height:PH,background:'#f8fafc',fontFamily:'Arial,sans-serif',overflow:'hidden',display:'flex',alignItems:'center',padding:'0 64px',gap:56,boxSizing:'border-box'}}>
      <div style={{flex:1}}>
        <div style={{fontSize:72,color:'#6366f1',lineHeight:0.7,fontFamily:'Georgia,serif',marginBottom:16}}>"</div>
        <div style={{fontSize:26,color:'#1e293b',lineHeight:1.6,fontWeight:500,marginBottom:28,fontStyle:'italic'}}>Working with [Brand/Product] completely changed how I [do something]. I went from [before] to [after] in just [timeframe]!</div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{width:60,height:60,borderRadius:'50%',background:'#c7d2fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>😊</div>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:'#1e293b'}}>[Client Name]</div>
            <div style={{fontSize:14,color:'#6366f1'}}>[Title / @handle]</div>
            <div style={{display:'flex',gap:2,marginTop:4}}>{'★★★★★'.split('').map((s,i)=><span key={i} style={{color:'#f59e0b',fontSize:16}}>{s}</span>)}</div>
          </div>
        </div>
      </div>
      <div style={{width:200,flexShrink:0,display:'flex',flexDirection:'column',gap:16,alignItems:'center'}}>
        <div style={{width:180,height:180,borderRadius:16,background:'linear-gradient(135deg,#c7d2fe,#a5b4fc)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:70}}>⭐</div>
        <div style={{fontSize:13,color:'#6366f1',fontWeight:700,textAlign:'center',letterSpacing:1}}>VERIFIED REVIEW</div>
      </div>
    </div>
  );
}

function FlashSale() {
  return (
    <div style={{width:PW,height:PH,background:'#7f1d1d',fontFamily:'Arial,sans-serif',overflow:'hidden',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#7f1d1d 0%,#b91c1c 50%,#7f1d1d 100%)'}}/>
      <div style={{position:'absolute',top:-100,right:-100,width:400,height:400,borderRadius:'50%',background:'rgba(255,255,255,0.04)'}}/>
      <div style={{position:'relative',zIndex:1,textAlign:'center',color:'#fff'}}>
        <div style={{fontSize:16,letterSpacing:6,color:'#fca5a5',marginBottom:6}}>⚡ TODAY ONLY ⚡</div>
        <div style={{fontSize:56,fontWeight:900,lineHeight:1,marginBottom:4}}>FLASH</div>
        <div style={{fontSize:56,fontWeight:900,lineHeight:1,color:'#fca5a5',marginBottom:20}}>SALE</div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginBottom:24}}>
          <div style={{background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.3)',borderRadius:8,padding:'8px 16px',textAlign:'center'}}>
            <div style={{fontSize:36,fontWeight:900,lineHeight:1}}>50</div>
            <div style={{fontSize:11,color:'#fca5a5',letterSpacing:1}}>HRS</div>
          </div>
          <div style={{fontSize:28,fontWeight:900,paddingBottom:12}}>:</div>
          <div style={{background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.3)',borderRadius:8,padding:'8px 16px',textAlign:'center'}}>
            <div style={{fontSize:36,fontWeight:900,lineHeight:1}}>00</div>
            <div style={{fontSize:11,color:'#fca5a5',letterSpacing:1}}>MIN</div>
          </div>
          <div style={{fontSize:28,fontWeight:900,paddingBottom:12}}>:</div>
          <div style={{background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.3)',borderRadius:8,padding:'8px 16px',textAlign:'center'}}>
            <div style={{fontSize:36,fontWeight:900,lineHeight:1}}>00</div>
            <div style={{fontSize:11,color:'#fca5a5',letterSpacing:1}}>SEC</div>
          </div>
        </div>
        <div style={{fontSize:24,fontWeight:800}}>Up to <span style={{color:'#fca5a5',fontSize:40}}>70%</span> OFF</div>
      </div>
    </div>
  );
}

function ProductAnnounce() {
  return (
    <div style={{width:PW,height:PH,fontFamily:'Arial,sans-serif',overflow:'hidden',background:'#f0fdf4',display:'flex',alignItems:'center',padding:'0 64px',gap:56,boxSizing:'border-box',position:'relative'}}>
      <div style={{position:'absolute',top:-80,right:-80,width:320,height:320,borderRadius:'50%',background:'rgba(16,185,129,0.08)'}}/>
      <div style={{flex:1,zIndex:1}}>
        <div style={{display:'inline-block',background:'#d1fae5',color:'#065f46',fontSize:13,fontWeight:700,padding:'6px 16px',borderRadius:20,marginBottom:16,letterSpacing:1}}>🎉 BIG ANNOUNCEMENT</div>
        <div style={{fontSize:50,fontWeight:900,color:'#064e3b',lineHeight:1.1,marginBottom:16}}>Something<br/><span style={{color:'#059669'}}>Amazing</span><br/>is Coming!</div>
        <div style={{fontSize:15,color:'#065f46',lineHeight:1.7,marginBottom:28}}>We've been working on something big and we're almost ready to share it with you. Stay tuned — you won't want to miss this! 🚀</div>
        <div style={{display:'flex',gap:16}}>
          <div style={{background:'#059669',color:'#fff',padding:'13px 28px',borderRadius:8,fontWeight:700,fontSize:14}}>Get Notified →</div>
          <div style={{border:'2px solid #059669',color:'#059669',padding:'13px 24px',borderRadius:8,fontWeight:600,fontSize:14}}>Learn More</div>
        </div>
      </div>
      <div style={{width:220,height:280,flexShrink:0,zIndex:1,display:'flex',flexDirection:'column',gap:12}}>
        <div style={{flex:1,background:'#a7f3d0',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:60}}>🚀</div>
        <div style={{height:80,background:'#6ee7b7',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#064e3b',letterSpacing:1}}>COMING SOON</div>
      </div>
    </div>
  );
}

function SummerVibes() {
  return (
    <div style={{width:PW,height:PH,fontFamily:'Arial,sans-serif',overflow:'hidden',position:'relative',display:'flex'}}>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#fbbf24 0%,#f97316 40%,#ef4444 100%)'}}/>
      <div style={{position:'absolute',top:-60,right:80,width:280,height:280,borderRadius:'50%',background:'rgba(255,255,255,0.12)'}}/>
      <div style={{position:'absolute',bottom:-80,left:100,width:240,height:240,borderRadius:'50%',background:'rgba(255,255,255,0.08)'}}/>
      <div style={{position:'relative',zIndex:1,display:'flex',alignItems:'center',padding:'0 64px',gap:48,width:'100%',boxSizing:'border-box'}}>
        <div style={{color:'#fff',flex:1}}>
          <div style={{fontSize:80,marginBottom:0,lineHeight:1}}>☀️</div>
          <div style={{fontSize:60,fontWeight:900,lineHeight:1,marginBottom:8,textShadow:'0 2px 12px rgba(0,0,0,0.2)'}}>Summer<br/>Vibes</div>
          <div style={{fontSize:16,color:'rgba(255,255,255,0.85)',lineHeight:1.6,marginBottom:24}}>Bring the heat this season with [your product/service]. Shop our summer collection now!</div>
          <div style={{background:'rgba(255,255,255,0.25)',backdropFilter:'blur(8px)',border:'2px solid rgba(255,255,255,0.5)',color:'#fff',padding:'12px 28px',borderRadius:8,display:'inline-block',fontWeight:700,fontSize:14,letterSpacing:1}}>SHOP NOW 🌊</div>
        </div>
        <div style={{flexShrink:0,display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,width:200,height:200}}>
          <div style={{background:'rgba(255,255,255,0.2)',borderRadius:12}}/>
          <div style={{background:'rgba(255,255,255,0.15)',borderRadius:12}}/>
          <div style={{background:'rgba(255,255,255,0.15)',borderRadius:12}}/>
          <div style={{background:'rgba(255,255,255,0.2)',borderRadius:12}}/>
        </div>
      </div>
    </div>
  );
}

function EventCountdown() {
  return (
    <div style={{width:PW,height:PH,background:'#1e1b4b',fontFamily:'Arial,sans-serif',overflow:'hidden',position:'relative',display:'flex',alignItems:'center'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at top,#312e81 0%,#1e1b4b 70%)'}}/>
      {[...Array(12)].map((_,i)=>(
        <div key={i} style={{position:'absolute',width:3,height:3,borderRadius:'50%',background:'rgba(255,255,255,0.4)',top:`${10+Math.random()*80}%`,left:`${Math.random()*100}%`}}/>
      ))}
      <div style={{position:'relative',zIndex:1,padding:'0 60px',color:'#fff',width:'100%',boxSizing:'border-box'}}>
        <div style={{fontSize:14,color:'#a5b4fc',letterSpacing:3,marginBottom:10}}>MARK YOUR CALENDAR</div>
        <div style={{fontSize:50,fontWeight:900,lineHeight:1.1,marginBottom:8}}>[Event Name]<br/><span style={{color:'#a5b4fc',fontSize:36}}>is happening!</span></div>
        <div style={{fontSize:15,color:'#c7d2fe',marginBottom:28,lineHeight:1.6}}>Join us for [description of event]. An experience you won't forget.</div>
        <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
          <div style={{background:'rgba(165,180,252,0.15)',border:'1px solid #6366f1',borderRadius:10,padding:'12px 20px'}}>
            <div style={{fontSize:11,color:'#a5b4fc',letterSpacing:2,marginBottom:4}}>DATE</div>
            <div style={{fontSize:20,fontWeight:700}}>[Month Day]</div>
          </div>
          <div style={{background:'rgba(165,180,252,0.15)',border:'1px solid #6366f1',borderRadius:10,padding:'12px 20px'}}>
            <div style={{fontSize:11,color:'#a5b4fc',letterSpacing:2,marginBottom:4}}>TIME</div>
            <div style={{fontSize:20,fontWeight:700}}>[X:XX PM]</div>
          </div>
          <div style={{background:'rgba(165,180,252,0.15)',border:'1px solid #6366f1',borderRadius:10,padding:'12px 20px'}}>
            <div style={{fontSize:11,color:'#a5b4fc',letterSpacing:2,marginBottom:4}}>WHERE</div>
            <div style={{fontSize:20,fontWeight:700}}>[Location]</div>
          </div>
          <div style={{background:'#4f46e5',borderRadius:10,padding:'12px 24px',display:'flex',alignItems:'center',fontSize:15,fontWeight:700,letterSpacing:1}}>RSVP NOW →</div>
        </div>
      </div>
    </div>
  );
}


function getCatColor(cat) {
  const map = {
    Business: { bg:'#eff6ff', text:'#1d4ed8' },
    Sale:     { bg:'#fef2f2', text:'#dc2626' },
    Content:  { bg:'#f0fdf4', text:'#15803d' },
    Holiday:  { bg:'#fff7ed', text:'#c2410c' },
    Product:  { bg:'#faf5ff', text:'#7c3aed' },
    Quote:    { bg:'#fdf4ff', text:'#7e22ce' },
    Event:    { bg:'#eef2ff', text:'#4338ca' },
    Announce: { bg:'#f0fdf4', text:'#065f46' },
  };
  return map[cat] || { bg:'#f1f5f9', text:'#64748b' };
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function CaptionTemplates({ onBack, onUseTemplate }) {
  const [cat, setCat]         = useState('All');
  const [preview, setPreview] = useState(null);
  const [copied, setCopied]   = useState(null);

  const filtered = TEMPLATES.filter(t => cat === 'All' || t.category === cat);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleUse = (t) => {
    if (onUseTemplate) onUseTemplate(t.caption);
    if (onBack) onBack();
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f1f5f9', fontFamily:'"Segoe UI",Arial,sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'18px 32px', display:'flex', alignItems:'center', gap:16 }}>
        <button onClick={onBack}
          style={{ background:'#f1f5f9', border:'none', cursor:'pointer', fontSize:14, color:'#6366f1', padding:'8px 16px', borderRadius:8, fontWeight:700 }}>
          ← Back
        </button>
        <div>
          <div style={{ fontSize:20, fontWeight:800, color:'#1e293b' }}>🎨 Design Templates</div>
          <div style={{ fontSize:13, color:'#64748b' }}>12 professional social media designs — preview, copy caption, customize &amp; post</div>
        </div>
      </div>

      {/* ── Category Pills ── */}
      <div style={{ padding:'20px 32px 4px', display:'flex', gap:10, flexWrap:'wrap' }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)}
            style={{
              padding:'7px 20px', borderRadius:24, fontSize:13, fontWeight:600,
              cursor:'pointer', border:'none', transition:'all 0.15s',
              background: cat === c ? '#6366f1' : '#fff',
              color: cat === c ? '#fff' : '#64748b',
              boxShadow:'0 1px 4px rgba(0,0,0,0.08)',
            }}>{c}
          </button>
        ))}
      </div>

      {/* ── Template Grid ── */}
      <div style={{ padding:'20px 32px 40px', display:'flex', flexWrap:'wrap', gap:24 }}>
        {filtered.map(t => {
          const PreviewComp = t.Preview;
          return (
            <div key={t.id}
              style={{ width:CW, background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,0.07)', flexShrink:0 }}
            >
              {/* Scaled visual preview */}
              <div
                onClick={() => setPreview(t)}
                style={{ width:CW, height:CH, overflow:'hidden', position:'relative', cursor:'pointer', background:'#e8edf2' }}
                onMouseEnter={e => { e.currentTarget.querySelector('.hov').style.background='rgba(99,102,241,0.14)'; e.currentTarget.querySelector('.hovlabel').style.opacity='1'; }}
                onMouseLeave={e => { e.currentTarget.querySelector('.hov').style.background='transparent'; e.currentTarget.querySelector('.hovlabel').style.opacity='0'; }}
              >
                <div style={{ position:'absolute', top:0, left:0, width:PW, height:PH, transformOrigin:'top left', transform:`scale(${SC})` }}>
                  <PreviewComp />
                </div>
                <div className="hov" style={{ position:'absolute', inset:0, background:'transparent', transition:'background 0.2s', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span className="hovlabel" style={{ background:'rgba(255,255,255,0.95)', padding:'6px 16px', borderRadius:20, fontSize:12, fontWeight:700, color:'#4f46e5', opacity:0, transition:'opacity 0.2s' }}>
                    👁 Preview
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding:'14px 16px' }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#1e293b', marginBottom:6 }}>{t.name}</div>
                <span style={{ fontSize:11, background:getCatColor(t.category).bg, color:getCatColor(t.category).text, padding:'3px 10px', borderRadius:12, fontWeight:600 }}>
                  {t.category}
                </span>
                <div style={{ display:'flex', gap:8, marginTop:12 }}>
                  <button onClick={() => handleCopy(t.caption, t.id)}
                    style={{ flex:1, padding:'8px 6px', borderRadius:8, border:'1.5px solid #e2e8f0', background: copied===t.id ? '#f0fdf4' : '#fff', color: copied===t.id ? '#15803d' : '#64748b', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                    {copied===t.id ? '✓ Copied' : '📋 Copy'}
                  </button>
                  <button onClick={() => handleUse(t)}
                    style={{ flex:1, padding:'8px 6px', borderRadius:8, border:'none', background:'#6366f1', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                    Use →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Preview Modal ── */}
      {preview && (() => {
        const PreviewComp = preview.Preview;
        return (
          <div
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
            onClick={() => setPreview(null)}
          >
            <div
              style={{ background:'#fff', borderRadius:20, overflow:'hidden', maxWidth:860, width:'100%', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 28px 64px rgba(0,0,0,0.35)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div style={{ padding:'18px 24px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:17, fontWeight:800, color:'#1e293b', marginBottom:4 }}>{preview.name}</div>
                  <span style={{ fontSize:12, background:getCatColor(preview.category).bg, color:getCatColor(preview.category).text, padding:'2px 10px', borderRadius:10, fontWeight:600 }}>{preview.category}</span>
                </div>
                <button onClick={() => setPreview(null)}
                  style={{ background:'#f1f5f9', border:'none', fontSize:16, cursor:'pointer', color:'#64748b', width:34, height:34, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
              </div>

              {/* Large design preview */}
              <div style={{ background:'#f1f5f9', padding:24, display:'flex', justifyContent:'center' }}>
                <div style={{ width:'100%', maxWidth:PW, aspectRatio:`${PW}/${PH}`, overflow:'hidden', borderRadius:14, boxShadow:'0 4px 20px rgba(0,0,0,0.12)' }}>
                  <PreviewComp />
                </div>
              </div>

              {/* Caption */}
              <div style={{ padding:'20px 24px 28px' }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Caption Template</div>
                <pre style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12, padding:'16px 18px', fontSize:13, color:'#334155', lineHeight:1.8, whiteSpace:'pre-wrap', fontFamily:'"Segoe UI",Arial,sans-serif', margin:0 }}>
                  {preview.caption}
                </pre>
                <div style={{ marginTop:16, display:'flex', gap:10, justifyContent:'flex-end' }}>
                  <button onClick={() => handleCopy(preview.caption, preview.id)}
                    style={{ padding:'10px 22px', borderRadius:8, border:'1.5px solid #6366f1', background: copied===preview.id ? '#f0fdf4' : '#fff', color: copied===preview.id ? '#15803d' : '#6366f1', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                    {copied===preview.id ? '✓ Copied!' : '📋 Copy Caption'}
                  </button>
                  <button onClick={() => handleUse(preview)}
                    style={{ padding:'10px 26px', borderRadius:8, border:'none', background:'#6366f1', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                    Use in Publisher →
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
