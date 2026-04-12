import React, { useState } from 'react';

const CATS = ['All','Business','Sale','Content','Holiday','Product'];
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
];

function getCatColor(cat) {
  const map = {
    Business: { bg:'#eff6ff', text:'#1d4ed8' },
    Sale:     { bg:'#fef2f2', text:'#dc2626' },
    Content:  { bg:'#f0fdf4', text:'#15803d' },
    Holiday:  { bg:'#fff7ed', text:'#c2410c' },
    Product:  { bg:'#faf5ff', text:'#7c3aed' },
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
