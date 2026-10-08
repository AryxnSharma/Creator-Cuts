import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   CREATORCUTS — Hyper-3D rebuild
   Data lives at the top so copy, plans, stats and clips are easy to edit.
   ═══════════════════════════════════════════════════════════════ */

const LINKS = {
  dm: "https://ig.me/m/creatorcuts.in",
  ig: "https://www.instagram.com/creatorcuts.in/",
  yt: "https://www.youtube.com/@CreatorCuts-in",
  hiring: "https://forms.gle/sztw45N7Svkmbvbf9",
  email: "contact@creatorcuts.in",
  site: "https://creatorcuts.in",
};

/* Prices are per month. `inr` is a fixed rupee price (edit freely), YEARLY_OFF is the yearly discount. */
const YEARLY_OFF = 0.2;
const PLANS = [
  {
    key: "starter", name: "Starter", usd: 49, inr: 4199, clips: "15", n: 15,
    tag: "For creators starting their content engine.",
    badge: null, cta: "Get Starter",
    features: ["15 edited clips", "1 platform", "Cinematic captions", "Sound design", "Hook optimization", "48-hour turnaround", "Monthly performance recap"],
  },
  {
    key: "creator", name: "Creator", usd: 89, inr: 7499, clips: "35", n: 35,
    tag: "For channels posting every week.",
    badge: "Most popular", cta: "Choose Creator", pop: true,
    features: ["35 edited clips", "2 platforms", "Custom thumbnail design", "Trend-matched hooks", "24-hour batch turnaround", "Priority editing", "Performance review", "Platform optimization"],
  },
  {
    key: "studio", name: "Studio", usd: 149, inr: 12499, clips: "60+", n: 60,
    tag: "Premium full-service for full-time creators.",
    badge: "Best value", cta: "Go Studio",
    features: ["60+ edited clips", "Major platforms", "Dedicated editor", "Custom branding", "Thumbnail suite", "Priority turnaround", "Analytics reporting", "Strategy support", "Premium content management"],
  },
];
const monthly = (p, cur, yearly) => Math.round((cur === "INR" ? p.inr : p.usd) * (yearly ? 1 - YEARLY_OFF : 1));
const money = (cur, n, dec = 0) => (cur === "INR" ? "₹" : "$") + n.toLocaleString(cur === "INR" ? "en-IN" : "en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const STEPS = [
  { n: "01", title: "You stream", desc: "Go live on Twitch, Kick or YouTube like always. That's the only thing left on your plate.", v: "live" },
  { n: "02", title: "We find the moments", desc: "Editors review every VOD and flag what chat reacts to: big plays, funny reactions, emotional beats.", v: "detect" },
  { n: "03", title: "We edit", desc: "Cut, captions, sound design and pacing — built for the scroll, not just resized.", v: "edit" },
  { n: "04", title: "We publish", desc: "Clips go live on your platforms, on schedule, every single time.", v: "post" },
];

const ENGINE = [
  { t: "Stream", d: "You go live. Nothing changes on your side." },
  { t: "VOD", d: "We pull the full recording." },
  { t: "Moment detection", d: "Chat spikes, clutch plays and reactions get flagged." },
  { t: "Editor review", d: "A human decides what's actually worth posting." },
  { t: "Cut", d: "Tight, hook-first edits that get to the point." },
  { t: "Captions", d: "Cinematic captions timed to the beat." },
  { t: "Sound design", d: "Mix and impact that land with sound on." },
  { t: "Platform optimization", d: "Rebuilt for Shorts, Reels or wherever it lands." },
  { t: "Publish", d: "Scheduled, posted and tracked." },
];

const WHY = [
  { t: "Editorial judgement", d: "We cut what chat reacted to, not random highlights." },
  { t: "Platform-native editing", d: "Every clip is rebuilt for where it's going." },
  { t: "Retention-first pacing", d: "Hooks up front and no dead air." },
  { t: "Captions & sound design", d: "Clips that feel produced, not trimmed." },
  { t: "Consistent output", d: "Steady posting keeps the algorithm on your side." },
  { t: "Performance feedback", d: "We track what works and sharpen every edit." },
];

const FAQS = [
  { q: "How do you get access to my VODs?", a: "Twitch VODs, YouTube streams or a shared Drive link. Nothing extra to upload. We set it up in onboarding." },
  { q: "How fast do clips come back?", a: "Starter batches return within 48 hours. Creator runs on a 24-hour batch turnaround with priority editing, and Studio gets priority turnaround with a dedicated editor." },
  { q: "Which platforms do you post to?", a: "Twitch, YouTube, Instagram Reels and Kick. How many platforms we handle depends on your plan: one on Starter, two on Creator, all major platforms on Studio." },
  { q: "Will you post directly to my channels?", a: "On Creator and Studio we handle posting end-to-end. On Starter we deliver ready-to-post files and you upload them." },
  { q: "How are you different from AI clipping tools?", a: "AI tools are fast and cheap, but you still choose the clips, write the hooks and proofread the captions. We do that part: human editors watch your VOD, pick the moments, edit them and, on Creator and Studio, post them." },
  { q: "Why are you cheaper than agencies?", a: "Agencies often charge $80–$250 per gaming clip, or retainers in the thousands. Our plans are built around one job, stream clips, at a fixed monthly volume, which keeps the price per clip at about $2.48–$3.27." },
  { q: "Can I approve clips before they post?", a: "Yes. Tell us in onboarding what to approve and what to never clip. Starter delivers files you post yourself, and Creator and Studio can hold every clip for your OK first." },
  { q: "Can I change plans later?", a: "Yes. Upgrade or downgrade anytime. Your new plan starts from the next billing cycle." },
  { q: "What if I stream less in a month?", a: "Unused clip credits roll over for one month, so a quiet week doesn't cost you anything." },
  { q: "Do you work with smaller streamers?", a: "Yes. Consistent clips while you're growing compound fastest." },
  { q: "What kinds of content do you edit?", a: "Gaming, IRL, variety and entertainment, with no one-size template." },
  { q: "Do you understand Hindi and Hinglish?", a: "Yes. We're built for Indian creators and their humor." },
  { q: "Do you offer custom plans?", a: "Yes, for larger creators, teams and multi-streamer operations. DM us on Instagram and we'll help you out." },
];

/* ═══════════════ CSS ═══════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
:root{
  --bg:#050507;--bg2:#07070A;--bg3:#09090D;
  --tx:#F5F5F7;--mu:#858591;--mu2:#5c5c68;
  --vi:#8B5CFF;--vi2:#A78BFA;--vi3:#7C3AED;--cy:#67E8F9;
  --ln:rgba(255,255,255,.08);
  --ease:cubic-bezier(.16,1,.3,1);
  --mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
  --sans:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{background:var(--bg);color:var(--tx);font-family:var(--sans);-webkit-font-smoothing:antialiased;overflow-x:hidden}
::selection{background:var(--vi3);color:#fff}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#23232e;border-radius:3px}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit}
ul,ol{list-style:none}
:focus-visible{outline:2px solid var(--vi2);outline-offset:3px;border-radius:8px}
section[id]{scroll-margin-top:96px}

.cc{position:relative;min-height:100vh;overflow-x:clip;background:var(--bg)}
.wrap{width:100%;max-width:1280px;margin:0 auto;padding:0 clamp(20px,5vw,56px);position:relative;z-index:2}

/* ── atmosphere ── */
.atmo{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.atmo::before{content:'';position:absolute;inset:0;background:
  radial-gradient(1200px 700px at 78% -8%,rgba(139,92,255,.20),transparent 60%),
  radial-gradient(900px 600px at 6% 38%,rgba(103,232,249,.06),transparent 62%),
  radial-gradient(1000px 700px at 90% 92%,rgba(124,58,237,.12),transparent 60%),
  linear-gradient(180deg,#050507,#07070A 50%,#050507)}
.orb{position:absolute;border-radius:50%;filter:blur(90px);will-change:transform}
.orb.a{width:560px;height:560px;top:-8%;right:-8%;background:radial-gradient(circle,rgba(139,92,255,.30),transparent 70%);animation:dr1 22s ease-in-out infinite}
.orb.b{width:480px;height:480px;top:46%;left:-12%;background:radial-gradient(circle,rgba(103,232,249,.10),transparent 70%);animation:dr2 28s ease-in-out infinite}
.orb.c{width:520px;height:520px;bottom:-12%;right:10%;background:radial-gradient(circle,rgba(124,58,237,.18),transparent 70%);animation:dr1 30s ease-in-out infinite reverse}
@keyframes dr1{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-40px,50px,0)}}
@keyframes dr2{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(50px,-40px,0)}}
.grain{position:fixed;inset:-50%;z-index:1;pointer-events:none;opacity:.06;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.dust{position:absolute;inset:0}
.dust i{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;opacity:.0;animation:dust 9s linear infinite}
@keyframes dust{0%{opacity:0;transform:translateY(0)}15%{opacity:.5}85%{opacity:.25}100%{opacity:0;transform:translateY(-120px)}}
.prog{position:fixed;top:0;left:0;height:2px;width:100%;z-index:300;transform-origin:0 50%;transform:scaleX(var(--sp,0));background:linear-gradient(90deg,var(--vi),var(--cy));opacity:.9}
.clight{position:fixed;left:0;top:0;width:520px;height:520px;margin:-260px 0 0 -260px;z-index:1;pointer-events:none;border-radius:50%;
  background:radial-gradient(circle,rgba(139,92,255,.10),transparent 65%);will-change:transform;opacity:0;transition:opacity .4s}
.cdot{position:fixed;left:0;top:0;width:6px;height:6px;margin:-3px 0 0 -3px;z-index:400;pointer-events:none;border-radius:50%;background:#fff;mix-blend-mode:difference;will-change:transform;opacity:0;transition:opacity .3s,width .25s var(--ease),height .25s var(--ease),margin .25s var(--ease)}
.cdot.big{width:34px;height:34px;margin:-17px 0 0 -17px;background:rgba(255,255,255,.9)}
.on .clight,.on .cdot{opacity:1}

/* ── glass system ── */
.g1{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);backdrop-filter:blur(12px) saturate(120%);-webkit-backdrop-filter:blur(12px) saturate(120%)}
.g2{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.022));border:1px solid rgba(255,255,255,.09);
  backdrop-filter:blur(24px) saturate(140%);-webkit-backdrop-filter:blur(24px) saturate(140%);
  box-shadow:0 12px 32px -12px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.09)}
.g3{background:linear-gradient(165deg,rgba(255,255,255,.065),rgba(255,255,255,.02) 55%,rgba(139,92,255,.03));border:1px solid rgba(255,255,255,.08);
  backdrop-filter:blur(28px) saturate(150%);-webkit-backdrop-filter:blur(28px) saturate(150%);
  box-shadow:0 24px 48px -24px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,255,255,.10),inset 0 -1px 0 rgba(255,255,255,.02)}
.g4{background:linear-gradient(160deg,rgba(255,255,255,.085),rgba(255,255,255,.025) 50%,rgba(139,92,255,.05));border:1px solid rgba(255,255,255,.11);
  backdrop-filter:blur(32px) saturate(160%);-webkit-backdrop-filter:blur(32px) saturate(160%);
  box-shadow:0 40px 80px -30px rgba(0,0,0,.9),0 0 0 1px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.14),inset 0 0 40px rgba(139,92,255,.04)}

/* ── 3D card ── */
.t3d{position:relative;transform:perspective(1000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateY(calc(var(--base,0px) + var(--lift,0px)));
  transition:transform .6s var(--ease),border-color .4s,box-shadow .4s;transform-style:flat;will-change:transform}
.t3d.live{transition:transform .18s ease-out,border-color .4s,box-shadow .4s}
.t3d::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .4s;
  background:radial-gradient(420px circle at var(--lx,50%) var(--ly,0%),rgba(255,255,255,.10),transparent 45%)}
.t3d:hover{--lift:-6px;border-color:rgba(167,139,250,.35)}
.t3d:hover::after{opacity:1}

/* ── type ── */
.disp{font-weight:800;letter-spacing:-.045em;line-height:.95;text-transform:uppercase}
.h2{font-size:clamp(34px,5.4vw,72px)}
.kick{display:inline-flex;align-items:center;gap:10px;font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:var(--vi2)}
.kick b{color:var(--mu);font-weight:500}
.kick::before{content:'';width:18px;height:1px;background:linear-gradient(90deg,transparent,var(--vi2))}
.lead{font-size:clamp(15px,1.5vw,18px);line-height:1.65;color:var(--mu);max-width:560px}
.grad{background:linear-gradient(100deg,#fff 0%,var(--vi2) 55%,var(--cy) 120%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
.sec{padding:clamp(80px,11vw,150px) 0;position:relative}
.sec-h{display:flex;flex-direction:column;gap:20px;margin-bottom:clamp(44px,6vw,80px)}

/* ── reveal ── */
.rv{opacity:0;transform:translate3d(0,26px,0);transition:opacity .9s var(--ease) var(--d,0ms),transform .9s var(--ease) var(--d,0ms)}
.rv.in{opacity:1;transform:none}

/* ── buttons ── */
.btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:10px;height:52px;padding:0 28px;border-radius:999px;font-weight:600;font-size:15px;letter-spacing:-.01em;cursor:pointer;white-space:nowrap;
  transition:transform .35s var(--ease),box-shadow .35s,background .3s,border-color .3s;will-change:transform}
.btn .mg-in{display:inline-flex;align-items:center;gap:10px;transition:transform .35s var(--ease)}
.btn:active{transition-duration:.08s;scale:.965}
.btn-p{color:#fff;border:1px solid rgba(255,255,255,.22);
  background:linear-gradient(180deg,#9A78FF 0%,#7C3AED 100%);
  box-shadow:0 10px 30px -10px rgba(139,92,255,.75),inset 0 1px 0 rgba(255,255,255,.35),inset 0 -8px 16px rgba(60,20,140,.35)}
.btn-p:hover,.btn-p.mg-on{box-shadow:0 16px 44px -10px rgba(139,92,255,.95),inset 0 1px 0 rgba(255,255,255,.4),inset 0 -8px 16px rgba(60,20,140,.35)}
.btn-g{color:var(--tx);background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
.btn-g:hover,.btn-g.mg-on{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.24)}
.btn-sm{height:40px;padding:0 18px;font-size:13.5px}
.btn-block{width:100%}
.arr{display:inline-block;transition:transform .35s var(--ease)}
.btn:hover .arr{transform:translateX(3px)}
.btn:hover .arr.dn{transform:translateY(3px)}

/* ── hiring bar ── */
.hire{position:fixed;top:0;left:0;right:0;z-index:210;height:36px;display:flex;align-items:center;justify-content:center;gap:14px;padding:0 44px;
  background:rgba(9,9,13,.78);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid var(--ln);font-size:12.5px;color:#d6d6de}
.hire strong{color:var(--vi2);font-weight:600}
.hire a.ap{font-weight:600;color:#fff;padding:3px 11px;border-radius:999px;background:rgba(139,92,255,.22);border:1px solid rgba(139,92,255,.45);white-space:nowrap}
.hire a.ap:hover{background:rgba(139,92,255,.38)}
.hire .x{position:absolute;right:10px;top:50%;transform:translateY(-50%);width:26px;height:26px;border-radius:50%;background:none;border:0;color:var(--mu);cursor:pointer;font-size:14px}
.hire .x:hover{color:#fff;background:rgba(255,255,255,.08)}
.hire .sub{color:var(--mu)}

/* ── nav ── */
.nav{position:fixed;left:50%;z-index:200;transform:translateX(-50%);width:min(880px,calc(100% - 28px));transition:top .5s var(--ease),width .5s var(--ease)}
.nav.sc{width:min(780px,calc(100% - 28px))}
.nav-in{display:flex;align-items:center;gap:8px;border-radius:999px;height:60px;padding:0 10px 0 20px;transition:height .5s var(--ease),background .4s,box-shadow .4s,backdrop-filter .4s;
  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);backdrop-filter:blur(16px) saturate(130%);-webkit-backdrop-filter:blur(16px) saturate(130%)}
.nav.sc .nav-in{height:52px;background:rgba(12,12,18,.72);backdrop-filter:blur(34px) saturate(170%);-webkit-backdrop-filter:blur(34px) saturate(170%);
  box-shadow:0 18px 40px -14px rgba(0,0,0,.85),inset 0 1px 0 rgba(255,255,255,.08);border-color:rgba(255,255,255,.1)}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:14px;letter-spacing:.06em;margin-right:auto}
.brand em{font-style:normal;color:var(--vi2)}
.logo-i{display:block;object-fit:contain}
.logo-fb{display:grid;place-items:center;border-radius:8px;background:linear-gradient(135deg,var(--vi),var(--cy));color:#07070A;font-weight:900}
.nav-l{display:flex;gap:2px;margin-right:6px}
.nav-l a{position:relative;padding:8px 14px;font-size:13.5px;font-weight:500;color:var(--mu);transition:color .25s;border-radius:999px}
.nav-l a::after{content:'';position:absolute;left:14px;right:14px;bottom:3px;height:1px;background:var(--vi2);transform:scaleX(0);transform-origin:0 50%;transition:transform .4s var(--ease)}
.nav-l a:hover{color:#fff}.nav-l a:hover::after{transform:scaleX(1)}
.burger{display:none;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.05);border:1px solid var(--ln);cursor:pointer;align-items:center;justify-content:center;flex-direction:column;gap:5px}
.burger i{display:block;width:16px;height:1.5px;background:#fff;border-radius:2px;transition:transform .35s var(--ease),opacity .2s}
.burger.o i:nth-child(1){transform:translateY(6.5px) rotate(45deg)}
.burger.o i:nth-child(2){opacity:0}
.burger.o i:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}
.mob{position:fixed;inset:0;z-index:190;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:120px 28px 40px;
  background:rgba(5,5,7,.86);backdrop-filter:blur(36px) saturate(150%);-webkit-backdrop-filter:blur(36px) saturate(150%);
  opacity:0;pointer-events:none;transition:opacity .4s}
.mob.o{opacity:1;pointer-events:auto}
.mob a.ml{font-size:clamp(34px,10vw,52px);font-weight:800;letter-spacing:-.04em;text-transform:uppercase;padding:8px 0;border-bottom:1px solid var(--ln);
  transform:translateY(16px);opacity:0;transition:transform .6s var(--ease) var(--d),opacity .6s var(--d)}
.mob.o a.ml{transform:none;opacity:1}
.mob .btn{margin-top:28px}

/* ── hero ── */
.hero{position:relative;padding:clamp(150px,18vh,190px) 0 40px;min-height:100svh;display:flex;align-items:center}
.hero-grid{display:grid;grid-template-columns:minmax(0,1.04fr) minmax(0,.96fr);gap:clamp(24px,4vw,64px);align-items:center;width:100%}
.pill{display:inline-flex;align-items:center;gap:10px;padding:7px 14px 7px 10px;border-radius:999px;font-size:12px;font-weight:500;color:#cfcfda;margin-bottom:28px}
.dot{width:7px;height:7px;border-radius:50%;background:#34d399;box-shadow:0 0 0 0 rgba(52,211,153,.6);animation:pulse 2.4s infinite;flex:none}
.dot.v{background:var(--vi2);animation-name:pulseV}
.dot.c{background:var(--cy);box-shadow:0 0 10px var(--cy);animation:none}
@keyframes pulse{70%{box-shadow:0 0 0 8px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)}}
@keyframes pulseV{0%{box-shadow:0 0 0 0 rgba(167,139,250,.6)}70%{box-shadow:0 0 0 8px rgba(167,139,250,0)}100%{box-shadow:0 0 0 0 rgba(167,139,250,0)}}
.hero h1{font-size:clamp(40px,5.3vw,92px);letter-spacing:-.055em;line-height:.92}
.hero h1 span{display:block;overflow:hidden;padding-bottom:.08em;white-space:nowrap}
.hero h1 span>b{display:block;font-weight:inherit;transform:translateY(105%);animation:rise 1.1s var(--ease) forwards}
.hero h1 span:nth-child(2)>b{animation-delay:.1s}
.hero h1 span:nth-child(3)>b{animation-delay:.2s}
@keyframes rise{to{transform:none}}
.hero p.lead{margin-top:30px;opacity:0;animation:fadeup 1s var(--ease) .5s forwards}
.hero .cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:36px;opacity:0;animation:fadeup 1s var(--ease) .65s forwards}
@keyframes fadeup{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}

/* hero scene */
.scene-w{position:relative;height:clamp(440px,46vw,620px);opacity:0;animation:fadeup 1.4s var(--ease) .4s forwards}
.scene{position:absolute;inset:0;transform:perspective(1500px) rotateY(calc(var(--mx,0)*-6deg)) rotateX(calc(var(--my,0)*5deg));transform-style:preserve-3d;will-change:transform}
.pl{position:absolute;transform:translate3d(calc(var(--mx,0)*var(--d,0)*1px),calc(var(--my,0)*var(--d,0)*1px),0);will-change:transform}
.fl{animation:fl 7s ease-in-out infinite;animation-delay:var(--fd,0s)}
@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
.s-glow{position:absolute;left:8%;right:8%;top:10%;bottom:6%;border-radius:50%;background:radial-gradient(circle at 50% 45%,rgba(139,92,255,.36),transparent 62%);filter:blur(50px)}
.s-grid{position:absolute;left:-10%;right:-10%;bottom:-6%;height:46%;transform:perspective(500px) rotateX(62deg);transform-origin:50% 100%;
  background-image:linear-gradient(rgba(139,92,255,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,255,.35) 1px,transparent 1px);background-size:44px 44px;
  mask-image:linear-gradient(0deg,rgba(0,0,0,.9),transparent 85%);-webkit-mask-image:linear-gradient(0deg,rgba(0,0,0,.9),transparent 85%);opacity:.45}
.win{left:8%;top:12%;width:84%;border-radius:22px;overflow:hidden}
.win-bar{display:flex;align-items:center;gap:7px;padding:13px 16px;border-bottom:1px solid rgba(255,255,255,.06)}
.win-bar i{width:10px;height:10px;border-radius:50%;background:#ff5f57}
.win-bar i:nth-child(2){background:#febc2e}.win-bar i:nth-child(3){background:#28c840}
.win-bar span{margin-left:10px;font-family:var(--mono);font-size:11px;color:var(--mu)}
.win-bar .st{margin-left:auto;display:flex;align-items:center;gap:7px;font-family:var(--mono);font-size:10.5px;color:#cbd5e1}
.win-body{display:grid;grid-template-columns:34% 1fr;gap:16px;padding:16px}
.prev{position:relative;aspect-ratio:9/16;border-radius:14px;overflow:hidden;background:
  radial-gradient(120% 70% at 30% 10%,rgba(139,92,255,.7),transparent 60%),
  radial-gradient(90% 60% at 80% 90%,rgba(103,232,249,.35),transparent 60%),#0b0a14;border:1px solid rgba(255,255,255,.08)}
.prev::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.03) 0 1px,transparent 1px 3px)}
.prev .cap{position:absolute;left:8%;right:8%;bottom:20%;text-align:center;font-weight:900;font-size:clamp(11px,1.15vw,15px);letter-spacing:-.02em;line-height:1.05;text-transform:uppercase;text-shadow:0 2px 12px rgba(0,0,0,.7)}
.prev .cap em{font-style:normal;color:var(--cy)}
.prev .pb{position:absolute;left:10%;right:10%;bottom:9%;height:3px;border-radius:3px;background:rgba(255,255,255,.18);overflow:hidden}
.prev .pb::after{content:'';display:block;height:100%;width:100%;background:#fff;transform-origin:0 50%;animation:bar 6s linear infinite}
@keyframes bar{0%{transform:scaleX(0)}100%{transform:scaleX(1)}}
.prev .rec{position:absolute;top:9%;left:10%;display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:9px;letter-spacing:.1em;color:#fff;padding:4px 8px;border-radius:999px;background:rgba(0,0,0,.4)}
.prev .rec i{width:6px;height:6px;border-radius:50%;background:#ff4d6d;animation:blink 1.6s infinite}
@keyframes blink{50%{opacity:.25}}
.panel-r{display:flex;flex-direction:column;gap:14px;min-width:0}
.lbl{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--mu)}
.wave{display:flex;align-items:center;gap:2.5px;height:54px}
.wave i{flex:1;min-width:2px;border-radius:2px;background:linear-gradient(180deg,var(--vi2),var(--vi3));height:calc(var(--h)*1%);animation:wv 2.2s ease-in-out infinite;animation-delay:calc(var(--i)*-90ms);transform-origin:50% 50%}
@keyframes wv{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.45)}}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{font-family:var(--mono);font-size:10px;padding:5px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#d4d4de;white-space:nowrap}
.chip.on{border-color:rgba(103,232,249,.5);color:var(--cy);background:rgba(103,232,249,.07)}
.tl{padding:0 16px 18px;display:flex;flex-direction:column;gap:7px;position:relative}
.tr{position:relative;height:16px;border-radius:5px;background:rgba(255,255,255,.035)}
.tr b{position:absolute;top:2px;bottom:2px;border-radius:4px;background:linear-gradient(90deg,rgba(139,92,255,.9),rgba(124,58,237,.5))}
.tr b.c{background:linear-gradient(90deg,rgba(103,232,249,.8),rgba(103,232,249,.3))}
.tr b.w{background:rgba(255,255,255,.28)}
.ph{position:absolute;top:-4px;bottom:14px;width:1.5px;background:#fff;box-shadow:0 0 12px #fff;left:16px;animation:ph 6s linear infinite}
.ph::before{content:'';position:absolute;top:-2px;left:-3.5px;width:8px;height:8px;border-radius:2px;background:#fff;transform:rotate(45deg)}
@keyframes ph{from{left:16px}to{left:calc(100% - 16px)}}
.vcard{width:clamp(80px,9vw,118px);aspect-ratio:9/16;border-radius:16px;position:relative;overflow:hidden}
.vcard::before{content:'';position:absolute;inset:0;background:var(--bgc)}
.vcard .m{position:absolute;left:10px;bottom:10px;font-family:var(--mono);font-size:9.5px;color:#fff;display:flex;align-items:center;gap:5px}
.float-chip{display:flex;align-items:center;gap:10px;padding:10px 14px 10px 12px;border-radius:14px;font-size:12px;font-weight:500;white-space:nowrap}
.float-chip small{display:block;font-family:var(--mono);font-size:10px;color:var(--mu);margin-top:1px;font-weight:400}
.float-chip .ic{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;background:rgba(139,92,255,.2);border:1px solid rgba(139,92,255,.35)}

/* HUD metrics */
.hud{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:clamp(36px,5vw,64px)}
.hud-i{position:relative;padding:22px 22px 20px;border-radius:20px;animation:fl 8s ease-in-out infinite;animation-delay:var(--fd)}
.hud-i::before{content:'';position:absolute;top:14px;right:14px;width:5px;height:5px;border-radius:50%;background:var(--vi2);box-shadow:0 0 10px var(--vi2)}
.hud-v{font-family:var(--mono);font-size:clamp(30px,3.6vw,46px);font-weight:500;letter-spacing:-.04em;line-height:1}
.hud-l{margin-top:10px}
.plat{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px 34px;margin-top:clamp(36px,5vw,56px);padding-top:28px;border-top:1px solid var(--ln)}
.plat span{font-size:13.5px;font-weight:600;color:var(--mu2);letter-spacing:-.01em;transition:color .3s}
.plat span:hover{color:#fff}
.plat .lbl{margin-right:6px}

/* ── process timeline ── */
.tlw{position:relative;--p:0}
.tl-line{position:absolute;background:rgba(255,255,255,.07);border-radius:2px}
.tl-fill{position:absolute;background:linear-gradient(90deg,var(--vi),var(--cy));border-radius:2px;box-shadow:0 0 18px rgba(139,92,255,.8)}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;position:relative}
.tl-line.h{left:12.5%;right:12.5%;top:34px;height:2px}
.tl-fill.h{left:0;top:0;bottom:0;width:calc(var(--p)*100%)}
.step{position:relative;padding-top:0;display:flex;flex-direction:column;align-items:center;text-align:center;gap:22px;opacity:.38;transition:opacity .7s var(--ease)}
.step.act{opacity:1}
.node{position:relative;z-index:2;width:70px;height:70px;border-radius:50%;display:grid;place-items:center;font-family:var(--mono);font-weight:500;font-size:15px;color:var(--mu);transition:color .5s,box-shadow .6s,border-color .6s,transform .7s var(--ease)}
.step.act .node{color:#fff;border-color:rgba(167,139,250,.6);box-shadow:0 0 0 6px rgba(139,92,255,.08),0 0 40px rgba(139,92,255,.5),inset 0 1px 0 rgba(255,255,255,.2);transform:scale(1.06)}
.frame{width:100%;max-width:210px;aspect-ratio:9/12;border-radius:18px;position:relative;overflow:hidden;padding:12px;display:flex;flex-direction:column;justify-content:flex-end}
.frame>.bg{position:absolute;inset:0;background:var(--bgc)}
.frame .tag{position:relative;display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;padding:4px 8px;border-radius:999px;background:rgba(0,0,0,.45);align-self:flex-start;margin-bottom:auto}
.frame .mini{position:relative;display:flex;flex-direction:column;gap:5px}
.frame .mini i{display:block;height:5px;border-radius:3px;background:rgba(255,255,255,.35)}
.frame .mini i.v{background:var(--vi2)}.frame .mini i.c{background:var(--cy)}
.tl-line.v{display:none;left:28px;top:30px;bottom:30px;width:2px}
.tl-fill.v{left:0;top:0;right:0;width:auto;height:calc(var(--p)*100%);background:linear-gradient(180deg,var(--vi),var(--cy))}
.step .txt{display:flex;flex-direction:column;gap:10px;align-items:center}
.step h3{font-size:clamp(19px,1.8vw,24px);font-weight:700;letter-spacing:-.03em;text-transform:uppercase}
.step p{font-size:14px;line-height:1.6;color:var(--mu);max-width:250px}

/* ── engine ── */
.eng{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;position:relative}
.en{position:relative;padding:24px;border-radius:22px;min-height:150px;display:flex;flex-direction:column;gap:10px;transition:border-color .6s,box-shadow .8s,background .6s}
.en .no{font-family:var(--mono);font-size:11px;color:var(--mu2);letter-spacing:.1em;display:flex;align-items:center;gap:8px}
.en h3{font-size:18px;font-weight:700;letter-spacing:-.03em;text-transform:uppercase}
.en p{font-size:13.5px;line-height:1.55;color:var(--mu)}
.en.act{border-color:rgba(167,139,250,.5);box-shadow:0 0 50px -10px rgba(139,92,255,.5),inset 0 1px 0 rgba(255,255,255,.12);background:linear-gradient(165deg,rgba(139,92,255,.14),rgba(255,255,255,.02))}
.en.act .no{color:var(--vi2)}
.en.done .no{color:var(--cy)}
.en::before{content:'';position:absolute;right:-17px;top:50%;width:18px;height:1px;background:linear-gradient(90deg,rgba(167,139,250,.5),rgba(167,139,250,.1))}
.en:nth-child(3n)::before{display:none}
.en .ck{width:7px;height:7px;border-radius:50%;background:var(--mu2);transition:background .4s,box-shadow .4s}
.en.act .ck{background:var(--vi2);box-shadow:0 0 12px var(--vi2)}
.en.done .ck{background:var(--cy)}

.num{font-variant-numeric:tabular-nums}
/* ── rules room ── */
.rr{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.3fr);gap:16px;align-items:stretch}
.rr-l,.rr-r{border-radius:28px;padding:clamp(22px,2.8vw,32px)}
.rr-l ul{display:flex;flex-direction:column;margin-top:10px}
.rr-l li{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 0;border-bottom:1px solid var(--ln)}
.rr-l li:last-child{border-bottom:0;padding-bottom:0}
.rr-l li b{display:block;font-size:15.5px;font-weight:650;letter-spacing:-.02em}
.rr-l li span{display:block;margin-top:3px;font-size:13px;color:var(--mu)}
.sw{flex:none;width:48px;height:28px;border-radius:99px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.1);position:relative;cursor:pointer;transition:background .35s var(--ease),box-shadow .35s}
.sw i{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .4s var(--ease)}
.sw.on{background:linear-gradient(90deg,var(--vi3),var(--vi));box-shadow:0 0 22px rgba(139,92,255,.55)}
.sw.on i{transform:translateX(20px)}
.rr-h{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:8px}
.rr-c{display:flex;gap:6px;font-family:var(--mono);font-size:11px}
.rr-c span{padding:5px 10px;border-radius:99px;border:1px solid var(--ln);color:var(--mu)}
.rr-c .p{color:#6ee7b7;border-color:rgba(110,231,183,.25)}
.rr-c .w{color:var(--vi2);border-color:rgba(167,139,250,.3)}
.mom{display:flex;flex-direction:column}
.mo{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:15px 0;border-bottom:1px solid var(--ln);transition:opacity .4s}
.mo:last-child{border-bottom:0}
.mo-t{display:flex;flex-direction:column;gap:5px;min-width:0}
.mo-t b{font-size:15px;font-weight:600;letter-spacing:-.015em;transition:color .3s}
.mo-tag{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--mu2)}
.mo-s{display:flex;align-items:center;gap:10px;flex:none}
.mo-chip{display:inline-flex;align-items:center;gap:8px;padding:7px 12px;border-radius:99px;font-size:12.5px;font-weight:600;white-space:nowrap;animation:chip .5s var(--ease)}
@keyframes chip{from{opacity:0;transform:translateY(6px) scale(.96)}to{opacity:1;transform:none}}
.mo.post .mo-chip{background:rgba(110,231,183,.1);color:#6ee7b7}
.mo.wait .mo-chip{background:rgba(139,92,255,.16);color:#c4b5fd}
.mo.skip .mo-chip{background:rgba(255,255,255,.05);color:var(--mu)}
.mo.skip .mo-t b{color:var(--mu2);text-decoration:line-through;text-decoration-color:rgba(255,255,255,.25)}
.mo .x{width:10px;height:2px;border-radius:2px;background:currentColor;display:inline-block}
.mo-ok{height:32px;padding:0 14px;border-radius:99px;background:#fff;color:#0a0a10;font-size:12.5px;font-weight:700;border:0;cursor:pointer;transition:transform .25s var(--ease)}
.mo-ok:hover{transform:scale(1.05)}
.rr-n{margin-top:14px;font-size:12px;color:var(--mu2)}
.prom{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:16px}
.pm{display:flex;gap:14px;align-items:flex-start;padding:22px;border-radius:22px;width:100%}
.pm svg{flex:none;margin-top:2px}
.pm b{display:block;font-size:15.5px;font-weight:650;letter-spacing:-.02em}
.pm span{display:block;margin-top:4px;font-size:13.5px;line-height:1.5;color:var(--mu)}
@media (prefers-reduced-motion:reduce){.mo-chip{animation:none}.sw,.sw i{transition:none}}

/* ── compare ── */
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.scale{border-radius:30px;padding:clamp(22px,3.4vw,40px);margin-bottom:clamp(56px,7vw,96px)}
.scale-h{display:flex;justify-content:space-between;align-items:flex-end;gap:20px 40px;flex-wrap:wrap;margin-bottom:34px}
.scale-h h3{font-size:clamp(24px,3vw,38px);font-weight:800;letter-spacing:-.045em;margin-top:10px}
.scale-h p{max-width:380px;font-size:14.5px;line-height:1.6;color:var(--mu)}
.scale-h p b{color:#fff}
.scale-b{position:relative;display:flex;flex-direction:column;gap:22px;padding-bottom:30px}
.grid-l{position:absolute;inset:0 0 0 0;pointer-events:none}
.grid-l i{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.07)}
.grid-l i span{position:absolute;bottom:-4px;left:0;transform:translateX(-50%);font-family:var(--mono);font-size:10.5px;color:var(--mu2);white-space:nowrap}
.sr{position:relative;display:grid;gap:8px;z-index:1}
.sr-t{display:flex;justify-content:space-between;gap:12px;font-size:14px;font-weight:600;color:#d4d4de}
.sr-t b{font-family:var(--mono);font-weight:500;color:var(--mu)}
.sr.us .sr-t,.sr.us .sr-t b{color:#fff}
.sr-k{position:relative;height:14px;border-radius:7px;background:rgba(255,255,255,.04)}
.sr-k i{position:absolute;top:0;bottom:0;border-radius:7px;background:linear-gradient(90deg,#4b4b60,#6b6b82);clip-path:inset(0 100% 0 0);transition:clip-path 1.4s var(--ease) var(--d)}
.scale.in .sr-k i{clip-path:inset(0 0 0 0)}
.sr.us .sr-k i{background:linear-gradient(90deg,var(--vi),var(--cy));box-shadow:0 0 24px rgba(139,92,255,.9),0 0 2px #fff}
.sr-n{font-size:12.5px;color:var(--mu2)}
.sr.us .sr-n{color:var(--vi2)}
.gap-h{margin:0 0 22px}
.gap-h h3{font-size:clamp(22px,2.6vw,32px);font-weight:800;letter-spacing:-.04em}
.gaps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-bottom:clamp(56px,7vw,96px)}
.gap{border-radius:24px;padding:26px;display:flex;flex-direction:column;gap:12px}
.gap h4{font-size:19px;font-weight:700;letter-spacing:-.03em;line-height:1.2}
.gap p{font-size:14px;line-height:1.6;color:var(--mu);flex:1}
.gap .ans{display:flex;gap:10px;align-items:flex-start;padding-top:14px;margin-top:4px;border-top:1px solid var(--ln);font-size:14px;line-height:1.45;color:#fff;font-weight:500}
.gap .ans svg{flex:none;margin-top:2px}
.mx{border-radius:26px;overflow:hidden}
.mx table{width:100%;border-collapse:collapse;table-layout:fixed}
.mx th,.mx td{padding:18px 20px;text-align:left;vertical-align:top;font-size:14px;line-height:1.5;border-bottom:1px solid var(--ln)}
.mx thead th{font-size:13px;font-weight:700;color:#fff;letter-spacing:-.01em;padding-top:22px;padding-bottom:22px;background:rgba(255,255,255,.02)}
.mx tbody th{width:17%;font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--mu2);font-weight:500}
.mx td{color:var(--mu)}
.mx tr:last-child th,.mx tr:last-child td{border-bottom:0}
.mx .us{background:linear-gradient(180deg,rgba(139,92,255,.16),rgba(139,92,255,.07));color:#fff;border-left:1px solid rgba(167,139,250,.3);border-right:1px solid rgba(167,139,250,.3)}
.mx thead th.us{color:var(--vi2);box-shadow:inset 0 2px 0 var(--vi2)}
.mx td.us{display:table-cell}
.mx td.us svg{display:inline-block;vertical-align:-3px;margin-right:9px}
.cmp-fn{max-width:820px;margin:34px auto 0;text-align:center;font-size:12.5px;line-height:1.75;color:var(--mu2)}
.cmp-fn a{color:var(--mu);text-decoration:underline;text-decoration-color:rgba(255,255,255,.2);text-underline-offset:3px;transition:color .25s}
.cmp-fn a:hover{color:#fff}

/* ── plan extras ── */
.cpc{font-size:13px;color:var(--mu);margin-top:-12px}
.cpc b{color:#fff;font-family:var(--mono);font-weight:500}



/* ── why ── */
.why{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(30px,5vw,80px);align-items:start}
.why-l{position:sticky;top:130px}
.why-l h2{font-size:clamp(36px,5.2vw,76px)}
.layers{display:flex;flex-direction:column;gap:12px;perspective:1400px}
.lay{display:grid;grid-template-columns:44px minmax(0,1fr);gap:18px;align-items:start;padding:22px 24px;border-radius:20px;
  transform:translateX(var(--ox,0px)) rotateY(var(--oy,0deg));transition:transform .8s var(--ease),border-color .4s,background .4s}
.lay:nth-child(even){--ox:34px;--oy:-3deg}
.lay:nth-child(odd){--ox:0px;--oy:2deg}
.lay:hover{transform:translateX(calc(var(--ox) - 8px)) rotateY(0deg) translateZ(20px);border-color:rgba(167,139,250,.4)}
.lay .ix{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;font-family:var(--mono);font-size:12px;color:var(--vi2);background:rgba(139,92,255,.1);border:1px solid rgba(139,92,255,.25)}
.lay h3{font-size:clamp(17px,1.7vw,21px);font-weight:700;letter-spacing:-.03em;text-transform:uppercase}
.lay p{font-size:14px;line-height:1.6;color:var(--mu);margin-top:6px}

/* ── pricing ── */
.price-g{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;align-items:stretch;padding-top:22px}
.plan{border-radius:28px;padding:34px 30px 30px;display:flex;flex-direction:column;gap:22px}
.plan.pop{--base:-22px;position:relative;background:linear-gradient(165deg,rgba(139,92,255,.17),rgba(255,255,255,.03) 55%);border-color:transparent;
  box-shadow:0 50px 90px -30px rgba(139,92,255,.5),inset 0 1px 0 rgba(255,255,255,.16)}
.plan.pop::before{content:'';position:absolute;inset:-1px;border-radius:inherit;padding:1px;pointer-events:none;
  background:linear-gradient(120deg,var(--vi),var(--cy),var(--vi2),var(--vi));background-size:300% 100%;animation:bd 7s linear infinite;
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0)}
@keyframes bd{to{background-position:300% 0}}
.plan>*{position:relative;z-index:1}
.bdg{position:absolute!important;top:18px;right:18px;left:auto;transform:none;font-size:13px;font-weight:600;letter-spacing:-.01em;padding:7px 14px;border-radius:999px;white-space:nowrap;z-index:3!important;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);color:#fff}
.bdg.hot{background:#fff;color:#0a0a10;border-color:#fff;box-shadow:0 8px 24px -8px rgba(255,255,255,.4)}
.plan h3{font-size:clamp(26px,2.4vw,32px);font-weight:700;letter-spacing:-.035em;color:#fff}
.plan .tg{font-size:14px;color:var(--mu);line-height:1.5;margin-top:8px;min-height:42px}
.pr{display:flex;align-items:baseline;gap:6px}
.pr b{font-size:clamp(52px,5.4vw,68px);font-weight:800;letter-spacing:-.06em;line-height:.9}
.bill{font-size:13px;color:var(--mu);margin-top:8px}
.pr sup{font-size:26px;font-weight:600;color:var(--mu);align-self:flex-start;margin-top:8px;letter-spacing:-.02em}
.pr>span{font-size:14px;color:var(--mu)}
.vol{display:flex;align-items:center;gap:12px;padding:13px 16px;border-radius:14px;background:rgba(139,92,255,.09);border:1px solid rgba(139,92,255,.2);font-size:14px;font-weight:600}
.vol small{font-weight:400;color:var(--mu);font-size:12px;display:block;margin-top:1px}
.feat{display:flex;flex-direction:column;gap:12px;flex:1;padding-top:6px;border-top:1px solid var(--ln)}
.feat li{display:flex;gap:11px;align-items:flex-start;font-size:14px;color:#d0d0da;line-height:1.45}
.feat li svg{flex:none;margin-top:2px}
.custom{margin-top:22px;border-radius:28px;padding:clamp(24px,3vw,34px) clamp(24px,3.4vw,40px);display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
.custom h3{font-size:clamp(20px,2.2vw,28px);font-weight:700;letter-spacing:-.035em}
.custom p{color:var(--mu);font-size:14.5px;margin-top:6px}

/* ── pricing toggles ── */
.tgl{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin:-24px auto 48px}
.seg{display:inline-flex;gap:4px;padding:5px;border-radius:999px}
.seg button{cursor:pointer;border:0;background:none;padding:11px 24px;border-radius:999px;font-size:15px;font-weight:500;color:var(--mu);transition:background .35s var(--ease),color .3s}
.seg button:hover{color:#fff}
.seg button.on{background:rgba(255,255,255,.16);color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 4px 14px -4px rgba(0,0,0,.6)}
.seg button:active{scale:.97}

/* ── faq ── */
.faq{max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:10px}
.fq{border-radius:20px;overflow:hidden;transition:border-color .4s,background .4s}
.fq.o{border-color:rgba(167,139,250,.3)}
.fq button{width:100%;display:flex;align-items:center;gap:18px;justify-content:space-between;text-align:left;padding:22px 24px;background:none;border:0;cursor:pointer;font-size:16px;font-weight:600;letter-spacing:-.02em}
.fq .pm{width:30px;height:30px;border-radius:50%;flex:none;display:grid;place-items:center;border:1px solid var(--ln);background:rgba(255,255,255,.04);transition:transform .5s var(--ease),background .3s,border-color .3s}
.fq.o .pm{transform:rotate(45deg);background:rgba(139,92,255,.2);border-color:rgba(167,139,250,.5)}
.fq .bd{display:grid;grid-template-rows:0fr;transition:grid-template-rows .55s var(--ease)}
.fq.o .bd{grid-template-rows:1fr}
.fq .bd>div{overflow:hidden}
.fq .bd p{padding:0 24px 24px;max-width:680px;color:var(--mu);font-size:15px;line-height:1.7}

/* ── final cta ── */
.fin{position:relative;text-align:center;padding:clamp(110px,16vw,220px) 0;overflow:hidden}
.fin-l{position:absolute;left:50%;top:50%;width:min(1200px,160vw);height:min(760px,100vw);transform:translate(-50%,-50%);pointer-events:none;
  background:radial-gradient(ellipse at 50% 50%,rgba(139,92,255,.34),rgba(103,232,249,.07) 40%,transparent 68%);filter:blur(40px)}
.fin-g{position:absolute;left:-10%;right:-10%;bottom:0;height:60%;transform:perspective(600px) rotateX(64deg);transform-origin:50% 100%;opacity:.35;
  background-image:linear-gradient(rgba(139,92,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,255,.5) 1px,transparent 1px);background-size:56px 56px;
  mask-image:linear-gradient(0deg,#000,transparent 80%);-webkit-mask-image:linear-gradient(0deg,#000,transparent 80%)}
.obj{width:96px;height:96px;margin:0 auto 38px;border-radius:28px;display:grid;place-items:center;animation:objf 7s ease-in-out infinite;
  box-shadow:0 30px 70px -20px rgba(139,92,255,.7),0 0 0 8px rgba(255,255,255,.02),inset 0 1px 0 rgba(255,255,255,.25)}
@keyframes objf{0%,100%{transform:translateY(0) rotateY(-12deg) rotateX(6deg)}50%{transform:translateY(-14px) rotateY(12deg) rotateX(-4deg)}}
.fin h2{font-size:clamp(40px,8vw,128px);letter-spacing:-.06em}
.fin .sub{margin:28px auto 0;font-size:clamp(16px,1.8vw,21px);color:#c3c3ce;font-weight:500;letter-spacing:-.015em}
.fin .cta{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:40px}

/* ── footer ── */
.foot{padding:70px 0 120px;border-top:1px solid var(--ln);position:relative;z-index:2;background:linear-gradient(180deg,transparent,rgba(5,5,7,.9))}
.foot-g{display:grid;grid-template-columns:1.5fr 1fr 1fr 1.2fr;gap:40px}
.foot h4{font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;color:var(--mu2);text-transform:uppercase;margin-bottom:18px;font-weight:500}
.foot li{margin-bottom:11px}
.foot li a,.foot li button{font-size:14px;color:var(--mu);transition:color .25s;background:none;border:0;cursor:pointer;text-align:left}
.foot li a:hover,.foot li button:hover{color:#fff}
.foot .tagl{margin-top:16px;font-size:20px;font-weight:700;letter-spacing:-.035em;line-height:1.15;max-width:260px}
.foot-b{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:56px;padding-top:24px;border-top:1px solid var(--ln);font-size:12.5px;color:var(--mu2)}

/* ── floating DM ── */
.dm{position:fixed;right:22px;bottom:22px;z-index:250;display:flex;align-items:center;gap:11px;height:56px;padding:0 22px 0 8px;border-radius:999px;font-weight:600;font-size:14px;transition:transform .5s var(--ease),box-shadow .4s,opacity .5s;
  animation:dmin 1s var(--ease) 1.4s both}
@keyframes dmin{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
.dm:hover{transform:translateY(-4px);box-shadow:0 24px 50px -14px rgba(167,139,250,.55),inset 0 1px 0 rgba(255,255,255,.14)}
.dm:active{scale:.96}
.dm .ig{position:relative;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#8B5CFF,#C026D3 60%,#F472B6)}
.dm .ig::after{content:'';position:absolute;inset:-4px;border-radius:50%;border:1px solid rgba(192,38,211,.6);animation:ring 2.8s ease-out infinite}
@keyframes ring{0%{transform:scale(.9);opacity:.9}100%{transform:scale(1.35);opacity:0}}

/* ── responsive ── */
@media (max-width:1100px){
  .hero{min-height:auto}
  .hero-grid{grid-template-columns:1fr}
  .hero h1{font-size:clamp(40px,11.6vw,104px)}
  .scene-w{height:clamp(420px,70vw,560px);max-width:640px;margin:0 auto;width:100%}
  .why{grid-template-columns:1fr}
  .why-l{position:static}
  .foot-g{grid-template-columns:1fr 1fr}
}
@media (max-width:900px){
  .gaps{grid-template-columns:repeat(2,minmax(0,1fr))}
  .rr{grid-template-columns:1fr}
  .nav-l,.nav-in>.btn{display:none}
  .burger{display:flex}
  .price-g{grid-template-columns:1fr;max-width:520px;margin:0 auto;gap:34px}
  .plan.pop{--base:0px}
  .eng{grid-template-columns:1fr;gap:0}
  .en{padding:18px 20px 18px 56px;min-height:0;border-radius:18px;margin-bottom:12px}
  .en::before{display:none}
  .en .no{position:absolute;left:20px;top:20px}
  .steps{grid-template-columns:1fr;gap:34px;padding-left:0}
  .tl-line.h{display:none}
  .seg button{padding:10px 18px;font-size:14px}
  .tl-line.v,.tl-fill.v{display:block}
  .step{flex-direction:row;align-items:flex-start;text-align:left;gap:22px;opacity:.45}
  .step .txt{flex:1;min-width:0;align-items:flex-start;padding-top:6px}
  .step .frame{display:none}
  .step p{max-width:none}
  .node{flex:none;width:58px;height:58px}
}
@media (max-width:720px){
  .prom{grid-template-columns:1fr}
  .mo{flex-direction:column;align-items:flex-start;gap:10px}
  .gaps{grid-template-columns:1fr}
  .mx table,.mx thead,.mx tbody,.mx tr,.mx th,.mx td{display:block;width:100%}
  .mx thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  .mx tr{padding:6px 0 10px;border-bottom:1px solid var(--ln)}
  .mx tr:last-child{border-bottom:0}
  .mx tbody th{width:100%;padding:18px 18px 6px;border:0}
  .mx td{padding:10px 18px;border:0;display:block}
  .mx td::before{content:attr(data-l);display:block;font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--mu2);margin-bottom:3px}
  .mx td.us{border:0;border-left:2px solid var(--vi2);margin:4px 0}
  .mx td.us::before{color:var(--vi2)}
  .scale-b{padding-bottom:34px}
  .hud{grid-template-columns:1fr 1fr;gap:10px}
  .hud-i{padding:18px}
  .foot-g{grid-template-columns:1fr;gap:34px}
  .hire .sub{display:none}
  .hire{font-size:12px;gap:10px;padding:0 40px 0 14px;justify-content:flex-start}
  .dm{right:16px;bottom:16px;padding:0;width:56px;justify-content:center}
  .dm span{display:none}
  .dm .ig{width:44px;height:44px}
  .win{left:2%;width:96%}
  .win-body{grid-template-columns:38% 1fr;gap:12px;padding:12px}
  .chips .chip:nth-child(n+3){display:none}
  .float-chip.hide-m{display:none}
  .lay{grid-template-columns:38px minmax(0,1fr);padding:18px;--ox:0px!important;--oy:0deg!important}
  .lay .ix{width:38px;height:38px}
  .fq button{padding:18px 18px;font-size:15px}
  .fq .bd p{padding:0 18px 20px}
  .orb.b,.orb.c,.dust,.s-grid{display:none}
  .btn{height:50px}
}
@media (hover:none){
  .t3d:hover{--lift:0px}
}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}
  .rv{opacity:1;transform:none}
  .hero h1 span>b{transform:none}
  .hero p.lead,.hero .cta,.scene-w{opacity:1}
  .clight,.cdot{display:none}
}
`;

/* ═══════════════ helpers ═══════════════ */

const isBrowser = typeof window !== "undefined";
const mq = (q) => (isBrowser && window.matchMedia ? window.matchMedia(q).matches : false);
const prefersReduced = () => mq("(prefers-reduced-motion: reduce)");
const finePointer = () => mq("(hover: hover) and (pointer: fine)");
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function useInView(opts = { threshold: 0.25 }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, opts);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, seen];
}

function useSEO() {
  useEffect(() => {
    const title = "CreatorCuts — The Unfair Advantage for Content Creators";
    const desc = "CreatorCuts turns streams into high-performing short-form content. We find the moments, edit the clips, and help creators stay consistently visible.";
    document.title = title;
    const up = (sel, make, attr, val) => {
      let el = document.head.querySelector(sel);
      if (!el) { el = document.createElement(make[0]); Object.entries(make[1]).forEach(([k, v]) => el.setAttribute(k, v)); document.head.appendChild(el); }
      el.setAttribute(attr, val);
    };
    up('meta[name="description"]', ["meta", { name: "description" }], "content", desc);
    up('meta[name="theme-color"]', ["meta", { name: "theme-color" }], "content", "#050507");
    up('meta[property="og:title"]', ["meta", { property: "og:title" }], "content", title);
    up('meta[property="og:description"]', ["meta", { property: "og:description" }], "content", desc);
    up('meta[property="og:type"]', ["meta", { property: "og:type" }], "content", "website");
    up('meta[property="og:url"]', ["meta", { property: "og:url" }], "content", LINKS.site);
    up('meta[property="og:site_name"]', ["meta", { property: "og:site_name" }], "content", "CreatorCuts");
    up('meta[name="twitter:card"]', ["meta", { name: "twitter:card" }], "content", "summary");
    up('link[rel="canonical"]', ["link", { rel: "canonical" }], "href", LINKS.site);
    up('link[rel="icon"]', ["link", { rel: "icon" }], "href", "/favicon.png");
  }, []);
}

/* ═══════════════ icons ═══════════════ */

const IgIcon = ({ s = 20 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5.2" /><circle cx="12" cy="12" r="4.1" /><circle cx="17.4" cy="6.6" r=".9" fill="#fff" stroke="none" />
  </svg>
);
const YtIcon = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
  </svg>
);
const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.5" fill="rgba(139,92,255,.16)" stroke="rgba(167,139,250,.4)" /><path d="M4.8 8.2l2.2 2.2 4.2-4.6" fill="none" stroke="#C4B5FD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const PlayIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="#fff" /></svg>);
const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
);

/* ═══════════════ primitives ═══════════════ */

const Logo = ({ size = 30 }) => {
  const [bad, setBad] = useState(false);
  if (bad) return <span className="logo-i logo-fb" style={{ width: size, height: size, fontSize: size * 0.5 }} aria-hidden="true">C</span>;
  return <img className="logo-i" src="/favicon.png" alt="" width={size} height={size} onError={() => setBad(true)} />;
};

function Reveal({ children, delay = 0, className = "", as: Tag = "div", style, ...rest }) {
  const [ref, seen] = useInView({ threshold: 0.12 });
  return (
    <Tag ref={ref} className={`rv ${seen ? "in" : ""} ${className}`} style={{ "--d": `${delay}ms`, ...style }} {...rest}>
      {children}
    </Tag>
  );
}

/* magnetic registry: one pointer listener for every magnetic element */
const magnets = new Set();
let magBound = false, magRaf = 0, magEvt = null;
function bindMagnets() {
  if (magBound || !isBrowser) return;
  magBound = true;
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    magEvt = e;
    if (!magRaf) magRaf = requestAnimationFrame(() => { magRaf = 0; magnets.forEach((m) => m.move(magEvt)); });
  }, { passive: true });
}
function useMagnet(ref, strength = 0.28) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced() || !finePointer()) return;
    bindMagnets();
    const inner = el.querySelector(".mg-in");
    let tx = 0, ty = 0;
    const m = {
      move(e) {
        const r = el.getBoundingClientRect();
        const cx = r.left - tx + r.width / 2, cy = r.top - ty + r.height / 2;
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const range = Math.max(r.width, r.height) / 2 + 64;
        if (Math.hypot(dx, dy) < range) {
          tx = dx * strength; ty = dy * strength;
          el.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0)`;
          if (inner) inner.style.transform = `translate3d(${(dx * 0.07).toFixed(1)}px,${(dy * 0.07).toFixed(1)}px,0)`;
          el.classList.add("mg-on");
        } else if (tx || ty) {
          tx = 0; ty = 0; el.style.transform = ""; if (inner) inner.style.transform = ""; el.classList.remove("mg-on");
        }
      },
    };
    magnets.add(m);
    return () => { magnets.delete(m); el.style.transform = ""; };
  }, [ref, strength]);
}

function MagneticLink({ href = LINKS.dm, external = true, variant = "p", size, block, className = "", children, onClick, ...rest }) {
  const ref = useRef(null);
  useMagnet(ref);
  const ext = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <a ref={ref} href={href} onClick={onClick} className={`btn btn-${variant} ${size === "sm" ? "btn-sm" : ""} ${block ? "btn-block" : ""} ${className}`} {...ext} {...rest}>
      <span className="mg-in">{children}</span>
    </a>
  );
}

function GlassPanel({ level = 3, className = "", children, ...rest }) {
  return <div className={`g${level} ${className}`} {...rest}>{children}</div>;
}

function ThreeDCard({ children, className = "", max = 4, level = 3, style, ...rest }) {
  const ref = useRef(null);
  const raf = useRef(0);
  const onMove = (e) => {
    if (e.pointerType !== "mouse" || prefersReduced()) return;
    const el = ref.current; if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width, py = (clientY - r.top) / r.height;
      el.classList.add("live");
      el.style.setProperty("--rx", `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
      el.style.setProperty("--lx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--ly", `${(py * 100).toFixed(1)}%`);
    });
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
    cancelAnimationFrame(raf.current);
    el.classList.remove("live");
    el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg");
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return (
    <div ref={ref} className={`t3d g${level} ${className}`} style={style} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
      {children}
    </div>
  );
}

/* ═══════════════ global environment ═══════════════ */

function Atmosphere() {
  const dust = useRef(
    Array.from({ length: 16 }, (_, i) => ({
      l: (i * 61 + 13) % 100, t: (i * 37 + 29) % 100, d: (i * 1.3) % 9, s: i % 3 === 0 ? 3 : 2,
    }))
  ).current;
  return (
    <>
      <div className="atmo" aria-hidden="true">
        <div className="orb a" /><div className="orb b" /><div className="orb c" />
        <div className="dust">{dust.map((p, i) => <i key={i} style={{ left: `${p.l}%`, top: `${p.t}%`, animationDelay: `-${p.d}s`, width: p.s, height: p.s }} />)}</div>
      </div>
      <div className="grain" aria-hidden="true" />
    </>
  );
}

function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        ref.current && ref.current.style.setProperty("--sp", h > 0 ? clamp(window.scrollY / h, 0, 1).toFixed(4) : 0);
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  return <div ref={ref} className="prog" aria-hidden="true" />;
}

function CursorFX({ rootRef }) {
  const light = useRef(null), dot = useRef(null);
  useEffect(() => {
    if (!finePointer() || prefersReduced()) return;
    const root = rootRef.current; if (!root) return;
    root.classList.add("on");
    let x = innerWidth / 2, y = innerHeight / 2, lx = x, ly = y, dx = x, dy = y, raf = 0, running = false;
    const loop = () => {
      lx += (x - lx) * 0.08; ly += (y - ly) * 0.08; dx += (x - dx) * 0.4; dy += (y - dy) * 0.4;
      if (light.current) light.current.style.transform = `translate3d(${lx}px,${ly}px,0)`;
      if (dot.current) dot.current.style.transform = `translate3d(${dx}px,${dy}px,0)`;
      if (Math.abs(x - lx) + Math.abs(y - ly) > 0.4 || Math.abs(x - dx) + Math.abs(y - dy) > 0.4) raf = requestAnimationFrame(loop);
      else running = false;
    };
    const move = (e) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY;
      if (!running) { running = true; raf = requestAnimationFrame(loop); }
      const t = e.target;
      dot.current && dot.current.classList.toggle("big", !!(t.closest && t.closest("a,button,textarea")));
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); root.classList.remove("on"); };
  }, [rootRef]);
  return (<><div ref={light} className="clight" aria-hidden="true" /><div ref={dot} className="cdot" aria-hidden="true" /></>);
}

/* ═══════════════ nav ═══════════════ */

const NAV = [["Process", "#how"], ["Compare", "#compare"], ["Plans", "#plans"], ["FAQ", "#faq"]];

function HiringBar({ onClose }) {
  return (
    <div className="hire" role="region" aria-label="Hiring">
      <span><strong>We're hiring editors</strong></span>
      <a className="ap" href={LINKS.hiring} target="_blank" rel="noopener noreferrer">Apply now →</a>
      <button className="x" onClick={onClose} aria-label="Dismiss hiring banner">✕</button>
    </div>
  );
}

function Navbar({ bar }) {
  const [sc, setSc] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setSc(window.scrollY > 40);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", esc); };
  }, [open]);
  return (
    <>
      <header className={`nav ${sc ? "sc" : ""}`} style={{ top: bar ? 50 : 14 }}>
        <nav className="nav-in" aria-label="Primary">
          <a className="brand" href="#top" aria-label="CreatorCuts home"><Logo size={26} /><span>CREATOR<em>CUTS</em></span></a>
          <div className="nav-l">{NAV.slice(0, 4).map(([l, h]) => <a key={h} href={h}>{l}</a>)}</div>
          <MagneticLink size="sm" variant="g" href={LINKS.dm} aria-label="Message CreatorCuts on Instagram">Instagram <span className="arr">→</span></MagneticLink>
          <button className={`burger ${open ? "o" : ""}`} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobmenu" onClick={() => setOpen((v) => !v)}>
            <i /><i /><i />
          </button>
        </nav>
      </header>
      <div id="mobmenu" className={`mob ${open ? "o" : ""}`} aria-hidden={!open}>
        {NAV.map(([l, h], i) => (
          <a key={h} href={h} className="ml" style={{ "--d": `${80 + i * 55}ms` }} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>{l}</a>
        ))}
        <MagneticLink href={LINKS.dm} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>Get started <span className="arr">→</span></MagneticLink>
      </div>
    </>
  );
}

function InstagramDMButton() {
  return (
    <a className="dm g2" href={LINKS.dm} target="_blank" rel="noopener noreferrer" aria-label="DM CreatorCuts on Instagram">
      <span className="ig"><IgIcon s={20} /></span><span>DM us</span>
    </a>
  );
}

/* ═══════════════ hero ═══════════════ */

const WAVE = Array.from({ length: 40 }, (_, i) => Math.round(22 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.55)) * 78));

function HeroScene() {
  return (
    <div className="scene-w" aria-hidden="true">
      <div className="scene">
        <div className="s-glow" />
        <div className="s-grid" />

        <div className="pl" style={{ "--d": 10, left: "-2%", top: "6%" }}>
          <div className="fl" style={{ "--fd": "-2s", transform: "rotate(-8deg)" }}>
            <div className="vcard g2" style={{ "--bgc": "radial-gradient(100% 60% at 30% 10%,rgba(103,232,249,.5),transparent 60%),linear-gradient(180deg,#0d1220,#07070c)" }}>
              <div className="m"><i className="dot c" style={{ width: 5, height: 5 }} />Shorts</div>
            </div>
          </div>
        </div>
        <div className="pl" style={{ "--d": 14, right: "-3%", bottom: "22%" }}>
          <div className="fl" style={{ "--fd": "-4s", transform: "rotate(7deg)" }}>
            <div className="vcard g2" style={{ "--bgc": "radial-gradient(100% 60% at 70% 10%,rgba(192,38,211,.5),transparent 60%),linear-gradient(180deg,#140c1f,#07070c)" }}>
              <div className="m"><i className="dot v" style={{ width: 5, height: 5 }} />Reels</div>
            </div>
          </div>
        </div>

        <div className="pl win g4" style={{ "--d": 22 }}>
          <div className="win-bar">
            <i /><i /><i /><span>moment_042 — edit</span>
            <div className="st"><i className="dot v" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--vi2)" }} />Editing</div>
          </div>
          <div className="win-body">
            <div className="prev">
              <div className="rec"><i />REC</div>
              <div className="cap">WAIT FOR<br /><em>IT...</em></div>
              <div className="pb" />
            </div>
            <div className="panel-r">
              <div>
                <div className="lbl" style={{ marginBottom: 8 }}>Waveform</div>
                <div className="wave">{WAVE.map((h, i) => <i key={i} style={{ "--h": h, "--i": i }} />)}</div>
              </div>
              <div>
                <div className="lbl" style={{ marginBottom: 8 }}>Pipeline</div>
                <div className="chips">
                  <span className="chip on">Moment found</span><span className="chip">Captions</span><span className="chip">Sound</span><span className="chip">Optimize</span>
                </div>
              </div>
            </div>
          </div>
          <div className="tl">
            <div className="tr"><b style={{ left: "4%", width: "30%" }} /><b style={{ left: "40%", width: "22%" }} /><b style={{ left: "68%", width: "26%" }} /></div>
            <div className="tr"><b className="c" style={{ left: "10%", width: "40%" }} /><b className="c" style={{ left: "56%", width: "30%" }} /></div>
            <div className="tr"><b className="w" style={{ left: "6%", width: "12%" }} /><b className="w" style={{ left: "24%", width: "18%" }} /><b className="w" style={{ left: "48%", width: "14%" }} /><b className="w" style={{ left: "70%", width: "20%" }} /></div>
            <div className="ph" />
          </div>
        </div>

        <div className="pl" style={{ "--d": 38, left: "-4%", bottom: "18%" }}>
          <div className="fl" style={{ "--fd": "-1s" }}>
            <div className="float-chip g3 hide-m"><span className="ic"><i className="dot c" /></span><div>Moment detected<small>chat spike · clutch</small></div></div>
          </div>
        </div>
        <div className="pl" style={{ "--d": 46, right: "-2%", top: "6%" }}>
          <div className="fl" style={{ "--fd": "-3s" }}>
            <div className="float-chip g3"><span className="ic"><EyeIcon /></span><div>Hinglish captions<small>native, not translated</small></div></div>
          </div>
        </div>
        <div className="pl" style={{ "--d": 30, left: "30%", bottom: "-1%" }}>
          <div className="fl" style={{ "--fd": "-5s" }}>
            <div className="float-chip g3 hide-m"><span className="ic"><i className="dot" /></span><div>Ready to post<small>Shorts · Reels</small></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced() || !finePointer()) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, running = false;
    const loop = () => {
      cx += (tx - cx) * 0.065; cy += (ty - cy) * 0.065;
      el.style.setProperty("--mx", cx.toFixed(4)); el.style.setProperty("--my", cy.toFixed(4));
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001) raf = requestAnimationFrame(loop); else running = false;
    };
    const kick = () => { if (!running) { running = true; raf = requestAnimationFrame(loop); } };
    const move = (e) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
      ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
      kick();
    };
    const leave = () => { tx = 0; ty = 0; kick(); };
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); cancelAnimationFrame(raf); };
  }, []);

  const hud = [
    { v: "60+", l: "Clips / month" }, { v: "24H", l: "Turnaround" }, { v: "4", l: "Platforms" }, { v: "100%", l: "Done for you" },
  ];
  return (
    <section ref={ref} className="hero" id="top" aria-label="CreatorCuts">
      <div className="wrap">
        <div className="hero-grid">
          <div>
            <div className="pill g2"><i className="dot" />Now onboarding streamers</div>
            <h1 className="disp">
              <span><b>Your stream.</b></span>
              <span><b>Turned into</b></span>
              <span><b className="grad">content.</b></span>
            </h1>
            <p className="lead">We find the moments people want to see, edit them for short-form and post them, while you focus on streaming.</p>
            <div className="cta">
              <MagneticLink href={LINKS.dm}>Get started <span className="arr">→</span></MagneticLink>
              <MagneticLink variant="g" href="#how" external={false}>See how it works <span className="arr dn">↓</span></MagneticLink>
            </div>
          </div>
          <HeroScene />
        </div>

        <div className="hud" role="list" aria-label="Key numbers">
          {hud.map((h, i) => (
            <div key={h.l} role="listitem" className="hud-i g2" style={{ "--fd": `${-i * 1.7}s` }}>
              <div className="hud-v">{h.v}</div>
              <div className="lbl hud-l">{h.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ process ═══════════════ */

const FRAME_BG = [
  "radial-gradient(100% 70% at 30% 0%,rgba(255,77,109,.35),transparent 60%),linear-gradient(180deg,#14101c,#08070d)",
  "radial-gradient(100% 70% at 70% 0%,rgba(103,232,249,.35),transparent 60%),linear-gradient(180deg,#0d1220,#08070d)",
  "radial-gradient(100% 70% at 30% 0%,rgba(139,92,255,.55),transparent 60%),linear-gradient(180deg,#120d20,#08070d)",
  "radial-gradient(100% 70% at 70% 0%,rgba(52,211,153,.30),transparent 60%),linear-gradient(180deg,#0c1613,#08070d)",
];
function StepFrame({ v, i }) {
  const tag = { live: <><i className="dot" style={{ background: "#ff4d6d", animation: "blink 1.6s infinite" }} />LIVE</>, detect: <><i className="dot c" />FLAGGED</>, edit: <><i className="dot v" />EDITING</>, post: <><i className="dot" />POSTED</> }[v];
  return (
    <div className="frame g3" aria-hidden="true">
      <div className="bg" style={{ "--bgc": FRAME_BG[i] }} />
      <span className="tag">{tag}</span>
      <div className="mini">
        {v === "live" && (<><i style={{ width: "70%" }} /><i style={{ width: "45%" }} /></>)}
        {v === "detect" && (<><i className="c" style={{ width: "22%" }} /><i style={{ width: "86%" }} /><i className="c" style={{ width: "34%", marginLeft: "50%" }} /></>)}
        {v === "edit" && (<><i className="v" style={{ width: "62%" }} /><i style={{ width: "88%" }} /><i className="c" style={{ width: "40%" }} /></>)}
        {v === "post" && (<><i className="v" style={{ width: "100%" }} /><i className="v" style={{ width: "100%" }} /></>)}
      </div>
    </div>
  );
}

function ProcessTimeline() {
  const wrap = useRef(null);
  const [act, setAct] = useState(0);
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    let raf = 0, last = -1;
    const calc = () => {
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      const p = clamp((vh * 0.72 - r.top) / (r.height * 0.95), 0, 1);
      el.style.setProperty("--p", p.toFixed(4));
      const idx = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length + 0.12));
      if (idx !== last) { last = idx; setAct(idx); }
    };
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(calc); };
    calc();
    window.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  return (
    <section className="sec" id="how" aria-labelledby="how-h">
      <div className="wrap">
        <Reveal className="sec-h">
          <span className="kick">Process</span>
          <h2 id="how-h" className="disp h2">From stream<br />to posted.</h2>
          <p className="lead">Four steps, and only the first is yours.</p>
        </Reveal>
        <div className="tlw" ref={wrap}>
          <div className="tl-line h" aria-hidden="true"><div className="tl-fill h" /></div>
          <div className="tl-line v" aria-hidden="true"><div className="tl-fill v" /></div>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.n} className={`step ${i <= act ? "act" : ""}`}>
                <div className="node g3">{s.n}</div>
                <StepFrame v={s.v} i={i} />
                <div className="txt"><h3>{s.title}</h3><p>{s.desc}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ engine ═══════════════ */

function Engine() {
  const [ref, seen] = useInView({ threshold: 0.2 });
  const [cur, setCur] = useState(-1);
  useEffect(() => {
    if (!seen) return;
    if (prefersReduced()) { setCur(ENGINE.length); return; }
    let i = 0; setCur(0);
    const id = setInterval(() => { i += 1; setCur(i); if (i >= ENGINE.length + 2) i = -1; }, 1250);
    return () => clearInterval(id);
  }, [seen]);
  return (
    <section className="sec" aria-labelledby="eng-h">
      <div className="wrap">
        <Reveal className="sec-h">
          <span className="kick">The engine</span>
          <h2 id="eng-h" className="disp h2">The CreatorCuts<br />engine.</h2>
          <p className="lead">A repeatable pipeline, not a freelancer's inbox.</p>
        </Reveal>
        <ol className="eng" ref={ref}>
          {ENGINE.map((s, i) => (
            <li key={s.t} className={`en g3 ${cur === i ? "act" : cur > i ? "done" : ""}`}>
              <div className="no"><i className="ck" />{String(i + 1).padStart(2, "0")}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ═══════════════ your rules (control room) ═══════════════ */

const MOMENTS = [
  { id: 1, t: "1v4 clutch to win the round", k: "hype", tag: "Big play" },
  { id: 2, t: "Chat loses it over a fail", k: "funny", tag: "Funny" },
  { id: 3, t: "Mic-on slip-up on camera", k: "emb", tag: "Embarrassing" },
  { id: 4, t: "Heated argument in chat", k: "drama", tag: "Drama" },
  { id: 5, t: "Off-topic political hot take", k: "pol", tag: "Hot take" },
  { id: 6, t: "Surprise donation reaction", k: "hype", tag: "Wholesome" },
];
const RULES = [
  { k: "approve", t: "Ask me before posting", d: "Every clip waits for your OK." },
  { k: "emb", t: "Never clip embarrassing moments", d: "Slips, fails you'd rather forget." },
  { k: "drama", t: "Never clip chat drama", d: "Arguments and pile-ons." },
  { k: "pol", t: "Never clip hot takes", d: "Politics and off-topic opinions." },
];
const PROMISES = [
  ["Flat monthly fee", "No pay-per-view, so nothing rewards clips that embarrass you."],
  ["Your channels only", "No network of throwaway accounts."],
  ["No view-botting", "Real viewers or nothing."],
];

function Switch({ on, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={`sw ${on ? "on" : ""}`} onClick={() => onChange(!on)}><i /></button>
  );
}

function RulesRoom() {
  const [r, setR] = useState({ approve: true, emb: true, drama: false, pol: false });
  const [ok, setOk] = useState({});
  const set = (k) => (v) => setR((o) => ({ ...o, [k]: v }));
  const state = (m) => {
    if (r[m.k]) return "skip";
    if (r.approve && !ok[m.id]) return "wait";
    return "post";
  };
  const counts = MOMENTS.reduce((a, m) => { const s = state(m); a[s] = (a[s] || 0) + 1; return a; }, {});
  const label = { post: "Posted to your channel", wait: "Waiting for your OK", skip: "Skipped, on your never-clip list" };
  return (
    <section className="sec" id="rules" aria-labelledby="rules-h">
      <div className="wrap">
        <Reveal className="sec-h">
          <span className="kick">Control</span>
          <h2 id="rules-h" className="disp h2">You set the rules.<br />We follow them.</h2>
          <p className="lead">Pay-per-view clippers earn from views, not from your reputation. We work on a flat fee, so your rules come first. Try them.</p>
        </Reveal>

        <Reveal>
          <div className="rr">
            <div className="rr-l g3">
              <div className="lbl">Your rules</div>
              <ul>
                {RULES.map((x) => (
                  <li key={x.k}>
                    <div><b>{x.t}</b><span>{x.d}</span></div>
                    <Switch on={r[x.k]} onChange={set(x.k)} label={x.t} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="rr-r g3">
              <div className="rr-h">
                <div className="lbl">Moments from tonight's stream</div>
                <div className="rr-c" aria-live="polite">
                  <span className="p">{counts.post || 0} posted</span><span className="w">{counts.wait || 0} waiting</span><span className="s">{counts.skip || 0} skipped</span>
                </div>
              </div>
              <ul className="mom">
                {MOMENTS.map((m) => {
                  const s = state(m);
                  return (
                    <li key={m.id} className={`mo ${s}`}>
                      <div className="mo-t"><span className="mo-tag">{m.tag}</span><b>{m.t}</b></div>
                      <div className="mo-s">
                        <span className="mo-chip" key={s}>{s === "post" ? <Check /> : s === "wait" ? <i className="dot v" /> : <i className="x" />}{label[s]}</span>
                        {s === "wait" && <button type="button" className="mo-ok" onClick={() => setOk((o) => ({ ...o, [m.id]: true }))}>Approve</button>}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="rr-n">Illustrative moments. Your real rules are set in onboarding.</p>
            </div>
          </div>
        </Reveal>

        <div className="prom">
          {PROMISES.map(([t, d], i) => (
            <Reveal key={t} delay={i * 90} style={{ display: "flex" }}>
              <div className="pm g3"><Check /><div><b>{t}</b><span>{d}</span></div></div>
            </Reveal>
          ))}
        </div>
        <p className="cmp-fn">Why it matters: <a href="https://businessoftv.substack.com/p/clippers-and-view-botting-big-social" target="_blank" rel="noopener noreferrer">paid clipping and fake popularity</a>, <a href="https://trends.vc/clipping-businesses-pay-per-view-distribution-clip-armies-view-verification/" target="_blank" rel="noopener noreferrer">view verification and account risk</a>.</p>
      </div>
    </section>
  );
}

/* ═══════════════ compare ═══════════════ */

/* Market data, USD per finished 30–90s clip. Sources are listed under the section. */
const SCALE_MIN = 0.1, SCALE_MAX = 300;
const sp = (x) => ((Math.log10(x) - Math.log10(SCALE_MIN)) / (Math.log10(SCALE_MAX) - Math.log10(SCALE_MIN))) * 100;
const PRICE_ROWS = [
  { k: "ai", name: "AI clip tools", lo: 0.14, hi: 0.6, text: "$0.14–$0.60", note: "You pick, hook and proofread" },
  { k: "us", name: "CreatorCuts", lo: 2.48, hi: 3.27, text: "$2.48–$3.27", note: "Human-edited, and posted for you", us: true },
  { k: "fr", name: "Freelance gaming editor", lo: 25, hi: 80, text: "$25–$80", note: "Per clip, when they're available" },
  { k: "ag", name: "Editing agency", lo: 80, hi: 250, text: "$80–$250", note: "Per clip, often on a retainer" },
];
const TICKS = [[0.1, "$0.10"], [1, "$1"], [10, "$10"], [100, "$100"]];

const GAPS = [
  { tag: "AI clip tools", t: "They clip the transcript, not the stream", d: "Fails, facecam reactions and chat spikes don't show up in text, so a transcript-based picker tends to miss them.", a: "Editors watch your VOD for the moments chat reacted to." },
  { tag: "AI clip tools", t: "You become the editor-in-chief", d: "You still review the batch, pick what to post and proofread captions.", a: "We deliver finished clips, and post them on Creator and Studio." },
  { tag: "AI clip tools", t: "Credits and billing friction", d: "Reviews of leading AI clippers often mention expiring credits and billing or cancellation trouble.", a: "Unused clip credits roll over for a month. Change plans any time." },
  { tag: "Freelancers", t: "Great one week, gone the next", d: "Quality varies, freelancers juggle clients, and learning your style takes several projects.", a: "A team behind your account, not one person's calendar." },
  { tag: "Agencies", t: "Human editing at agency prices", d: "Gaming clips run about $80–$250 each, and managed retainers commonly start in the thousands of dollars a month.", a: "Human editors at about $2.48–$3.27 a clip, on a flat plan." },
  { tag: "Editing subscriptions", t: "One request at a time", d: "Flat-rate subscriptions work through requests in sequence, which means about 6–10 videos a month on base plans.", a: "A fixed clip count every month. Studio adds a dedicated editor." },
];

const COLS = ["AI clip tools", "Freelance editor", "Agencies & subscriptions", "CreatorCuts"];
const MATRIX = [
  ["Typical price", ["$15–$99 / month", "$25–$80 per gaming clip", "$80–$250 per clip, or $495+ / month", "From $49 / month for 15 clips"]],
  ["Who picks the moments", ["An algorithm, usually from the transcript", "You brief them each time", "Varies. Often built for podcasts and brands", "Human editors who watch your VOD"]],
  ["Stream moments", ["Can miss fails and facecam reactions", "Only if they watch the VOD", "Depends on the team", "Chat spikes, clutches, fails and reactions"]],
  ["Hindi / Hinglish", ["Varies by tool. Check before you pay", "Depends on who you find", "Check before you sign", "Built for Indian creators"]],
  ["Monthly volume", ["Unlimited uploads, but you do the work", "Whatever their schedule allows", "About 6–10 videos on base subscriptions", "A fixed 15, 35 or 60+ clips"]],
  ["Posting", ["Scheduling is on you, or a higher tier", "You post", "Often included on retainers", "We post on Creator and Studio"]],
  ["Your say", ["You review everything yourself", "Per project", "Varies. Some post through clipper networks", "Approval gate and a never-clip list"]],
  ["The catch", ["You're the editor-in-chief", "Hard to scale", "Price, and sales calls to get it", "We're new, so plans start small at $49"]],
];

const SOURCES = [
  ["AI per-clip costs", "https://techsy.io/en/blog/opusclip-vs-vizard"],
  ["Gaming clip rates", "https://increditors.com/gaming-video-editing-rates/"],
  ["Editing subscriptions", "https://increditors.com/unlimited-video-editing-services-compared-2026-guide/"],
  ["Clipping service costs", "https://www.highstyle.ai/insights/video-clipping-services"],
  ["AI clipper limits on streams", "https://clipme.com/best-ai-clipper-for-gaming"],
  ["User reviews", "https://ie.trustpilot.com/review/opus.pro"],
];

function PriceScale() {
  const [ref, seen] = useInView({ threshold: 0.3 });
  return (
    <div ref={ref} className={`scale g3 ${seen ? "in" : ""}`}>
      <div className="scale-h">
        <div>
          <div className="lbl">Price per finished clip · USD · log scale</div>
          <h3>Human editing at near-AI prices.</h3>
        </div>
        <p>About <b>8× to 30× less</b> per clip than a freelance gaming editor, and far less than an agency.</p>
      </div>
      <div className="scale-b">
        <div className="grid-l" aria-hidden="true">{TICKS.map(([v, l]) => <i key={v} style={{ left: `${sp(v)}%` }}><span>{l}</span></i>)}</div>
        {PRICE_ROWS.map((r, i) => (
          <div className={`sr ${r.us ? "us" : ""}`} key={r.k}>
            <div className="sr-t"><span>{r.name}</span><b>{r.text}</b></div>
            <div className="sr-k"><i style={{ left: `${sp(r.lo)}%`, width: `max(10px, ${sp(r.hi) - sp(r.lo)}%)`, "--d": `${i * 160}ms` }} /></div>
            <div className="sr-n">{r.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Compare() {
  return (
    <section className="sec" id="compare" aria-labelledby="cmp-h">
      <div className="wrap">
        <Reveal className="sec-h">
          <span className="kick">Compare</span>
          <h2 id="cmp-h" className="disp h2">How we stack up<br />against the market.</h2>
          <p className="lead">We read the pricing pages, industry guides and user reviews so you don't have to.</p>
        </Reveal>

        <Reveal><PriceScale /></Reveal>

        <Reveal className="gap-h"><h3>Where the alternatives fall short</h3></Reveal>
        <div className="gaps">
          {GAPS.map((g, i) => (
            <Reveal key={g.t} delay={(i % 3) * 90} style={{ display: "flex" }}>
              <ThreeDCard level={3} max={3} className="gap" style={{ width: "100%" }}>
                <span className="lbl">{g.tag}</span>
                <h4>{g.t}</h4>
                <p>{g.d}</p>
                <div className="ans"><Check /><span>{g.a}</span></div>
              </ThreeDCard>
            </Reveal>
          ))}
        </div>

        <Reveal className="gap-h"><h3>Side by side</h3></Reveal>
        <Reveal>
          <div className="mx g3">
            <table>
              <thead>
                <tr><th scope="col"><span className="sr-only">Criteria</span></th>{COLS.map((c, i) => <th scope="col" key={c} className={i === 3 ? "us" : ""}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {MATRIX.map(([k, vals]) => (
                  <tr key={k}>
                    <th scope="row">{k}</th>
                    {vals.map((v, i) => <td key={i} data-l={COLS[i]} className={i === 3 ? "us" : ""}>{i === 3 && <Check />}<span>{v}</span></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <p className="cmp-fn">
          Public 2026 figures that change often, so check current rates. CreatorCuts per-clip prices are monthly list prices ($149 ÷ 60 to $49 ÷ 15 clips). Sources:{" "}
          {SOURCES.map(([l, h], i) => (<span key={h}><a href={h} target="_blank" rel="noopener noreferrer">{l}</a>{i < SOURCES.length - 1 ? ", " : "."}</span>))}
        </p>
      </div>
    </section>
  );
}

/* ═══════════════ why ═══════════════ */

function WhySection() {
  return (
    <section className="sec" aria-labelledby="why-h">
      <div className="wrap why">
        <Reveal className="why-l">
          <span className="kick" style={{ marginBottom: 22 }}>Why CreatorCuts</span>
          <h2 id="why-h" className="disp">We don't just<br />cut videos.<br /><span className="grad">We build your content engine.</span></h2>
        </Reveal>
        <ul className="layers">
          {WHY.map((w, i) => (
            <Reveal as="li" key={w.t} delay={i * 70} className="lay g3">
              <span className="ix">{String(i + 1).padStart(2, "0")}</span>
              <div><h3>{w.t}</h3><p>{w.d}</p></div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ═══════════════ pricing ═══════════════ */

function Seg({ label, value, onChange, options }) {
  return (
    <div className="seg g2" role="radiogroup" aria-label={label}>
      {options.map(([v, l]) => (
        <button key={v} role="radio" aria-checked={value === v} className={value === v ? "on" : ""} onClick={() => onChange(v)}>{l}</button>
      ))}
    </div>
  );
}

/* Smoothly counts between values (respects reduced motion) */
function Num({ value, fmt, ms = 800 }) {
  const [v, setV] = useState(value);
  const from = useRef(value);
  const raf = useRef(0);
  useEffect(() => {
    if (prefersReduced() || from.current === value) { from.current = value; setV(value); return; }
    const a = from.current, b = value, t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
      const cur = a + (b - a) * e;
      from.current = cur; setV(cur);
      if (k < 1) raf.current = requestAnimationFrame(tick); else from.current = b;
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, ms]);
  return <span className="num">{fmt(v)}</span>;
}

function PricingCard({ p, cur, yearly }) {
  const mo = monthly(p, cur, yearly);
  const yr = Math.round((cur === "INR" ? p.inr : p.usd) * 12 * (1 - YEARLY_OFF));
  const per = mo / p.n;
  return (
    <ThreeDCard level={p.pop ? 4 : 3} max={4} className={`plan ${p.pop ? "pop" : ""}`} style={{ width: "100%" }}>
      {p.badge && <span className={`bdg ${p.pop ? "hot" : ""}`}>{p.badge}</span>}
      <div>
        <h3>{p.name}</h3>
        <p className="tg">{p.tag}</p>
      </div>
      <div>
        <div className="pr"><b><Num value={mo} fmt={(n) => money(cur, Math.round(n))} /></b><span>/ month</span></div>
        <p className="bill">{yearly ? <>Billed <Num value={yr} fmt={(n) => money(cur, Math.round(n))} /> yearly</> : "Billed monthly"}</p>
      </div>
      <p className="cpc">{p.key === "studio" ? "As low as " : ""}<b><Num value={per} fmt={(n) => money(cur, n, cur === "INR" ? 0 : 2)} /></b> per clip</p>
      <div className="vol"><span aria-hidden="true">✂</span><div>{p.clips} edited clips / month</div></div>
      <ul className="feat">{p.features.map((f) => <li key={f}><Check />{f}</li>)}</ul>
      <MagneticLink variant={p.pop ? "p" : "g"} block href={LINKS.dm}>{p.cta} <span className="arr">→</span></MagneticLink>
    </ThreeDCard>
  );
}

function Pricing() {
  const [yearly, setYearly] = useState(true);
  const [cur, setCur] = useState("USD");
  return (
    <section className="sec" id="plans" aria-labelledby="plans-h">
      <div className="wrap">
        <Reveal className="sec-h" style={{ alignItems: "center", textAlign: "center" }}>
          <span className="kick">Plans</span>
          <h2 id="plans-h" className="disp h2">Pick your<br />engine.</h2>
          <p className="lead">Unused credits roll over for a month. Change plans any time.</p>
        </Reveal>
        <Reveal className="tgl">
          <Seg label="Billing period" value={yearly ? "y" : "m"} onChange={(v) => setYearly(v === "y")} options={[["m", "Monthly"], ["y", "Yearly, save 20%"]]} />
          <Seg label="Currency" value={cur} onChange={setCur} options={[["USD", "USD"], ["INR", "INR"]]} />
        </Reveal>
        <div className="price-g">
          {PLANS.map((p, i) => <Reveal key={p.key} delay={i * 110} style={{ display: "flex" }}><PricingCard p={p} cur={cur} yearly={yearly} /></Reveal>)}
        </div>
        <Reveal delay={150}>
          <div className="custom g3">
            <div>
              <h3>Custom</h3>
              <p>More volume, a team or several streamers? We'll build it around you.</p>
            </div>
            <MagneticLink variant="g" href={LINKS.dm}>Talk to CreatorCuts <span className="arr">→</span></MagneticLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════ faq ═══════════════ */

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="sec" id="faq" aria-labelledby="faq-h">
      <div className="wrap">
        <Reveal className="sec-h" style={{ alignItems: "center", textAlign: "center" }}>
          <span className="kick">FAQ</span>
          <h2 id="faq-h" className="disp h2">Questions,<br />answered.</h2>
        </Reveal>
        <div className="faq">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={Math.min(i, 5) * 40} className={`fq g2 ${open === i ? "o" : ""}`}>
              <h3>
                <button aria-expanded={open === i} aria-controls={`fa-${i}`} id={`fb-${i}`} onClick={() => setOpen(open === i ? -1 : i)}>
                  <span>{f.q}</span>
                  <span className="pm" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /></svg></span>
                </button>
              </h3>
              <div className="bd" id={`fa-${i}`} role="region" aria-labelledby={`fb-${i}`}><div><p>{f.a}</p></div></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ final cta + footer ═══════════════ */

function FinalCTA() {
  return (
    <section className="fin" aria-labelledby="fin-h">
      <div className="fin-l" aria-hidden="true" /><div className="fin-g" aria-hidden="true" />
      <div className="wrap">
        <Reveal>
          <div className="obj g4" aria-hidden="true"><Logo size={52} /></div>
          <h2 id="fin-h" className="disp">Stop leaving<br /><span className="grad">content on the table.</span></h2>
          <div className="cta">
            <MagneticLink href={LINKS.dm} style={{ height: 58, padding: "0 34px", fontSize: 16 }}>Start your content engine <span className="arr">→</span></MagneticLink>
            <MagneticLink variant="g" href="#plans" external={false} style={{ height: 58, padding: "0 30px", fontSize: 16 }}>View plans</MagneticLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(LINKS.email); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (e) { window.location.href = `mailto:${LINKS.email}`; }
  };
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-g">
          <div>
            <a className="brand" href="#top" style={{ marginRight: 0 }}><Logo size={26} /><span>CREATOR<em>CUTS</em></span></a>
            <p className="tagl">The unfair advantage for content creators.</p>
          </div>
          <nav aria-label="Footer">
            <h4>Navigate</h4>
            <ul>{[["How it works", "#how"], ["Your rules", "#rules"], ["Compare", "#compare"], ["Plans", "#plans"], ["FAQ", "#faq"]].map(([l, h]) => <li key={h}><a href={h}>{l}</a></li>)}</ul>
          </nav>
          <div>
            <h4>Social</h4>
            <ul>
              <li><a href={LINKS.ig} target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href={LINKS.yt} target="_blank" rel="noopener noreferrer">YouTube</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href={LINKS.dm} target="_blank" rel="noopener noreferrer">DM us on Instagram</a></li>
              <li><button onClick={copy}>{copied ? "Copied ✓" : LINKS.email}</button></li>
              <li><a href={LINKS.hiring} target="_blank" rel="noopener noreferrer">We're hiring editors</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-b"><span>© 2026 CreatorCuts</span><span>creatorcuts.in</span></div>
      </div>
    </footer>
  );
}

/* ═══════════════ page ═══════════════ */

function CreatorCuts() {
  const root = useRef(null);
  const [bar, setBar] = useState(true);
  useSEO();
  const closeBar = useCallback(() => setBar(false), []);
  return (
    <div className="cc" ref={root}>
      <style>{CSS}</style>
      <Atmosphere />
      <ScrollProgress />
      <CursorFX rootRef={root} />
      {bar && <HiringBar onClose={closeBar} />}
      <Navbar bar={bar} />
      <main>
        <Hero />
        <ProcessTimeline />
        <Engine />
        <RulesRoom />
        <Compare />
        <WhySection />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <InstagramDMButton />
    </div>
  );
}

export default function App() { return <CreatorCuts />; }