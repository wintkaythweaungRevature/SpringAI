import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
  {
    id: 'lm23', name: 'Free Lead Magnet', category: 'Business', Preview: LeadMagnetPreview,
    caption: `🎁 FREE [Topic] Starter Kit — grab yours today!\n\nInside you'll get:\n✅ [Deliverable 1]\n✅ [Deliverable 2]\n✅ [Deliverable 3]\n\nPerfect for [target audience] who want [goal] without [pain point].\n\n🔗 Download free → link in bio\n\n#freebie #leadmagnet #[niche] #download #marketing`,
  },
  {
    id: 'pc24', name: 'Podcast Episode Drop', category: 'Content', Preview: PodcastEpPreview,
    caption: `🎙️ NEW EPISODE: [Episode Title]\n\nI sat down with [Guest Name] to talk about [hook topic].\n\nWe cover:\n• [Point 1]\n• [Point 2]\n• [Point 3]\n\n🎧 Listen now → link in bio (Spotify / Apple / YouTube)\n\n#podcast #newepisode #[niche] #interview`,
  },
  {
    id: 'cs25', name: 'Carousel — Swipe Tips', category: 'Content', Preview: CarouselSwipePreview,
    caption: `👉 SWIPE for [Number] [topic] tips you can use today!\n\nSlide 1: [Tip 1 short]\nSlide 2: [Tip 2 short]\nSlide 3: [Tip 3 short]\nSlide 4: [Tip 4 short]\n\nSave this carousel 🔖 and send it to a friend who needs it!\n\n#carousel #tips #[niche] #educational #swipe`,
  },
  {
    id: 'wl26', name: 'Waitlist / Launch Teaser', category: 'Announce', Preview: WaitlistPreview,
    caption: `🔔 Something big is coming — [Product Name]\n\nWe're opening a short waitlist so you get:\n✨ Early access\n✨ Launch-only pricing\n✨ Bonus [bonus item]\n\n👉 Join the waitlist → link in bio (spots limited)\n\n#waitlist #comingsoon #[niche] #launch #signup`,
  },
  {
    id: 'sd27', name: 'Holiday Shipping Cutoff', category: 'Holiday', Preview: ChristmasShipByPreview,
    caption: `📦 ORDER BY [Date] — get it in time for [Holiday]!\n\nLast day for [shipping tier] delivery is [Date] at [Time] [Timezone].\n\n🎁 Perfect gifts for [who it's for]:\n• [Gift idea 1]\n• [Gift idea 2]\n• [Gift idea 3]\n\n🛍️ Shop now → link in bio\n\n#shipping #holiday #[niche] #deadline #order`,
  },
  {
    id: 'am28', name: 'Live AMA Promo', category: 'Event', Preview: AMASessionPreview,
    caption: `💬 LIVE AMA — [Date] at [Time] [Timezone]\n\nAsk me anything about [topic]! I'll answer live in the comments / stream.\n\nHot topics we'll cover:\n• [Topic A]\n• [Topic B]\n• [Topic C]\n\n🔔 Turn on reminders so you don't miss it!\n\n#AMA #live #QandA #[niche] #community`,
  },
  {
    id: 'ys29', name: 'Year in Review Stats', category: 'Announce', Preview: YearStatsPreview,
    caption: `🎉 Our [Year] in numbers — thank YOU!\n\n📊 [Stat 1]\n📊 [Stat 2]\n📊 [Stat 3]\n\nNone of this happens without this community. What's your favorite memory from this year? 👇\n\n#yearinreview #grateful #[brand] #[niche] #community`,
  },
  {
    id: 'tt30', name: 'Trending Topics Roundup', category: 'Content', Preview: TrendingTopicsPreview,
    caption: `🔥 What's trending in [niche] this week?\n\nWe're watching:\n#[topic1] #[topic2] #[topic3]\n\nMy take: [Your short opinion / prediction]\n\nWhat did I miss? Drop a trend below 👇\n\n#trending #socialmedia #[niche] #news #roundup`,
  },
  {
    id: 'cw31', name: 'Client Win Spotlight', category: 'Business', Preview: ClientWinPreview,
    caption: `🏆 CLIENT WIN: [Result headline]\n\n[Client Name] came to us wanting [goal]. In [timeframe] we focused on:\n1️⃣ [Strategy 1]\n2️⃣ [Strategy 2]\n3️⃣ [Strategy 3]\n\nProud of this team — and prouder of them. 💪\n\nWant similar results? 🔗 Link in bio\n\n#casestudy #results #[niche] #business #growth`,
  },
  {
    id: 'rs32', name: 'Back in Stock', category: 'Sale', Preview: RestockPreview,
    caption: `🔔 [Product Name] is BACK IN STOCK!\n\nYou asked — we listened. Limited quantities this drop.\n\nWhy people love it:\n⭐ [Benefit 1]\n⭐ [Benefit 2]\n⭐ [Benefit 3]\n\n🛒 Grab yours → link in bio before it sells out again!\n\n#restock #limited #[niche] #shop #sale`,
  },
  {
    id: 'nb33', name: 'Founder Friday Intro', category: 'Business', Preview: NavyBizCover,
    caption: `👋 Hi, I'm [Your Name] — founder of [Brand Name].\n\nEvery Friday I share one lesson from building [what you build] for [target audience].\n\nToday's lesson: [Lesson in one sentence]\n\nFollow for more founder notes + behind-the-scenes 🔖\n\n#founder #startup #[niche] #lessons #business`,
  },
  {
    id: 'wb34', name: 'Brand Values Post', category: 'Business', Preview: WhiteBrand,
    caption: `At [Brand Name], we believe:\n\n💜 [Value 1]\n💜 [Value 2]\n💜 [Value 3]\n\nThese aren't buzzwords — they're how we show up for [target audience] every day.\n\nWhat value matters most to you? Tell me below 👇\n\n#brandvalues #mission #[niche] #community #authenticity`,
  },
  {
    id: 'dm35', name: 'Service Packages Menu', category: 'Business', Preview: DigitalExpert,
    caption: `📌 Pick your package — [Brand / Your Name]\n\n🟣 Starter — [what's included] — [price or \"DM for quote\"]\n🟣 Growth — [what's included] — [price or \"DM for quote\"]\n🟣 Pro — [what's included] — [price or \"DM for quote\"]\n\nNot sure which fits? DM me \"HELP\" and I'll point you in the right direction.\n\n#services #packages #[niche] #consulting #booking`,
  },
  {
    id: 'bn36', name: 'Myth vs Fact Listicle', category: 'Content', Preview: BigNumber,
    caption: `🧠 5 myths about [topic] — busted.\n\n❌ Myth 1: [myth]\n✅ Fact: [fact]\n\n❌ Myth 2: [myth]\n✅ Fact: [fact]\n\n(Save this — your future self will thank you 🔖)\n\n#mythbusting #education #[niche] #tips #learn`,
  },
  {
    id: 'ug37', name: 'Resource Stack Share', category: 'Content', Preview: UltimateGuide,
    caption: `📚 My go-to stack for [topic]:\n\n1) [Tool or book 1] — why I love it\n2) [Tool or book 2] — why I love it\n3) [Tool or book 3] — why I love it\n\nAnything you'd add? Drop your favorite below 👇\n\n#resources #tools #[niche] #productivity #stack`,
  },
  {
    id: 'cl38', name: 'Mini Course Teaser', category: 'Product', Preview: CourseLaunch,
    caption: `⚡ New mini-course: [Course Name]\n\nIn [X] short lessons you'll learn:\n• [Outcome 1]\n• [Outcome 2]\n• [Outcome 3]\n\nBuilt for [target audience] who are tired of [pain point].\n\n👉 Preview the first lesson → link in bio\n\n#minicourse #learnonline #[niche] #education #launch`,
  },
  {
    id: 'np39', name: 'Bundle Deal', category: 'Sale', Preview: NewProduct,
    caption: `🎁 BUNDLE ALERT — save when you buy together!\n\nGet [Product A] + [Product B] for one special price.\n\n✅ [Bundle benefit 1]\n✅ [Bundle benefit 2]\n\n⏰ Ends [date]\n🛍️ Shop bundle → link in bio\n\n#bundle #deal #save #[niche] #shopping`,
  },
  {
    id: 'mq40', name: 'Micro‑Affirmation', category: 'Quote', Preview: MotivationalQuote,
    caption: `🌿 Gentle reminder:\n\nYou don't have to [unrealistic expectation].\n\nYou only need to [small actionable step].\n\nThat's enough for today.\n\nSave if you needed this 🤍\n\n#selfcare #mindset #gentle #[niche] #mentalhealth`,
  },
  {
    id: 'hx41', name: 'We’re Hiring', category: 'Business', Preview: HiringBannerPreview,
    caption: `👋 We’re hiring a [Role Title]!\n\n📍 [Location / Remote]\n⏱ [Employment type]\n💼 [1–2 sentence why your team is great]\n\nApply: [link in bio]\n\n#hiring #jobs #[industry] #careers #remote`,
  },
  {
    id: 'hx42', name: 'Refer & Earn', category: 'Sale', Preview: ReferEarnPreview,
    caption: `🎁 Refer a friend, both win.\n\nThey get: [reward for friend]\nYou get: [reward for referrer]\n\nHow it works:\n1️⃣ Share your code\n2️⃣ They sign up / purchase\n3️⃣ Rewards unlock\n\nCode: [CODE] · Link in bio\n\n#referral #rewards #[Brand Name] #community`,
  },
  {
    id: 'hx43', name: 'Story Poll', category: 'Content', Preview: PollVotesPreview,
    caption: `Quick poll 👇\n\n[Question for audience]?\n\nA) [Option A]\nB) [Option B]\nC) [Option C]\n\nVote on the sticker + tell us why in the comments.\n\n#poll #community #[niche] #engagement`,
  },
  {
    id: 'hx44', name: '7‑Day Challenge', category: 'Content', Preview: DayChallengePreview,
    caption: `🔥 [X]-Day [Challenge name] starts [Date]!\n\nEach day we’ll cover:\n• Day 1: [topic]\n• Day 2: [topic]\n• Day 3: [topic]\n…\n\nJoin free — follow + turn on notifications 🔔\n\n#challenge #habits #[goal] #accountability`,
  },
  {
    id: 'hx45', name: 'Winter Sale', category: 'Sale', Preview: WinterSalePreview,
    caption: `❄️ Winter sale is ON.\n\nSave [X]% on [category] at [Brand Name].\n\nEnds [Date] — don’t sleep on it.\n\n🛒 Shop: link in bio\n\n#wintersale #sale #[Product Name] #limitedtime`,
  },
  {
    id: 'hx46', name: 'Tip Tuesday', category: 'Content', Preview: TipTuesdayPreview,
    caption: `💡 Tip Tuesday:\n\n[One-line tip headline]\n\nWhy it matters:\n→ [benefit 1]\n→ [benefit 2]\n\nTry it this week and tell us how it went.\n\n#tiptuesday #[niche] #smallbusiness #productivity`,
  },
  {
    id: 'hx47', name: 'Service Outage / Update', category: 'Announce', Preview: UrgentUpdatePreview,
    caption: `⚠️ Important update\n\n[Headline about change or outage]\n\nWhat happened: [short explanation]\nWhat we’re doing: [action]\nWhat you should do: [steps]\nETA / next update: [Time or Date]\n\nThanks for your patience — [Brand Name] team\n\n#update #support #transparency`,
  },
  {
    id: 'hx48', name: 'Ask the Audience', category: 'Content', Preview: CommunityQuestionPreview,
    caption: `Question for you 👇\n\n[Your question to the audience]?\n\nDrop your answer in the comments — we’re reading everything.\n\n#community #question #[niche] #discussion`,
  },
  {
    id: 'hx49', name: 'This or That', category: 'Content', Preview: FeatureComparePreview,
    caption: `This or that? 🤔\n\n[A] [Name A] — [one pro]\nvs\n[B] [Name B] — [one pro]\n\nComment A or B. Bonus: tell us your use case.\n\n#poll #versus #[niche] #debate`,
  },
  {
    id: 'hx50', name: 'Thank You / Milestone', category: 'Announce', Preview: ThankYouCustomersPreview,
    caption: `🙏 Thank you\n\n[Milestone or holiday message]\n\nWe’re grateful for every follow, order, and message. You make [Brand Name] possible.\n\n[Optional: small gift code or teaser]\n\n#thankyou #community #[Brand Name] #grateful`,
  },
  {
    id: 'hx51', name: 'Flash Giveaway', category: 'Sale', Preview: GiveawayPost,
    caption: `⚡ FLASH GIVEAWAY — ends in [timeframe]\n\nPrize: [prize]\n\nTo enter:\n1️⃣ Follow @[handle]\n2️⃣ Like + save this post\n3️⃣ Tag a friend who’d love this\n\nBonus entry: share to your story\n\n#giveaway #contest #[Brand Name] #free`,
  },
  {
    id: 'hx52', name: 'Lunch & Learn', category: 'Event', Preview: WebinarPromo,
    caption: `🥪 Lunch & Learn: [Topic]\n\n📅 [Date] · ⏰ [Time]\n📍 [Location / Zoom]\n\nBring your questions — we’ll cover [3 bullet points].\n\nRSVP: link in bio\n\n#webinar #learning #[industry] #networking`,
  },
  {
    id: 'hx53', name: 'Bold One‑Liner', category: 'Quote', Preview: BoldQuoteCard,
    caption: `📌 Save this.\n\n“[Powerful one-liner quote]”\n\n— [Attribution]\n\n#motivation #mindset #[niche] #quotes #growth`,
  },
  {
    id: 'hx54', name: 'How‑To Thread Teaser', category: 'Content', Preview: BloggingTips,
    caption: `🧵 New how‑to: [Topic]\n\nIf you’ve struggled with [pain point], this thread breaks it down step by step.\n\nPreview:\n→ Step 1: [teaser]\n→ Step 2: [teaser]\n→ Step 3: [teaser]\n\nFull post: link in bio\n\n#howto #tutorial #[niche] #tips`,
  },
  {
    id: 'hx55', name: 'Room Refresh', category: 'Product', Preview: HomeDecorPost,
    caption: `🏠 Room refresh under [budget]\n\nBefore: [vibe/problem]\nAfter: [vibe/result]\n\nHero pieces:\n• [item 1]\n• [item 2]\n• [item 3]\n\nLinks: in bio\n\n#homedecor #beforeandafter #interiordesign #diy`,
  },
  {
    id: 'hx56', name: 'Spring Promo', category: 'Holiday', Preview: SpringSeasonPreview,
    caption: `🌸 Spring is here — so is our sale.\n\n[Offer headline] at [Brand Name]\n\nCode: [CODE] · [Date] only\n\nTreat yourself (or your [gift recipient]).\n\n#spring #sale #[Product Name] #seasonal`,
  },
  {
    id: 'hx57', name: 'Friendsgiving / Gratitude', category: 'Holiday', Preview: FriendsgivingGatherPreview,
    caption: `🍂 Gathering season\n\nHosting [Friendsgiving / family dinner]? Here’s our checklist:\n• [item]\n• [item]\n• [item]\n\nWhat we’re grateful for: [short note]\n\n#thanksgiving #friendsgiving #hosting #grateful`,
  },
  {
    id: 'hx58', name: '48‑Hour Price Drop', category: 'Sale', Preview: LimitedOffer,
    caption: `⏰ 48 hours only\n\n[Product Name] — now [X]% off\n\nWhy now: [reason]\n\nNo code needed · Ends [Date]\n\n🛒 Link in bio\n\n#flashsale #deal #limited #[Brand Name]`,
  },
  {
    id: 'hx59', name: 'Feature Drop', category: 'Product', Preview: ProductAnnounce,
    caption: `🚀 New in [Product Name]\n\n✨ [Feature 1]\n✨ [Feature 2]\n✨ [Feature 3]\n\nBuilt because you asked for [pain point solved].\n\nTry it: link in bio\n\n#productupdate #saas #newfeature #[industry]`,
  },
  {
    id: 'hx60', name: 'Launch Countdown', category: 'Event', Preview: EventCountdown,
    caption: `⏳ T‑minus [X] until [Event Name]\n\nWhat to expect:\n• [highlight 1]\n• [highlight 2]\n• [highlight 3]\n\nSet a reminder — you won’t want to miss this.\n\n#launch #countdown #event #[Brand Name]`,
  },
  {
    id: 'hx61', name: 'Case Study Breakdown', category: 'Business', Preview: CaseStudyPreview,
    caption: `📊 Case study: [Client / project name]\n\nThe situation:\n[Problem context in 2–3 sentences]\n\nWhat we did:\n1️⃣ [Step / tactic 1]\n2️⃣ [Step / tactic 2]\n3️⃣ [Step / tactic 3]\n\nThe result:\n→ [Metric or outcome]\n→ [Metric or outcome]\n\nWant the full write-up? Link in bio.\n\n#casestudy #results #[niche] #marketing #B2B`,
  },
  {
    id: 'hx62', name: 'Free Resource Drop', category: 'Content', Preview: FreebieDropPreview,
    caption: `📥 New freebie: [Resource title]\n\nInside you’ll find:\n✅ [Bullet 1]\n✅ [Bullet 2]\n✅ [Bullet 3]\n\nPerfect if you’re [target audience] trying to [goal].\n\nGrab it → link in bio (PDF · [page count] pages)\n\n#freebie #download #[niche] #leadmagnet #templates`,
  },
  {
    id: 'hx63', name: 'Meet the Team', category: 'Business', Preview: MeetTeamPreview,
    caption: `👋 Meet [Name] — [Role] at [Brand Name]\n\n3 things to know:\n• [Fun fact 1]\n• [Fun fact 2]\n• [What they’re working on now]\n\nDrop a welcome in the comments!\n\n#team #culture #[industry] #behindthescenes #hiring`,
  },
  {
    id: 'hx64', name: 'Mindset Reframe', category: 'Quote', Preview: MindsetReframePreview,
    caption: `🧠 Reframe for [topic]:\n\nInstead of: “[Old belief]”\nTry: “[New belief]”\n\nSmall language shift → big behavior shift.\n\nSave if you needed this today 🔖\n\n#mindset #reframe #[niche] #mentalhealth #growth`,
  },
  {
    id: 'hx65', name: 'Objection Buster', category: 'Content', Preview: ObjectionBusterPreview,
    caption: `We hear this a lot:\n“[Common objection]”\n\nHere’s the truth:\n[One paragraph reframing the objection]\n\nStill unsure? DM us “[keyword]” and we’ll help you decide.\n\n#sales #FAQ #[niche] #transparency #smallbusiness`,
  },
  {
    id: 'hx66', name: 'Collab Announcement', category: 'Announce', Preview: CollabInvitePreview,
    caption: `🤝 [Brand A] × [Brand B]\n\nWe teamed up to bring you [what you built together].\n\nWhy we’re excited:\n• [Reason 1]\n• [Reason 2]\n\nAvailable [Date] — link in bio to [shop / sign up / learn more].\n\n#collab #partnership #[niche] #newdrop #limited`,
  },
  {
    id: 'hx67', name: 'Plan Comparison', category: 'Product', Preview: PlanComparePreview,
    caption: `📋 Pick your plan — [Product Name]\n\n🟣 Basic — [price] / [period]\nBest for: [who]\n\n🟣 Pro — [price] / [period]\nBest for: [who]\n\nNot sure? Take our 30-sec quiz → link in bio\n\n#pricing #SaaS #[industry] #compare #upgrade`,
  },
  {
    id: 'hx68', name: 'Live Shopping / Show', category: 'Event', Preview: LiveShoppingPreview,
    caption: `🔴 LIVE shopping: [Show title]\n\n📅 [Date] · ⏰ [Time] [Timezone]\n\nWe’ll demo [product or theme], answer questions live, and drop exclusive codes.\n\nTurn on reminders + tap link in bio to join.\n\n#liveshopping #livestream #[niche] #sale #community`,
  },
  {
    id: 'hx69', name: 'Newsletter Signup', category: 'Announce', Preview: NewsletterSignupPreview,
    caption: `✉️ [Newsletter name] — [frequency]\n\nEach issue: [value prop in one line]\n\nThis week’s topic: [teaser]\n\nSubscribe free → link in bio (unsubscribe anytime)\n\n#newsletter #email #[niche] #creator #subscribe`,
  },
  {
    id: 'hx70', name: 'Student / Course Win', category: 'Business', Preview: StudentWinPreview,
    caption: `🎓 Shoutout to [Name]!\n\nThey joined [Course / program] wanting [goal].\n\nIn [timeframe] they went from [starting point] → [result].\n\nProud doesn’t cover it. 💚\n\nDoors open again [Date] — waitlist in bio.\n\n#studentwin #onlinecourse #[niche] #testimonial #education`,
  },
  {
    id: 'hx71', name: 'BTS Reel / Day in the Life', category: 'Content', Preview: BeforeAfter,
    caption: `🎬 BTS: a day building [what you do]\n\nMorning: [beat 1]\nAfternoon: [beat 2]\nEvening: [beat 3]\n\nThe messy truth > highlight reel. Save if you’re a [niche] creator too.\n\n#behindthescenes #dayinthelife #[niche] #creator #reels`,
  },
  {
    id: 'hx72', name: 'FAQ Carousel Teaser', category: 'Content', Preview: BigNumber,
    caption: `❓ [Number] FAQs we get about [topic]\n\nSwipe the carousel for full answers — here’s a preview:\n\n1) [Question 1] → [one-line answer]\n2) [Question 2] → [one-line answer]\n\nGot another? Drop it below 👇\n\n#FAQ #carousel #[niche] #education #tips`,
  },
  {
    id: 'hx73', name: 'Member / VIP Perks', category: 'Sale', Preview: LimitedOffer,
    caption: `👑 VIP perk this month: [perk headline]\n\nMembers get:\n• [Benefit 1]\n• [Benefit 2]\n• [Benefit 3]\n\nJoin before [Date] — link in bio.\n\n#VIP #membership #loyalty #[Brand Name] #exclusive`,
  },
  {
    id: 'hx74', name: 'Influencer Takeover Teaser', category: 'Announce', Preview: ProductAnnounce,
    caption: `📣 Takeover alert: @[handle] runs our account [Date]!\n\nThey’ll share [theme] + a surprise for followers.\n\nSet a reminder — you won’t want to miss [teaser].\n\n#takeover #influencer #[niche] #community #announcement`,
  },
  {
    id: 'hx75', name: 'Pop‑Up / Local Event', category: 'Event', Preview: EventCountdown,
    caption: `📍 Pop‑up this weekend!\n\nWhere: [Address or neighborhood]\nWhen: [Date] · [Time]\n\nWhat’s there: [experience / products]\n\nBring a friend — first [X] visitors get [freebie].\n\n#popup #localevent #[city] #smallbusiness #weekend`,
  },
  {
    id: 'hx76', name: 'Coffee Chat / Office Hours', category: 'Event', Preview: WebinarPromo,
    caption: `☕ Open office hours — [Topic]\n\nNo pitch, just Q&A. Bring your questions about [focus area].\n\n📅 [Date] · ⏰ [Time] · [Zoom / space]\n\nRSVP (free, limited seats): link in bio\n\n#officehours #community #[niche] #networking #free`,
  },
  {
    id: 'hx77', name: 'Rate Our Product', category: 'Content', Preview: PollVotesPreview,
    caption: `How did we do? ⭐\n\nIf you’ve tried [Product Name], we’d love a quick rating:\n\n⭐️ Experience\n⭐️ Quality\n⭐️ Support\n\nComment your score 1–5 + one thing we should improve.\n\n#feedback #product #[Brand Name] #customerlove #poll`,
  },
  {
    id: 'hx78', name: 'Earth Day / Eco Pledge', category: 'Holiday', Preview: EarthDayPromoPreview,
    caption: `🌍 Earth Day pledge from [Brand Name]\n\nThis year we’re committing to:\n• [Pledge 1]\n• [Pledge 2]\n• [Pledge 3]\n\nShop our [eco product line] — [X]% to [cause] through [Date].\n\n#earthday #sustainable #[niche] #giveback #eco`,
  },
  {
    id: 'hx79', name: 'Founder’s Note', category: 'Business', Preview: WhiteBrand,
    caption: `A note from [Your Name], founder of [Brand Name]:\n\nWhen we started, we wanted to [mission in one sentence].\n\nToday [milestone or thank-you].\n\nWhat’s next: [teaser].\n\nThank you for being here. 💜\n\n#founder #letter #[niche] #startup #community`,
  },
  {
    id: 'hx80', name: 'Year‑End Inventory Clearance', category: 'Sale', Preview: FlashSale,
    caption: `📦 Year‑end clearance — make room for [new season / line]\n\nEverything in [collection] is up to [X]% off through [Date].\n\nSizes / colors moving fast — final sale on select SKUs.\n\n🛒 Shop clearance → link in bio\n\n#clearance #sale #yearend #[niche] #shop`,
  },
  {
    id: 'hx81', name: 'Halloween Promo', category: 'Holiday', Preview: HalloweenPromoPreview,
    caption: `🎃 Halloween at [Brand Name]!\n\n[Offer headline] — spooky savings through [Date].\n\nCostume-friendly picks:\n• [item 1]\n• [item 2]\n• [item 3]\n\n🛒 Shop the haunt → link in bio\n\n#halloween #spookyseason #[niche] #sale #october`,
  },
  {
    id: 'hx82', name: 'Christmas / Holiday Sale', category: 'Holiday', Preview: ChristmasPromoPreview,
    caption: `🎄 Our Christmas sale is live!\n\n[Offer summary] — perfect for [gift recipient].\n\nOrder by [Date] for the best chance to arrive before the holiday.\n\n🎁 Gift guide + shop: link in bio\n\n#christmas #holidaysale #[Brand Name] #gifts #seasonal`,
  },
  {
    id: 'hx83', name: 'New Year Kickoff', category: 'Holiday', Preview: NewYearsPromoPreview,
    caption: `🎆 New Year, new energy.\n\nWe’re helping [target audience] [goal] in [Year] with:\n• [Initiative 1]\n• [Initiative 2]\n• [Initiative 3]\n\nStart here → link in bio\n\n#newyear #freshstart #[niche] #goals #motivation`,
  },
  {
    id: 'hx84', name: 'President’s Day Sale', category: 'Holiday', Preview: PresidentsDayPromoPreview,
    caption: `🇺🇸 President’s Day long weekend — extra savings at [Brand Name].\n\n[Offer headline] through [Date].\n\nStock up on [category] while codes last.\n\n🛒 Shop: link in bio\n\n#presidentsday #longweekend #sale #[niche] #deals`,
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

function LeadMagnetPreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(145deg,#1e1b4b,#312e81)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 56px', gap: 40, boxSizing: 'border-box' }}>
      <div style={{ flex: 1, color: '#fff' }}>
        <div style={{ fontSize: 13, color: '#a5b4fc', letterSpacing: 3, marginBottom: 10 }}>FREE DOWNLOAD</div>
        <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.05, marginBottom: 12 }}>The [Topic]<br /><span style={{ color: '#a5b4fc' }}>Starter Kit</span></div>
        <div style={{ fontSize: 14, color: '#c7d2fe', lineHeight: 1.6, marginBottom: 20 }}>PDF checklist + templates. No spam — unsubscribe anytime.</div>
        <div style={{ background: '#4f46e5', padding: '12px 22px', borderRadius: 8, display: 'inline-block', fontWeight: 700, fontSize: 14 }}>GET IT FREE →</div>
      </div>
      <div style={{ width: 200, height: 260, background: 'rgba(255,255,255,0.08)', borderRadius: 16, border: '2px dashed rgba(165,180,252,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>📎</div>
    </div>
  );
}

function PodcastEpPreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#0f172a', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 56px', gap: 36, boxSizing: 'border-box' }}>
      <div style={{ width: 160, height: 160, borderRadius: 20, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, flexShrink: 0 }}>🎙️</div>
      <div style={{ flex: 1, color: '#fff' }}>
        <div style={{ fontSize: 12, color: '#94a3b8', letterSpacing: 2, marginBottom: 8 }}>NEW EPISODE</div>
        <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.15, marginBottom: 10 }}>Ep. [X]: [Episode Title]</div>
        <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6 }}>With [Guest Name] — we unpack [hook topic] in under [minutes] minutes.</div>
      </div>
    </div>
  );
}

function CarouselSwipePreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#fefce8', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg,transparent,transparent 38px,rgba(234,179,8,0.08) 38px,rgba(234,179,8,0.08) 40px)' }} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 48px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#854d0e', marginBottom: 8 }}>CAROUSEL ALERT</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: '#713f12', lineHeight: 1.05, marginBottom: 12 }}>Swipe for<br />[Number] tips →</div>
        <div style={{ fontSize: 15, color: '#a16207', fontWeight: 600 }}>Save this post 🔖</div>
      </div>
    </div>
  );
}

function WaitlistPreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(160deg,#0c4a6e,#0369a1)', fontFamily: 'Arial,sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '0 48px', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 14, letterSpacing: 4, color: '#7dd3fc', marginBottom: 10 }}>COMING SOON</div>
      <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 12 }}>[Product Name]</div>
      <div style={{ fontSize: 15, color: '#bae6fd', maxWidth: 520, lineHeight: 1.6, marginBottom: 24 }}>Join the waitlist — be first to know when we launch.</div>
      <div style={{ background: '#fff', color: '#0369a1', padding: '12px 28px', borderRadius: 8, fontWeight: 800, fontSize: 14 }}>JOIN WAITLIST</div>
    </div>
  );
}

function AMASessionPreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#f8fafc', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 52px', gap: 28, boxSizing: 'border-box' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', marginBottom: 10 }}>Ask Me<br />Anything</div>
        <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>Live on [Date] — drop your questions in the comments.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 280 }}>
        <div style={{ background: '#e2e8f0', borderRadius: 14, padding: '12px 16px', fontSize: 13, color: '#475569' }}>Q: [Sample question]?</div>
        <div style={{ background: '#6366f1', borderRadius: 14, padding: '12px 16px', fontSize: 13, color: '#fff', alignSelf: 'flex-end' }}>A: [Your teaser answer]…</div>
      </div>
    </div>
  );
}

function YearStatsPreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#020617', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 40px', boxSizing: 'border-box' }}>
      {[
        { n: '[Stat 1]', l: 'LABEL A' },
        { n: '[Stat 2]', l: 'LABEL B' },
        { n: '[Stat 3]', l: 'LABEL C' },
      ].map((s, i) => (
        <div key={i} style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: '#38bdf8', marginBottom: 4 }}>{s.n}</div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: '#64748b' }}>{s.l}</div>
        </div>
      ))}
    </div>
  );
}

function TrendingTopicsPreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(135deg,#fdf2f8,#ede9fe)', fontFamily: 'Arial,sans-serif', padding: '40px 48px', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#db2777', marginBottom: 16, letterSpacing: 2 }}>TRENDING NOW</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {['#[topic1]', '#[topic2]', '#[topic3]', '#[topic4]', '#[topic5]'].map((tag, idx) => (
          <span key={idx} style={{ background: '#fff', border: '1.5px solid #e9d5ff', borderRadius: 999, padding: '8px 16px', fontSize: 14, fontWeight: 700, color: '#7c3aed' }}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

function ClientWinPreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(90deg,#ecfdf5,#d1fae5)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 56px', gap: 40, boxSizing: 'border-box' }}>
      <div style={{ fontSize: 80, lineHeight: 1 }}>🏆</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: '#059669', fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>CLIENT WIN</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: '#064e3b', lineHeight: 1.15, marginBottom: 10 }}>[Result headline]</div>
        <div style={{ fontSize: 14, color: '#047857', lineHeight: 1.6 }}>How [Client Name] hit [metric] in [timeframe].</div>
      </div>
    </div>
  );
}

function RestockPreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#fffbeb', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 40px', boxSizing: 'border-box' }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#b45309', marginBottom: 6 }}>BACK IN STOCK</div>
        <div style={{ fontSize: 46, fontWeight: 900, color: '#92400e', marginBottom: 10 }}>[Product Name]</div>
        <div style={{ fontSize: 15, color: '#a16207' }}>Limited quantities — tap link in bio 🛒</div>
      </div>
    </div>
  );
}

function HiringBannerPreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(135deg,#14532d,#166534)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 56px', gap: 36, boxSizing: 'border-box', color: '#fff' }}>
      <div style={{ fontSize: 72, lineHeight: 1 }}>👋</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, letterSpacing: 3, color: '#bbf7d0', marginBottom: 8 }}>WE&apos;RE HIRING</div>
        <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>[Role Title]</div>
        <div style={{ fontSize: 15, color: '#dcfce7', lineHeight: 1.6 }}>[Location / Remote] · [Employment type]</div>
      </div>
    </div>
  );
}

function ReferEarnPreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#faf5ff', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 48px', boxSizing: 'border-box' }}>
      <div>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🎁</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#6b21a8', marginBottom: 8 }}>Refer &amp; Earn</div>
        <div style={{ fontSize: 15, color: '#7c3aed', fontWeight: 600 }}>Give [reward], get [reward]</div>
      </div>
    </div>
  );
}

function PollVotesPreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#f1f5f9', fontFamily: 'Arial,sans-serif', padding: '36px 48px', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#475569', marginBottom: 16, letterSpacing: 1 }}>POLL</div>
      {['Option A', 'Option B', 'Option C'].map((label, i) => (
        <div key={label} style={{ marginBottom: 12, background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #6366f1' }} />
          <div style={{ flex: 1, fontWeight: 700, color: '#1e293b' }}>{label}</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>{30 + i * 15}%</div>
        </div>
      ))}
    </div>
  );
}

function DayChallengePreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(180deg,#1e293b,#0f172a)', fontFamily: 'Arial,sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '0 40px', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 14, color: '#94a3b8', letterSpacing: 3, marginBottom: 8 }}>CHALLENGE</div>
      <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.05, marginBottom: 12 }}>[X]-Day<br /><span style={{ color: '#38bdf8' }}>[Challenge name]</span></div>
      <div style={{ fontSize: 14, color: '#cbd5e1' }}>Starts [Date] — join us!</div>
    </div>
  );
}

function WinterSalePreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(160deg,#1e3a5f,#0c4a6e)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 48px', gap: 28, boxSizing: 'border-box', color: '#fff' }}>
      <div style={{ fontSize: 80, lineHeight: 1 }}>❄️</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.1, marginBottom: 8 }}>Winter<br />Sale</div>
        <div style={{ fontSize: 15, color: '#bae6fd' }}>Cozy deals on [category] — limited time.</div>
      </div>
    </div>
  );
}

function TipTuesdayPreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(135deg,#fef3c7,#fed7aa)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 52px', gap: 28, boxSizing: 'border-box' }}>
      <div style={{ fontSize: 64 }}>💡</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#b45309', letterSpacing: 2, marginBottom: 6 }}>TIP TUESDAY</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: '#78350f', lineHeight: 1.2 }}>[One-line tip headline]</div>
      </div>
    </div>
  );
}

function UrgentUpdatePreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#fff', fontFamily: 'Arial,sans-serif', boxSizing: 'border-box', borderTop: '12px solid #dc2626' }}>
      <div style={{ padding: '40px 48px' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#dc2626', letterSpacing: 2, marginBottom: 10 }}>IMPORTANT UPDATE</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: '#0f172a', lineHeight: 1.15, marginBottom: 12 }}>[Headline about change or outage]</div>
        <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>What you need to know — short and clear.</div>
      </div>
    </div>
  );
}

function CommunityQuestionPreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#ecfeff', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 48px', boxSizing: 'border-box', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0e7490', marginBottom: 12 }}>Question for you 👇</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#134e4a', lineHeight: 1.35 }}>[Your question to the audience]?</div>
      </div>
    </div>
  );
}

function FeatureComparePreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#f8fafc', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'stretch', boxSizing: 'border-box' }}>
      <div style={{ flex: 1, padding: '36px 32px', background: '#e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 8 }}>OPTION A</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#1e293b' }}>[Name A]</div>
      </div>
      <div style={{ width: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20, color: '#6366f1', background: '#fff' }}>VS</div>
      <div style={{ flex: 1, padding: '36px 32px', background: '#ede9fe', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#6d28d9', marginBottom: 8 }}>OPTION B</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#1e293b' }}>[Name B]</div>
      </div>
    </div>
  );
}

function ThankYouCustomersPreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(135deg,#fdf2f8,#fff1f2)', fontFamily: 'Arial,sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 48px', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>🙏</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: '#9d174d', marginBottom: 8 }}>Thank you</div>
      <div style={{ fontSize: 15, color: '#be185d', fontWeight: 600 }}>[Milestone or holiday message]</div>
    </div>
  );
}

function CaseStudyPreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#f8fafc', fontFamily: 'Arial,sans-serif', padding: '36px 48px', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', letterSpacing: 2, marginBottom: 14 }}>CASE STUDY</div>
      <div style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', marginBottom: 20, lineHeight: 1.2 }}>[Client / project name]</div>
      <div style={{ display: 'flex', gap: 16 }}>
        {['Problem', 'Approach', 'Result'].map((label, i) => (
          <div key={label} style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1.5px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#6366f1', marginBottom: 6 }}>{i + 1}. {label}</div>
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>[Short teaser]</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FreebieDropPreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(145deg,#0ea5e9,#0369a1)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 52px', gap: 32, boxSizing: 'border-box', color: '#fff' }}>
      <div style={{ width: 120, height: 140, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>📥</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: '#bae6fd', marginBottom: 8 }}>FREE DOWNLOAD</div>
        <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.1, marginBottom: 8 }}>[Resource title]</div>
        <div style={{ fontSize: 14, color: '#e0f2fe' }}>PDF · [page count] pages · No email required [optional]</div>
      </div>
    </div>
  );
}

function MeetTeamPreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#fff7ed', fontFamily: 'Arial,sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px', boxSizing: 'border-box', textAlign: 'center' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#c2410c', letterSpacing: 2, marginBottom: 14 }}>MEET THE TEAM</div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
        {[1, 2, 3, 4].map((n) => (
          <div key={n} style={{ width: 64, height: 64, borderRadius: '50%', background: `hsl(${n * 50}, 70%, 65%)`, border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
        ))}
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: '#7c2d12' }}>[Role spotlight: Name]</div>
    </div>
  );
}

function MindsetReframePreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(180deg,#1e1b4b,#312e81)', fontFamily: 'Georgia,serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 64px', boxSizing: 'border-box', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 15, color: '#a5b4fc', fontStyle: 'italic', marginBottom: 16 }}>Instead of thinking…</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#94a3b8', textDecoration: 'line-through', marginBottom: 20 }}>[Old belief]</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: '#f8fafc', lineHeight: 1.35 }}>Try: [New belief]</div>
      </div>
    </div>
  );
}

function ObjectionBusterPreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#fefce8', fontFamily: 'Arial,sans-serif', padding: '36px 48px', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#a16207', marginBottom: 14 }}>“[Common objection]”</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#422006', marginBottom: 10 }}>Here&apos;s the truth 👇</div>
      <div style={{ fontSize: 15, color: '#713f12', lineHeight: 1.65 }}>[One paragraph reframing the objection]</div>
    </div>
  );
}

function CollabInvitePreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(135deg,#fce7f3,#e0e7ff)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '0 48px', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 72 }}>🤝</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#7c3aed', letterSpacing: 2, marginBottom: 6 }}>COLLAB</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: '#4c1d95', lineHeight: 1.15 }}>[Brand A] × [Brand B]</div>
        <div style={{ fontSize: 14, color: '#6b21a8', marginTop: 8 }}>[What you built together]</div>
      </div>
    </div>
  );
}

function PlanComparePreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#f1f5f9', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'stretch', gap: 14, padding: '32px 40px', boxSizing: 'border-box' }}>
      {[
        { t: 'Basic', p: '[price]', h: false },
        { t: 'Pro', p: '[price]', h: true },
      ].map((col) => (
        <div key={col.t} style={{ flex: 1, background: col.h ? '#4f46e5' : '#fff', color: col.h ? '#fff' : '#1e293b', borderRadius: 14, padding: '22px 20px', border: col.h ? 'none' : '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.85, marginBottom: 6 }}>{col.t}</div>
          <div style={{ fontSize: 36, fontWeight: 900 }}>{col.p}</div>
          <div style={{ fontSize: 12, marginTop: 8, opacity: 0.8 }}>per [period]</div>
        </div>
      ))}
    </div>
  );
}

function LiveShoppingPreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#18181b', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 48px', gap: 28, boxSizing: 'border-box', color: '#fff' }}>
      <div style={{ background: '#ef4444', color: '#fff', fontWeight: 900, fontSize: 14, letterSpacing: 2, padding: '8px 14px', borderRadius: 6 }}>LIVE</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.1, marginBottom: 8 }}>[Show title]</div>
        <div style={{ fontSize: 14, color: '#a1a1aa' }}>[Date] · [Time] · Tap link to shop live</div>
      </div>
    </div>
  );
}

function NewsletterSignupPreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#fafafa', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 56px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 520, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#171717', marginBottom: 10 }}>[Newsletter name]</div>
        <div style={{ fontSize: 15, color: '#525252', lineHeight: 1.6 }}>[One-line value prop] — link in bio to subscribe.</div>
      </div>
    </div>
  );
}

function StudentWinPreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 52px', gap: 28, boxSizing: 'border-box' }}>
      <div style={{ fontSize: 76 }}>🎓</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#047857', letterSpacing: 2, marginBottom: 6 }}>STUDENT WIN</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: '#064e3b', lineHeight: 1.2, marginBottom: 8 }}>[Outcome headline]</div>
        <div style={{ fontSize: 14, color: '#065f46' }}>From [starting point] to [result] — [timeframe]</div>
      </div>
    </div>
  );
}

/** Seasonal / holiday — each uses a unique layout & palette (no shared art between these). */
function HalloweenPromoPreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(160deg,#1e0533,#312e81)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 52px', gap: 32, boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 24, right: 40, fontSize: 44, opacity: 0.35 }}>🦇</div>
      <div style={{ position: 'absolute', bottom: 20, left: 50, fontSize: 36, opacity: 0.3 }}>🎃</div>
      <div style={{ fontSize: 88, lineHeight: 1, zIndex: 1 }}>🕯️</div>
      <div style={{ flex: 1, zIndex: 1, color: '#fff' }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: '#fb923c', fontWeight: 800, marginBottom: 8 }}>HALLOWEEN</div>
        <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.05, marginBottom: 8 }}>Spooky<br /><span style={{ color: '#c4b5fd' }}>Savings</span></div>
        <div style={{ fontSize: 14, color: '#e9d5ff', opacity: 0.95 }}>Treats, no tricks — limited time.</div>
      </div>
    </div>
  );
}

function ChristmasPromoPreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#7f1d1d', fontFamily: 'Arial,sans-serif', display: 'flex', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ width: '42%', background: 'linear-gradient(180deg,#14532d,#166534)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '0 24px' }}>
        <div style={{ fontSize: 72, marginBottom: 8 }}>🎄</div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: '#bbf7d0' }}>MERRY</div>
      </div>
      <div style={{ flex: 1, padding: '40px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#fff', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 16, right: 20, fontSize: 22 }}>✨</div>
        <div style={{ fontSize: 13, color: '#fecaca', letterSpacing: 3, marginBottom: 8 }}>CHRISTMAS</div>
        <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>Holiday<br />Sale</div>
        <div style={{ height: 4, width: 120, background: 'linear-gradient(90deg,#fbbf24,#f59e0b)', borderRadius: 2, marginBottom: 12 }} />
        <div style={{ fontSize: 14, color: '#fecaca', lineHeight: 1.5 }}>Gifts they&apos;ll love — order early.</div>
      </div>
    </div>
  );
}

function NewYearsPromoPreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'radial-gradient(ellipse at 30% 20%,#1e293b 0%,#020617 65%)', fontFamily: 'Arial,sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 48px', boxSizing: 'border-box', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      {[12, 28, 55, 72, 88].map((l, i) => (
        <div key={i} style={{ position: 'absolute', left: `${l}%`, top: `${15 + (i * 17) % 55}%`, width: 6, height: 6, borderRadius: '50%', background: i % 2 ? '#fbbf24' : '#fde68a', opacity: 0.7 }} />
      ))}
      <div style={{ fontSize: 14, color: '#94a3b8', letterSpacing: 4, marginBottom: 10 }}>NEW YEAR</div>
      <div style={{ fontSize: 56, fontWeight: 900, background: 'linear-gradient(135deg,#fef08a,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12 }}>Fresh Start</div>
      <div style={{ fontSize: 15, color: '#cbd5e1', maxWidth: 440, lineHeight: 1.5 }}>Goals, resets &amp; [your offer] — link in bio.</div>
    </div>
  );
}

function PresidentsDayPromoPreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#0f172a', fontFamily: 'Arial,sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 56px', boxSizing: 'border-box', color: '#fff', position: 'relative' }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 8, background: 'repeating-linear-gradient(90deg,#b91c1c 0,#b91c1c 28px,#f8fafc 28px,#f8fafc 56px,#1e3a8a 56px,#1e3a8a 84px)' }} />
      <div style={{ fontSize: 12, letterSpacing: 3, color: '#94a3b8', marginBottom: 10 }}>LONG WEEKEND</div>
      <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.05, marginBottom: 12 }}>President&apos;s<br /><span style={{ color: '#60a5fa' }}>Day Sale</span></div>
      <div style={{ fontSize: 15, color: '#cbd5e1', maxWidth: 480 }}>Extra day to save on [category].</div>
    </div>
  );
}

function SpringSeasonPreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(135deg,#fce7f3 0%,#fef9c3 45%,#d1fae5 100%)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 52px', gap: 36, boxSizing: 'border-box' }}>
      <div style={{ fontSize: 96, lineHeight: 1 }}>🌸</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#be185d', letterSpacing: 2, marginBottom: 8 }}>SPRING HAS SPRUNG</div>
        <div style={{ fontSize: 44, fontWeight: 900, color: '#831843', lineHeight: 1.1, marginBottom: 8 }}>Bloom &amp;<br />Save</div>
        <div style={{ fontSize: 15, color: '#9d174d', lineHeight: 1.5 }}>Fresh picks for [category] — limited window.</div>
      </div>
    </div>
  );
}

function FriendsgivingGatherPreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(180deg,#431407,#78350f)', fontFamily: 'Georgia,serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 48px', boxSizing: 'border-box', color: '#fef3c7' }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>🍽️</div>
      <div style={{ fontSize: 15, letterSpacing: 4, color: '#fcd34d', marginBottom: 8 }}>FRIENDSGIVING</div>
      <div style={{ fontSize: 40, fontWeight: 700, fontStyle: 'italic', marginBottom: 10 }}>Gather &amp; Give Thanks</div>
      <div style={{ fontSize: 14, color: '#fde68a', maxWidth: 460, lineHeight: 1.6 }}>Host notes, recipes &amp; gratitude — not a doorbuster sale.</div>
    </div>
  );
}

function EarthDayPromoPreview() {
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(135deg,#022c22,#0f766e,#155e75)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 48px', gap: 32, boxSizing: 'border-box', color: '#fff' }}>
      <div style={{ width: 160, height: 160, borderRadius: '50%', background: 'linear-gradient(145deg,#0369a1 30%,#15803d 70%)', border: '4px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, flexShrink: 0 }}>🌍</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, letterSpacing: 3, color: '#99f6e4', marginBottom: 8 }}>EARTH DAY</div>
        <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>Planet‑first<br />pledge</div>
        <div style={{ fontSize: 14, color: '#ccfbf1', lineHeight: 1.5 }}>Eco steps that fit real life.</div>
      </div>
    </div>
  );
}

/** Holiday shipping cutoff — kraft “shipping label” look (distinct from Christmas sale card & Easter). */
function ChristmasShipByPreview() {
  return (
    <div style={{ width: PW, height: PH, background: '#d6d3d1', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 48px', boxSizing: 'border-box' }}>
      <div style={{ background: '#fafaf9', border: '2px dashed #78716c', borderRadius: 4, padding: '28px 40px', maxWidth: 620, boxShadow: '0 12px 28px rgba(0,0,0,0.12)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 12, right: 16, background: '#b91c1c', color: '#fff', fontSize: 11, fontWeight: 900, letterSpacing: 1, padding: '6px 12px', transform: 'rotate(-6deg)' }}>URGENT</div>
        <div style={{ fontSize: 11, color: '#57534e', letterSpacing: 2, marginBottom: 8 }}>TRACKING · HOLIDAY DEADLINE</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: '#1c1917', lineHeight: 1.1, marginBottom: 10 }}>Order by [Date]</div>
        <div style={{ fontSize: 14, color: '#44403c', lineHeight: 1.6 }}>Arrives before [Holiday] — carrier cutoffs vary.</div>
        <div style={{ marginTop: 16, height: 3, background: 'repeating-linear-gradient(90deg,#1c1917 0,#1c1917 4px,transparent 4px,transparent 8px)', opacity: 0.25 }} />
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
   PLACEHOLDER HINT HELPER
══════════════════════════════════════════════════════════ */
function getHint(p) {
  const map = {
    '[Your Name]':'e.g. Jane Smith','[Brand Name]':'e.g. Acme Co.',
    '[Product Name]':'e.g. SuperWidget Pro','[target audience]':'e.g. small business owners',
    '[goal]':'e.g. grow their audience','[pain point]':'e.g. wasting time',
    '[niche]':'e.g. fitness','[topic]':'e.g. social media',
    '[your offer]':'e.g. free consultation','[industry]':'e.g. e-commerce',
    '[Date]':'e.g. Dec 25','[Time]':'e.g. 6:00 PM EST',
    '[X]':'e.g. 50','[timeframe]':'e.g. 48 hours',
    '[Location]':'e.g. Online / Zoom','[Event Name]':'e.g. Business Summit 2025',
    '[Course Name]':'e.g. Social Media Mastery','[Client Name]':'e.g. Sarah T.',
  };
  return map[p] || `e.g. ${p.replace(/\[|\]/g,'')}`;
}

/* ══════════════════════════════════════════════════════════
   CUSTOMIZE MODAL
══════════════════════════════════════════════════════════ */
function CustomizeModal({ template, onClose, onConfirm, onDownloadDesign, designDownloading }) {
  const placeholders = [...new Set(template.caption.match(/\[[^\]]+\]/g) || [])];
  const [values, setValues] = useState(Object.fromEntries(placeholders.map(p => [p, ''])));
  const [footerDlOpen, setFooterDlOpen] = useState(false);

  const filled = template.caption.replace(/\[[^\]]+\]/g, m => values[m] || m);

  const set = (p, v) => setValues(prev => ({ ...prev, [p]: v }));

  useEffect(() => {
    if (!footerDlOpen) return;
    const close = () => setFooterDlOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [footerDlOpen]);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:900, maxHeight:'90vh', display:'flex', flexDirection:'column', boxShadow:'0 28px 64px rgba(0,0,0,0.3)', overflow:'hidden' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding:'18px 24px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:17, fontWeight:800, color:'#1e293b' }}>✏️ Customize Template</div>
            <div style={{ fontSize:13, color:'#64748b', marginTop:2 }}>Fill in your details — see the live preview update on the right</div>
          </div>
          <button onClick={onClose} style={{ background:'#f1f5f9', border:'none', cursor:'pointer', color:'#64748b', width:34, height:34, borderRadius:8, fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>

          {/* Left — input fields */}
          <div style={{ width:340, borderRight:'1px solid #f1f5f9', padding:'20px 24px', overflowY:'auto', flexShrink:0 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>
              {placeholders.length} fields to fill
            </div>
            {placeholders.length === 0 && (
              <div style={{ fontSize:13, color:'#94a3b8', textAlign:'center', padding:'20px 0' }}>No placeholders found.<br/>Ready to use as-is!</div>
            )}
            {placeholders.map(p => (
              <div key={p} style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#475569', marginBottom:6 }}>
                  {p.replace(/\[|\]/g,'')}
                </label>
                <input
                  value={values[p]}
                  onChange={e => set(p, e.target.value)}
                  placeholder={getHint(p)}
                  style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #e2e8f0', fontSize:13, color:'#1e293b', outline:'none', boxSizing:'border-box',
                    fontFamily:'"Segoe UI",Arial,sans-serif' }}
                  onFocus={e => e.target.style.borderColor='#6366f1'}
                  onBlur={e => e.target.style.borderColor='#e2e8f0'}
                />
              </div>
            ))}
          </div>

          {/* Right — live preview */}
          <div style={{ flex:1, padding:'20px 24px', overflowY:'auto', background:'#f8fafc' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>Live Preview</div>
            <pre style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'16px 18px', fontSize:13, color:'#334155', lineHeight:1.9, whiteSpace:'pre-wrap', fontFamily:'"Segoe UI",Arial,sans-serif', margin:0, minHeight:200 }}>
              {filled.split(/(\[[^\]]+\])/g).map((part, i) =>
                /^\[[^\]]+\]$/.test(part)
                  ? <mark key={i} style={{ background:'#fef9c3', color:'#92400e', borderRadius:3, padding:'0 2px' }}>{part}</mark>
                  : part
              )}
            </pre>
            <div style={{ fontSize:12, color:'#94a3b8', marginTop:10 }}>
              💡 Highlighted text = unfilled placeholders
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'16px 24px', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', alignItems:'center', gap:10, flexShrink:0, background:'#fff' }}>
          <button onClick={onClose}
            style={{ padding:'10px 22px', borderRadius:8, border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            Cancel
          </button>
          {onDownloadDesign && (
            <div style={{ position:'relative' }}>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setFooterDlOpen(o => !o); }}
                style={{ padding:'10px 16px', borderRadius:8, border:'1.5px solid #e2e8f0', background:'#fff', color:'#334155', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}
                title="Download design as image or PDF"
              >
                {designDownloading ? '⏳' : '⬇'} Download
              </button>
              {footerDlOpen && (
                <div
                  style={{ position:'absolute', bottom:'100%', right:0, marginBottom:6, background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, boxShadow:'0 4px 16px rgba(0,0,0,0.12)', overflow:'hidden', zIndex:20, minWidth:120 }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ padding:'6px 10px', fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, borderBottom:'1px solid #f1f5f9' }}>Download as</div>
                  {[['png','🖼 PNG'],['jpg','📷 JPG'],['pdf','📄 PDF']].map(([fmt, label]) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={e => { onDownloadDesign(fmt, e); setFooterDlOpen(false); }}
                      style={{ width:'100%', padding:'9px 14px', border:'none', background:'none', textAlign:'left', fontSize:13, fontWeight:600, cursor:'pointer', color:'#1e293b', display:'flex', alignItems:'center', gap:8 }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button type="button" onClick={() => onConfirm(filled)}
            style={{ padding:'10px 28px', borderRadius:8, border:'none', background:'#6366f1', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            Use in Publisher →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function CaptionTemplates({ onBack, onUseTemplate }) {
  const [cat, setCat]             = useState('All');
  const [preview, setPreview]     = useState(null);
  const [customize, setCustomize] = useState(null);
  const [copied, setCopied]       = useState(null);
  const [dlMenu, setDlMenu]       = useState(null);   // templateId with open dropdown
  const [dlTarget, setDlTarget]   = useState(null);   // { template, format }
  const [dlLoading, setDlLoading] = useState(null);   // templateId being downloaded
  const captureRef                = useRef(null);

  const filtered = TEMPLATES.filter(t => cat === 'All' || t.category === cat);

  // Close download menu when clicking outside
  useEffect(() => {
    if (!dlMenu) return;
    const close = () => setDlMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [dlMenu]);

  // Trigger html2canvas after hidden div renders the template
  useEffect(() => {
    if (!dlTarget || !captureRef.current) return;
    const { template, format } = dlTarget;
    const timer = setTimeout(async () => {
      try {
        const canvas = await html2canvas(captureRef.current, {
          width: PW, height: PH, scale: 2,
          useCORS: true, logging: false, backgroundColor: '#ffffff',
        });
        const filename = template.name.replace(/\s+/g, '-').toLowerCase();

        if (format === 'pdf') {
          // Landscape PDF sized exactly to the design (px → pt: 1px = 0.75pt)
          const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [PW, PH] });
          pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, PW, PH);
          pdf.save(`${filename}.pdf`);
        } else {
          const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
          const link = document.createElement('a');
          link.download = `${filename}.${format}`;
          link.href = canvas.toDataURL(mime, 0.95);
          link.click();
        }
      } catch (err) {
        console.error('Download failed:', err);
      } finally {
        setDlLoading(null);
        setDlTarget(null);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [dlTarget]);

  const handleDownload = (t, format, e) => {
    e.stopPropagation();
    setDlMenu(null);
    setDlLoading(t.id);
    setDlTarget({ template: t, format });
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCustomizeConfirm = (filledCaption) => {
    setCustomize(null);
    setPreview(null);
    if (onUseTemplate) onUseTemplate(filledCaption);
    if (onBack) onBack();
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f1f5f9', fontFamily:'"Segoe UI",Arial,sans-serif' }}>

      {/* ── Hidden capture div for html2canvas ── */}
      <div style={{ position:'fixed', top:-9999, left:-9999, width:PW, height:PH, overflow:'hidden', pointerEvents:'none' }}
        ref={captureRef}>
        {dlTarget && (() => { const P = dlTarget.template.Preview; return <P />; })()}
      </div>

      {/* ── Header ── */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'18px 32px', display:'flex', alignItems:'center', gap:16 }}>
        <button onClick={onBack}
          style={{ background:'#f1f5f9', border:'none', cursor:'pointer', fontSize:14, color:'#6366f1', padding:'8px 16px', borderRadius:8, fontWeight:700 }}>
          ← Back
        </button>
        <div>
          <div style={{ fontSize:20, fontWeight:800, color:'#1e293b' }}>🎨 Design Templates</div>
          <div style={{ fontSize:13, color:'#64748b' }}>{TEMPLATES.length} professional social media designs — preview, customize, and send captions to the publisher</div>
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
                <div style={{ display:'flex', gap:6, marginTop:12 }}>
                  <button onClick={() => handleCopy(t.caption, t.id)}
                    style={{ flex:1, padding:'8px 4px', borderRadius:8, border:'1.5px solid #e2e8f0', background: copied===t.id ? '#f0fdf4' : '#fff', color: copied===t.id ? '#15803d' : '#64748b', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                    {copied===t.id ? '✓' : '📋'} Copy
                  </button>
                  <button type="button" onClick={() => setCustomize(t)} title="Customize placeholders, then use in Video Publisher"
                    style={{ flex:1, padding:'8px 4px', borderRadius:8, border:'none', background:'#6366f1', color:'#fff', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                    ✏️ Use
                  </button>
                  {/* Download dropdown */}
                  <div style={{ position:'relative' }}>
                    <button
                      onClick={e => { e.stopPropagation(); setDlMenu(dlMenu === t.id ? null : t.id); }}
                      style={{ padding:'8px 10px', borderRadius:8, border:'1.5px solid #e2e8f0', background:'#fff', color:'#334155', fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:3 }}
                      title="Download as image">
                      {dlLoading === t.id ? '⏳' : '⬇'}
                    </button>
                    {dlMenu === t.id && (
                      <div style={{ position:'absolute', bottom:'110%', right:0, background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, boxShadow:'0 4px 16px rgba(0,0,0,0.12)', overflow:'hidden', zIndex:100, minWidth:100 }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ padding:'6px 8px', fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, borderBottom:'1px solid #f1f5f9' }}>Download as</div>
                        {[['png','🖼 PNG'],['jpg','📷 JPG'],['pdf','📄 PDF']].map(([fmt, label]) => (
                          <button key={fmt} onClick={e => handleDownload(t, fmt, e)}
                            style={{ width:'100%', padding:'9px 14px', border:'none', background:'none', textAlign:'left', fontSize:13, fontWeight:600, cursor:'pointer', color:'#1e293b', display:'flex', alignItems:'center', gap:8 }}
                            onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background='none'}>
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
              <div style={{ padding:'18px 24px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:17, fontWeight:800, color:'#1e293b', marginBottom:4 }}>{preview.name}</div>
                  <span style={{ fontSize:12, background:getCatColor(preview.category).bg, color:getCatColor(preview.category).text, padding:'2px 10px', borderRadius:10, fontWeight:600 }}>{preview.category}</span>
                </div>
                <button onClick={() => setPreview(null)}
                  style={{ background:'#f1f5f9', border:'none', fontSize:16, cursor:'pointer', color:'#64748b', width:34, height:34, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
              </div>
              <div style={{ background:'#f1f5f9', padding:24, display:'flex', justifyContent:'center' }}>
                <div style={{ width:'100%', maxWidth:PW, aspectRatio:`${PW}/${PH}`, overflow:'hidden', borderRadius:14, boxShadow:'0 4px 20px rgba(0,0,0,0.12)' }}>
                  <PreviewComp />
                </div>
              </div>
              <div style={{ padding:'20px 24px 28px' }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Caption Template</div>
                <pre style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12, padding:'16px 18px', fontSize:13, color:'#334155', lineHeight:1.8, whiteSpace:'pre-wrap', fontFamily:'"Segoe UI",Arial,sans-serif', margin:0 }}>
                  {preview.caption}
                </pre>
                <div style={{ marginTop:16, display:'flex', gap:10, justifyContent:'flex-end', flexWrap:'wrap' }}>
                  <button onClick={() => handleCopy(preview.caption, preview.id)}
                    style={{ padding:'10px 22px', borderRadius:8, border:'1.5px solid #e2e8f0', background: copied===preview.id ? '#f0fdf4' : '#fff', color: copied===preview.id ? '#15803d' : '#64748b', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                    {copied===preview.id ? '✓ Copied!' : '📋 Copy Caption'}
                  </button>
                  {[['png','🖼 PNG'],['jpg','📷 JPG'],['pdf','📄 PDF']].map(([fmt, label]) => (
                    <button key={fmt} onClick={e => handleDownload(preview, fmt, e)}
                      style={{ padding:'10px 18px', borderRadius:8, border:'1.5px solid #e2e8f0', background:'#fff', color:'#334155', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                      {dlLoading === preview.id ? '⏳' : `⬇ ${label.split(' ')[1]}`}
                    </button>
                  ))}
                  <button type="button" onClick={() => { setPreview(null); setCustomize(preview); }}
                    style={{ padding:'10px 26px', borderRadius:8, border:'none', background:'#6366f1', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                    ✏️ Customize &amp; Use →
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Customize Modal ── */}
      {customize && (
        <CustomizeModal
          template={customize}
          onClose={() => setCustomize(null)}
          onConfirm={handleCustomizeConfirm}
          onDownloadDesign={(format, e) => handleDownload(customize, format, e)}
          designDownloading={dlLoading === customize.id}
        />
      )}
    </div>
  );
}
