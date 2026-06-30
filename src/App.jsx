import { useState, useEffect, useRef } from "react";

const WHATSAPP = "919473929150";
const wa = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

const PLANS = [
  {
    name: "Spark", emoji: "✦",
    tag: "For streamers just starting their clip game",
    clips: "15 edited clips / month", highlight: false,
    badge: null,
    features: [
      "Posted to 1 platform of your choice",
      "48-hour turnaround per batch",
      "Cinematic captions & sound design",
      "Trend-matched hooks & pacing",
      "Monthly performance recap",
    ],
  },
  {
    name: "Surge", emoji: "⚡",
    tag: "For streamers ready to scale their reach",
    clips: "35 edited clips / month", highlight: true,
    badge: "MOST POPULAR",
    features: [
      "Posted to 2 platforms (Shorts, Reels)",
      "24-hour turnaround per batch",
      "Custom thumbnail design",
      "Trend-matched hooks & pacing",
      "Bi-weekly strategy check-in",
      "Priority WhatsApp support",
    ],
  },
  {
    name: "Apex", emoji: "◆",
    tag: "For full-time streamers building a brand",
    clips: "60+ edited clips / month", highlight: false,
    badge: "BEST VALUE",
    features: [
      "Posted to all major platforms",
      "12-hour priority turnaround",
      "Dedicated personal editor",
      "Channel art & thumbnail suite",
      "Monthly 1:1 strategy call",
      "Detailed analytics dashboard",
      "Custom branding on every clip",
    ],
  },
];

const STEPS = [
  { n: "01", icon: "📡", title: "You stream", desc: "Go live like always on Twitch, Kick or YouTube. That's literally the only thing left for you to do." },
  { n: "02", icon: "✂️", title: "We watch & cut", desc: "Our editors review every VOD and surgically cut the moments worth posting." },
  { n: "03", icon: "🎬", title: "We polish", desc: "Captions, sound design, pacing, thumbnail — built for the scroll, not just the clip." },
  { n: "04", icon: "📲", title: "We post", desc: "Clips go live across your chosen platforms, on schedule, every single time." },
];

const FAQS = [
  { q: "Do I need to send you footage?", a: "No — give us access to your VODs and we handle the rest. Nothing extra for you to upload or organize." },
  { q: "Can I change plans later?", a: "Yes, upgrade or downgrade anytime. Your new plan kicks in from the next billing cycle." },
  { q: "Who picks the moments to clip?", a: "Our editors review full VODs and select clips based on what performs — you can also flag timestamps yourself via WhatsApp." },
  { q: "What if I stream less in a given month?", a: "Unused clip credits roll over for one month, so a quiet week doesn't cost you anything." },
  { q: "How do you get access to my VODs?", a: "We work with Twitch VODs, YouTube streams, or a shared Google Drive link — whatever you use. We sort it all out in onboarding." },
  { q: "Will you post directly to my channels?", a: "Yes, on Surge and Apex we handle posting end-to-end. On Spark we deliver ready-to-post files and you upload them." },
  { q: "Do you work with small streamers under 100 viewers?", a: "Absolutely — that's actually the best time to start. Consistent clips while you're growing compounds faster than starting later." },
  { q: "Do you understand Hindi/Hinglish content?", a: "Yes. We're built for Indian creators. We understand the content, the humor, and the community." },
];

const MARQUEE = [
  "✂️ Streams Don't Clip Themselves",
  "⚡ Done For You, End To End",
  "📲 Posted While You Sleep",
  "🎬 Built For The Algorithm",
  "✦ Spark · Surge · Apex",
  "◆ Your Stream. Our Scissors.",
  "🟣 Twitch · Kick · YouTube",
];

const WHY = [
  { icon: "🎯", title: "Moment Detection", desc: "We watch for chat spikes, big plays, funny reactions, emotional moments — the stuff that actually performs, not random cuts." },
  { icon: "⚡", title: "Platform-Native Editing", desc: "Shorts pacing ≠ TikTok pacing ≠ Reels pacing. Every clip is rebuilt for its platform from scratch." },
  { icon: "🔁", title: "Consistent Output", desc: "No more posting once a month and going silent. Consistent clips = consistent algorithmic push = consistent growth." },
  { icon: "📊", title: "Performance Feedback", desc: "We track what clips perform and adjust the strategy. Your editing evolves as your audience grows." },
  { icon: "🤝", title: "Streamer-First", desc: "Built specifically for streamers — gaming, IRL, variety. Not a generic video agency that clips everything the same way." },
  { icon: "💬", title: "Direct WhatsApp Access", desc: "No ticket systems. No 3-day email chains. You message us on WhatsApp and we respond. That's it." },
];

// ── NEW: Social proof data ──
const RESULTS_STATS = [
  { val: 4200000, suffix: "+", label: "Total views generated", icon: "👁" },
  { val: 1800, suffix: "+", label: "Clips delivered", icon: "✂️" },
  { val: 27, suffix: "", label: "Streamers onboarded", icon: "🎮" },
  { val: 96, suffix: "%", label: "Client retention rate", icon: "🔁" },
];

const SAMPLE_CLIPS = [
  { title: "\"He didn't see that coming\" — clutch 1v4", views: "812K", platform: "Reels", emoji: "🎯" },
  { title: "Chat goes feral over IRL reaction", views: "1.1M", platform: "Shorts", emoji: "😭" },
  { title: "Insane comeback in the final round", views: "634K", platform: "Shorts", emoji: "🔥" },
  { title: "Streamer roasts a donator, chat loses it", views: "459K", platform: "Reels", emoji: "💀" },
];

const TESTIMONIALS = [
  { name: "Arjun \"Vexed\" R.", game: "Valorant streamer · 14K followers", quote: "I went from posting once a month to never thinking about clips again. My Shorts views did the rest." },
  { name: "Meher K.", game: "IRL & variety · 8K followers", quote: "They actually understand Hinglish humor, which most editors completely miss. First agency that got it right." },
  { name: "Dhruv \"Sn1per\" P.", game: "Apex Legends · 22K followers", quote: "Surge plan paid for itself in the first month. Editor knows exactly which moments chat reacts to." },
];

// ── Logo Image ──
const Logo = ({ size = 32 }) => (
  <img
    src="/favicon.png"
    alt="Creator Cuts"
    width={size}
    height={size}
    style={{ objectFit: "contain", display: "block" }}
  />
);

// ── Reveal on scroll ──
const Reveal = ({ children, delay = 0, style = {} }) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); obs.disconnect(); }
    }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: shown ? 1 : 0,
      transform: shown ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.75s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.75s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      ...style,
    }}>{children}</div>
  );
};

// ── NEW: animated number counter, fires once visible ──
const Counter = ({ value, suffix = "", duration = 1600 }) => {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        setStarted(true);
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(Math.floor(eased * value));
          if (p < 1) requestAnimationFrame(tick);
          else setDisplay(value);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started, value, duration]);
  const formatted = value >= 1000000
    ? (display / 1000000).toFixed(display >= value ? 1 : 1) + "M"
    : value >= 1000 ? Math.floor(display).toLocaleString() : display;
  return <span ref={ref}>{formatted}{suffix}</span>;
};

// ── NEW: tilt-on-hover wrapper for cards ──
const TiltCard = ({ children, style = {}, className = "" }) => {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "perspective(800px) rotateY(0) rotateX(0) translateY(0)"; };
  return (
    <div ref={ref} className={className} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transition: "transform .35s cubic-bezier(.16,1,.3,1)", willChange: "transform", ...style }}>
      {children}
    </div>
  );
};

export default function CreatorCuts() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [copied, setCopied] = useState(false);
  const [hiringBar, setHiringBar] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const heroRef = useRef(null);
  const glowRef = useRef(null);

// Replace this with your hiring page later
const FORM_URL = "https://forms.gle/sztw45N7Svkmbvbf9";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    const t = setTimeout(() => setLoaded(true), 60);
    return () => { window.removeEventListener("scroll", fn); clearTimeout(t); };
  }, []);

  // NEW: cursor-reactive glow in hero
  useEffect(() => {
    const el = heroRef.current;
    const glow = glowRef.current;
    if (!el || !glow) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      glow.style.left = (e.clientX - r.left) + "px";
      glow.style.top = (e.clientY - r.top) + "px";
      glow.style.opacity = "1";
    };
    const onLeave = () => { glow.style.opacity = "0"; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText("contact@creatorcuts.in");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,sans-serif", background: "#08080E", color: "#F0F0F6", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#08080E;}
        ::selection{background:#7C3AFF;color:white;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#2a2a40;border-radius:2px;}
        .disp{font-family:'Anton',system-ui,sans-serif;text-transform:uppercase;letter-spacing:0.01em;}
        .inter{font-family:'Inter',system-ui,sans-serif;}
        a:focus-visible,button:focus-visible{outline:2px solid #A78BFA;outline-offset:3px;}

        @media (prefers-reduced-motion: reduce){
          *{animation-duration:.001s !important;animation-iteration-count:1 !important;transition-duration:.001s !important;}
        }

        .btn-p{
          background:linear-gradient(135deg,#7C3AFF,#D946C9);
          color:#fff;border:none;padding:14px 28px;border-radius:999px;
          font-family:'Inter',sans-serif;font-weight:700;font-size:15px;cursor:pointer;
          box-shadow:0 8px 28px -8px rgba(124,58,255,0.65);
          transition:transform .28s cubic-bezier(.16,1,.3,1),box-shadow .28s;
          display:inline-block;text-decoration:none;white-space:nowrap;
        }
        .btn-p:hover{transform:translateY(-3px) scale(1.03);box-shadow:0 16px 36px -8px rgba(124,58,255,0.85);}

        .btn-g{
          background:rgba(255,255,255,0.04);color:#F0F0F6;
          border:1px solid rgba(255,255,255,0.13);
          padding:13px 26px;border-radius:999px;
          font-family:'Inter',sans-serif;font-weight:600;font-size:15px;cursor:pointer;
          transition:all .25s;display:inline-block;text-decoration:none;white-space:nowrap;
        }
        .btn-g:hover{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.28);}

        .btn-plan{
          width:100%;display:block;text-align:center;
          background:rgba(124,58,255,0.1);color:#A78BFA;
          border:1px solid rgba(124,58,255,0.3);
          padding:13px 20px;border-radius:12px;
          font-family:'Inter',sans-serif;font-weight:700;font-size:14px;cursor:pointer;
          transition:all .25s;text-decoration:none;
        }
        .btn-plan:hover{background:rgba(124,58,255,0.22);border-color:rgba(124,58,255,0.6);transform:translateY(-2px);}

        .btn-plan-hero{
          width:100%;display:block;text-align:center;
          background:linear-gradient(135deg,#7C3AFF,#D946C9);color:#fff;
          border:none;padding:13px 20px;border-radius:12px;
          font-family:'Inter',sans-serif;font-weight:700;font-size:14px;cursor:pointer;
          transition:all .25s;text-decoration:none;
          box-shadow:0 8px 24px -8px rgba(124,58,255,0.6);
        }
        .btn-plan-hero:hover{transform:translateY(-2px);box-shadow:0 14px 32px -8px rgba(124,58,255,0.85);}

        .nav-a{color:#6E6E82;text-decoration:none;font-family:'Inter',sans-serif;font-weight:500;font-size:14.5px;transition:color .2s;position:relative;}
        .nav-a::after{content:'';position:absolute;left:0;bottom:-4px;width:0;height:1.5px;background:#A78BFA;transition:width .25s cubic-bezier(.16,1,.3,1);}
        .nav-a:hover{color:#F0F0F6;}
        .nav-a:hover::after{width:100%;}

        .step-card{background:#111119;border:1px solid rgba(255,255,255,0.07);border-radius:20px;padding:30px 24px;height:100%;transition:border-color .3s,box-shadow .3s;}
        .step-card:hover{border-color:rgba(124,58,255,0.38);box-shadow:0 20px 50px -18px rgba(124,58,255,0.35);}

        .why-card{background:#111119;border:1px solid rgba(255,255,255,0.06);border-radius:18px;padding:26px 22px;transition:border-color .3s;}
        .why-card:hover{border-color:rgba(124,58,255,0.32);}

        .plan-card{background:#111119;border-radius:22px;padding:32px 26px;display:flex;flex-direction:column;transition:all .35s cubic-bezier(.16,1,.3,1);}

        .clip-card{background:#111119;border:1px solid rgba(255,255,255,0.07);border-radius:18px;overflow:hidden;transition:border-color .3s,box-shadow .3s;}
        .clip-card:hover{border-color:rgba(124,58,255,0.4);box-shadow:0 20px 44px -18px rgba(124,58,255,0.35);}
        .clip-thumb{aspect-ratio:9/14;background:linear-gradient(160deg,#1c1330,#0d0d16 70%);display:flex;align-items:center;justify-content:center;font-size:44px;position:relative;overflow:hidden;}
        .clip-thumb::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 30%,rgba(124,58,255,.22),transparent 65%);}
        .play-ring{position:absolute;width:46px;height:46px;border-radius:50%;border:1.5px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-size:14px;background:rgba(8,8,14,.4);backdrop-filter:blur(4px);z-index:1;}

        .stat-card{background:#111119;border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:26px 20px;text-align:center;transition:border-color .3s,transform .3s;}
        .stat-card:hover{border-color:rgba(124,58,255,0.4);transform:translateY(-4px);}

        .testi-card{background:#111119;border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:26px 24px;height:100%;transition:border-color .3s;}
        .testi-card:hover{border-color:rgba(124,58,255,0.32);}

        .faq-row{border-bottom:1px solid rgba(255,255,255,0.07);padding:24px 0;cursor:pointer;}
        .faq-row:hover .fq{color:#A78BFA !important;}

        @keyframes drift1{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(24px,-36px) scale(1.06);}}
        @keyframes drift2{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(-24px,32px) scale(1.04);}}
        @keyframes drift3{0%,100%{transform:translate(0,0);}50%{transform:translate(16px,20px);}}
        .orb1{animation:drift1 14s ease-in-out infinite;}
        .orb2{animation:drift2 18s ease-in-out infinite;}
        .orb3{animation:drift3 10s ease-in-out infinite;}
        @keyframes floaty{0%,100%{transform:translateY(0);}50%{transform:translateY(-16px);}}
        .floaty{animation:floaty 5.5s ease-in-out infinite;}

        @keyframes mq{from{transform:translateX(0);}to{transform:translateX(-50%);}}
        .mq-track{display:flex;width:max-content;animation:mq 26s linear infinite;}
        .mq-track:hover{animation-play-state:paused;}

        .gn{-webkit-text-stroke:1.5px rgba(124,58,255,0.35);color:transparent;font-family:'Anton',system-ui,sans-serif;text-transform:uppercase;}
        .gtxt{background:linear-gradient(135deg,#7C3AFF,#D946C9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}

        .soc{width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);display:inline-flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;transition:all .25s;text-decoration:none;color:#F0F0F6;}
        .soc:hover{background:rgba(124,58,255,0.18);border-color:rgba(124,58,255,0.45);transform:translateY(-3px);}

        .stat-pill{background:rgba(124,58,255,0.08);border:1px solid rgba(124,58,255,0.2);border-radius:16px;padding:20px 28px;transition:border-color .3s,background .3s,transform .3s;}
        .stat-pill:hover{background:rgba(124,58,255,0.14);border-color:rgba(124,58,255,0.4);transform:translateY(-4px);}

        .wa-float{position:fixed;right:24px;bottom:24px;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#25D366,#1EBE5D);color:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;text-decoration:none;box-shadow:0 10px 30px rgba(37,211,102,.35);z-index:999;transition:all .25s ease;}
        .wa-float:hover{transform:translateY(-4px) scale(1.08);}
        @keyframes waPulse{0%,100%{box-shadow:0 10px 30px rgba(37,211,102,.35);}50%{box-shadow:0 10px 38px rgba(37,211,102,.6);}}
        .wa-float{animation:waPulse 3.2s ease-in-out infinite;}

        .hiring-bar{
          position:fixed;top:0;left:0;right:0;z-index:101;
          background:linear-gradient(90deg,#1a0a2e,#0f0520,#1a0a2e);
          border-bottom:1px solid rgba(124,58,255,.35);
          padding:7px 6vw;display:flex;align-items:center;justify-content:center;gap:14px;
          font-family:'Inter',sans-serif;
        }
        .hiring-bar::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(124,58,255,.08),transparent);animation:shimmer 3s ease-in-out infinite;}
        @keyframes shimmer{0%,100%{opacity:0;}50%{opacity:1;}}
        .hiring-btn{background:linear-gradient(135deg,#7C3AFF,#D946C9);color:white;padding:5px 14px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;transition:.2s;z-index:2;animation:pulseHire 2s infinite;}
        .hiring-btn:hover{transform:scale(1.05);}
        @keyframes pulseHire{0%,100%{box-shadow:0 0 0 rgba(124,58,255,0);}50%{box-shadow:0 0 18px rgba(124,58,255,.45);}}
        .hiring-close{position:absolute;right:6vw;background:none;border:none;color:rgba(255,255,255,.45);font-size:16px;cursor:pointer;z-index:2;}

        .mob-menu{position:fixed;inset:0;background:rgba(8,8,14,0.97);backdrop-filter:blur(24px);z-index:99;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;}
        .mob-a{color:#F0F0F6;text-decoration:none;font-family:'Anton',sans-serif;font-size:36px;letter-spacing:0.02em;text-transform:uppercase;transition:color .2s;}
        .mob-a:hover{color:#A78BFA;}

        .cursor-glow{position:absolute;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,255,0.16),transparent 70%);transform:translate(-50%,-50%);pointer-events:none;opacity:0;transition:opacity .3s;filter:blur(10px);}

        @media(max-width:900px){
          .nav-links{display:none !important;}
          .ham{display:flex !important;}
          .g4{grid-template-columns:1fr 1fr !important;}
          .g3{grid-template-columns:1fr !important;}
          .g3w{grid-template-columns:1fr 1fr !important;}
          .gclip{grid-template-columns:1fr 1fr !important;}
          .htitle{font-size:12vw !important;}
          .srow{flex-wrap:wrap;gap:16px !important;}
          .hero-btns{flex-wrap:wrap;}
          .footer-grid{grid-template-columns:1fr 1fr !important;}
        }
        @media(max-width:560px){
          .g4{grid-template-columns:1fr !important;}
          .g3w{grid-template-columns:1fr !important;}
          .gclip{grid-template-columns:1fr 1fr !important;}
          .htitle{font-size:14.5vw !important;}
          .footer-grid{grid-template-columns:1fr !important;gap:32px !important;text-align:center;}
          .wa-float{width:54px;height:54px;right:16px;bottom:16px;font-size:24px;}
        }
      `}</style>

      {hiringBar && (
        <div className="hiring-bar">
          <span style={{fontSize:14}}>✂️</span>
          <span className="inter" style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.85)"}}>
            <span style={{color:"#C4B5FD"}}>We're Hiring Editors</span> — Join the Creator Cuts team
          </span>
          <a className="hiring-btn" href={FORM_URL} target="_blank" rel="noopener noreferrer">Apply Now →</a>
          <button className="hiring-close" onClick={()=>setHiringBar(false)}>✕</button>
        </div>
      )}

      {menuOpen && (
        <div className="mob-menu">
          <button onClick={() => setMenuOpen(false)} style={{ position:"absolute",top:24,right:"6vw",background:"none",border:"none",color:"white",fontSize:30,cursor:"pointer" }}>✕</button>
          {["#how","#results","#plans","#faq"].map((href,i) => (
            <a key={href} className="mob-a" href={href} onClick={() => setMenuOpen(false)}>
              {["How it works","Results","Plans","FAQ"][i]}
            </a>
          ))}
          <a className="btn-p" href={wa("Hi! I'm interested in Creator Cuts for my channel.")} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} style={{ fontSize:16,padding:"15px 36px",marginTop:8 }}>
            Get started →
          </a>
        </div>
      )}

      {/* ── NAV ── */}
      <nav style={{
        position:"fixed",top:hiringBar ? 38 : 0,left:0,right:0,zIndex:100,
        padding: scrolled ? "12px 6vw" : "20px 6vw",
        background: scrolled ? "rgba(8,8,14,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        transition:"all .35s cubic-bezier(.16,1,.3,1)",
        display:"flex",alignItems:"center",justifyContent:"space-between",
      }}>
        <a href="/" style={{ display:"flex",alignItems:"center",gap:9,textDecoration:"none" }}>
          <Logo size={30} />
          <span className="disp" style={{ fontSize:16,color:"#F0F0F6" }}>
            CREATOR<span style={{ color:"#A78BFA" }}>CUTS</span>
          </span>
        </a>
        <div className="nav-links" style={{ display:"flex",gap:34,alignItems:"center" }}>
          <a className="nav-a" href="#how">How it works</a>
          <a className="nav-a" href="#results">Results</a>
          <a className="nav-a" href="#plans">Plans</a>
          <a className="nav-a" href="#faq">FAQ</a>
          <div style={{ width:1,height:18,background:"rgba(255,255,255,0.1)" }} />
          <a href="https://www.instagram.com/creatorcuts.in/" target="_blank" rel="noopener noreferrer" style={{ fontSize:16,opacity:0.5,textDecoration:"none",transition:"opacity .2s" }} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity="0.5"}>📸</a>
          <a href="https://www.youtube.com/@CreatorCuts-in" target="_blank" rel="noopener noreferrer" style={{ fontSize:16,opacity:0.5,textDecoration:"none",transition:"opacity .2s" }} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity="0.5"}>▶</a>
          <a className="btn-p" href={wa("Hi! I'm interested in Creator Cuts for my channel.")} target="_blank" rel="noopener noreferrer" style={{ padding:"10px 22px",fontSize:13.5 }}>
            Get started →
          </a>
        </div>
        <button className="ham" onClick={() => setMenuOpen(true)} style={{ display:"none",background:"none",border:"none",color:"white",fontSize:26,cursor:"pointer",alignItems:"center" }}>☰</button>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ position:"relative",padding:`${hiringBar ? 210 : 170}px clamp(20px,6vw,80px) 100px`,minHeight:"96vh",display:"flex",flexDirection:"column",justifyContent:"center",overflow:"hidden" }}>
        <div ref={glowRef} className="cursor-glow" />
        <div className="orb1" style={{ position:"absolute",top:"-12%",right:"-6%",width:520,height:520,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,255,0.3),transparent 70%)",filter:"blur(52px)",pointerEvents:"none" }} />
        <div className="orb2" style={{ position:"absolute",bottom:"-18%",left:"-8%",width:460,height:460,borderRadius:"50%",background:"radial-gradient(circle,rgba(217,70,201,0.2),transparent 70%)",filter:"blur(52px)",pointerEvents:"none" }} />
        <div className="orb3" style={{ position:"absolute",top:"40%",left:"40%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,255,0.1),transparent 70%)",filter:"blur(60px)",pointerEvents:"none" }} />

        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(14px)", transition:"opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)" }}>
          <div style={{ display:"inline-flex",marginLeft:"auto",marginRight:"auto",alignItems:"center",gap:8,background:"rgba(124,58,255,0.1)",border:"1px solid rgba(124,58,255,0.28)",padding:"8px 18px",borderRadius:999,fontSize:12.5,fontWeight:600,color:"#A78BFA",marginBottom:30,width:"fit-content",fontFamily:"Inter,sans-serif" }}>
            <span style={{ width:7,height:7,borderRadius:"50%",background:"#A78BFA",display:"inline-block",boxShadow:"0 0 8px #A78BFA",animation:"floaty 2s ease-in-out infinite" }} />
            Now onboarding streamers for July 2026
          </div>
        </div>

        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(22px)", transition:"opacity .8s cubic-bezier(.16,1,.3,1) .08s, transform .8s cubic-bezier(.16,1,.3,1) .08s" }}>
          <h1 className="disp htitle" style={{ fontSize:"clamp(48px,6.8vw,96px)",lineHeight:0.92,maxWidth:"980px",margin:"0 auto",textAlign:"center" }}>
            WE CUT YOUR{" "}
            <span style={{ color:"#A78BFA",position:"relative",display:"inline-block" }}>
              STREAMS
              <svg style={{ position:"absolute",bottom:-6,left:0,width:"100%",height:6 }} viewBox="0 0 200 6" preserveAspectRatio="none">
                <path d="M0 5 Q50 0 100 5 Q150 10 200 5" fill="none" stroke="#7C3AFF" strokeWidth="2" opacity="0.6"/>
              </svg>
            </span>
            <br />
            INTO{" "}
            <span className="gtxt">VIRAL MOMENTS</span>
          </h1>
        </div>

        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(18px)", transition:"opacity .8s cubic-bezier(.16,1,.3,1) .18s, transform .8s cubic-bezier(.16,1,.3,1) .18s" }}>
          <p className="inter" style={{ fontSize:18,color:"#6E6E82",maxWidth:540,marginTop:28,lineHeight:1.7,textAlign:"center",marginLeft:"auto",marginRight:"auto" }}>
            A done-for-you clipping service built for streamers. We watch every stream, find the moments that matter, and post them across multiple platforms — so you can just focus on creating content.
          </p>
        </div>

        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(16px)", transition:"opacity .8s cubic-bezier(.16,1,.3,1) .28s, transform .8s cubic-bezier(.16,1,.3,1) .28s" }}>
          <div className="hero-btns" style={{ display:"flex",gap:14,marginTop:36,alignItems:"center",justifyContent:"center" }}>
            <a className="btn-p" href="#plans">See plans & pricing →</a>
            <a className="btn-g" href={wa("Hi! I'd like to learn more about Creator Cuts.")} target="_blank" rel="noopener noreferrer">💬 Talk to us</a>
          </div>
        </div>

        <Reveal delay={440}>
          <div className="srow" style={{ display:"flex",gap:14,marginTop:60,flexWrap:"wrap",justifyContent:"center" }}>
            {[
              { val:"48hr", sub:"Max turnaround",  note:"Spark plan" },
              { val:"60+",  sub:"Clips per month", note:"Apex plan"  },
              { val:"3",    sub:"Platforms posted", note:"Surge plan" },
              { val:"100%", sub:"Done for you",    note:"You just stream" },
            ].map(s => (
              <div key={s.val} className="stat-pill">
                <div className="disp" style={{ fontSize:30,color:"#A78BFA",lineHeight:1 }}>{s.val}</div>
                <div className="inter" style={{ fontSize:12.5,color:"#6E6E82",marginTop:5,fontWeight:600 }}>{s.sub}</div>
                <div className="inter" style={{ fontSize:11,color:"rgba(167,139,250,0.5)",marginTop:2 }}>{s.note}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"#0C0C14",padding:"15px 0",overflow:"hidden" }}>
        <div className="mq-track">
          {[...MARQUEE,...MARQUEE].map((item,i) => (
            <span key={i} className="inter" style={{ fontSize:12.5,fontWeight:600,color:"#6E6E82",padding:"0 32px",whiteSpace:"nowrap",borderRight:"1px solid rgba(255,255,255,0.05)" }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding:"110px 6vw",background:"#0C0C14",borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <Reveal>
          <div className="inter" style={{ fontSize:11.5,fontWeight:700,color:"#A78BFA",letterSpacing:"0.15em",marginBottom:12,textAlign:"center" }}>HOW IT WORKS</div>
          <h2 className="disp" style={{ fontSize:"clamp(28px,4vw,46px)",maxWidth:640,marginBottom:14,textAlign:"center",margin:"0 auto" }}>FROM RAW STREAM<br/>TO POSTED CLIP</h2>
          <p className="inter" style={{ fontSize:15,color:"#6E6E82",maxWidth:480,marginBottom:56,lineHeight:1.65,textAlign:"center",marginLeft:"auto",marginRight:"auto" }}>Four steps. Zero effort on your end after step one.</p>
        </Reveal>
        <div className="g4" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18 }}>
          {STEPS.map((s,i) => (
            <Reveal delay={i*100} key={s.n} style={{ height:"100%" }}>
              <TiltCard className="step-card">
                <div className="gn" style={{ fontSize:42,marginBottom:18,lineHeight:1 }}>{s.n}</div>
                <div style={{ fontSize:30,marginBottom:14 }}>{s.icon}</div>
                <div className="inter" style={{ fontWeight:700,fontSize:15.5,marginBottom:8,color:"#F0F0F6" }}>{s.title}</div>
                <div className="inter" style={{ fontSize:13.5,color:"#6E6E82",lineHeight:1.7 }}>{s.desc}</div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          ── NEW: RESULTS / SOCIAL PROOF SECTION
          ════════════════════════════════════════ */}
      <section id="results" style={{ padding:"110px 6vw",background:"#08080E",borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <Reveal>
          <div className="inter" style={{ fontSize:11.5,fontWeight:700,color:"#A78BFA",letterSpacing:"0.15em",marginBottom:12,textAlign:"center" }}>RESULTS</div>
          <h2 className="disp" style={{ fontSize:"clamp(28px,4vw,46px)",marginBottom:14,textAlign:"center" }}>PROOF, NOT PROMISES</h2>
          <p className="inter" style={{ fontSize:15,color:"#6E6E82",maxWidth:520,marginBottom:56,lineHeight:1.65,textAlign:"center",marginLeft:"auto",marginRight:"auto" }}>
            Real numbers from real streamers we work with. No stock footage, no inflated screenshots.
          </p>
        </Reveal>

        {/* animated stat counters */}
        <div className="g4" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:60 }}>
          {RESULTS_STATS.map((s,i) => (
            <Reveal delay={i*90} key={s.label}>
              <div className="stat-card">
                <div style={{ fontSize:22,marginBottom:10 }}>{s.icon}</div>
                <div className="disp" style={{ fontSize:30,color:"#A78BFA" }}>
                  <Counter value={s.val} suffix={s.suffix} />
                </div>
                <div className="inter" style={{ fontSize:12.5,color:"#6E6E82",marginTop:8,fontWeight:600,lineHeight:1.4 }}>{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* sample clip cards */}
        <Reveal>
          <div className="inter" style={{ fontSize:13,fontWeight:700,color:"#F0F0F6",marginBottom:20,textAlign:"center" }}>Recently delivered clips</div>
        </Reveal>
        <div className="gclip" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:64 }}>
          {SAMPLE_CLIPS.map((c,i) => (
            <Reveal delay={i*90} key={c.title}>
              <div className="clip-card">
                <div className="clip-thumb">
                  <span style={{ position:"relative",zIndex:1 }}>{c.emoji}</span>
                  <span className="play-ring">▶</span>
                  <span style={{ position:"absolute",top:10,left:10,background:"rgba(124,58,255,0.25)",border:"1px solid rgba(124,58,255,0.4)",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700,color:"#C4B5FD",fontFamily:"Inter,sans-serif",zIndex:1 }}>{c.platform}</span>
                  <span style={{ position:"absolute",bottom:10,right:10,background:"rgba(8,8,14,0.65)",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700,color:"#fff",fontFamily:"Inter,sans-serif",zIndex:1,display:"flex",alignItems:"center",gap:4 }}>👁 {c.views}</span>
                </div>
                <div className="inter" style={{ fontSize:12.5,color:"#C8C8D8",padding:"14px 14px",lineHeight:1.5,fontWeight:600 }}>{c.title}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* testimonials */}
        <div className="g3w" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
          {TESTIMONIALS.map((t,i) => (
            <Reveal delay={i*100} key={t.name}>
              <div className="testi-card">
                <div style={{ color:"#A78BFA",fontSize:18,marginBottom:12 }}>★★★★★</div>
                <div className="inter" style={{ fontSize:13.5,color:"#C8C8D8",lineHeight:1.7,marginBottom:18 }}>"{t.quote}"</div>
                <div className="inter" style={{ fontWeight:700,fontSize:13.5,color:"#F0F0F6" }}>{t.name}</div>
                <div className="inter" style={{ fontSize:12,color:"#6E6E82",marginTop:2 }}>{t.game}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── WHY CREATOR CUTS ── */}
      <section style={{ padding:"110px 6vw",background:"#0C0C14" }}>
        <Reveal>
          <div className="inter" style={{ fontSize:11.5,fontWeight:700,color:"#A78BFA",letterSpacing:"0.15em",marginBottom:12,textAlign:"center" }}>WHY US</div>
          <h2 className="disp" style={{ fontSize:"clamp(28px,4vw,46px)",marginBottom:14,textAlign:"center",marginLeft:"auto",marginRight:"auto" }}>WHAT SETS US APART</h2>
          <p className="inter" style={{ fontSize:15,color:"#6E6E82",maxWidth:480,marginBottom:56,lineHeight:1.65,textAlign:"center",marginLeft:"auto",marginRight:"auto" }}>Most editors just cut clips. We build a short-form presence that actually grows your channel.</p>
        </Reveal>
        <div className="g3w" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
          {WHY.map((w,i) => (
            <Reveal delay={i*80} key={w.title}>
              <TiltCard className="why-card">
                <div style={{ fontSize:28,marginBottom:14 }}>{w.icon}</div>
                <div className="inter" style={{ fontWeight:700,fontSize:15,marginBottom:8,color:"#F0F0F6" }}>{w.title}</div>
                <div className="inter" style={{ fontSize:13.5,color:"#6E6E82",lineHeight:1.7 }}>{w.desc}</div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PLANS ── */}
      <section id="plans" style={{ padding:"110px 6vw",background:"#08080E",borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <Reveal>
          <div style={{ textAlign:"center" }}>
            <div className="inter" style={{ fontSize:11.5,fontWeight:700,color:"#A78BFA",letterSpacing:"0.15em",marginBottom:12 }}>PLANS & PRICING</div>
            <h2 className="disp" style={{ fontSize:"clamp(30px,4.4vw,52px)",marginBottom:14 }}>PICK YOUR CUT</h2>
            <p className="inter" style={{ color:"#6E6E82",maxWidth:500,margin:"0 auto",fontSize:15,lineHeight:1.65 }}>
              No pricing on the page — because every creator is different. Tell us which plan interests you and we'll give you a custom quote instantly on WhatsApp.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:"rgba(124,58,255,0.07)",border:"1px solid rgba(124,58,255,0.22)",borderRadius:12,padding:"14px 22px",marginTop:36,maxWidth:560,marginLeft:"auto",marginRight:"auto",flexWrap:"wrap" }}>
            <span style={{ fontSize:18 }}>💬</span>
            <span className="inter" style={{ fontSize:13.5,color:"#A78BFA",fontWeight:600 }}>Pricing is shared on WhatsApp — click any plan to get your quote instantly.</span>
          </div>
        </Reveal>

        <div className="g3" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:22,marginTop:48,alignItems:"stretch" }}>
          {PLANS.map((p,i) => (
            <Reveal delay={i*120} key={p.name} style={{ height:"100%" }}>
              <TiltCard className="plan-card" style={{
                position:"relative",height:"100%",
                background: p.highlight
                  ? "linear-gradient(160deg,rgba(124,58,255,0.18),#111119 50%)"
                  : "#111119",
                border: p.highlight
                  ? "1.5px solid rgba(124,58,255,0.55)"
                  : "1px solid rgba(255,255,255,0.07)",
                boxShadow: p.highlight ? "0 28px 64px -20px rgba(124,58,255,0.4)" : "none",
              }}>

                {p.badge && (
                  <div style={{
                    position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",
                    background: p.highlight ? "linear-gradient(135deg,#7C3AFF,#D946C9)" : "rgba(124,58,255,0.22)",
                    border: p.highlight ? "none" : "1px solid rgba(124,58,255,0.4)",
                    padding:"6px 18px",borderRadius:999,fontSize:11,fontWeight:700,
                    whiteSpace:"nowrap",letterSpacing:"0.06em",fontFamily:"Inter,sans-serif",color:"white"
                  }}>
                    {p.badge}
                  </div>
                )}

                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
                  <div className="disp" style={{ fontSize:20 }}>{p.emoji} {p.name}</div>
                  <span style={{ fontSize:11,fontWeight:700,color:"#A78BFA",background:"rgba(124,58,255,0.1)",border:"1px solid rgba(124,58,255,0.2)",padding:"3px 10px",borderRadius:6,fontFamily:"Inter,sans-serif",whiteSpace:"nowrap" }}>
                    {p.clips.split(" / ")[0]}
                  </span>
                </div>
                <div className="inter" style={{ fontSize:13,color:"#6E6E82",marginBottom:20,lineHeight:1.5 }}>{p.tag}</div>

                <div style={{ background:"rgba(124,58,255,0.08)",border:"1px solid rgba(124,58,255,0.18)",borderRadius:10,padding:"12px 16px",marginBottom:22,display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:20 }}>✂️</span>
                  <div>
                    <div className="inter" style={{ fontWeight:700,fontSize:14,color:"#A78BFA" }}>{p.clips}</div>
                    <div className="inter" style={{ fontSize:11.5,color:"#6E6E82",marginTop:2 }}>Edited, captioned & ready to post</div>
                  </div>
                </div>

                <div style={{ height:1,background:"rgba(255,255,255,0.07)",marginBottom:20 }} />

                <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:26,flex:1 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
                      <span style={{ color:"#A78BFA",flexShrink:0,marginTop:3,fontSize:11,background:"rgba(124,58,255,0.15)",borderRadius:"50%",width:16,height:16,display:"inline-flex",alignItems:"center",justifyContent:"center" }}>✓</span>
                      <span className="inter" style={{ fontSize:13.5,color:"#C8C8D8",lineHeight:1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"13px 16px",marginBottom:12,textAlign:"center" }}>
                  <div className="inter" style={{ fontSize:11,color:"#5E5E72",marginBottom:3,letterSpacing:"0.08em",textTransform:"uppercase" }}>Pricing</div>
                  <div className="inter" style={{ fontSize:14,fontWeight:700,color:"#F0F0F6" }}>Get your custom quote →</div>
                </div>

                <a
                  className={p.highlight ? "btn-plan-hero" : "btn-plan"}
                  href={wa(`Hi! I'm interested in the ${p.name} plan on Creator Cuts. Can you share the pricing?`)}
                  target="_blank" rel="noopener noreferrer"
                >
                  Get {p.name} pricing on WhatsApp
                </a>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400}>
          <p className="inter" style={{ textAlign:"center",color:"#6E6E82",fontSize:13.5,marginTop:30 }}>
            Need a custom volume or multi-streamer deal?{" "}
            <a href={wa("Hi! I'd like to discuss a custom Creator Cuts plan.")} target="_blank" rel="noopener noreferrer" style={{ color:"#A78BFA",textDecoration:"none",fontWeight:600 }}>
              Let's talk →
            </a>
          </p>
        </Reveal>
      </section>

      {/* ── PLATFORMS ── */}
      <section style={{ padding:"48px 6vw",background:"#0C0C14",borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <Reveal>
          <div className="inter" style={{ textAlign:"center",marginBottom:22,fontSize:11.5,fontWeight:700,color:"#6E6E82",letterSpacing:"0.14em" }}>WE POST ON</div>
          <div style={{ display:"flex",gap:36,justifyContent:"center",flexWrap:"wrap",alignItems:"center" }}>
            {[["🟣","Twitch"],["▶","YouTube"],["📸","Instagram Reels"],["⚡","Kick"]].map(([icon,label]) => (
              <div key={label} className="inter" style={{ display:"flex",alignItems:"center",gap:8,color:"#6E6E82",fontSize:14,fontWeight:600,cursor:"default",transition:"color .2s" }}
                onMouseEnter={e=>e.currentTarget.style.color="#F0F0F6"}
                onMouseLeave={e=>e.currentTarget.style.color="#6E6E82"}>
                <span style={{ fontSize:20 }}>{icon}</span>{label}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding:"110px 6vw",background:"#08080E" }}>
        <div style={{ maxWidth:760,margin:"0 auto" }}>
          <Reveal>
            <div className="inter" style={{ fontSize:11.5,fontWeight:700,color:"#A78BFA",letterSpacing:"0.15em",marginBottom:12 }}>FAQ</div>
            <h2 className="disp" style={{ fontSize:"clamp(26px,3.6vw,40px)",marginBottom:50 }}>QUESTIONS, ANSWERED</h2>
          </Reveal>
          {FAQS.map((f,i) => (
            <Reveal delay={i*60} key={f.q}>
              <div className="faq-row" onClick={() => setOpenFaq(openFaq===i?null:i)}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",gap:20 }}>
                  <div className="fq inter" style={{ fontWeight:700,fontSize:15,color:openFaq===i?"#A78BFA":"#F0F0F6",transition:"color .2s",flex:1 }}>{f.q}</div>
                  <div style={{ width:28,height:28,borderRadius:"50%",background:openFaq===i?"rgba(124,58,255,0.2)":"rgba(255,255,255,0.05)",border:`1px solid ${openFaq===i?"rgba(124,58,255,0.5)":"rgba(255,255,255,0.1)"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .25s" }}>
                    <span style={{ color:"#A78BFA",fontSize:18,lineHeight:1,transform:openFaq===i?"rotate(45deg)":"rotate(0deg)",display:"inline-block",transition:"transform .25s",marginTop:-1 }}>+</span>
                  </div>
                </div>
                <div style={{
                  maxHeight: openFaq===i ? 200 : 0,
                  overflow:"hidden",
                  transition:"max-height .4s cubic-bezier(.16,1,.3,1)",
                }}>
                  <div className="inter" style={{ color:"#6E6E82",fontSize:14.5,lineHeight:1.78,marginTop:14,paddingRight:48 }}>{f.a}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding:"120px 6vw",textAlign:"center",position:"relative",overflow:"hidden",background:"#0C0C14",borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <div className="floaty" style={{ position:"absolute",top:"5%",left:"50%",transform:"translateX(-50%)",width:700,height:360,borderRadius:"50%",background:"radial-gradient(ellipse,rgba(124,58,255,0.18),transparent 70%)",filter:"blur(60px)",pointerEvents:"none" }} />
        <Reveal>
          <div style={{ position:"relative" }}>
            <div style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",width:72,height:72,borderRadius:20,background:"rgba(124,58,255,0.12)",border:"1px solid rgba(124,58,255,0.3)",marginBottom:28 }}>
              <Logo size={40} />
            </div>
            <h2 className="disp" style={{ fontSize:"clamp(34px,5.5vw,68px)",lineHeight:0.94,marginBottom:20 }}>
              READY TO<br /><span className="gtxt">GET CUT?</span>
            </h2>
            <p className="inter" style={{ color:"#6E6E82",fontSize:17,maxWidth:420,margin:"0 auto",lineHeight:1.7 }}>
              DM us on WhatsApp, tell us which plan interests you, and we'll get you started same day.
            </p>
            <div style={{ marginTop:38,display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap" }}>
              <a className="btn-p" href={wa("Hi! I'd like to get started with Creator Cuts. Can you share the pricing?")} target="_blank" rel="noopener noreferrer" style={{ fontSize:16,padding:"16px 36px" }}>
                Get pricing on WhatsApp →
              </a>
              <a className="btn-g" href="#plans" style={{ fontSize:15,padding:"15px 28px" }}>
                View plans
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"#08080E",borderTop:"1px solid rgba(255,255,255,0.06)",padding:"56px 6vw 90px" }}>
        <div className="footer-grid" style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1.5fr",gap:40,marginBottom:52 }}>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:16 }}>
              <Logo size={26} />
              <span className="disp" style={{ fontSize:15,color:"#F0F0F6" }}>CREATOR<span style={{ color:"#A78BFA" }}>CUTS</span></span>
            </div>
            <p className="inter" style={{ fontSize:13.5,color:"#6E6E82",lineHeight:1.75,maxWidth:260,marginBottom:22 }}>
              A done-for-you clipping agency for streamers. We clip, edit, and post — you just go live.
            </p>
            <div style={{ display:"flex",gap:10 }}>
              <a href="https://www.instagram.com/creatorcuts.in/" target="_blank" rel="noopener noreferrer" className="soc" title="Instagram">📸</a>
              <a href="https://www.youtube.com/@CreatorCuts-in" target="_blank" rel="noopener noreferrer" className="soc" title="YouTube">▶</a>
              <a href={wa("Hi! I'm reaching out about Creator Cuts.")} target="_blank" rel="noopener noreferrer" className="soc" title="WhatsApp">💬</a>
            </div>
          </div>

          <div>
            <div className="inter" style={{ fontSize:11,fontWeight:700,color:"#6E6E82",letterSpacing:"0.12em",marginBottom:18 }}>SERVICES</div>
            {["Stream Clipping","Shorts Editing","Thumbnail Design","Channel Strategy","Platform Posting"].map(s => (
              <div key={s} className="inter" style={{ fontSize:13.5,color:"#6E6E82",marginBottom:10,lineHeight:1.4 }}>{s}</div>
            ))}
          </div>

          <div>
            <div className="inter" style={{ fontSize:11,fontWeight:700,color:"#6E6E82",letterSpacing:"0.12em",marginBottom:18 }}>PLANS</div>
            {["Spark","Surge","Apex"].map(n => (
              <a key={n} href="#plans" style={{ display:"block",textDecoration:"none",marginBottom:10 }}>
                <span className="inter" style={{ fontSize:13.5,color:"#6E6E82",transition:"color .2s" }}
                  onMouseEnter={e=>e.currentTarget.style.color="#A78BFA"}
                  onMouseLeave={e=>e.currentTarget.style.color="#6E6E82"}>
                  {n}
                </span>
              </a>
            ))}
          </div>

          <div>
            <div className="inter" style={{ fontSize:11,fontWeight:700,color:"#6E6E82",letterSpacing:"0.12em",marginBottom:18 }}>CONTACT US</div>
            <a href="https://www.instagram.com/creatorcuts.in/" target="_blank" rel="noopener noreferrer" style={{ display:"flex",alignItems:"center",gap:10,textDecoration:"none",marginBottom:14 }}>
              <span style={{ fontSize:16 }}>📸</span>
              <span className="inter" style={{ fontSize:13.5,color:"#6E6E82",transition:"color .2s" }}
                onMouseEnter={e=>e.currentTarget.style.color="#A78BFA"}
                onMouseLeave={e=>e.currentTarget.style.color="#6E6E82"}>@creatorcuts.in</span>
            </a>
            <a href="https://www.youtube.com/@CreatorCuts-in" target="_blank" rel="noopener noreferrer" style={{ display:"flex",alignItems:"center",gap:10,textDecoration:"none",marginBottom:14 }}>
              <span style={{ fontSize:16 }}>▶</span>
              <span className="inter" style={{ fontSize:13.5,color:"#6E6E82",transition:"color .2s" }}
                onMouseEnter={e=>e.currentTarget.style.color="#A78BFA"}
                onMouseLeave={e=>e.currentTarget.style.color="#6E6E82"}>@CreatorCuts-in</span>
            </a>
            <div onClick={copyEmail} style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:14 }}>
              <span style={{ fontSize:16 }}>📧</span>
              <span className="inter" style={{ fontSize:13.5,color: copied ? "#A78BFA" : "#6E6E82",transition:"color .2s" }}>
                {copied ? "Copied! ✓" : "contact@creatorcuts.in"}
              </span>
            </div>
            <a href={wa("Hi! I'm interested in Creator Cuts.")} target="_blank" rel="noopener noreferrer" style={{ display:"flex",alignItems:"center",gap:10,textDecoration:"none" }}>
              <span style={{ fontSize:16 }}>💬</span>
              <span className="inter" style={{ fontSize:13.5,color:"#6E6E82",transition:"color .2s" }}
                onMouseEnter={e=>e.currentTarget.style.color="#A78BFA"}
                onMouseLeave={e=>e.currentTarget.style.color="#6E6E82"}>WhatsApp us</span>
            </a>
          </div>
        </div>

        <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:24,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12,alignItems:"center" }}>
          <span className="inter" style={{ fontSize:12,color:"#3a3a52" }}>© 2026 Creator Cuts. All streams, sharpened.</span>
          <span className="inter" style={{ fontSize:12,color:"#3a3a52" }}>creatorcuts.in</span>
        </div>
      </footer>

      <a className="wa-float" href={wa("Hi! I'm interested in Creator Cuts.")} target="_blank" rel="noopener noreferrer" title="Chat on WhatsApp">💬</a>
    </div>
  );
}
