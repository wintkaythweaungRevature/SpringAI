import React, { useState, useRef, useEffect, useLayoutEffect, useContext, createContext, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/** Context that injects user-typed design text into every Preview component */
const DesignTextCtx = createContext({});
/**
 * In a Preview component call:  const t = useText({ headline:'Default', subtitle:'Default', ... })
 * Any key filled by the user in the Customize modal will override the default.
 */
function useText(defaults) {
  const ctx = useContext(DesignTextCtx);
  // Auto-report defaults so the Customize modal discovers editable fields
  const onDefaults = ctx.__onDefaults;
  const defaultsRef = useRef(defaults);
  useEffect(() => {
    if (onDefaults) onDefaults(defaultsRef.current);
  }, [onDefaults]);
  const out = { ...defaults };
  Object.keys(defaults).forEach(k => {
    const v = ctx[k];
    if (typeof v === 'string' && v.trim()) out[k] = v;
  });
  return out;
}

const CATS = ['All','Business','Sale','Content','Holiday','Product','Quote','Event','Announce'];
const PW = 780, PH = 440, CW = 300, CH = 170;
const SC = CW / PW; // ≈ 0.3846

/** Gallery / export colour themes (swatches ≈ reference UI). `filter` tints the artwork inside the frame. */
const PREVIEW_THEMES = [
  // Most templates use navy/blue (~210° hue) as their primary color.
  // hue-rotate(X) shifts ALL hues by X degrees.
  // To get target color T from base 210°: rotation = T - 210  (mod 360)
  { id: 'default',   label: 'Default',   frameBg: '#e8edf2',                              filter: 'none',                                                     swatch: ['#1a3a5c','#94a3b8','#e2e8f0'] },
  { id: 'earth',     label: 'Earth',     frameBg: 'linear-gradient(160deg,#e4e9e0,#c9d4c2)', filter: 'hue-rotate(-110deg) saturate(0.85) brightness(0.97)',     swatch: ['#3d4a38','#8b9a7d','#f8faf8'] },
  { id: 'neutral',   label: 'Neutral',   frameBg: 'linear-gradient(160deg,#f3eee8,#dcd7d0)', filter: 'saturate(0.28) sepia(0.14) brightness(1.04)',             swatch: ['#d6cfc4','#faf8f5','#2d2a28'] },
  { id: 'floral',    label: 'Floral',    frameBg: 'linear-gradient(160deg,#ede4f0,#f5e6ea)', filter: 'hue-rotate(90deg) saturate(1.15)',                        swatch: ['#9d7a8c','#c9b8c8','#faf5f7'] },
  { id: 'corporate', label: 'Corporate', frameBg: 'linear-gradient(160deg,#dbeafe,#e0f2fe)', filter: 'hue-rotate(-25deg) saturate(1.1) brightness(1.02)',       swatch: ['#0e7490','#f8fafc','#0f172a'] },
  { id: 'warm',      label: 'Warm',      frameBg: 'linear-gradient(160deg,#fff4e6,#fde68a)', filter: 'hue-rotate(170deg) saturate(1.25) brightness(1.05)',      swatch: ['#c2410c','#fef3c7','#fefce8'] },
  { id: 'grey',      label: 'Grey',      frameBg: 'linear-gradient(160deg,#e2e8f0,#cbd5e1)', filter: 'saturate(0.15) contrast(1.08)',                           swatch: ['#475569','#f1f5f9','#1e293b'] },
  { id: 'navy',      label: 'Navy',      frameBg: 'linear-gradient(160deg,#dbeafe,#bfdbfe)', filter: 'hue-rotate(22deg) saturate(1.05) brightness(0.92)',       swatch: ['#1e3a8a','#ffffff','#1e40af'] },
  { id: 'mono',      label: 'Mono',      frameBg: 'linear-gradient(160deg,#f4f4f5,#d4d4d8)', filter: 'grayscale(0.9) contrast(1.1)',                            swatch: ['#18181b','#fafafa','#52525b'] },
  { id: 'rose',      label: 'Rose',      frameBg: 'linear-gradient(160deg,#ffe4e6,#fecdd3)', filter: 'hue-rotate(135deg) saturate(1.2)',                        swatch: ['#be185d','#fda4af','#fff1f2'] },
  { id: 'forest',    label: 'Forest',    frameBg: 'linear-gradient(160deg,#dcfce7,#bbf7d0)', filter: 'hue-rotate(-80deg) saturate(1.2) brightness(1.02)',       swatch: ['#166534','#86efac','#f0fdf4'] },
  { id: 'sunset',    label: 'Sunset',    frameBg: 'linear-gradient(160deg,#ffedd5,#fde68a)', filter: 'hue-rotate(150deg) saturate(1.5) brightness(1.05)',       swatch: ['#c2410c','#f97316','#fff7ed'] },
];

function getPreviewTheme(themeId) {
  return PREVIEW_THEMES.find((t) => t.id === themeId) || PREVIEW_THEMES[0];
}

/** User text or a clear slot label — never fake sample emails/handles/URLs */
function previewText(value, slotLabel) {
  const v = value != null && String(value).trim() !== '' ? String(value).trim() : '';
  return v || `[${slotLabel}]`;
}

/* ══════════════════════════════════════════════════════════
   PREVIEW COMPONENTS  — each renders at 780×440
══════════════════════════════════════════════════════════ */

function NavyBizCover({ fields = {} }) {
  const biz     = previewText(fields.businessName, 'Business / brand name');
  const handle  = previewText(fields.handle, 'Social handle');
  const email   = previewText(fields.email, 'Contact email');
  const website = previewText(fields.website, 'Website URL');
  return (
    <div style={{width:PW,height:PH,background:'#1a3a5c',display:'flex',alignItems:'center',padding:'0 64px',gap:48,fontFamily:'Arial,sans-serif',boxSizing:'border-box'}}>
      <div style={{flex:1,color:'#fff'}}>
        <div style={{color:'#8ecde8',fontSize:16,marginBottom:10}}>📱 {handle} &nbsp;•&nbsp; 📧 {email}</div>
        <div style={{fontSize:54,fontWeight:900,lineHeight:1.05,marginBottom:12,letterSpacing:-1}}>{biz}</div>
        <div style={{color:'#8ecde8',fontSize:14,marginTop:18,letterSpacing:1}}>{website}</div>
      </div>
      <div style={{width:190,height:310,background:'#243d5e',borderRadius:14,overflow:'hidden',flexShrink:0,display:'flex',alignItems:'flex-end',justifyContent:'center',position:'relative'}}>
        <div style={{width:95,height:250,background:'#4a80aa',borderRadius:'48px 48px 0 0'}}/>
        <div style={{position:'absolute',top:50,left:'50%',transform:'translateX(-50%)',width:64,height:64,background:'#3a6a90',borderRadius:'50%'}}/>
      </div>
    </div>
  );
}

function WhiteBrand({ fields = {} }) {
  const biz     = previewText(fields.businessName, 'Business / brand name');
  const author  = previewText(fields.name, 'Your name');
  const handle  = previewText(fields.handle, 'Social handle');
  const email   = previewText(fields.email, 'Contact email');
  const website = previewText(fields.website, 'Website URL');
  return (
    <div style={{width:PW,height:PH,background:'#f8f9fc',display:'flex',alignItems:'center',padding:'0 64px',gap:48,fontFamily:'Arial,sans-serif',boxSizing:'border-box',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',right:-100,top:-100,width:460,height:460,borderRadius:'50%',background:'#dde8f5'}}/>
      <div style={{width:190,height:190,borderRadius:'50%',background:'#b8d0e8',flexShrink:0,zIndex:1,overflow:'hidden',display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
        <div style={{width:84,height:160,background:'#7fafd0',borderRadius:'42px 42px 0 0'}}/>
      </div>
      <div style={{flex:1,zIndex:1}}>
        <div style={{fontSize:15,color:'#8090a0',letterSpacing:3,textTransform:'uppercase',marginBottom:4}}>[Section label]</div>
        <div style={{fontSize:54,fontWeight:900,color:'#1a3a5c',lineHeight:1.05,marginBottom:8}}>{biz}</div>
        <div style={{fontSize:15,color:'#8090a0',marginBottom:20}}>by {author}</div>
        <div style={{fontSize:13,color:'#555',marginBottom:16}}>📱 {handle} &nbsp;&nbsp; 📧 {email}</div>
        <div style={{borderTop:'2px solid #1a3a5c',paddingTop:10,fontSize:13,color:'#1a3a5c',fontWeight:700,letterSpacing:1}}>{website}</div>
      </div>
    </div>
  );
}

function DigitalExpert({ fields = {} }) {
  const handle  = previewText(fields.handle, 'Social handle').toUpperCase();
  const email   = previewText(fields.email, 'Contact email').toUpperCase();
  const website = previewText(fields.website, 'Website URL');
  const t = useText({
    line1: '[Headline 1]',
    line2: '[Headline 2]',
    lineAccent: '[Accent line]',
    sub: '[Subtitle — e.g. role or tagline]',
  });
  return (
    <div style={{width:PW,height:PH,display:'flex',fontFamily:'Arial,sans-serif',overflow:'hidden'}}>
      <div style={{flex:1,background:'#9ab5cc',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:190,height:370,background:'#7095b5',borderRadius:'95px 95px 0 0'}}/>
        <div style={{position:'absolute',bottom:240,left:'50%',transform:'translateX(-50%) translateY(-50%)',width:90,height:90,background:'#5c80a5',borderRadius:'50%'}}/>
      </div>
      <div style={{width:390,background:'#1a3a5c',padding:'60px 44px',display:'flex',flexDirection:'column',justifyContent:'center',color:'#fff',boxSizing:'border-box'}}>
        <div style={{fontSize:13,color:'#7fc4e8',letterSpacing:2,marginBottom:16}}>📱 {handle} &nbsp; 📧 {email}</div>
        <div style={{fontSize:44,fontWeight:900,lineHeight:1.15,marginBottom:10}}>{t.line1}<br/>{t.line2}<br/><span style={{color:'#7fc4e8'}}>{t.lineAccent}</span></div>
        <div style={{fontSize:16,color:'#c0d8ec',marginBottom:24}}>{t.sub}</div>
        <div style={{borderTop:'1px solid #2d5580',paddingTop:18,fontSize:13,color:'#7fc4e8'}}>{website}</div>
      </div>
    </div>
  );
}

function ThanksgivingSale() {
  const t = useText({
    holiday: 'Thanksgiving',
    discount: '30',
    website: '[Website URL]',
    body: '[Sale or promo copy — edit in Customize]',
  });
  return (
    <div style={{width:PW,height:PH,display:'flex',fontFamily:'Arial,sans-serif',overflow:'hidden'}}>
      <div style={{width:270,background:'#3a8fa0',padding:'50px 36px',display:'flex',flexDirection:'column',justifyContent:'center',color:'#fff',boxSizing:'border-box',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',bottom:-60,right:-60,width:180,height:180,borderRadius:'50%',background:'rgba(255,255,255,0.07)'}}/>
        <div style={{fontSize:26,fontWeight:800,marginBottom:2}}>{t.holiday}</div>
        <div style={{fontSize:40,fontWeight:900,marginBottom:18}}>SALE</div>
        <div style={{fontSize:13,color:'#c8eef7',marginBottom:4}}>up to</div>
        <div style={{fontSize:90,fontWeight:900,lineHeight:0.85,color:'#fff'}}>{t.discount}<span style={{fontSize:44}}>%</span></div>
        <div style={{fontSize:20,color:'#c8eef7',marginBottom:24}}>off</div>
        <div style={{fontSize:11,color:'#a0dded',borderTop:'1px solid rgba(255,255,255,0.25)',paddingTop:12}}>{t.website}</div>
      </div>
      <div style={{flex:1,background:'#f5f0eb',padding:'50px 44px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:20,right:20,width:210,height:210,background:'#e0d5c8',borderRadius:'50%'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{fontSize:14,color:'#666',lineHeight:1.9,marginBottom:20,whiteSpace:'pre-line'}}>
            {t.body}
          </div>
          <div style={{width:80,height:4,background:'#3a8fa0',borderRadius:2}}/>
        </div>
      </div>
    </div>
  );
}

function LimitedOffer() {
  const t = useText({
    badge: 'LIMITED TIME',
    headline: 'OFFER',
    body: 'Croissant pastry dessert marzipan sesame snaps.\nBiscuit marzipan candy canes cotton candy icing.',
    cta: 'CTA GOES HERE',
  });
  return (
    <div style={{width:PW,height:PH,background:'#f5f8fc',fontFamily:'Arial,sans-serif',position:'relative',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:'60%',background:'#3a8fa0',borderRadius:'0 0 55% 55%'}}/>
      <div style={{position:'relative',zIndex:1,textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',width:'100%'}}>
        <div style={{color:'rgba(255,255,255,0.85)',fontSize:20,letterSpacing:4,marginBottom:4}}>{t.badge}</div>
        <div style={{color:'#fff',fontSize:96,fontWeight:900,lineHeight:0.9,marginBottom:0}}>{t.headline}</div>
        <div style={{marginTop:30,background:'#fff',borderRadius:'20px 20px 0 0',padding:'28px 52px 0',width:400,boxSizing:'border-box',boxShadow:'0 -8px 24px rgba(0,0,0,0.08)'}}>
          <div style={{fontSize:14,color:'#666',marginBottom:20,lineHeight:1.7,whiteSpace:'pre-line'}}>{t.body}</div>
          <div style={{background:'#3a8fa0',color:'#fff',padding:'14px 36px',borderRadius:8,display:'inline-block',fontWeight:700,fontSize:16,letterSpacing:2}}>{t.cta}</div>
        </div>
      </div>
    </div>
  );
}

function EasterSale() {
  const t = useText({
    badge: 'COMING SOON',
    holiday: 'Easter Sunday',
    headline: 'SALE',
    body: 'Croissant pastry dessert marzipan sesame snaps. Biscuit marzipan candy canes.',
    cta: 'Brush up on all our latest products →',
  });
  return (
    <div style={{width:PW,height:PH,background:'#f5f0e8',fontFamily:'Arial,sans-serif',overflow:'hidden',display:'flex',alignItems:'center',position:'relative'}}>
      <div style={{position:'absolute',left:0,top:0,width:'52%',height:'100%',background:'#4a9bb5',clipPath:'polygon(0 0,85% 0,70% 100%,0 100%)'}}/>
      <div style={{position:'relative',zIndex:1,width:340,padding:'0 44px',color:'#fff',boxSizing:'border-box'}}>
        <div style={{fontSize:13,letterSpacing:4,marginBottom:10,opacity:0.8}}>{t.badge}</div>
        <div style={{fontSize:32,fontWeight:800,marginBottom:2}}>{t.holiday}</div>
        <div style={{fontSize:58,fontWeight:900,marginBottom:20,lineHeight:1}}>{t.headline}</div>
        <div style={{fontSize:13,color:'#c8eaf7',marginBottom:22,lineHeight:1.7}}>{t.body}</div>
        <div style={{borderTop:'1px solid rgba(255,255,255,0.35)',paddingTop:14,fontSize:14,color:'#c8eaf7',fontWeight:600}}>{t.cta}</div>
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
  const t = useText({
    number: '42',
    headline: 'Social Media\nPost Ideas',
    body: 'Biscuit lollipop jelly-o cake cookie caramels. Brownie donut muffin biscuit jelly is sweet.',
  });
  return (
    <div style={{width:PW,height:PH,background:'#fff',fontFamily:'Arial,sans-serif',overflow:'hidden',display:'flex',alignItems:'center',position:'relative'}}>
      <div style={{position:'absolute',top:0,right:0,width:'56%',height:'100%',background:'#e8f4f8',clipPath:'polygon(16% 0,100% 0,100% 100%,0 100%)'}}/>
      <div style={{paddingLeft:56,zIndex:1,position:'relative'}}>
        <div style={{fontSize:220,fontWeight:900,color:'#1a3a5c',lineHeight:0.85,opacity:0.1,position:'absolute',top:'50%',left:30,transform:'translateY(-50%)'}}>{t.number}</div>
        <div style={{fontSize:170,fontWeight:900,color:'#1a3a5c',lineHeight:0.9,position:'relative',zIndex:1}}>{t.number}</div>
      </div>
      <div style={{position:'absolute',right:48,zIndex:1,width:320}}>
        <div style={{fontSize:44,fontWeight:800,color:'#2e7d9e',lineHeight:1.2,marginBottom:14,whiteSpace:'pre-line'}}>{t.headline}</div>
        <div style={{fontSize:14,color:'#888',lineHeight:1.8}}>{t.body}</div>
      </div>
    </div>
  );
}

function UltimateGuide() {
  const t = useText({
    badge: 'THE ULTIMATE GUIDE',
    topic: 'Pinterest',
    subtopic: 'Marketing',
    subtitle: 'The Ultimate Guide',
    body: '[Body copy — edit in Customize]',
    website: '[Website URL]',
  });
  return (
    <div style={{width:PW,height:PH,display:'flex',fontFamily:'Arial,sans-serif',overflow:'hidden'}}>
      <div style={{width:430,background:'#1a3a5c',padding:'56px 48px',display:'flex',flexDirection:'column',justifyContent:'center',color:'#fff',boxSizing:'border-box'}}>
        <div style={{fontSize:12,color:'#7fc4e8',letterSpacing:2,marginBottom:14}}>{t.badge}</div>
        <div style={{fontSize:46,fontWeight:900,lineHeight:1.1,marginBottom:10}}>{t.topic}<br/><span style={{color:'#7fc4e8'}}>{t.subtopic}</span></div>
        <div style={{fontSize:18,color:'#c0d8ec',fontStyle:'italic',marginBottom:24}}>{t.subtitle}</div>
        <div style={{fontSize:13,color:'#a0c8e0',lineHeight:1.8,marginBottom:24}}>{t.body}</div>
        <div style={{fontSize:13,color:'#7fc4e8',fontWeight:600}}>{t.website}</div>
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
  const t = useText({
    headline: 'Blogging Tips',
    subtitle: 'for Beginners',
    body: 'Jelly-o cheesecake cookie donut soufflé.\nBiscuit marzipan candy canes tootsie roll.\nSweet roll jelly-o candy is sweet.',
  });
  return (
    <div style={{width:PW,height:PH,background:'#fff',fontFamily:'Arial,sans-serif',overflow:'hidden',display:'flex'}}>
      <div style={{width:260,background:'#d4c8bc',position:'relative',overflow:'hidden',flexShrink:0}}>
        <div style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:160,height:330,background:'#c0b0a0',borderRadius:'80px 80px 0 0'}}/>
        <div style={{position:'absolute',bottom:230,left:'50%',transform:'translateX(-50%)',width:72,height:72,background:'#a89080',borderRadius:'50%'}}/>
      </div>
      <div style={{flex:1,padding:'52px 48px',boxSizing:'border-box'}}>
        <div style={{fontSize:30,fontWeight:800,color:'#1a3a5c',marginBottom:6}}>{t.headline}</div>
        <div style={{fontSize:18,color:'#2e7d9e',marginBottom:24}}>{t.subtitle}</div>
        <div style={{fontSize:13,color:'#666',lineHeight:1.9,marginBottom:24,whiteSpace:'pre-line'}}>
          {t.body}
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
  const t = useText({
    number: '15',
    topic: 'Home\nDecor\nIdeas',
    subtitle: 'The best ways to organize your space',
    body: 'Biscuit lollipop jelly muffin soufflé sweet roll toffee. Candy cotton candy canes icing bear claw.',
  });
  return (
    <div style={{width:PW,height:PH,background:'#f5f0eb',fontFamily:'Arial,sans-serif',overflow:'hidden',display:'flex',alignItems:'center',padding:'0 56px',gap:48,boxSizing:'border-box'}}>
      <div style={{flexShrink:0,textAlign:'center'}}>
        <div style={{fontSize:160,fontWeight:900,color:'#1a3a5c',lineHeight:1}}>{t.number}</div>
        <div style={{fontSize:24,fontWeight:700,color:'#2e7d9e',lineHeight:1.3,maxWidth:160,whiteSpace:'pre-line'}}>{t.topic}</div>
        <div style={{fontSize:13,color:'#888',marginTop:10,maxWidth:160,lineHeight:1.5}}>{t.subtitle}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gridTemplateRows:'1fr 1fr',gap:10,width:260,height:260,flexShrink:0}}>
        <div style={{background:'#c8b8a8',borderRadius:10}}/>
        <div style={{background:'#9cc4b8',borderRadius:10}}/>
        <div style={{background:'#d4a880',borderRadius:10}}/>
        <div style={{background:'#b8c8d8',borderRadius:10}}/>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:14,color:'#666',lineHeight:1.9}}>{t.body}</div>
      </div>
    </div>
  );
}

function CourseLaunch() {
  const t = useText({
    badge: '✨ INTRODUCING',
    preheadline: 'Your Amazing',
    headline: 'COURSE',
    headlineAccent: 'LAUNCH',
    body: 'Everything you need to achieve your goal and transform your career or business.',
    cta: 'ENROLL NOW →',
  });
  return (
    <div style={{width:PW,height:PH,background:'#1a3a5c',fontFamily:'Arial,sans-serif',overflow:'hidden',display:'flex',alignItems:'center',padding:'0 56px',gap:48,boxSizing:'border-box'}}>
      <div style={{flex:1,color:'#fff'}}>
        <div style={{fontSize:13,color:'#7fc4e8',letterSpacing:2,marginBottom:10}}>{t.badge}</div>
        <div style={{fontSize:16,color:'#c0d8ec',marginBottom:2}}>{t.preheadline}</div>
        <div style={{fontSize:56,fontWeight:900,lineHeight:1,marginBottom:16}}>{t.headline}<br/><span style={{color:'#7fc4e8'}}>{t.headlineAccent}</span></div>
        <div style={{fontSize:13,color:'#a0c8e0',lineHeight:1.8,marginBottom:24}}>{t.body}</div>
        <div style={{background:'#2e7d9e',color:'#fff',padding:'13px 28px',borderRadius:8,display:'inline-block',fontSize:14,fontWeight:700,letterSpacing:1}}>{t.cta}</div>
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

/** Distinct from CourseLaunch: diagonal split, numbered mini-lesson row, warm accent (not navy + stacked cards). */
function MiniCourseTeaserPreview() {
  const t = useText({
    badge: 'NEW · MINI PROGRAM',
    headline: 'Teaser',
    headlineAccent: 'Track',
    rightHeadline: '3 bite-sized\nlessons',
    rightBody: 'Hook → teach → soft CTA. Built for busy learners.',
    cta: 'Watch preview →',
  });
  return (
    <div
      style={{
        width: PW,
        height: PH,
        background: 'linear-gradient(118deg,#312e81 0%,#312e81 46%,#fffbeb 46%,#fef3c7 100%)',
        fontFamily: 'Arial,sans-serif',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ flex: 1, padding: '38px 48px', color: '#fff' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: '#c4b5fd', marginBottom: 8 }}>{t.badge}</div>
        <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.02, marginBottom: 14 }}>
          {t.headline}<br /><span style={{ color: '#fde68a' }}>{t.headlineAccent}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  background: '#6366f1',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {n}
              </div>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.22)', borderRadius: 5, width: 160 }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ width: 280, padding: '36px 40px 36px 0', boxSizing: 'border-box' }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#78350f', lineHeight: 1.1, marginBottom: 10, whiteSpace: 'pre-line' }}>{t.rightHeadline}</div>
        <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.55, marginBottom: 16 }}>{t.rightBody}</div>
        <div style={{ background: '#d97706', color: '#fff', padding: '11px 22px', borderRadius: 8, fontWeight: 700, fontSize: 13, display: 'inline-block' }}>{t.cta}</div>
      </div>
    </div>
  );
}

function NewProduct() {
  const t = useText({
    badge: '✦ NEW ARRIVAL ✦',
    headline: 'Product',
    headlineAccent: 'Launch',
    subtitle: 'The perfect solution for your audience. Built to deliver real results.',
    cta1: 'SHOP NOW',
    cta2: 'Learn More',
  });
  return (
    <div style={{width:PW,height:PH,fontFamily:'Arial,sans-serif',overflow:'hidden',position:'relative',background:'#0f2a45'}}>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#0f2a45 0%,#1e5080 55%,#0f2a45 100%)'}}/>
      <div style={{position:'absolute',top:-100,right:-100,width:360,height:360,borderRadius:'50%',background:'rgba(100,180,230,0.08)'}}/>
      <div style={{position:'absolute',bottom:-80,left:-80,width:290,height:290,borderRadius:'50%',background:'rgba(100,180,230,0.06)'}}/>
      <div style={{position:'relative',zIndex:1,display:'flex',alignItems:'center',height:'100%',padding:'0 64px',boxSizing:'border-box'}}>
        <div style={{color:'#fff',maxWidth:540}}>
          <div style={{fontSize:14,color:'#7fc4e8',letterSpacing:3,marginBottom:14}}>{t.badge}</div>
          <div style={{fontSize:76,fontWeight:900,lineHeight:0.88,marginBottom:14,background:'linear-gradient(90deg,#ffffff,#7fc4e8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{t.headline}<br/>{t.headlineAccent}</div>
          <div style={{fontSize:16,color:'#a0c8e0',marginBottom:34,lineHeight:1.6}}>{t.subtitle}</div>
          <div style={{display:'flex',gap:16}}>
            <div style={{background:'#2e7d9e',color:'#fff',padding:'13px 32px',borderRadius:8,fontWeight:700,fontSize:14,letterSpacing:1}}>{t.cta1}</div>
            <div style={{border:'2px solid #4a9bc0',color:'#7fc4e8',padding:'13px 26px',borderRadius:8,fontWeight:600,fontSize:14}}>{t.cta2}</div>
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
    id: 'nb33', name: 'Founder Friday Intro', category: 'Business', Preview: FounderFridayPreview,
    caption: `👋 Hi, I'm [Your Name] — founder of [Brand Name].\n\nEvery Friday I share one lesson from building [what you build] for [target audience].\n\nToday's lesson: [Lesson in one sentence]\n\nFollow for more founder notes + behind-the-scenes 🔖\n\n#founder #startup #[niche] #lessons #business`,
  },
  {
    id: 'wb34', name: 'Brand Values Post', category: 'Business', Preview: BrandValuesPreview,
    caption: `At [Brand Name], we believe:\n\n💜 [Value 1]\n💜 [Value 2]\n💜 [Value 3]\n\nThese aren't buzzwords — they're how we show up for [target audience] every day.\n\nWhat value matters most to you? Tell me below 👇\n\n#brandvalues #mission #[niche] #community #authenticity`,
  },
  {
    id: 'dm35', name: 'Service Packages Menu', category: 'Business', Preview: ServiceMenuPreview,
    caption: `📌 Pick your package — [Brand / Your Name]\n\n🟣 Starter — [what's included] — [price or 'DM for quote']\n🟣 Growth — [what's included] — [price or 'DM for quote']\n🟣 Pro — [what's included] — [price or 'DM for quote']\n\nNot sure which fits? DM me 'HELP' and I'll point you in the right direction.\n\n#services #packages #[niche] #consulting #booking`,
  },
  {
    id: 'bn36', name: 'Myth vs Fact Listicle', category: 'Content', Preview: MythFactPreview,
    caption: `🧠 5 myths about [topic] — busted.\n\n❌ Myth 1: [myth]\n✅ Fact: [fact]\n\n❌ Myth 2: [myth]\n✅ Fact: [fact]\n\n(Save this — your future self will thank you 🔖)\n\n#mythbusting #education #[niche] #tips #learn`,
  },
  {
    id: 'ug37', name: 'Resource Stack Share', category: 'Content', Preview: ResourceStackPreview,
    caption: `📚 My go-to stack for [topic]:\n\n1) [Tool or book 1] — why I love it\n2) [Tool or book 2] — why I love it\n3) [Tool or book 3] — why I love it\n\nAnything you'd add? Drop your favorite below 👇\n\n#resources #tools #[niche] #productivity #stack`,
  },
  {
    id: 'cl38', name: 'Mini Course Teaser', category: 'Product', Preview: MiniCourseTeaserPreview,
    caption: `⚡ New mini-course: [Course Name]\n\nIn [X] short lessons you'll learn:\n• [Outcome 1]\n• [Outcome 2]\n• [Outcome 3]\n\nBuilt for [target audience] who are tired of [pain point].\n\n👉 Preview the first lesson → link in bio\n\n#minicourse #learnonline #[niche] #education #launch`,
  },
  {
    id: 'np39', name: 'Bundle Deal', category: 'Sale', Preview: BundleDealPreview,
    caption: `🎁 BUNDLE ALERT — save when you buy together!\n\nGet [Product A] + [Product B] for one special price.\n\n✅ [Bundle benefit 1]\n✅ [Bundle benefit 2]\n\n⏰ Ends [date]\n🛍️ Shop bundle → link in bio\n\n#bundle #deal #save #[niche] #shopping`,
  },
  {
    id: 'mq40', name: 'Micro‑Affirmation', category: 'Quote', Preview: MicroAffirmPreview,
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
    id: 'hx51', name: 'Flash Giveaway', category: 'Sale', Preview: FlashGiveawayPreview,
    caption: `⚡ FLASH GIVEAWAY — ends in [timeframe]\n\nPrize: [prize]\n\nTo enter:\n1️⃣ Follow @[handle]\n2️⃣ Like + save this post\n3️⃣ Tag a friend who’d love this\n\nBonus entry: share to your story\n\n#giveaway #contest #[Brand Name] #free`,
  },
  {
    id: 'hx52', name: 'Lunch & Learn', category: 'Event', Preview: LunchLearnPreview,
    caption: `🥪 Lunch & Learn: [Topic]\n\n📅 [Date] · ⏰ [Time]\n📍 [Location / Zoom]\n\nBring your questions — we’ll cover [3 bullet points].\n\nRSVP: link in bio\n\n#webinar #learning #[industry] #networking`,
  },
  {
    id: 'hx53', name: 'Bold One‑Liner', category: 'Quote', Preview: BoldOneLinerPreview,
    caption: `📌 Save this.\n\n“[Powerful one-liner quote]”\n\n— [Attribution]\n\n#motivation #mindset #[niche] #quotes #growth`,
  },
  {
    id: 'hx54', name: 'How‑To Thread Teaser', category: 'Content', Preview: HowToThreadPreview,
    caption: `🧵 New how‑to: [Topic]\n\nIf you’ve struggled with [pain point], this thread breaks it down step by step.\n\nPreview:\n→ Step 1: [teaser]\n→ Step 2: [teaser]\n→ Step 3: [teaser]\n\nFull post: link in bio\n\n#howto #tutorial #[niche] #tips`,
  },
  {
    id: 'hx55', name: 'Room Refresh', category: 'Product', Preview: RoomRefreshPreview,
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
    id: 'hx58', name: '48‑Hour Price Drop', category: 'Sale', Preview: HourPriceDropPreview,
    caption: `⏰ 48 hours only\n\n[Product Name] — now [X]% off\n\nWhy now: [reason]\n\nNo code needed · Ends [Date]\n\n🛒 Link in bio\n\n#flashsale #deal #limited #[Brand Name]`,
  },
  {
    id: 'hx59', name: 'Feature Drop', category: 'Product', Preview: FeatureDropPreview,
    caption: `🚀 New in [Product Name]\n\n✨ [Feature 1]\n✨ [Feature 2]\n✨ [Feature 3]\n\nBuilt because you asked for [pain point solved].\n\nTry it: link in bio\n\n#productupdate #saas #newfeature #[industry]`,
  },
  {
    id: 'hx60', name: 'Launch Countdown', category: 'Event', Preview: LaunchCountdownPreview,
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
    id: 'hx71', name: 'BTS Reel / Day in the Life', category: 'Content', Preview: BTSReelPreview,
    caption: `🎬 BTS: a day building [what you do]\n\nMorning: [beat 1]\nAfternoon: [beat 2]\nEvening: [beat 3]\n\nThe messy truth > highlight reel. Save if you’re a [niche] creator too.\n\n#behindthescenes #dayinthelife #[niche] #creator #reels`,
  },
  {
    id: 'hx72', name: 'FAQ Carousel Teaser', category: 'Content', Preview: FAQCarouselPreview,
    caption: `❓ [Number] FAQs we get about [topic]\n\nSwipe the carousel for full answers — here’s a preview:\n\n1) [Question 1] → [one-line answer]\n2) [Question 2] → [one-line answer]\n\nGot another? Drop it below 👇\n\n#FAQ #carousel #[niche] #education #tips`,
  },
  {
    id: 'hx73', name: 'Member / VIP Perks', category: 'Sale', Preview: VIPPerksPreview,
    caption: `👑 VIP perk this month: [perk headline]\n\nMembers get:\n• [Benefit 1]\n• [Benefit 2]\n• [Benefit 3]\n\nJoin before [Date] — link in bio.\n\n#VIP #membership #loyalty #[Brand Name] #exclusive`,
  },
  {
    id: 'hx74', name: 'Influencer Takeover Teaser', category: 'Announce', Preview: InfluencerTakeoverPreview,
    caption: `📣 Takeover alert: @[handle] runs our account [Date]!\n\nThey’ll share [theme] + a surprise for followers.\n\nSet a reminder — you won’t want to miss [teaser].\n\n#takeover #influencer #[niche] #community #announcement`,
  },
  {
    id: 'hx75', name: 'Pop‑Up / Local Event', category: 'Event', Preview: PopUpEventPreview,
    caption: `📍 Pop‑up this weekend!\n\nWhere: [Address or neighborhood]\nWhen: [Date] · [Time]\n\nWhat’s there: [experience / products]\n\nBring a friend — first [X] visitors get [freebie].\n\n#popup #localevent #[city] #smallbusiness #weekend`,
  },
  {
    id: 'hx76', name: 'Coffee Chat / Office Hours', category: 'Event', Preview: CoffeeChatPreview,
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
    id: 'hx79', name: "Founder's Note", category: 'Business', Preview: FoundersNotePreview,
    caption: `A note from [Your Name], founder of [Brand Name]:\n\nWhen we started, we wanted to [mission in one sentence].\n\nToday [milestone or thank-you].\n\nWhat's next: [teaser].\n\nThank you for being here. 💜\n\n#founder #letter #[niche] #startup #community`,
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

function MotivationalQuote({ fields = {} }) {
  const byline = previewText(fields.name || fields.businessName, 'Name or brand (byline)');
  const t = useText({
    quote: 'The best time to start was yesterday. The next best time is right now.',
  });
  return (
    <div style={{width:PW,height:PH,background:'#0f172a',fontFamily:'Georgia,serif',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:-80,left:-80,width:320,height:320,borderRadius:'50%',background:'rgba(99,102,241,0.12)'}}/>
      <div style={{position:'absolute',bottom:-60,right:-60,width:260,height:260,borderRadius:'50%',background:'rgba(99,102,241,0.08)'}}/>
      <div style={{position:'relative',zIndex:1,textAlign:'center',padding:'0 80px',maxWidth:680}}>
        <div style={{fontSize:80,color:'#6366f1',lineHeight:0.6,marginBottom:16,fontFamily:'serif'}}>"</div>
        <div style={{fontSize:34,color:'#f1f5f9',lineHeight:1.5,fontStyle:'italic',marginBottom:24}}>{t.quote}</div>
        <div style={{fontSize:80,color:'#6366f1',lineHeight:0.6,transform:'rotate(180deg)',display:'inline-block',marginBottom:20,fontFamily:'serif'}}>"</div>
        <div style={{borderTop:'1px solid rgba(99,102,241,0.4)',paddingTop:16,fontSize:16,color:'#94a3b8',letterSpacing:2}}>— {byline}</div>
      </div>
    </div>
  );
}

function BoldQuoteCard({ fields = {} }) {
  const authorName = previewText(fields.name || fields.businessName, 'Your name');
  const handle = previewText(fields.handle, 'Social handle');
  const t = useText({
    quote: 'Done is better than perfect. Start before you feel ready.',
  });
  return (
    <div style={{width:PW,height:PH,display:'flex',fontFamily:'Arial,sans-serif',overflow:'hidden'}}>
      <div style={{width:16,background:'#f59e0b',flexShrink:0}}/>
      <div style={{flex:1,background:'#fffbeb',padding:'56px 64px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
        <div style={{fontSize:100,color:'#f59e0b',lineHeight:0.7,marginBottom:10,fontFamily:'Georgia,serif'}}>❝</div>
        <div style={{fontSize:36,fontWeight:800,color:'#1e293b',lineHeight:1.4,marginBottom:28}}>{t.quote}</div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{width:52,height:52,borderRadius:'50%',background:'#fde68a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>✨</div>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:'#1e293b'}}>{authorName}</div>
            <div style={{fontSize:13,color:'#f59e0b',fontWeight:600}}>@{handle.replace(/^@/, '')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WebinarPromo() {
  const t = useText({
    badge: 'FREE WEBINAR',
    headline: 'Join Us',
    headlineAccent: 'Live!',
    body: '[Topic] — Everything you need to know about [subject].',
    date: '[Date]',
    time: '[Time]',
    cta: 'REGISTER FREE →',
  });
  return (
    <div style={{width:PW,height:PH,background:'#0f172a',fontFamily:'Arial,sans-serif',overflow:'hidden',position:'relative',display:'flex',alignItems:'center'}}>
      <div style={{position:'absolute',top:0,right:0,width:'45%',height:'100%',background:'linear-gradient(135deg,#312e81,#4f46e5)',clipPath:'polygon(20% 0,100% 0,100% 100%,0 100%)'}}/>
      <div style={{position:'absolute',right:60,top:'50%',transform:'translateY(-50%)',zIndex:1,textAlign:'center'}}>
        <div style={{width:160,height:160,borderRadius:'50%',background:'rgba(255,255,255,0.1)',border:'2px dashed rgba(255,255,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:60}}>📅</div>
      </div>
      <div style={{position:'relative',zIndex:1,padding:'0 60px',maxWidth:460,color:'#fff'}}>
        <div style={{fontSize:13,color:'#a5b4fc',letterSpacing:3,marginBottom:14}}>{t.badge}</div>
        <div style={{fontSize:44,fontWeight:900,lineHeight:1.1,marginBottom:16}}>{t.headline}<br/><span style={{color:'#a5b4fc'}}>{t.headlineAccent}</span></div>
        <div style={{fontSize:15,color:'#cbd5e1',marginBottom:24,lineHeight:1.6}}>{t.body}</div>
        <div style={{display:'flex',gap:16,marginBottom:24}}>
          <div style={{background:'rgba(165,180,252,0.15)',border:'1px solid #a5b4fc',borderRadius:8,padding:'10px 18px',fontSize:13,color:'#a5b4fc',fontWeight:600}}>📅 {t.date}</div>
          <div style={{background:'rgba(165,180,252,0.15)',border:'1px solid #a5b4fc',borderRadius:8,padding:'10px 18px',fontSize:13,color:'#a5b4fc',fontWeight:600}}>⏰ {t.time}</div>
        </div>
        <div style={{background:'#4f46e5',color:'#fff',padding:'13px 28px',borderRadius:8,display:'inline-block',fontWeight:700,fontSize:14,letterSpacing:1}}>{t.cta}</div>
      </div>
    </div>
  );
}

function GiveawayPost() {
  const t = useText({
    badge: '✨ WE\'RE CELEBRATING ✨',
    headline: 'GIVE\nAWAY',
    prize: '[What you\'re giving away]',
    step1: '❤️ Like this post',
    step2: '👥 Tag a friend',
    step3: '🔔 Follow us',
  });
  return (
    <div style={{width:PW,height:PH,background:'#fdf2f8',fontFamily:'Arial,sans-serif',overflow:'hidden',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'absolute',top:-100,left:'50%',transform:'translateX(-50%)',width:500,height:500,borderRadius:'50%',background:'rgba(236,72,153,0.08)'}}/>
      <div style={{position:'absolute',top:30,right:40,fontSize:60,opacity:0.15}}>🎁</div>
      <div style={{position:'absolute',bottom:30,left:40,fontSize:50,opacity:0.12}}>🎉</div>
      <div style={{position:'relative',zIndex:1,textAlign:'center',padding:'0 60px'}}>
        <div style={{fontSize:18,color:'#db2777',letterSpacing:4,fontWeight:700,marginBottom:8}}>{t.badge}</div>
        <div style={{fontSize:90,fontWeight:900,color:'#be185d',lineHeight:0.9,marginBottom:10,background:'linear-gradient(135deg,#db2777,#9333ea)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',whiteSpace:'pre-line'}}>{t.headline}</div>
        <div style={{fontSize:16,color:'#6b21a8',fontWeight:600,marginBottom:20}}>Prize: {t.prize}</div>
        <div style={{display:'flex',justifyContent:'center',gap:20,fontSize:14,color:'#9333ea',fontWeight:600}}>
          <span>{t.step1}</span>
          <span>{t.step2}</span>
          <span>{t.step3}</span>
        </div>
      </div>
    </div>
  );
}

function BeforeAfter() {
  const t = useText({ before:'BEFORE', after:'AFTER' });
  return (
    <div style={{width:PW,height:PH,fontFamily:'Arial,sans-serif',overflow:'hidden',display:'flex',position:'relative'}}>
      <div style={{flex:1,background:'#94a3b8',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',padding:'0 0 30px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{width:120,height:240,background:'#64748b',borderRadius:'60px 60px 0 0',marginTop:60}}/>
          <div style={{position:'absolute',top:60,width:60,height:60,background:'#475569',borderRadius:'50%'}}/>
        </div>
        <div style={{position:'relative',zIndex:1,background:'rgba(0,0,0,0.55)',color:'#fff',padding:'8px 28px',borderRadius:6,fontSize:18,fontWeight:800,letterSpacing:2}}>{t.before}</div>
      </div>
      <div style={{width:6,background:'#fff',zIndex:10,position:'relative'}}>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:36,height:36,background:'#fff',borderRadius:'50%',boxShadow:'0 2px 8px rgba(0,0,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#334155'}}>↔</div>
      </div>
      <div style={{flex:1,background:'#4a9bb5',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',padding:'0 0 30px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{width:130,height:260,background:'#2e7d9e',borderRadius:'65px 65px 0 0',marginTop:40}}/>
          <div style={{position:'absolute',top:50,width:65,height:65,background:'#1a5f7a',borderRadius:'50%'}}/>
        </div>
        <div style={{position:'relative',zIndex:1,background:'rgba(0,0,0,0.55)',color:'#fff',padding:'8px 28px',borderRadius:6,fontSize:18,fontWeight:800,letterSpacing:2}}>{t.after}</div>
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
  const t = useText({
    badge: '⚡ TODAY ONLY ⚡',
    headline: 'FLASH',
    headlineAccent: 'SALE',
    discount: '70',
    timerHrs: '50',
    timerMin: '00',
    timerSec: '00',
  });
  return (
    <div style={{width:PW,height:PH,background:'#7f1d1d',fontFamily:'Arial,sans-serif',overflow:'hidden',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#7f1d1d 0%,#b91c1c 50%,#7f1d1d 100%)'}}/>
      <div style={{position:'absolute',top:-100,right:-100,width:400,height:400,borderRadius:'50%',background:'rgba(255,255,255,0.04)'}}/>
      <div style={{position:'relative',zIndex:1,textAlign:'center',color:'#fff'}}>
        <div style={{fontSize:16,letterSpacing:6,color:'#fca5a5',marginBottom:6}}>{t.badge}</div>
        <div style={{fontSize:56,fontWeight:900,lineHeight:1,marginBottom:4}}>{t.headline}</div>
        <div style={{fontSize:56,fontWeight:900,lineHeight:1,color:'#fca5a5',marginBottom:20}}>{t.headlineAccent}</div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginBottom:24}}>
          <div style={{background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.3)',borderRadius:8,padding:'8px 16px',textAlign:'center'}}>
            <div style={{fontSize:36,fontWeight:900,lineHeight:1}}>{t.timerHrs}</div>
            <div style={{fontSize:11,color:'#fca5a5',letterSpacing:1}}>HRS</div>
          </div>
          <div style={{fontSize:28,fontWeight:900,paddingBottom:12}}>:</div>
          <div style={{background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.3)',borderRadius:8,padding:'8px 16px',textAlign:'center'}}>
            <div style={{fontSize:36,fontWeight:900,lineHeight:1}}>{t.timerMin}</div>
            <div style={{fontSize:11,color:'#fca5a5',letterSpacing:1}}>MIN</div>
          </div>
          <div style={{fontSize:28,fontWeight:900,paddingBottom:12}}>:</div>
          <div style={{background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.3)',borderRadius:8,padding:'8px 16px',textAlign:'center'}}>
            <div style={{fontSize:36,fontWeight:900,lineHeight:1}}>{t.timerSec}</div>
            <div style={{fontSize:11,color:'#fca5a5',letterSpacing:1}}>SEC</div>
          </div>
        </div>
        <div style={{fontSize:24,fontWeight:800}}>Up to <span style={{color:'#fca5a5',fontSize:40}}>{t.discount}%</span> OFF</div>
      </div>
    </div>
  );
}

function ProductAnnounce() {
  const t = useText({
    badge: '🎉 BIG ANNOUNCEMENT',
    headline: 'Something',
    headlineAccent: 'Amazing',
    headlineSub: 'is Coming!',
    body: 'We\'ve been working on something big and we\'re almost ready to share it with you. Stay tuned — you won\'t want to miss this! 🚀',
    cta1: 'Get Notified →',
    cta2: 'Learn More',
  });
  return (
    <div style={{width:PW,height:PH,fontFamily:'Arial,sans-serif',overflow:'hidden',background:'#f0fdf4',display:'flex',alignItems:'center',padding:'0 64px',gap:56,boxSizing:'border-box',position:'relative'}}>
      <div style={{position:'absolute',top:-80,right:-80,width:320,height:320,borderRadius:'50%',background:'rgba(16,185,129,0.08)'}}/>
      <div style={{flex:1,zIndex:1}}>
        <div style={{display:'inline-block',background:'#d1fae5',color:'#065f46',fontSize:13,fontWeight:700,padding:'6px 16px',borderRadius:20,marginBottom:16,letterSpacing:1}}>{t.badge}</div>
        <div style={{fontSize:50,fontWeight:900,color:'#064e3b',lineHeight:1.1,marginBottom:16}}>{t.headline}<br/><span style={{color:'#059669'}}>{t.headlineAccent}</span><br/>{t.headlineSub}</div>
        <div style={{fontSize:15,color:'#065f46',lineHeight:1.7,marginBottom:28}}>{t.body}</div>
        <div style={{display:'flex',gap:16}}>
          <div style={{background:'#059669',color:'#fff',padding:'13px 28px',borderRadius:8,fontWeight:700,fontSize:14}}>{t.cta1}</div>
          <div style={{border:'2px solid #059669',color:'#059669',padding:'13px 24px',borderRadius:8,fontWeight:600,fontSize:14}}>{t.cta2}</div>
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
  const t = useText({
    headline: 'Summer\nVibes',
    body: 'Bring the heat this season with [your product/service]. Shop our summer collection now!',
    cta: 'SHOP NOW 🌊',
  });
  return (
    <div style={{width:PW,height:PH,fontFamily:'Arial,sans-serif',overflow:'hidden',position:'relative',display:'flex'}}>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#fbbf24 0%,#f97316 40%,#ef4444 100%)'}}/>
      <div style={{position:'absolute',top:-60,right:80,width:280,height:280,borderRadius:'50%',background:'rgba(255,255,255,0.12)'}}/>
      <div style={{position:'absolute',bottom:-80,left:100,width:240,height:240,borderRadius:'50%',background:'rgba(255,255,255,0.08)'}}/>
      <div style={{position:'relative',zIndex:1,display:'flex',alignItems:'center',padding:'0 64px',gap:48,width:'100%',boxSizing:'border-box'}}>
        <div style={{color:'#fff',flex:1}}>
          <div style={{fontSize:80,marginBottom:0,lineHeight:1}}>☀️</div>
          <div style={{fontSize:60,fontWeight:900,lineHeight:1,marginBottom:8,textShadow:'0 2px 12px rgba(0,0,0,0.2)',whiteSpace:'pre-line'}}>{t.headline}</div>
          <div style={{fontSize:16,color:'rgba(255,255,255,0.85)',lineHeight:1.6,marginBottom:24}}>{t.body}</div>
          <div style={{background:'rgba(255,255,255,0.25)',backdropFilter:'blur(8px)',border:'2px solid rgba(255,255,255,0.5)',color:'#fff',padding:'12px 28px',borderRadius:8,display:'inline-block',fontWeight:700,fontSize:14,letterSpacing:1}}>{t.cta}</div>
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
  const t = useText({
    badge: 'MARK YOUR CALENDAR',
    eventName: '[Event Name]',
    subheadline: 'is happening!',
    body: 'Join us for [description of event]. An experience you won\'t forget.',
    date: '[Month Day]',
    time: '[X:XX PM]',
    location: '[Location]',
    cta: 'RSVP NOW →',
  });
  return (
    <div style={{width:PW,height:PH,background:'#1e1b4b',fontFamily:'Arial,sans-serif',overflow:'hidden',position:'relative',display:'flex',alignItems:'center'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at top,#312e81 0%,#1e1b4b 70%)'}}/>
      {[...Array(12)].map((_,i)=>(
        <div key={i} style={{position:'absolute',width:3,height:3,borderRadius:'50%',background:'rgba(255,255,255,0.4)',top:`${10+Math.random()*80}%`,left:`${Math.random()*100}%`}}/>
      ))}
      <div style={{position:'relative',zIndex:1,padding:'0 60px',color:'#fff',width:'100%',boxSizing:'border-box'}}>
        <div style={{fontSize:14,color:'#a5b4fc',letterSpacing:3,marginBottom:10}}>{t.badge}</div>
        <div style={{fontSize:50,fontWeight:900,lineHeight:1.1,marginBottom:8}}>{t.eventName}<br/><span style={{color:'#a5b4fc',fontSize:36}}>{t.subheadline}</span></div>
        <div style={{fontSize:15,color:'#c7d2fe',marginBottom:28,lineHeight:1.6}}>{t.body}</div>
        <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
          <div style={{background:'rgba(165,180,252,0.15)',border:'1px solid #6366f1',borderRadius:10,padding:'12px 20px'}}>
            <div style={{fontSize:11,color:'#a5b4fc',letterSpacing:2,marginBottom:4}}>DATE</div>
            <div style={{fontSize:20,fontWeight:700}}>{t.date}</div>
          </div>
          <div style={{background:'rgba(165,180,252,0.15)',border:'1px solid #6366f1',borderRadius:10,padding:'12px 20px'}}>
            <div style={{fontSize:11,color:'#a5b4fc',letterSpacing:2,marginBottom:4}}>TIME</div>
            <div style={{fontSize:20,fontWeight:700}}>{t.time}</div>
          </div>
          <div style={{background:'rgba(165,180,252,0.15)',border:'1px solid #6366f1',borderRadius:10,padding:'12px 20px'}}>
            <div style={{fontSize:11,color:'#a5b4fc',letterSpacing:2,marginBottom:4}}>WHERE</div>
            <div style={{fontSize:20,fontWeight:700}}>{t.location}</div>
          </div>
          <div style={{background:'#4f46e5',borderRadius:10,padding:'12px 24px',display:'flex',alignItems:'center',fontSize:15,fontWeight:700,letterSpacing:1}}>{t.cta}</div>
        </div>
      </div>
    </div>
  );
}

function LeadMagnetPreview() {
  const t = useText({
    badge: 'FREE DOWNLOAD',
    topic: '[Topic]',
    kitName: 'Starter Kit',
    body: 'PDF checklist + templates. No spam — unsubscribe anytime.',
    cta: 'GET IT FREE →',
  });
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(145deg,#1e1b4b,#312e81)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 56px', gap: 40, boxSizing: 'border-box' }}>
      <div style={{ flex: 1, color: '#fff' }}>
        <div style={{ fontSize: 13, color: '#a5b4fc', letterSpacing: 3, marginBottom: 10 }}>{t.badge}</div>
        <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.05, marginBottom: 12 }}>The {t.topic}<br /><span style={{ color: '#a5b4fc' }}>{t.kitName}</span></div>
        <div style={{ fontSize: 14, color: '#c7d2fe', lineHeight: 1.6, marginBottom: 20 }}>{t.body}</div>
        <div style={{ background: '#4f46e5', padding: '12px 22px', borderRadius: 8, display: 'inline-block', fontWeight: 700, fontSize: 14 }}>{t.cta}</div>
      </div>
      <div style={{ width: 200, height: 260, background: 'rgba(255,255,255,0.08)', borderRadius: 16, border: '2px dashed rgba(165,180,252,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>📎</div>
    </div>
  );
}

function PodcastEpPreview() {
  const t = useText({
    badge: 'NEW EPISODE',
    episodeNum: '[X]',
    title: '[Episode Title]',
    body: 'With [Guest Name] — we unpack [hook topic] in under [minutes] minutes.',
  });
  return (
    <div style={{ width: PW, height: PH, background: '#0f172a', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 56px', gap: 36, boxSizing: 'border-box' }}>
      <div style={{ width: 160, height: 160, borderRadius: 20, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, flexShrink: 0 }}>🎙️</div>
      <div style={{ flex: 1, color: '#fff' }}>
        <div style={{ fontSize: 12, color: '#94a3b8', letterSpacing: 2, marginBottom: 8 }}>{t.badge}</div>
        <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.15, marginBottom: 10 }}>Ep. {t.episodeNum}: {t.title}</div>
        <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6 }}>{t.body}</div>
      </div>
    </div>
  );
}

function CarouselSwipePreview() {
  const t = useText({
    badge: 'CAROUSEL ALERT',
    headline: 'Swipe for',
    number: '[Number]',
    suffix: 'tips →',
    cta: 'Save this post 🔖',
  });
  return (
    <div style={{ width: PW, height: PH, background: '#fefce8', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg,transparent,transparent 38px,rgba(234,179,8,0.08) 38px,rgba(234,179,8,0.08) 40px)' }} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 48px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#854d0e', marginBottom: 8 }}>{t.badge}</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: '#713f12', lineHeight: 1.05, marginBottom: 12 }}>{t.headline}<br />{t.number} {t.suffix}</div>
        <div style={{ fontSize: 15, color: '#a16207', fontWeight: 600 }}>{t.cta}</div>
      </div>
    </div>
  );
}

function WaitlistPreview() {
  const t = useText({
    badge: 'COMING SOON',
    productName: '[Product Name]',
    body: 'Join the waitlist — be first to know when we launch.',
    cta: 'JOIN WAITLIST',
  });
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(160deg,#0c4a6e,#0369a1)', fontFamily: 'Arial,sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '0 48px', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 14, letterSpacing: 4, color: '#7dd3fc', marginBottom: 10 }}>{t.badge}</div>
      <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 12 }}>{t.productName}</div>
      <div style={{ fontSize: 15, color: '#bae6fd', maxWidth: 520, lineHeight: 1.6, marginBottom: 24 }}>{t.body}</div>
      <div style={{ background: '#fff', color: '#0369a1', padding: '12px 28px', borderRadius: 8, fontWeight: 800, fontSize: 14 }}>{t.cta}</div>
    </div>
  );
}

function AMASessionPreview() {
  const t = useText({
    headline: 'Ask Me\nAnything',
    body: 'Live on [Date] — drop your questions in the comments.',
    sampleQ: 'Q: [Sample question]?',
    sampleA: 'A: [Your teaser answer]…',
  });
  return (
    <div style={{ width: PW, height: PH, background: '#f8fafc', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 52px', gap: 28, boxSizing: 'border-box' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', marginBottom: 10, whiteSpace: 'pre-line' }}>{t.headline}</div>
        <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{t.body}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 280 }}>
        <div style={{ background: '#e2e8f0', borderRadius: 14, padding: '12px 16px', fontSize: 13, color: '#475569' }}>{t.sampleQ}</div>
        <div style={{ background: '#6366f1', borderRadius: 14, padding: '12px 16px', fontSize: 13, color: '#fff', alignSelf: 'flex-end' }}>{t.sampleA}</div>
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
  const t = useText({
    badge: 'CLIENT WIN',
    headline: '[Result headline]',
    body: 'How [Client Name] hit [metric] in [timeframe].',
  });
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(90deg,#ecfdf5,#d1fae5)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 56px', gap: 40, boxSizing: 'border-box' }}>
      <div style={{ fontSize: 80, lineHeight: 1 }}>🏆</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: '#059669', fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>{t.badge}</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: '#064e3b', lineHeight: 1.15, marginBottom: 10 }}>{t.headline}</div>
        <div style={{ fontSize: 14, color: '#047857', lineHeight: 1.6 }}>{t.body}</div>
      </div>
    </div>
  );
}

function RestockPreview() {
  const t = useText({
    badge: 'BACK IN STOCK',
    productName: '[Product Name]',
    body: 'Limited quantities — tap link in bio 🛒',
  });
  return (
    <div style={{ width: PW, height: PH, background: '#fffbeb', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 40px', boxSizing: 'border-box' }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#b45309', marginBottom: 6 }}>{t.badge}</div>
        <div style={{ fontSize: 46, fontWeight: 900, color: '#92400e', marginBottom: 10 }}>{t.productName}</div>
        <div style={{ fontSize: 15, color: '#a16207' }}>{t.body}</div>
      </div>
    </div>
  );
}

function HiringBannerPreview() {
  const t = useText({
    badge: "WE'RE HIRING",
    role: '[Role Title]',
    details: '[Location / Remote] · [Employment type]',
  });
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(135deg,#14532d,#166534)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 56px', gap: 36, boxSizing: 'border-box', color: '#fff' }}>
      <div style={{ fontSize: 72, lineHeight: 1 }}>👋</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, letterSpacing: 3, color: '#bbf7d0', marginBottom: 8 }}>{t.badge}</div>
        <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>{t.role}</div>
        <div style={{ fontSize: 15, color: '#dcfce7', lineHeight: 1.6 }}>{t.details}</div>
      </div>
    </div>
  );
}

function ReferEarnPreview() {
  const t = useText({
    headline: 'Refer & Earn',
    body: 'Give [reward], get [reward]',
  });
  return (
    <div style={{ width: PW, height: PH, background: '#faf5ff', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 48px', boxSizing: 'border-box' }}>
      <div>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🎁</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#6b21a8', marginBottom: 8 }}>{t.headline}</div>
        <div style={{ fontSize: 15, color: '#7c3aed', fontWeight: 600 }}>{t.body}</div>
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
  const t = useText({
    badge: 'CHALLENGE',
    days: '[X]',
    name: '[Challenge name]',
    body: 'Starts [Date] — join us!',
  });
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(180deg,#1e293b,#0f172a)', fontFamily: 'Arial,sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '0 40px', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 14, color: '#94a3b8', letterSpacing: 3, marginBottom: 8 }}>{t.badge}</div>
      <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.05, marginBottom: 12 }}>{t.days}-Day<br /><span style={{ color: '#38bdf8' }}>{t.name}</span></div>
      <div style={{ fontSize: 14, color: '#cbd5e1' }}>{t.body}</div>
    </div>
  );
}

function WinterSalePreview() {
  const t = useText({
    headline: 'Winter\nSale',
    body: 'Cozy deals on [category] — limited time.',
  });
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(160deg,#1e3a5f,#0c4a6e)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 48px', gap: 28, boxSizing: 'border-box', color: '#fff' }}>
      <div style={{ fontSize: 80, lineHeight: 1 }}>❄️</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.1, marginBottom: 8, whiteSpace: 'pre-line' }}>{t.headline}</div>
        <div style={{ fontSize: 15, color: '#bae6fd' }}>{t.body}</div>
      </div>
    </div>
  );
}

function TipTuesdayPreview() {
  const t = useText({
    badge: 'TIP TUESDAY',
    headline: '[One-line tip headline]',
  });
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(135deg,#fef3c7,#fed7aa)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 52px', gap: 28, boxSizing: 'border-box' }}>
      <div style={{ fontSize: 64 }}>💡</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#b45309', letterSpacing: 2, marginBottom: 6 }}>{t.badge}</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: '#78350f', lineHeight: 1.2 }}>{t.headline}</div>
      </div>
    </div>
  );
}

function UrgentUpdatePreview() {
  const t = useText({
    badge: 'IMPORTANT UPDATE',
    headline: '[Headline about change or outage]',
    body: 'What you need to know — short and clear.',
  });
  return (
    <div style={{ width: PW, height: PH, background: '#fff', fontFamily: 'Arial,sans-serif', boxSizing: 'border-box', borderTop: '12px solid #dc2626' }}>
      <div style={{ padding: '40px 48px' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#dc2626', letterSpacing: 2, marginBottom: 10 }}>{t.badge}</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: '#0f172a', lineHeight: 1.15, marginBottom: 12 }}>{t.headline}</div>
        <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{t.body}</div>
      </div>
    </div>
  );
}

function CommunityQuestionPreview() {
  const t = useText({
    headline: 'Question for you 👇',
    question: '[Your question to the audience]?',
  });
  return (
    <div style={{ width: PW, height: PH, background: '#ecfeff', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 48px', boxSizing: 'border-box', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0e7490', marginBottom: 12 }}>{t.headline}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#134e4a', lineHeight: 1.35 }}>{t.question}</div>
      </div>
    </div>
  );
}

function FeatureComparePreview() {
  const t = useText({
    optionA: '[Name A]',
    optionB: '[Name B]',
  });
  return (
    <div style={{ width: PW, height: PH, background: '#f8fafc', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'stretch', boxSizing: 'border-box' }}>
      <div style={{ flex: 1, padding: '36px 32px', background: '#e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 8 }}>OPTION A</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#1e293b' }}>{t.optionA}</div>
      </div>
      <div style={{ width: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20, color: '#6366f1', background: '#fff' }}>VS</div>
      <div style={{ flex: 1, padding: '36px 32px', background: '#ede9fe', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#6d28d9', marginBottom: 8 }}>OPTION B</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#1e293b' }}>{t.optionB}</div>
      </div>
    </div>
  );
}

function ThankYouCustomersPreview() {
  const t = useText({
    headline: 'Thank you',
    body: '[Milestone or holiday message]',
  });
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(135deg,#fdf2f8,#fff1f2)', fontFamily: 'Arial,sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 48px', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>🙏</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: '#9d174d', marginBottom: 8 }}>{t.headline}</div>
      <div style={{ fontSize: 15, color: '#be185d', fontWeight: 600 }}>{t.body}</div>
    </div>
  );
}

function CaseStudyPreview() {
  const t = useText({
    badge: 'CASE STUDY',
    clientName: '[Client / project name]',
  });
  return (
    <div style={{ width: PW, height: PH, background: '#f8fafc', fontFamily: 'Arial,sans-serif', padding: '36px 48px', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', letterSpacing: 2, marginBottom: 14 }}>{t.badge}</div>
      <div style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', marginBottom: 20, lineHeight: 1.2 }}>{t.clientName}</div>
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
  const t = useText({
    badge: 'FREE DOWNLOAD',
    title: '[Resource title]',
    body: 'PDF · [page count] pages · No email required [optional]',
  });
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(145deg,#0ea5e9,#0369a1)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 52px', gap: 32, boxSizing: 'border-box', color: '#fff' }}>
      <div style={{ width: 120, height: 140, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>📥</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: '#bae6fd', marginBottom: 8 }}>{t.badge}</div>
        <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.1, marginBottom: 8 }}>{t.title}</div>
        <div style={{ fontSize: 14, color: '#e0f2fe' }}>{t.body}</div>
      </div>
    </div>
  );
}

function MeetTeamPreview() {
  const t = useText({
    badge: 'MEET THE TEAM',
    spotlight: '[Role spotlight: Name]',
  });
  return (
    <div style={{ width: PW, height: PH, background: '#fff7ed', fontFamily: 'Arial,sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px', boxSizing: 'border-box', textAlign: 'center' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#c2410c', letterSpacing: 2, marginBottom: 14 }}>{t.badge}</div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
        {[1, 2, 3, 4].map((n) => (
          <div key={n} style={{ width: 64, height: 64, borderRadius: '50%', background: `hsl(${n * 50}, 70%, 65%)`, border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
        ))}
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: '#7c2d12' }}>{t.spotlight}</div>
    </div>
  );
}

function MindsetReframePreview() {
  const t = useText({
    intro: 'Instead of thinking…',
    oldBelief: '[Old belief]',
    newBelief: 'Try: [New belief]',
  });
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(180deg,#1e1b4b,#312e81)', fontFamily: 'Georgia,serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 64px', boxSizing: 'border-box', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 15, color: '#a5b4fc', fontStyle: 'italic', marginBottom: 16 }}>{t.intro}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#94a3b8', textDecoration: 'line-through', marginBottom: 20 }}>{t.oldBelief}</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: '#f8fafc', lineHeight: 1.35 }}>{t.newBelief}</div>
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
  const t = useText({
    badge: 'COLLAB',
    headline: '[Brand A] × [Brand B]',
    body: '[What you built together]',
  });
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(135deg,#fce7f3,#e0e7ff)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '0 48px', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 72 }}>🤝</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#7c3aed', letterSpacing: 2, marginBottom: 6 }}>{t.badge}</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: '#4c1d95', lineHeight: 1.15 }}>{t.headline}</div>
        <div style={{ fontSize: 14, color: '#6b21a8', marginTop: 8 }}>{t.body}</div>
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
  const t = useText({
    name: '[Newsletter name]',
    body: '[One-line value prop] — link in bio to subscribe.',
  });
  return (
    <div style={{ width: PW, height: PH, background: '#fafafa', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 56px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 520, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#171717', marginBottom: 10 }}>{t.name}</div>
        <div style={{ fontSize: 15, color: '#525252', lineHeight: 1.6 }}>{t.body}</div>
      </div>
    </div>
  );
}

function StudentWinPreview() {
  const t = useText({
    badge: 'STUDENT WIN',
    headline: '[Outcome headline]',
    body: 'From [starting point] to [result] — [timeframe]',
  });
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 52px', gap: 28, boxSizing: 'border-box' }}>
      <div style={{ fontSize: 76 }}>🎓</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#047857', letterSpacing: 2, marginBottom: 6 }}>{t.badge}</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: '#064e3b', lineHeight: 1.2, marginBottom: 8 }}>{t.headline}</div>
        <div style={{ fontSize: 14, color: '#065f46' }}>{t.body}</div>
      </div>
    </div>
  );
}

/** Seasonal / holiday — each uses a unique layout & palette (no shared art between these). */
function HalloweenPromoPreview() {
  const t = useText({
    badge: 'HALLOWEEN',
    headline: 'Spooky',
    headlineAccent: 'Savings',
    body: 'Treats, no tricks — limited time.',
  });
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(160deg,#1e0533,#312e81)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 52px', gap: 32, boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 24, right: 40, fontSize: 44, opacity: 0.35 }}>🦇</div>
      <div style={{ position: 'absolute', bottom: 20, left: 50, fontSize: 36, opacity: 0.3 }}>🎃</div>
      <div style={{ fontSize: 88, lineHeight: 1, zIndex: 1 }}>🕯️</div>
      <div style={{ flex: 1, zIndex: 1, color: '#fff' }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: '#fb923c', fontWeight: 800, marginBottom: 8 }}>{t.badge}</div>
        <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.05, marginBottom: 8 }}>{t.headline}<br /><span style={{ color: '#c4b5fd' }}>{t.headlineAccent}</span></div>
        <div style={{ fontSize: 14, color: '#e9d5ff', opacity: 0.95 }}>{t.body}</div>
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
  const t = useText({
    badge: 'NEW YEAR',
    headline: 'Fresh Start',
    body: 'Goals, resets & [your offer] — link in bio.',
  });
  return (
    <div style={{ width: PW, height: PH, background: 'radial-gradient(ellipse at 30% 20%,#1e293b 0%,#020617 65%)', fontFamily: 'Arial,sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 48px', boxSizing: 'border-box', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      {[12, 28, 55, 72, 88].map((l, i) => (
        <div key={i} style={{ position: 'absolute', left: `${l}%`, top: `${15 + (i * 17) % 55}%`, width: 6, height: 6, borderRadius: '50%', background: i % 2 ? '#fbbf24' : '#fde68a', opacity: 0.7 }} />
      ))}
      <div style={{ fontSize: 14, color: '#94a3b8', letterSpacing: 4, marginBottom: 10 }}>{t.badge}</div>
      <div style={{ fontSize: 56, fontWeight: 900, background: 'linear-gradient(135deg,#fef08a,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12 }}>{t.headline}</div>
      <div style={{ fontSize: 15, color: '#cbd5e1', maxWidth: 440, lineHeight: 1.5 }}>{t.body}</div>
    </div>
  );
}

function PresidentsDayPromoPreview() {
  const t = useText({ badge:'LONG WEEKEND', headline:"President's", headlineAccent:'Day Sale', body:'Extra day to save on [category].' });
  return (
    <div style={{ width: PW, height: PH, background: '#0f172a', fontFamily: 'Arial,sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 56px', boxSizing: 'border-box', color: '#fff', position: 'relative' }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 8, background: 'repeating-linear-gradient(90deg,#b91c1c 0,#b91c1c 28px,#f8fafc 28px,#f8fafc 56px,#1e3a8a 56px,#1e3a8a 84px)' }} />
      <div style={{ fontSize: 12, letterSpacing: 3, color: '#94a3b8', marginBottom: 10 }}>{t.badge}</div>
      <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.05, marginBottom: 12 }}>{t.headline}<br /><span style={{ color: '#60a5fa' }}>{t.headlineAccent}</span></div>
      <div style={{ fontSize: 15, color: '#cbd5e1', maxWidth: 480 }}>{t.body}</div>
    </div>
  );
}

function SpringSeasonPreview() {
  const t = useText({ badge:'SPRING HAS SPRUNG', headline:'Bloom &', headlineAccent:'Save', body:'Fresh picks for [category] — limited window.' });
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(135deg,#fce7f3 0%,#fef9c3 45%,#d1fae5 100%)', fontFamily: 'Arial,sans-serif', display: 'flex', alignItems: 'center', padding: '0 52px', gap: 36, boxSizing: 'border-box' }}>
      <div style={{ fontSize: 96, lineHeight: 1 }}>🌸</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#be185d', letterSpacing: 2, marginBottom: 8 }}>{t.badge}</div>
        <div style={{ fontSize: 44, fontWeight: 900, color: '#831843', lineHeight: 1.1, marginBottom: 8 }}>{t.headline}<br />{t.headlineAccent}</div>
        <div style={{ fontSize: 15, color: '#9d174d', lineHeight: 1.5 }}>{t.body}</div>
      </div>
    </div>
  );
}

function FriendsgivingGatherPreview() {
  const t = useText({ badge:'FRIENDSGIVING', headline:'Gather & Give Thanks', body:'Host notes, recipes & gratitude — not a doorbuster sale.' });
  return (
    <div style={{ width: PW, height: PH, background: 'linear-gradient(180deg,#431407,#78350f)', fontFamily: 'Georgia,serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 48px', boxSizing: 'border-box', color: '#fef3c7' }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>🍽️</div>
      <div style={{ fontSize: 15, letterSpacing: 4, color: '#fcd34d', marginBottom: 8 }}>{t.badge}</div>
      <div style={{ fontSize: 40, fontWeight: 700, fontStyle: 'italic', marginBottom: 10 }}>{t.headline}</div>
      <div style={{ fontSize: 14, color: '#fde68a', maxWidth: 460, lineHeight: 1.6 }}>{t.body}</div>
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

/* ── Unique replacements for every duplicate ─────────────── */

function FounderFridayPreview({ fields = {} }) {
  const founderName = previewText(fields.name || fields.businessName, 'Your name');
  const brandName   = previewText(fields.businessName || fields.name, 'Brand name');
  const t = useText({
    badge: 'Founder Friday',
    headline: "This week's\nlesson",
    body: 'What I learned building your brand this week',
  });
  return (
    <div style={{ width:PW, height:PH, background:'#111827', fontFamily:'Arial,sans-serif', display:'flex', overflow:'hidden', position:'relative' }}>
      <div style={{ position:'absolute', top:0, left:0, width:260, height:'100%', background:'linear-gradient(180deg,#1d4ed8,#1e3a8a)' }} />
      <div style={{ position:'absolute', top:0, left:0, width:260, height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, boxSizing:'border-box' }}>
        <div style={{ width:90, height:90, borderRadius:'50%', background:'#3b82f6', border:'3px solid #93c5fd', marginBottom:16, display:'flex', alignItems:'flex-end', justifyContent:'center', overflow:'hidden' }}>
          <div style={{ width:50, height:80, background:'#2563eb', borderRadius:'25px 25px 0 0' }} />
        </div>
        <div style={{ color:'#93c5fd', fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase' }}>Founder</div>
        <div style={{ color:'#fff', fontSize:15, fontWeight:900, marginTop:4 }}>{founderName}</div>
      </div>
      <div style={{ marginLeft:260, flex:1, padding:'44px 44px', display:'flex', flexDirection:'column', justifyContent:'center', boxSizing:'border-box' }}>
        <div style={{ color:'#3b82f6', fontSize:12, fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:8 }}>{t.badge}</div>
        <div style={{ color:'#fff', fontSize:40, fontWeight:900, lineHeight:1.1, marginBottom:16, whiteSpace:'pre-line' }}>{t.headline}</div>
        <div style={{ color:'#94a3b8', fontSize:14, lineHeight:1.7, marginBottom:24 }}>{t.body}</div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:32, height:3, background:'#3b82f6' }} />
          <div style={{ color:'#3b82f6', fontSize:12, fontWeight:700 }}>{brandName}</div>
        </div>
      </div>
    </div>
  );
}

function BrandValuesPreview() {
  const t = useText({
    badge: 'Our Values',
    headline: 'What we\nstand for',
  });
  return (
    <div style={{ width:PW, height:PH, background:'#f0fdf4', fontFamily:'Arial,sans-serif', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 60px', boxSizing:'border-box', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'#bbf7d0', opacity:0.5 }} />
      <div style={{ fontSize:12, color:'#16a34a', fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:12 }}>{t.badge}</div>
      <div style={{ fontSize:42, fontWeight:900, color:'#14532d', marginBottom:32, textAlign:'center', lineHeight:1.1, whiteSpace:'pre-line' }}>{t.headline}</div>
      <div style={{ display:'flex', gap:20, width:'100%' }}>
        {['💚 [Value 1]','🌱 [Value 2]','✨ [Value 3]'].map((v,i) => (
          <div key={i} style={{ flex:1, background:'#fff', borderRadius:14, padding:'18px 20px', border:'1.5px solid #86efac', boxShadow:'0 4px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize:14, fontWeight:800, color:'#15803d' }}>{v}</div>
            <div style={{ fontSize:11, color:'#4ade80', marginTop:6 }}>Core pillar</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceMenuPreview({ fields = {} }) {
  const brandName  = previewText(fields.businessName || fields.name, 'Brand name');
  const expertName = previewText(fields.name || fields.businessName, 'Your name');
  const t = useText({
    badge: 'Services',
    headline: 'Pick your\npackage',
  });
  return (
    <div style={{ width:PW, height:PH, background:'#0f172a', fontFamily:'Arial,sans-serif', display:'flex', alignItems:'stretch', overflow:'hidden' }}>
      <div style={{ flex:1, padding:'44px 40px', boxSizing:'border-box', display:'flex', flexDirection:'column', justifyContent:'center' }}>
        <div style={{ color:'#f472b6', fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:12 }}>{t.badge}</div>
        <div style={{ color:'#fff', fontSize:38, fontWeight:900, lineHeight:1.1, marginBottom:8, whiteSpace:'pre-line' }}>{t.headline}</div>
        <div style={{ color:'#94a3b8', fontSize:13, marginBottom:28 }}>{brandName} — specialist</div>
        {[['Starter','For beginners'],['Growth','Scale your reach'],['Pro','Full service']].map(([t,d],i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12, padding:'10px 14px', background:'#1e293b', borderRadius:10, borderLeft:`3px solid ${['#f472b6','#c084fc','#818cf8'][i]}` }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:['#f472b6','#c084fc','#818cf8'][i] }} />
            <div style={{ flex:1 }}>
              <div style={{ color:'#fff', fontSize:13, fontWeight:700 }}>{t}</div>
              <div style={{ color:'#64748b', fontSize:11 }}>{d}</div>
            </div>
            <div style={{ color:['#f472b6','#c084fc','#818cf8'][i], fontSize:11, fontWeight:700 }}>DM →</div>
          </div>
        ))}
      </div>
      <div style={{ width:220, background:'linear-gradient(180deg,#7c3aed,#4f46e5)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32 }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, marginBottom:16 }}>💼</div>
        <div style={{ color:'#fff', fontSize:14, fontWeight:800, textAlign:'center' }}>{expertName}</div>
        <div style={{ color:'#c4b5fd', fontSize:11, textAlign:'center', marginTop:6 }}>Expert &amp; Specialist</div>
      </div>
    </div>
  );
}

function FoundersNotePreview({ fields = {} }) {
  const founderName = previewText(fields.name || fields.businessName, 'Your name');
  const brandName   = previewText(fields.businessName || fields.name, 'Brand name');
  const t = useText({
    sectionLabel: 'A note from the founder',
    quote: 'We started with a simple mission — to create something meaningful. Every day, that mission drives us forward.',
  });
  return (
    <div style={{ width:PW, height:PH, background:'#fef9f0', fontFamily:'Georgia,serif', display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 72px', boxSizing:'border-box', position:'relative' }}>
      <div style={{ position:'absolute', top:20, left:20, right:20, bottom:20, border:'2px solid #d97706', borderRadius:4, opacity:0.3 }} />
      <div style={{ position:'absolute', top:0, left:72, width:2, height:'100%', background:'#fde68a', opacity:0.6 }} />
      <div style={{ flex:1, paddingLeft:28 }}>
        <div style={{ color:'#b45309', fontSize:12, fontWeight:700, letterSpacing:2, textTransform:'uppercase', marginBottom:16 }}>{t.sectionLabel}</div>
        <div style={{ color:'#1c1917', fontSize:22, fontStyle:'italic', lineHeight:1.7, marginBottom:20 }}>"{t.quote}"</div>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:16 }}>
          <div style={{ width:40, height:40, borderRadius:'50%', background:'#fde68a', border:'2px solid #d97706' }} />
          <div>
            <div style={{ color:'#1c1917', fontSize:14, fontWeight:700 }}>{founderName}</div>
            <div style={{ color:'#b45309', fontSize:12 }}>Founder, {brandName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MythFactPreview() {
  const t = useText({ mythLabel:'MYTH', mythText:'"[Common misconception about your topic]"', mythSub:'❌ What people believe', factLabel:'FACT', factText:'"[The actual truth, backed by your expertise]"', factSub:'✅ The real story' });
  return (
    <div style={{ width:PW, height:PH, background:'#fff', fontFamily:'Arial,sans-serif', display:'flex', overflow:'hidden' }}>
      <div style={{ flex:1, background:'#fef2f2', display:'flex', flexDirection:'column', justifyContent:'center', padding:'40px 40px', boxSizing:'border-box', borderRight:'4px solid #fca5a5' }}>
        <div style={{ background:'#ef4444', color:'#fff', fontSize:11, fontWeight:900, letterSpacing:2, padding:'6px 14px', borderRadius:4, display:'inline-block', marginBottom:16, width:'fit-content' }}>{t.mythLabel}</div>
        <div style={{ fontSize:22, fontWeight:800, color:'#991b1b', lineHeight:1.3, marginBottom:12 }}>{t.mythText}</div>
        <div style={{ fontSize:13, color:'#b91c1c' }}>{t.mythSub}</div>
      </div>
      <div style={{ flex:1, background:'#f0fdf4', display:'flex', flexDirection:'column', justifyContent:'center', padding:'40px 40px', boxSizing:'border-box' }}>
        <div style={{ background:'#16a34a', color:'#fff', fontSize:11, fontWeight:900, letterSpacing:2, padding:'6px 14px', borderRadius:4, display:'inline-block', marginBottom:16, width:'fit-content' }}>{t.factLabel}</div>
        <div style={{ fontSize:22, fontWeight:800, color:'#14532d', lineHeight:1.3, marginBottom:12 }}>{t.factText}</div>
        <div style={{ fontSize:13, color:'#15803d' }}>{t.factSub}</div>
      </div>
    </div>
  );
}

function ResourceStackPreview() {
  const t = useText({ headline:'Resource Stack', subtitle:'My top tools for [topic]', tool1:'[Tool / Book 1]', tool2:'[Tool / Book 2]', tool3:'[Tool / Book 3]', tool4:'[Tool / Book 4]' });
  return (
    <div style={{ width:PW, height:PH, background:'#fffbeb', fontFamily:'Arial,sans-serif', display:'flex', alignItems:'stretch', overflow:'hidden' }}>
      <div style={{ width:200, background:'#f59e0b', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, boxSizing:'border-box' }}>
        <div style={{ fontSize:48, marginBottom:8 }}>📚</div>
        <div style={{ color:'#fff', fontSize:16, fontWeight:900, textAlign:'center', lineHeight:1.2 }}>{t.headline}</div>
        <div style={{ color:'#fef3c7', fontSize:11, marginTop:8, textAlign:'center' }}>{t.subtitle}</div>
      </div>
      <div style={{ flex:1, padding:'32px 36px', boxSizing:'border-box', display:'flex', flexDirection:'column', justifyContent:'center' }}>
        {[t.tool1, t.tool2, t.tool3, t.tool4].map((r,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14, padding:'12px 16px', background:'#fff', borderRadius:10, boxShadow:'0 2px 8px rgba(0,0,0,0.07)', borderLeft:'4px solid #f59e0b' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, color:'#d97706', flexShrink:0 }}>{i+1}</div>
            <div style={{ color:'#1c1917', fontSize:14, fontWeight:600 }}>{r}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowToThreadPreview() {
  const t = useText({ badge:'How-To Thread', headline:'How to', headlineAccent:'[Topic]', step1:'Step 1: [teaser]', step2:'Step 2: [teaser]', step3:'Step 3: [teaser]', footer:'Full thread: link in bio' });
  return (
    <div style={{ width:PW, height:PH, background:'#0ea5e9', fontFamily:'Arial,sans-serif', display:'flex', alignItems:'center', padding:'40px 56px', boxSizing:'border-box', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:-60, right:-60, width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,0.1)' }} />
      <div style={{ flex:1 }}>
        <div style={{ color:'#bae6fd', fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:10 }}>{t.badge}</div>
        <div style={{ color:'#fff', fontSize:44, fontWeight:900, lineHeight:1.1, marginBottom:20 }}>{t.headline}<br/>{t.headlineAccent}</div>
        {[t.step1, t.step2, t.step3].map((s,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:24, height:24, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color:'#0ea5e9', flexShrink:0 }}>{i+1}</div>
            <div style={{ color:'#fff', fontSize:13, fontWeight:600 }}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{ width:180, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4 }}>
        {['🧵','↓','↓','↓'].map((c,i)=><div key={i} style={{ fontSize:i===0?40:24, color:'#fff' }}>{c}</div>)}
        <div style={{ color:'#bae6fd', fontSize:11, fontWeight:700, textAlign:'center', marginTop:8 }}>{t.footer}</div>
      </div>
    </div>
  );
}

function BTSReelPreview() {
  const t = useText({ badge:'🎬 BEHIND THE SCENES', headline:'A day in', headlineAccent:'the life', time1:'Morning', time2:'Afternoon', time3:'Evening', beat1:'[beat 1]', beat2:'[beat 2]', beat3:'[beat 3]', footer:'Swipe for the day' });
  const times = [t.time1, t.time2, t.time3];
  const beats = [t.beat1, t.beat2, t.beat3];
  return (
    <div style={{ width:PW, height:PH, background:'#18181b', fontFamily:'Arial,sans-serif', display:'flex', alignItems:'stretch', overflow:'hidden', position:'relative' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:6, background:'repeating-linear-gradient(90deg,#fbbf24 0,#fbbf24 40px,#18181b 40px,#18181b 50px)' }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:6, background:'repeating-linear-gradient(90deg,#fbbf24 0,#fbbf24 40px,#18181b 40px,#18181b 50px)' }} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'40px 48px', boxSizing:'border-box' }}>
        <div style={{ color:'#fbbf24', fontSize:12, fontWeight:700, letterSpacing:3, marginBottom:10 }}>{t.badge}</div>
        <div style={{ color:'#fff', fontSize:40, fontWeight:900, lineHeight:1.1, marginBottom:16 }}>{t.headline}<br/>{t.headlineAccent}</div>
        <div style={{ display:'flex', gap:12 }}>
          {times.map((tm,i)=>(
            <div key={i} style={{ flex:1, background:'#27272a', borderRadius:10, padding:'12px 14px', borderTop:`3px solid ${['#f472b6','#a78bfa','#34d399'][i]}` }}>
              <div style={{ color:['#f472b6','#a78bfa','#34d399'][i], fontSize:10, fontWeight:700, marginBottom:4 }}>{tm}</div>
              <div style={{ color:'#a1a1aa', fontSize:11 }}>{beats[i]}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ width:160, background:'#fbbf24', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:24 }}>
        <div style={{ fontSize:48 }}>🎥</div>
        <div style={{ color:'#18181b', fontSize:13, fontWeight:900, textAlign:'center', lineHeight:1.2 }}>{t.footer}</div>
      </div>
    </div>
  );
}

function FAQCarouselPreview() {
  const t = useText({ badge:'FAQ Carousel', headline:'Got Qs?', subtitle:'Swipe through [Number] questions we answer about [topic]', q1:'Q1: [Question]?', q2:'Q2: [Question]?', q3:'Q3: [Question]?', more:'+ [Number-3] more →' });
  return (
    <div style={{ width:PW, height:PH, background:'#6366f1', fontFamily:'Arial,sans-serif', display:'flex', alignItems:'center', padding:'40px 56px', boxSizing:'border-box', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', bottom:-40, right:-40, width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,0.1)' }} />
      <div style={{ flex:1 }}>
        <div style={{ color:'#c7d2fe', fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:8 }}>{t.badge}</div>
        <div style={{ color:'#fff', fontSize:52, fontWeight:900, lineHeight:1, marginBottom:20 }}>❓<br/>{t.headline}</div>
        <div style={{ color:'#e0e7ff', fontSize:16, lineHeight:1.6 }}>{t.subtitle}</div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {[t.q1, t.q2, t.q3].map((q,i)=>(
          <div key={i} style={{ background:'rgba(255,255,255,0.15)', borderRadius:10, padding:'12px 18px', width:240, backdropFilter:'blur(4px)' }}>
            <div style={{ color:'#fff', fontSize:12, fontWeight:600 }}>{q}</div>
          </div>
        ))}
        <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 18px', width:240, textAlign:'center' }}>
          <div style={{ color:'#c7d2fe', fontSize:11, fontWeight:700 }}>{t.more}</div>
        </div>
      </div>
    </div>
  );
}

function BundleDealPreview() {
  return (
    <div style={{ width:PW, height:PH, background:'#7c3aed', fontFamily:'Arial,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 56px', boxSizing:'border-box', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:-80, left:-80, width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'100%' }}>
        <div style={{ color:'#ddd6fe', fontSize:12, fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:16 }}>🎁 Bundle Deal</div>
        <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24 }}>
          {['[Product A]','[Product B]'].map((p,i)=>(
            <React.Fragment key={i}>
              <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:16, padding:'20px 28px', textAlign:'center', backdropFilter:'blur(4px)', border:'2px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>{['📦','✨'][i]}</div>
                <div style={{ color:'#fff', fontSize:14, fontWeight:700 }}>{p}</div>
              </div>
              {i===0 && <div style={{ color:'#fff', fontSize:28, fontWeight:900 }}>+</div>}
            </React.Fragment>
          ))}
        </div>
        <div style={{ background:'#fbbf24', borderRadius:50, padding:'14px 48px' }}>
          <div style={{ color:'#18181b', fontSize:22, fontWeight:900 }}>One special price</div>
        </div>
        <div style={{ color:'#ddd6fe', fontSize:12, marginTop:16 }}>⏰ Ends [Date] · Link in bio</div>
      </div>
    </div>
  );
}

function FlashGiveawayPreview() {
  const t = useText({
    badge: '⚡ FLASH GIVEAWAY',
    headline: 'WIN',
    prize: '[Prize]',
    step1: '❤️ Like',
    step2: '👥 Tag 2',
    step3: '🔔 Follow',
    ending: 'Ends in [timeframe]',
  });
  return (
    <div style={{ width:PW, height:PH, background:'linear-gradient(135deg,#ec4899,#8b5cf6)', fontFamily:'Arial,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 56px', boxSizing:'border-box', position:'relative', overflow:'hidden' }}>
      {['⭐','🎉','✨','🎊','💫','⭐','🎉','✨'].map((e,i)=>(
        <div key={i} style={{ position:'absolute', fontSize:20, opacity:0.4, top:`${[10,20,70,80,15,55,45,85][i]}%`, left:`${[5,85,8,80,40,2,92,50][i]}%` }}>{e}</div>
      ))}
      <div style={{ textAlign:'center', position:'relative' }}>
        <div style={{ color:'#fdf2f8', fontSize:13, fontWeight:700, letterSpacing:3, marginBottom:12 }}>{t.badge}</div>
        <div style={{ color:'#fff', fontSize:60, fontWeight:900, lineHeight:1, marginBottom:8 }}>{t.headline}</div>
        <div style={{ color:'#fde68a', fontSize:26, fontWeight:800, marginBottom:20 }}>{t.prize}</div>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          {[t.step1, t.step2, t.step3].map((s,i)=>(
            <div key={i} style={{ background:'rgba(255,255,255,0.2)', borderRadius:50, padding:'8px 18px', color:'#fff', fontSize:13, fontWeight:700, backdropFilter:'blur(4px)' }}>{s}</div>
          ))}
        </div>
        <div style={{ color:'#fde68a', fontSize:12, marginTop:16 }}>{t.ending}</div>
      </div>
    </div>
  );
}

function HourPriceDropPreview() {
  const t = useText({
    timerLabel: '48\nHours',
    badge: 'Price Drop Alert',
    productName: '[Product Name]',
    discount: '[X]',
    body: 'Limited window — no code needed.',
    cta: 'Shop Now →',
    endDate: 'Ends [Date]',
  });
  return (
    <div style={{ width:PW, height:PH, background:'#1e293b', fontFamily:'Arial,sans-serif', display:'flex', alignItems:'center', overflow:'hidden', position:'relative' }}>
      <div style={{ position:'absolute', top:'50%', left:220, transform:'translateY(-50%)', width:340, height:340, borderRadius:'50%', border:'40px solid #f97316', opacity:0.15 }} />
      <div style={{ width:260, height:'100%', background:'#f97316', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, boxSizing:'border-box' }}>
        <div style={{ fontSize:56 }}>⏰</div>
        <div style={{ color:'#fff', fontSize:36, fontWeight:900, textAlign:'center', lineHeight:1.1, marginTop:12, whiteSpace:'pre-line' }}>{t.timerLabel}</div>
        <div style={{ color:'#ffedd5', fontSize:13, marginTop:8, textAlign:'center' }}>Only</div>
      </div>
      <div style={{ flex:1, padding:'40px 44px', boxSizing:'border-box' }}>
        <div style={{ color:'#f97316', fontSize:12, fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:10 }}>{t.badge}</div>
        <div style={{ color:'#fff', fontSize:38, fontWeight:900, lineHeight:1.1, marginBottom:16 }}>{t.productName}<br/>Now {t.discount}% Off</div>
        <div style={{ color:'#94a3b8', fontSize:13, lineHeight:1.7, marginBottom:20 }}>{t.body}</div>
        <div style={{ display:'flex', gap:10 }}>
          <div style={{ background:'#f97316', color:'#fff', fontSize:12, fontWeight:700, padding:'10px 20px', borderRadius:8 }}>{t.cta}</div>
          <div style={{ background:'#1e293b', color:'#64748b', fontSize:12, fontWeight:700, padding:'10px 20px', borderRadius:8, border:'1px solid #334155' }}>{t.endDate}</div>
        </div>
      </div>
    </div>
  );
}

function VIPPerksPreview() {
  const t = useText({
    badge: 'VIP Member Perks',
    headline: 'Exclusive\nbenefits, just\nfor you',
    cta: 'Join VIP →',
  });
  return (
    <div style={{ width:PW, height:PH, background:'linear-gradient(135deg,#1c1917,#292524)', fontFamily:'Arial,sans-serif', display:'flex', alignItems:'center', padding:'40px 56px', boxSizing:'border-box', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:-40, right:-40, width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle,#fbbf24,transparent)', opacity:0.2 }} />
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <span style={{ fontSize:28 }}>👑</span>
          <div style={{ color:'#fbbf24', fontSize:12, fontWeight:700, letterSpacing:3, textTransform:'uppercase' }}>{t.badge}</div>
        </div>
        <div style={{ color:'#fff', fontSize:40, fontWeight:900, lineHeight:1.1, marginBottom:20, whiteSpace:'pre-line' }}>{t.headline}</div>
        {['[Benefit 1]','[Benefit 2]','[Benefit 3]'].map((b,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#fbbf24' }} />
            <div style={{ color:'#e7e5e4', fontSize:13, fontWeight:600 }}>{b}</div>
          </div>
        ))}
      </div>
      <div style={{ width:220, display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <div style={{ width:120, height:120, borderRadius:'50%', background:'linear-gradient(135deg,#fbbf24,#d97706)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:52 }}>👑</div>
        <div style={{ background:'#fbbf24', borderRadius:50, padding:'10px 28px' }}>
          <div style={{ color:'#18181b', fontSize:13, fontWeight:900 }}>{t.cta}</div>
        </div>
      </div>
    </div>
  );
}

function MicroAffirmPreview() {
  const t = useText({
    badge: 'Gentle Reminder',
    quote: "You don't have to\n[unrealistic expectation].\nYou only need to [small step].",
    cta: 'Save if you needed this 🤍',
  });
  return (
    <div style={{ width:PW, height:PH, background:'linear-gradient(135deg,#fdf4ff,#fce7f3)', fontFamily:'Georgia,serif', display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 72px', boxSizing:'border-box', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:20, left:20, right:20, bottom:20, border:'1px solid #f9a8d4', borderRadius:20, opacity:0.5 }} />
      <div style={{ textAlign:'center', position:'relative' }}>
        <div style={{ fontSize:36, marginBottom:20 }}>🌿</div>
        <div style={{ color:'#701a75', fontSize:14, fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:20 }}>{t.badge}</div>
        <div style={{ color:'#4a044e', fontSize:28, fontStyle:'italic', lineHeight:1.6, marginBottom:24, whiteSpace:'pre-line' }}>"{t.quote}"</div>
        <div style={{ color:'#c026d3', fontSize:13, fontWeight:600 }}>{t.cta}</div>
      </div>
    </div>
  );
}

function BoldOneLinerPreview() {
  const t = useText({
    quote: '[Powerful one-liner quote]',
    attribution: '[Attribution]',
  });
  return (
    <div style={{ width:PW, height:PH, background:'#0f172a', fontFamily:'Arial,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 80px', boxSizing:'border-box', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', width:6, height:'60%', background:'linear-gradient(180deg,#6366f1,#a855f7)' }} />
      <div style={{ textAlign:'center' }}>
        <div style={{ color:'#64748b', fontSize:36, marginBottom:16 }}>❝</div>
        <div style={{ color:'#fff', fontSize:36, fontWeight:900, lineHeight:1.3, marginBottom:16 }}>{t.quote}</div>
        <div style={{ color:'#64748b', fontSize:36, marginBottom:24 }}>❞</div>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(99,102,241,0.2)', borderRadius:50, padding:'8px 20px' }}>
          <div style={{ color:'#818cf8', fontSize:13, fontWeight:700 }}>— {t.attribution}</div>
        </div>
      </div>
    </div>
  );
}

function LunchLearnPreview() {
  const t = useText({
    sideTitle: 'Lunch &\nLearn',
    topic: '[Topic]',
    badge: "You're Invited",
    headline: 'Join us for a casual\nQ&A session',
    cta: 'RSVP Free →',
  });
  return (
    <div style={{ width:PW, height:PH, background:'#fff7ed', fontFamily:'Arial,sans-serif', display:'flex', alignItems:'stretch', overflow:'hidden' }}>
      <div style={{ width:240, background:'#ea580c', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, boxSizing:'border-box' }}>
        <div style={{ fontSize:52, marginBottom:12 }}>🥪</div>
        <div style={{ color:'#fff', fontSize:18, fontWeight:900, textAlign:'center', whiteSpace:'pre-line' }}>{t.sideTitle}</div>
        <div style={{ marginTop:12, width:40, height:3, background:'rgba(255,255,255,0.4)' }} />
        <div style={{ color:'#fed7aa', fontSize:12, marginTop:10, textAlign:'center' }}>{t.topic}</div>
      </div>
      <div style={{ flex:1, padding:'40px 44px', boxSizing:'border-box', display:'flex', flexDirection:'column', justifyContent:'center' }}>
        <div style={{ color:'#9a3412', fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:14 }}>{t.badge}</div>
        <div style={{ color:'#1c1917', fontSize:32, fontWeight:900, lineHeight:1.2, marginBottom:20, whiteSpace:'pre-line' }}>{t.headline}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[['📅','[Date]'],['⏰','[Time] [Timezone]'],['📍','[Location / Zoom]']].map(([ic,t],i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:16 }}>{ic}</span>
              <span style={{ color:'#44403c', fontSize:14, fontWeight:600 }}>{t}</span>
            </div>
          ))}
        </div>
        <div style={{ background:'#ea580c', color:'#fff', fontSize:13, fontWeight:700, padding:'10px 24px', borderRadius:8, marginTop:20, display:'inline-block', width:'fit-content' }}>{t.cta}</div>
      </div>
    </div>
  );
}

function LaunchCountdownPreview() {
  const t = useText({
    badge: '⏳ Launching In',
    days: '[X] Days',
    eventName: '[Event Name]',
    highlight1: '🚀 [Highlight 1]',
    highlight2: '✨ [Highlight 2]',
    cta: '🔔 Set reminder → link in bio',
  });
  return (
    <div style={{ width:PW, height:PH, background:'#030712', fontFamily:'Arial,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 60px', boxSizing:'border-box', position:'relative', overflow:'hidden' }}>
      {[...Array(20)].map((_,i)=>(
        <div key={i} style={{ position:'absolute', width:2, height:2, borderRadius:'50%', background:'#fff', opacity:Math.random()*0.6+0.1, top:`${Math.random()*100}%`, left:`${Math.random()*100}%` }} />
      ))}
      <div style={{ textAlign:'center', position:'relative' }}>
        <div style={{ color:'#6366f1', fontSize:12, fontWeight:700, letterSpacing:4, textTransform:'uppercase', marginBottom:12 }}>{t.badge}</div>
        <div style={{ color:'#fff', fontSize:56, fontWeight:900, lineHeight:1, marginBottom:16 }}>{t.days}</div>
        <div style={{ color:'#94a3b8', fontSize:18, marginBottom:28 }}>{t.eventName}</div>
        <div style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:24 }}>
          {[t.highlight1, t.highlight2].map((h,i)=>(
            <div key={i} style={{ background:'rgba(99,102,241,0.2)', border:'1px solid #4f46e5', borderRadius:8, padding:'8px 16px', color:'#c7d2fe', fontSize:12 }}>{h}</div>
          ))}
        </div>
        <div style={{ color:'#6366f1', fontSize:13, fontWeight:700 }}>{t.cta}</div>
      </div>
    </div>
  );
}

function PopUpEventPreview() {
  const t = useText({ badge:'Pop-Up Event', headline:"We're coming", headlineAccent:'to [City]!', date:'[Date]', time:'[Time]', where:'[Address]', cta:'Get Directions →', footer:'First [X] visitors get a freebie!' });
  return (
    <div style={{ width:PW, height:PH, background:'#ecfdf5', fontFamily:'Arial,sans-serif', display:'flex', alignItems:'stretch', overflow:'hidden' }}>
      <div style={{ flex:1, padding:'40px 44px', boxSizing:'border-box', display:'flex', flexDirection:'column', justifyContent:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <span style={{ fontSize:28 }}>📍</span>
          <div style={{ color:'#065f46', fontSize:12, fontWeight:700, letterSpacing:3, textTransform:'uppercase' }}>{t.badge}</div>
        </div>
        <div style={{ color:'#064e3b', fontSize:38, fontWeight:900, lineHeight:1.1, marginBottom:20 }}>{t.headline}<br/>{t.headlineAccent}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
          {[['📅 Date',t.date],['⏰ Time',t.time],['📍 Where',t.where]].map(([l,v],i)=>(
            <div key={i} style={{ display:'flex', gap:16, alignItems:'center' }}>
              <div style={{ color:'#6ee7b7', fontSize:12, fontWeight:700, width:80 }}>{l}</div>
              <div style={{ color:'#064e3b', fontSize:14, fontWeight:600 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ background:'#10b981', color:'#fff', fontSize:13, fontWeight:700, padding:'12px 24px', borderRadius:10, display:'inline-block', width:'fit-content' }}>{t.cta}</div>
      </div>
      <div style={{ width:240, background:'#10b981', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:32 }}>
        <div style={{ fontSize:64 }}>🗺️</div>
        <div style={{ color:'#fff', fontSize:14, fontWeight:800, textAlign:'center' }}>{t.footer}</div>
      </div>
    </div>
  );
}

function CoffeeChatPreview() {
  return (
    <div style={{ width:PW, height:PH, background:'#fef3c7', fontFamily:'Arial,sans-serif', display:'flex', alignItems:'center', padding:'40px 60px', boxSizing:'border-box', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', bottom:-60, right:-60, width:280, height:280, borderRadius:'50%', background:'#fde68a', opacity:0.5 }} />
      <div style={{ width:220, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, flexShrink:0 }}>
        <div style={{ width:140, height:140, borderRadius:'50%', background:'#92400e', display:'flex', alignItems:'center', justifyContent:'center', fontSize:64 }}>☕</div>
        <div style={{ color:'#92400e', fontSize:13, fontWeight:800, textAlign:'center' }}>No pitch.<br/>Just Q&A.</div>
      </div>
      <div style={{ flex:1, paddingLeft:40 }}>
        <div style={{ color:'#92400e', fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:12 }}>Open Office Hours</div>
        <div style={{ color:'#1c1917', fontSize:38, fontWeight:900, lineHeight:1.1, marginBottom:16 }}>Coffee Chat:<br/>[Topic]</div>
        <div style={{ color:'#78350f', fontSize:14, lineHeight:1.7, marginBottom:20 }}>Bring your questions about [focus area]. I'll answer everything live.</div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {['📅 [Date]','⏰ [Time]','💻 [Platform]'].map((t,i)=>(
            <div key={i} style={{ background:'#92400e', color:'#fef3c7', fontSize:12, fontWeight:700, padding:'8px 14px', borderRadius:20 }}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfluencerTakeoverPreview() {
  const t = useText({
    badge: '📣 Takeover Alert',
    handle: '@[handle]',
    subheadline: 'takes over!',
    body: "They're running our account on [Date] — sharing [theme] + a surprise for followers.",
    cta: 'Set Reminder 🔔',
    date: '[Date]',
  });
  return (
    <div style={{ width:PW, height:PH, background:'#2e1065', fontFamily:'Arial,sans-serif', display:'flex', alignItems:'center', padding:'40px 60px', boxSizing:'border-box', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,#a855f7,transparent)', opacity:0.4 }} />
      <div style={{ flex:1 }}>
        <div style={{ color:'#d8b4fe', fontSize:12, fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:12 }}>{t.badge}</div>
        <div style={{ color:'#fff', fontSize:40, fontWeight:900, lineHeight:1.1, marginBottom:20 }}>{t.handle}<br/>{t.subheadline}</div>
        <div style={{ color:'#c4b5fd', fontSize:14, lineHeight:1.7, marginBottom:24 }}>{t.body}</div>
        <div style={{ display:'flex', gap:12 }}>
          <div style={{ background:'#a855f7', color:'#fff', fontSize:13, fontWeight:700, padding:'10px 24px', borderRadius:8 }}>{t.cta}</div>
          <div style={{ background:'rgba(168,85,247,0.2)', color:'#d8b4fe', fontSize:13, fontWeight:700, padding:'10px 24px', borderRadius:8, border:'1px solid #7c3aed' }}>{t.date}</div>
        </div>
      </div>
      <div style={{ width:200, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
        <div style={{ width:100, height:100, borderRadius:'50%', background:'rgba(168,85,247,0.3)', border:'3px solid #a855f7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:44 }}>📸</div>
        <div style={{ color:'#d8b4fe', fontSize:12, fontWeight:700, textAlign:'center' }}>Guest Creator</div>
      </div>
    </div>
  );
}

function FeatureDropPreview() {
  const t = useText({
    badge: 'New Feature Drop',
    productName: '[Product Name]',
    feature1: '✨ [Feature 1]',
    feature2: '✨ [Feature 2]',
    feature3: '✨ [Feature 3]',
    cta: 'Try it now →',
  });
  return (
    <div style={{ width:PW, height:PH, background:'#0f172a', fontFamily:'Arial,sans-serif', display:'flex', alignItems:'stretch', overflow:'hidden' }}>
      <div style={{ flex:1, padding:'40px 44px', boxSizing:'border-box', display:'flex', flexDirection:'column', justifyContent:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <div style={{ background:'#10b981', width:8, height:8, borderRadius:'50%' }} />
          <div style={{ color:'#34d399', fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase' }}>{t.badge}</div>
        </div>
        <div style={{ color:'#fff', fontSize:36, fontWeight:900, lineHeight:1.1, marginBottom:20 }}>Now live in<br/>{t.productName}</div>
        {[t.feature1, t.feature2, t.feature3].map((f,i)=>(
          <div key={i} style={{ color:'#94a3b8', fontSize:14, marginBottom:8, paddingLeft:4 }}>{f}</div>
        ))}
        <div style={{ background:'#10b981', color:'#fff', fontSize:13, fontWeight:700, padding:'10px 24px', borderRadius:8, marginTop:20, width:'fit-content' }}>{t.cta}</div>
      </div>
      <div style={{ width:240, background:'#1e293b', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, gap:12 }}>
        <div style={{ background:'#0f172a', borderRadius:14, padding:20, width:'100%', border:'1px solid #334155' }}>
          <div style={{ height:10, background:'#10b981', borderRadius:50, marginBottom:10 }} />
          <div style={{ height:6, background:'#1e293b', borderRadius:50, marginBottom:8, border:'1px solid #334155', width:'80%' }} />
          <div style={{ height:6, background:'#1e293b', borderRadius:50, border:'1px solid #334155', width:'60%' }} />
        </div>
        <div style={{ color:'#34d399', fontSize:12, fontWeight:700, textAlign:'center' }}>Built for [pain point]</div>
      </div>
    </div>
  );
}

function RoomRefreshPreview() {
  const t = useText({ before:'BEFORE', after:'AFTER' });
  return (
    <div style={{ width:PW, height:PH, background:'#f5f0eb', fontFamily:'Arial,sans-serif', display:'flex', alignItems:'stretch', overflow:'hidden' }}>
      <div style={{ flex:1, background:'#d6cfc4', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:32, boxSizing:'border-box', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:160, height:120, background:'#b0a090', borderRadius:8, boxShadow:'0 8px 24px rgba(0,0,0,0.15)' }} />
        </div>
        <div style={{ background:'rgba(0,0,0,0.5)', color:'#fff', fontSize:12, fontWeight:700, padding:'6px 14px', borderRadius:4, display:'inline-block', position:'relative', width:'fit-content' }}>{t.before}</div>
      </div>
      <div style={{ width:4, background:'#fff', flexShrink:0 }} />
      <div style={{ flex:1, background:'#e8f5e9', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:32, boxSizing:'border-box', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:160, height:120, background:'#a8d5a2', borderRadius:8, boxShadow:'0 8px 24px rgba(0,0,0,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>🌿</div>
        </div>
        <div style={{ background:'#16a34a', color:'#fff', fontSize:12, fontWeight:700, padding:'6px 14px', borderRadius:4, display:'inline-block', position:'relative', width:'fit-content' }}>{t.after}</div>
      </div>
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#fff', borderRadius:'50%', width:48, height:48, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:'0 4px 12px rgba(0,0,0,0.2)', zIndex:10 }}>🏠</div>
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
function CustomizeModal({ template, onClose, onConfirm, onDownloadDesign, designDownloading, initialThemeId, onThemeChange, extraThemes = [] }) {
  const modalThemes = [...extraThemes, ...PREVIEW_THEMES];
  const placeholders = [...new Set(template.caption.match(/\[[^\]]+\]/g) || [])];
  const [values, setValues]         = useState(Object.fromEntries(placeholders.map(p => [p, ''])));
  const [themeId, setThemeId]       = useState(initialThemeId || 'default');
  const [customColors, setCustomColors] = useState({ primary: '#FF4C46', bg: '#DFFFDE', text: '#012B3A' });
  const [activeTab, setActiveTab]   = useState('text'); // 'text' | 'design'
  const [designFields, setDesignFields] = useState({ businessName: '', name: '', handle: '', email: '', website: '' });
  const setDField = (k, v) => setDesignFields(prev => ({ ...prev, [k]: v }));

  // ── Inline design-text editing ──
  const [designText, setDesignText]           = useState({});
  const [discoveredDefaults, setDiscoveredDefaults] = useState(null);
  const handleDefaults = useCallback((defs) => {
    setDiscoveredDefaults(prev => prev || defs);
  }, []);
  const textCtxValue = useMemo(() => ({
    ...designText,
    __onDefaults: handleDefaults,
  }), [designText, handleDefaults]);

  const filled = template.caption.replace(/\[[^\]]+\]/g, m => values[m] || m);
  const set = (p, v) => setValues(prev => ({ ...prev, [p]: v }));

  // Auto-populate design fields from caption values so users don't fill twice
  const resolvedFields = {
    businessName: designFields.businessName || values['[Brand Name]'] || values['[Your Brand]'] || values['[business name]'] || '',
    name:         designFields.name         || values['[Your Name]'] || values['[Author / Your Name]'] || values['[your name]'] || '',
    handle:       designFields.handle       || values['[handle]'] || values['[yourhandle]'] || values['[your handle]'] || '',
    email:        designFields.email        || values['[email]'] || '',
    website:      designFields.website      || values['[website]'] || '',
  };

  const isCustom = themeId === 'custom';
  const activeTheme = isCustom ? null : getPreviewTheme(themeId);
  const designFilter = isCustom
    ? `hue-rotate(${hexToHue(customColors.primary)}deg) saturate(1.1)`
    : (activeTheme?.filter || 'none');

  // notify parent so download uses same theme
  const pickTheme = (id) => {
    setThemeId(id);
    if (onThemeChange) onThemeChange(id === 'custom' ? 'custom' : id);
  };

  // small design preview scale inside modal
  const PREV_W = 420, PREV_H = Math.round(420 * PH / PW);
  const PREV_SC = PREV_W / PW;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:9100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:980, maxHeight:'94vh', display:'flex', flexDirection:'column', boxShadow:'0 32px 80px rgba(0,0,0,0.35)', overflow:'hidden' }}
        onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={{ padding:'16px 24px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:'#1e293b' }}>✏️ Customize Template</div>
            <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>Fill in your details, pick colors, then download or send to Publisher</div>
          </div>
          <button onClick={onClose} style={{ background:'#f1f5f9', border:'none', cursor:'pointer', color:'#64748b', width:32, height:32, borderRadius:8, fontSize:15, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {/* ── Body ── */}
        <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>

          {/* ── LEFT — inputs + color picker ── */}
          <div style={{ width:320, borderRight:'1px solid #f1f5f9', display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden' }}>

            {/* Tab switcher */}
            <div style={{ display:'flex', borderBottom:'1px solid #f1f5f9', flexShrink:0 }}>
              {[['text','✏️ Text'],['color','🎨 Colour']].map(([id, label]) => (
                <button key={id} onClick={() => setActiveTab(id)} style={{
                  flex:1, padding:'11px 0', border:'none', cursor:'pointer', fontSize:13, fontWeight:700,
                  background: activeTab === id ? '#fff' : '#f8fafc',
                  color: activeTab === id ? '#6366f1' : '#94a3b8',
                  borderBottom: activeTab === id ? '2px solid #6366f1' : '2px solid transparent',
                }}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── TEXT TAB ── */}
            {activeTab === 'text' && (
              <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>

                {/* ── Edit Design Text — inline text editing ── */}
                {discoveredDefaults && Object.keys(discoveredDefaults).length > 0 && (
                  <>
                    <div style={{ fontSize:11, fontWeight:700, color:'#e11d48', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
                      ✏️ Edit Design Text
                    </div>
                    <div style={{ fontSize:11, color:'#94a3b8', marginBottom:12, lineHeight:1.5 }}>
                      Change the words shown in the design (headline, buttons, etc.)
                    </div>
                    {Object.entries(discoveredDefaults).map(([key, defaultVal]) => (
                      <div key={key} style={{ marginBottom:10 }}>
                        <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#475569', marginBottom:4 }}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                        </label>
                        <input
                          value={designText[key] || ''}
                          onChange={e => setDesignText(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder={defaultVal}
                          style={{ width:'100%', padding:'7px 10px', borderRadius:8, border:'1.5px solid #fecdd3', fontSize:12, color:'#1e293b', outline:'none', boxSizing:'border-box', fontFamily:'"Segoe UI",Arial,sans-serif', background:'#fff5f7' }}
                          onFocus={e => e.target.style.borderColor='#e11d48'}
                          onBlur={e  => e.target.style.borderColor='#fecdd3'}
                        />
                      </div>
                    ))}
                    <div style={{ borderTop:'1px solid #f1f5f9', margin:'16px 0 14px' }} />
                  </>
                )}

                {/* ── Design Info fields (update the visual template) ── */}
                <div style={{ fontSize:11, fontWeight:700, color:'#6366f1', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
                  🖼 Design Info
                </div>
                <div style={{ fontSize:11, color:'#94a3b8', marginBottom:12, lineHeight:1.5 }}>
                  Appears inside the visual design. Auto-fills from Caption Fields below if left empty.
                </div>
                {[
                  { key:'businessName', label:'Business / Brand Name', ph:'e.g. Spring AI' },
                  { key:'name',         label:'Your Name',              ph:'e.g. Jane Smith' },
                  { key:'handle',       label:'Social Handle',          ph:'e.g. @springai' },
                  { key:'email',        label:'Email',                  ph:'e.g. hello@springai.com' },
                  { key:'website',      label:'Website',                ph:'e.g. www.springai.com' },
                ].map(({ key, label, ph }) => (
                  <div key={key} style={{ marginBottom:10 }}>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#475569', marginBottom:4 }}>{label}</label>
                    <input value={designFields[key]} onChange={e => setDField(key, e.target.value)} placeholder={ph}
                      style={{ width:'100%', padding:'7px 10px', borderRadius:8, border:'1.5px solid #e2e8f0', fontSize:12, color:'#1e293b', outline:'none', boxSizing:'border-box', fontFamily:'"Segoe UI",Arial,sans-serif' }}
                      onFocus={e => e.target.style.borderColor='#6366f1'}
                      onBlur={e  => e.target.style.borderColor='#e2e8f0'}
                    />
                  </div>
                ))}

                <div style={{ borderTop:'1px solid #f1f5f9', margin:'16px 0 14px' }} />

                {/* ── Caption placeholders ── */}
                <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>
                  📝 Caption Fields ({placeholders.length})
                </div>
                {placeholders.length === 0 && (
                  <div style={{ fontSize:13, color:'#94a3b8', textAlign:'center', padding:'20px 0' }}>No placeholders found.<br/>Ready to use as-is!</div>
                )}
                {placeholders.map(p => (
                  <div key={p} style={{ marginBottom:14 }}>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#475569', marginBottom:5 }}>
                      {p.replace(/\[|\]/g,'')}
                    </label>
                    <input value={values[p]} onChange={e => set(p, e.target.value)} placeholder={getHint(p)}
                      style={{ width:'100%', padding:'8px 11px', borderRadius:8, border:'1.5px solid #e2e8f0', fontSize:13, color:'#1e293b', outline:'none', boxSizing:'border-box', fontFamily:'"Segoe UI",Arial,sans-serif' }}
                      onFocus={e => e.target.style.borderColor='#6366f1'}
                      onBlur={e  => e.target.style.borderColor='#e2e8f0'}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ── COLOUR TAB ── */}
            {activeTab === 'color' && (
              <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>

                {/* Themes grid */}
                <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Themes</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:18 }}>
                  {modalThemes.map(th => (
                    <button key={th.id} onClick={() => pickTheme(th.id)} title={th.label} style={{
                      border: themeId === th.id ? '2px solid #6366f1' : '2px solid transparent',
                      borderRadius:10, padding:0, cursor:'pointer', background:'none', position:'relative',
                    }}>
                      <div style={{ borderRadius:8, overflow:'hidden', height:44, display:'flex', background:'#f1f5f9' }}>
                        {th.swatch.map((c,i) => (
                          <div key={i} style={{ flex:1, background:c }} />
                        ))}
                      </div>
                      {themeId === th.id && (
                        <div style={{ position:'absolute', top:3, right:3, width:14, height:14, borderRadius:'50%', background:'#6366f1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#fff' }}>✓</div>
                      )}
                      <div style={{ fontSize:10, color:'#64748b', marginTop:3, textAlign:'center' }}>{th.label}</div>
                    </button>
                  ))}

                  {/* Custom tile */}
                  <button onClick={() => pickTheme('custom')} style={{
                    border: isCustom ? '2px solid #f97316' : '2px solid #e2e8f0',
                    borderRadius:10, padding:0, cursor:'pointer', background:'none', position:'relative',
                  }}>
                    <div style={{ borderRadius:8, height:44, display:'flex', background:'#f8fafc', alignItems:'center', justifyContent:'center', fontSize:18 }}>🎨</div>
                    {isCustom && (
                      <div style={{ position:'absolute', top:3, right:3, width:14, height:14, borderRadius:'50%', background:'#f97316', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#fff' }}>✓</div>
                    )}
                    <div style={{ fontSize:10, color:'#64748b', marginTop:3, textAlign:'center' }}>Custom</div>
                  </button>
                </div>

                {/* Custom colour pickers */}
                {isCustom && (
                  <div style={{ background:'#f8fafc', borderRadius:12, padding:'14px 14px', border:'1px solid #e2e8f0' }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>Customize</div>
                    {[
                      { key:'primary', label:'Primary colour' },
                      { key:'bg',      label:'Background colour' },
                      { key:'text',    label:'Font colour' },
                    ].map(({ key, label }) => (
                      <div key={key} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                        <div style={{ position:'relative', flexShrink:0 }}>
                          <div style={{ width:36, height:36, borderRadius:8, background:customColors[key], border:'2px solid #e2e8f0', cursor:'pointer' }} />
                          <input type="color" value={customColors[key]}
                            onChange={e => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                            style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%', height:'100%' }}
                          />
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:11, fontWeight:600, color:'#475569', marginBottom:3 }}>{label}</div>
                          <input value={customColors[key].toUpperCase()}
                            onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) setCustomColors(prev => ({ ...prev, [key]: e.target.value })); }}
                            style={{ width:'100%', padding:'5px 8px', borderRadius:6, border:'1.5px solid #e2e8f0', fontSize:11, fontWeight:700, color:'#334155', fontFamily:'monospace', outline:'none', boxSizing:'border-box', letterSpacing:1 }}
                          />
                        </div>
                      </div>
                    ))}
                    <div style={{ fontSize:10, color:'#94a3b8', lineHeight:1.5 }}>
                      Primary colour controls the hue of the entire design.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT — design preview + caption ── */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'#f8fafc' }}>

            {/* Design preview */}
            <div style={{ flexShrink:0, padding:'16px 20px 12px', borderBottom:'1px solid #f1f5f9', background:'#fff' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Design Preview</div>
              <div style={{ width:PREV_W, height:PREV_H, overflow:'hidden', borderRadius:10, border:'1px solid #e2e8f0', position:'relative', maxWidth:'100%' }}>
                <div style={{ width:PW, height:PH, transform:`scale(${PREV_SC})`, transformOrigin:'top left', filter:designFilter }}>
                  <DesignTextCtx.Provider value={textCtxValue}>
                    <template.Preview fields={resolvedFields} />
                  </DesignTextCtx.Provider>
                </div>
                {/* Custom bg overlay */}
                {isCustom && (
                  <div style={{ position:'absolute', inset:0, background:customColors.bg, opacity:0.25, pointerEvents:'none', borderRadius:10 }} />
                )}
              </div>
            </div>

            {/* Caption live preview */}
            <div style={{ flex:1, overflowY:'auto', padding:'14px 20px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Caption Preview</div>
              <pre style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:'14px 16px', fontSize:13, color:'#334155', lineHeight:1.85, whiteSpace:'pre-wrap', fontFamily:'"Segoe UI",Arial,sans-serif', margin:0, minHeight:120 }}>
                {filled.split(/(\[[^\]]+\])/g).map((part, i) =>
                  /^\[[^\]]+\]$/.test(part)
                    ? <mark key={i} style={{ background:'#fef9c3', color:'#92400e', borderRadius:3, padding:'0 2px' }}>{part}</mark>
                    : part
                )}
              </pre>
              <div style={{ fontSize:11, color:'#94a3b8', marginTop:8 }}>
                💡 Yellow highlights = unfilled placeholders
              </div>

              {/* ── Download options — shown after user edits ── */}
              {onDownloadDesign && (
                <div style={{ marginTop:20, padding:'16px', background:'#f8fafc', borderRadius:12, border:'1px solid #e2e8f0' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>
                    ⬇ Download Design
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    {[['png','🖼 PNG'],['jpg','📷 JPG'],['pdf','📄 PDF']].map(([fmt, label]) => (
                      <button key={fmt} type="button"
                        onClick={e => onDownloadDesign(fmt, e, filled, resolvedFields, designText, themeId === 'custom' ? customColors : null)}
                        disabled={!!designDownloading}
                        style={{
                          flex:1, padding:'10px 8px', borderRadius:9, border:'1.5px solid #e2e8f0',
                          background: designDownloading === fmt ? '#6366f1' : '#fff',
                          color: designDownloading === fmt ? '#fff' : '#334155',
                          fontSize:12, fontWeight:700, cursor: designDownloading ? 'wait' : 'pointer',
                          display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                          transition:'all 0.15s',
                        }}
                        onMouseEnter={e => { if (!designDownloading) { e.currentTarget.style.background='#6366f1'; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='#6366f1'; }}}
                        onMouseLeave={e => { if (!designDownloading) { e.currentTarget.style.background='#fff'; e.currentTarget.style.color='#334155'; e.currentTarget.style.borderColor='#e2e8f0'; }}}
                      >
                        {designDownloading === fmt ? '⏳' : label}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize:10, color:'#94a3b8', marginTop:8 }}>Current colour theme is applied to the download.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ padding:'14px 20px', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', alignItems:'center', gap:8, flexShrink:0, background:'#fff' }}>
          <button onClick={onClose}
            style={{ padding:'9px 20px', borderRadius:8, border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            Cancel
          </button>
          <button type="button" onClick={() => onConfirm(filled)}
            style={{ padding:'9px 24px', borderRadius:8, border:'none', background:'#6366f1', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            Use in Publisher →
          </button>
        </div>
      </div>
    </div>
  );
}

/** Convert a hex colour to approximate hue degrees for hue-rotate filter */
function hexToHue(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
  if (d === 0) return 0;
  let h = max === r ? ((g-b)/d + (g<b?6:0)) : max === g ? ((b-r)/d + 2) : ((r-g)/d + 4);
  return Math.round(h * 60);
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function CaptionTemplates({ onBack, onUseTemplate }) {
  const { user } = useAuth();

  // Build brand theme from user's saved brand kit (if any)
  const brandTheme = useMemo(() => {
    if (!user?.brandColors) return null;
    try {
      const colors = JSON.parse(user.brandColors);
      if (!colors?.length) return null;
      const primary   = colors[0] || '#6366f1';
      const secondary = colors[1] || '#a5b4fc';
      const accent    = colors[2] || '#ffffff';
      return {
        id: 'brand',
        label: '🎨 My Brand',
        frameBg: `linear-gradient(160deg, ${primary}22, ${secondary}44)`,
        filter: 'none',
        swatch: [primary, secondary, accent],
        _isBrand: true,
      };
    } catch { return null; }
  }, [user?.brandColors]);

  // All themes: brand first (if exists), then defaults
  const allThemes = useMemo(() =>
    brandTheme ? [brandTheme, ...PREVIEW_THEMES] : PREVIEW_THEMES,
  [brandTheme]);

  const [cat, setCat]             = useState('All');
  const [preview, setPreview]     = useState(null);
  const [customize, setCustomize] = useState(null);
  const [copied, setCopied]       = useState(null);
  const [dlMenu, setDlMenu]       = useState(null);   // templateId with open dropdown
  const [dlTarget, setDlTarget]   = useState(null);   // { template, format, filledCaption?, exportThemeId? }
  const [dlLoading, setDlLoading] = useState(null);   // templateId being downloaded
  const [previewTheme, setPreviewTheme] = useState('default');
  const captureRef                = useRef(null);

  const filtered = TEMPLATES.filter(t => cat === 'All' || t.category === cat);

  // Close download menu when clicking outside
  useEffect(() => {
    if (!dlMenu) return;
    const close = () => setDlMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [dlMenu]);

  // Rasterize after DOM commit. Capture root stays in-viewport (invisible) so layout includes caption text;
  // off-screen fixed nodes often paint only the design (780×440), which broke "download right after fill".
  useLayoutEffect(() => {
    if (!dlTarget) return;
    const { template, format, filledCaption, exportThemeId, customColors: dlCustomColors } = dlTarget;
    const withCaption = typeof filledCaption === 'string';
    const theme = getPreviewTheme(exportThemeId || 'default');
    const isCustomDl = exportThemeId === 'custom' && dlCustomColors;
    const dlFilter = isCustomDl
      ? `hue-rotate(${hexToHue(dlCustomColors.primary)}deg) saturate(1.1)`
      : (theme.filter && theme.filter !== 'none' ? theme.filter : null);
    let cancelled = false;

    const run = async () => {
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));
      try {
        await document.fonts.ready;
      } catch (_) {
        /* ignore */
      }
      if (cancelled) return;
      const el = captureRef.current;
      if (!el) return;
      try {
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          // Force full 780px render regardless of viewport/sidebar width
          width: PW,
          windowWidth: PW,
          scrollX: 0,
          scrollY: 0,
          onclone: (_doc, clone) => {
            clone.style.opacity = '1';
            clone.style.visibility = 'visible';
            clone.style.position = 'fixed';
            clone.style.left = '0';
            clone.style.top = '0';
            clone.style.width = `${PW}px`;
            clone.style.zIndex = '0';
            clone.style.overflow = 'visible';
            // Force art wrap to exact design dimensions so nothing gets clipped
            const art = clone.querySelector('[data-theme-art-wrap]');
            if (art) {
              art.style.width = `${PW}px`;
              art.style.height = `${PH}px`;
              art.style.overflow = 'hidden';
              art.style.flexShrink = '0';
              // Remove CSS filter — html2canvas can't render it; we apply it post-capture
              art.style.filter = 'none';
            }
          },
        });
        if (cancelled) return;

        // Apply theme filter post-capture using Canvas 2D filter API
        // (html2canvas ignores CSS filter like hue-rotate/saturate)
        let outputCanvas = canvas;
        if (dlFilter) {
          const filtered = document.createElement('canvas');
          filtered.width = canvas.width;
          filtered.height = canvas.height;
          const fCtx = filtered.getContext('2d');
          fCtx.filter = dlFilter;
          fCtx.drawImage(canvas, 0, 0);
          fCtx.filter = 'none';
          outputCanvas = filtered;
        }

        const filename = template.name.replace(/\s+/g, '-').toLowerCase();
        const suffix = withCaption ? '-caption' : '';
        const baseName = `${filename}${suffix}`;
        const cw = outputCanvas.width;
        const ch = outputCanvas.height;

        if (format === 'pdf') {
          const pdf = new jsPDF({
            orientation: cw >= ch ? 'landscape' : 'portrait',
            unit: 'px',
            format: [cw, ch],
          });
          pdf.addImage(outputCanvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, cw, ch);
          pdf.save(`${baseName}.pdf`);
        } else {
          const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
          const link = document.createElement('a');
          link.download = `${baseName}.${format}`;
          link.href = outputCanvas.toDataURL(mime, 0.95);
          link.click();
        }
      } catch (err) {
        console.error('Download failed:', err);
      } finally {
        setDlLoading(null);
        if (!cancelled) setDlTarget(null);
      }
    };

    const t = withCaption ? window.setTimeout(run, 200) : window.setTimeout(run, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [dlTarget]);

  /** Card / preview modal: design image only. */
  const handleDownload = (t, format, e) => {
    e.stopPropagation();
    setDlMenu(null);
    setDlLoading(t.id);
    setDlTarget({ template: t, format, exportThemeId: previewTheme });
  };

  /** Customize modal: download the visual design only (no caption text). */
  const handleModalCaptionExport = (format, e, _filledText, designFields, designText, customColors) => {
    e.stopPropagation();
    setDlMenu(null);
    const t = customize;
    if (!t) return;
    setDlLoading(t.id);
    setDlTarget({ template: t, format, exportThemeId: previewTheme, designFields: designFields || {}, designText: designText || {}, customColors: customColors || null });
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
    <div style={{ minHeight:'100vh', background:'#f1f5f9', fontFamily:'"Segoe UI",Arial,sans-serif', position:'relative' }}>

      {/* ── Capture root: fixed in-viewport, nearly transparent (opacity 0 on parent hid caption from raster). onclone restores full opacity on the clone. */}
      {dlTarget && (() => {
        const P = dlTarget.template.Preview;
        const withCaption = typeof dlTarget.filledCaption === 'string';
        return (
          <div
            ref={captureRef}
            aria-hidden
            data-caption-export-root
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: PW,
              zIndex: -20,
              opacity: 0.012,
              pointerEvents: 'none',
              background: '#fff',
              boxSizing: 'border-box',
            }}
          >
            <div
              data-theme-art-wrap
              style={{
                width: PW,
                height: PH,
                overflow: 'hidden',
              }}
            >
              <DesignTextCtx.Provider value={dlTarget.designText || {}}>
                <P fields={dlTarget.designFields || {}} />
              </DesignTextCtx.Provider>
            </div>
            {withCaption && (
              <div
                style={{
                  width: PW,
                  boxSizing: 'border-box',
                  padding: '18px 22px 22px',
                  borderTop: '1px solid #e2e8f0',
                  fontFamily: '"Segoe UI",Arial,sans-serif',
                  fontSize: 13,
                  color: '#334155',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {dlTarget.filledCaption}
              </div>
            )}
          </div>
        );
      })()}

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

      {/* ── Category + theme (same chrome as pills: white chips, indigo active, soft shadow) ── */}
      <div style={{ padding:'20px 32px 16px' }}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
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
        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:10, marginTop:14 }}>
          <span style={{ fontSize:11, fontWeight:800, color:'#94a3b8', letterSpacing:1.2 }}>THEME</span>
          {allThemes.map((th) => {
            const active = previewTheme === th.id;
            return (
              <button
                key={th.id}
                type="button"
                onClick={() => setPreviewTheme(th.id)}
                title={th.label}
                style={{
                  width: 52,
                  height: 44,
                  borderRadius: 24,
                  border: 'none',
                  background: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  padding: '0 9px',
                  boxShadow: active
                    ? '0 1px 4px rgba(0,0,0,0.08), 0 0 0 2px #6366f1'
                    : '0 1px 4px rgba(0,0,0,0.08)',
                  position: 'relative',
                }}
              >
                {th.swatch.map((c, i) => (
                  <span key={i} style={{ width: 8, height: 24, borderRadius: 3, background: c, flexShrink: 0 }} />
                ))}
                {active && (
                  <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#6366f1', color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize:11, color:'#94a3b8', marginTop:8 }}>Theme tints thumbnails and downloads — same layout as your template cards.</div>
      </div>

      {/* ── Template Grid ── */}
      <div style={{ padding:'20px 32px 40px', display:'flex', flexWrap:'wrap', gap:24 }}>
        {filtered.map(t => {
          const PreviewComp = t.Preview;
          const th = getPreviewTheme(previewTheme);
          return (
            <div key={t.id}
              style={{ width:CW, background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,0.07)', flexShrink:0, border:'1px solid #f1f5f9' }}
            >
              {/* Scaled visual preview */}
              <div
                onClick={() => setPreview(t)}
                style={{
                  width:CW, height:CH, overflow:'hidden', position:'relative', cursor:'pointer',
                  borderRadius:'14px 14px 0 0',
                  ...(th.frameBg.includes('gradient')
                    ? { backgroundColor: '#f8fafc', backgroundImage: th.frameBg }
                    : { background: th.frameBg }),
                }}
                onMouseEnter={e => { e.currentTarget.querySelector('.hov').style.background='rgba(99,102,241,0.14)'; e.currentTarget.querySelector('.hovlabel').style.opacity='1'; }}
                onMouseLeave={e => { e.currentTarget.querySelector('.hov').style.background='transparent'; e.currentTarget.querySelector('.hovlabel').style.opacity='0'; }}
              >
                <div
                  data-theme-art-wrap
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: PW,
                    height: PH,
                    transformOrigin: 'top left',
                    transform: `scale(${SC})`,
                    filter: th.filter === 'none' ? undefined : th.filter,
                  }}
                >
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
                <div style={{ display:'flex', gap:6, marginTop:12, alignItems:'stretch' }}>
                  <button onClick={() => handleCopy(t.caption, t.id)}
                    style={{ flex:1, minWidth:0, padding:'8px 8px', borderRadius:8, border:'1.5px solid #e2e8f0', background: copied===t.id ? '#f0fdf4' : '#fff', color: copied===t.id ? '#15803d' : '#64748b', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                    {copied===t.id ? '✓' : '📋'} Copy
                  </button>
                  <button type="button" onClick={() => setCustomize(t)} title="Customize placeholders, then use in Video Publisher"
                    style={{ padding:'8px 14px', borderRadius:8, border:'none', background:'#6366f1', color:'#fff', fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
                    ✏️ Use
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
        const pmTheme = getPreviewTheme(previewTheme);
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
                <div
                  style={{
                    width:'100%',
                    maxWidth:PW,
                    aspectRatio:`${PW}/${PH}`,
                    overflow:'hidden',
                    borderRadius:14,
                    boxShadow:'0 4px 20px rgba(0,0,0,0.12)',
                    ...(pmTheme.frameBg.includes('gradient')
                      ? { backgroundColor: '#f8fafc', backgroundImage: pmTheme.frameBg }
                      : { background: pmTheme.frameBg }),
                  }}
                >
                  <div
                    data-theme-art-wrap
                    style={{
                      width: PW,
                      height: PH,
                      filter: pmTheme.filter === 'none' ? undefined : pmTheme.filter,
                    }}
                  >
                    <PreviewComp />
                  </div>
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
          onDownloadDesign={handleModalCaptionExport}
          designDownloading={dlLoading === customize.id}
          initialThemeId={previewTheme}
          onThemeChange={(id) => setPreviewTheme(id)}
          extraThemes={brandTheme ? [brandTheme] : []}
        />
      )}
    </div>
  );
}
