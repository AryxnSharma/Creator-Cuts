import { useState, useEffect, useRef } from "react";

const WHATSAPP = "919473929150";
const wa = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

const PLANS = [
  {
    name: "Spark", emoji: "✦", price: "6,999",
    tag: "For streamers just starting their clip game",
    clips: "15 edited clips / month", highlight: false,
    features: ["Posted to 1 platform of your choice","48-hour turnaround per batch","Cinematic captions & sound design","Monthly performance recap"],
  },
  {
    name: "Surge", emoji: "⚡", price: "14,999",
    tag: "For streamers ready to scale their reach",
    clips: "35 edited clips / month", highlight: true,
    features: ["Posted to 3 platforms (YT Shorts, Reels, TikTok)","24-hour turnaround per batch","Custom thumbnail design","Trend-matched hooks & pacing","Bi-weekly strategy check-in"],
  },
  {
    name: "Apex", emoji: "◆", price: "29,999",
    tag: "For full-time streamers building a brand",
    clips: "60+ edited clips / month", highlight: false,
    features: ["Posted to all major platforms","12-hour priority turnaround","Dedicated personal editor","Channel art & thumbnail suite","Monthly 1:1 strategy call","Detailed analytics dashboard"],
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

// ── Logo SVG (no external image dependency) ──
const Logo = ({ size = 32 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <defs>
      <linearGradient id="ccg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#A78BFA" />
        <stop offset="100%" stopColor="#7C3AFF" />
      </linearGradient>
    </defs>
    <path d="M68 18 A32 32 0 1 0 68 82 L50 50 Z" fill="url(#ccg)" />
    <path d="M32 18 A32 32 0 1 1 32 82 L50 50 Z" fill="#C7C7D1" />
    <line x1="20" y1="50" x2="80" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
  </svg>
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

export default function CreatorCuts() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText("info@creatorcuts.in");
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

        .nav-a{color:#6E6E82;text-decoration:none;font-family:'Inter',sans-serif;font-weight:500;font-size:14.5px;transition:color .2s;}
        .nav-a:hover{color:#F0F0F6;}

        /* Cards */
        .step-card{
          background:#111119;border:1px solid rgba(255,255,255,0.07);
          border-radius:20px;padding:30px 24px;height:100%;
          transition:transform .32s cubic-bezier(.16,1,.3,1),border-color .3s,box-shadow .3s;
        }
        .step-card:hover{transform:translateY(-8px);border-color:rgba(124,58,255,0.38);box-shadow:0 20px 50px -18px rgba(124,58,255,0.35);}

        .why-card{
          background:#111119;border:1px solid rgba(255,255,255,0.06);
          border-radius:18px;padding:26px 22px;
          transition:transform .3s cubic-bezier(.16,1,.3,1),border-color .3s;
        }
        .why-card:hover{transform:translateY(-6px);border-color:rgba(124,58,255,0.32);}

        .plan-card{
          background:#111119;border-radius:24px;padding:36px 30px;
          display:flex;flex-direction:column;
          transition:transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s;
        }

        .faq-row{border-bottom:1px solid rgba(255,255,255,0.07);padding:24px 0;cursor:pointer;}
        .faq-row:hover .fq{color:#A78BFA !important;}

        /* Glow orbs */
        @keyframes drift1{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(24px,-36px) scale(1.06);}}
        @keyframes drift2{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(-24px,32px) scale(1.04);}}
        @keyframes drift3{0%,100%{transform:translate(0,0);}50%{transform:translate(16px,20px);}}
        .orb1{animation:drift1 14s ease-in-out infinite;}
        .orb2{animation:drift2 18s ease-in-out infinite;}
        .orb3{animation:drift3 10s ease-in-out infinite;}
        @keyframes floaty{0%,100%{transform:translateY(0);}50%{transform:translateY(-16px);}}
        .floaty{animation:floaty 5.5s ease-in-out infinite;}

        /* Marquee */
        @keyframes mq{from{transform:translateX(0);}to{transform:translateX(-50%);}}
        .mq-track{display:flex;width:max-content;animation:mq 26s linear infinite;}
        .mq-track:hover{animation-play-state:paused;}

        /* Ghost number */
        .gn{
          -webkit-text-stroke:1.5px rgba(124,58,255,0.35);
          color:transparent;
          font-family:'Anton',system-ui,sans-serif;
          text-transform:uppercase;
        }

        /* Gradient text */
        .gtxt{
          background:linear-gradient(135deg,#7C3AFF,#D946C9);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          background-clip:text;
        }

        /* Social icon button */
        .soc{
          width:42px;height:42px;border-radius:12px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.1);
          display:inline-flex;align-items:center;justify-content:center;
          font-size:18px;cursor:pointer;transition:all .25s;
          text-decoration:none;color:#F0F0F6;
        }
        .soc:hover{background:rgba(124,58,255,0.18);border-color:rgba(124,58,255,0.45);transform:translateY(-3px);}

        /* Mobile menu */
        .mob-menu{
          position:fixed;inset:0;background:rgba(8,8,14,0.97);
          backdrop-filter:blur(24px);z-index:99;
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;
        }
        .mob-a{color:#F0F0F6;text-decoration:none;font-family:'Anton',sans-serif;font-size:36px;letter-spacing:0.02em;text-transform:uppercase;transition:color .2s;}
        .mob-a:hover{color:#A78BFA;}

        /* Stat pill */
        .stat-pill{
          background:rgba(124,58,255,0.08);
          border:1px solid rgba(124,58,255,0.2);
          border-radius:16px;padding:20px 28px;
          transition:border-color .3s,background .3s;
        }
        .stat-pill:hover{background:rgba(124,58,255,0.14);border-color:rgba(124,58,255,0.4);}

        /* Comparison table */
        .cmp-row:hover td{background:rgba(124,58,255,0.06) !important;}

        @media(max-width:900px){
          .nav-links{display:none !important;}
          .ham{display:flex !important;}
          .g4{grid-template-columns:1fr 1fr !important;}
          .g3{grid-template-columns:1fr !important;}
          .g3w{grid-template-columns:1fr 1fr !important;}
          .htitle{font-size:12vw !important;}
          .srow{flex-wrap:wrap;gap:16px !important;}
          .hero-btns{flex-wrap:wrap;}
        }
        @media(max-width:560px){
          .g4{grid-template-columns:1fr !important;}
          .g3w{grid-template-columns:1fr !important;}
          .htitle{font-size:14.5vw !important;}
        }
      `}</style>

      {/* ── MOBILE MENU ── */}
      {menuOpen && (
        <div className="mob-menu">
          <button onClick={() => setMenuOpen(false)} style={{ position:"absolute",top:24,right:"6vw",background:"none",border:"none",color:"white",fontSize:30,cursor:"pointer" }}>✕</button>
          {["#how","#plans","#faq"].map((href,i) => (
            <a key={href} className="mob-a" href={href} onClick={() => setMenuOpen(false)}>
              {["How it works","Plans","FAQ"][i]}
            </a>
          ))}
          <a className="btn-p" href={wa("Hi! I'm interested in Creator Cuts for my channel.")} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} style={{ fontSize:16,padding:"15px 36px",marginTop:8 }}>
            Get started →
          </a>
        </div>
      )}

      {/* ── NAV ── */}
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:100,
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
      <section style={{ position:"relative",padding:"170px 6vw 100px",minHeight:"96vh",display:"flex",flexDirection:"column",justifyContent:"center",overflow:"hidden" }}>
        {/* Orbs */}
        <div className="orb1" style={{ position:"absolute",top:"-12%",right:"-6%",width:520,height:520,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,255,0.3),transparent 70%)",filter:"blur(52px)",pointerEvents:"none" }} />
        <div className="orb2" style={{ position:"absolute",bottom:"-18%",left:"-8%",width:460,height:460,borderRadius:"50%",background:"radial-gradient(circle,rgba(217,70,201,0.2),transparent 70%)",filter:"blur(52px)",pointerEvents:"none" }} />
        <div className="orb3" style={{ position:"absolute",top:"40%",left:"40%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,255,0.1),transparent 70%)",filter:"blur(60px)",pointerEvents:"none" }} />

        <Reveal>
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(124,58,255,0.1)",border:"1px solid rgba(124,58,255,0.28)",padding:"8px 18px",borderRadius:999,fontSize:12.5,fontWeight:600,color:"#A78BFA",marginBottom:30,width:"fit-content",fontFamily:"Inter,sans-serif" }}>
            <span style={{ width:7,height:7,borderRadius:"50%",background:"#A78BFA",display:"inline-block",boxShadow:"0 0 8px #A78BFA",animation:"floaty 2s ease-in-out infinite" }} />
            Now onboarding streamers for July 2026
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="disp htitle" style={{ fontSize:"clamp(46px,7vw,108px)",lineHeight:0.93,maxWidth:1140,marginBottom:0 }}>
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
        </Reveal>

        <Reveal delay={190}>
          <p className="inter" style={{ fontSize:18,color:"#6E6E82",maxWidth:540,marginTop:28,lineHeight:1.7, textAlign:"center",
    marginLeft:"auto",
    marginRight:"auto" }}>
            A done-for-you clipping service built for streamers. We watch every stream, find the moments that matter, and post them across your channels — so you can just focus on going live.
          </p>
        </Reveal>

        <Reveal delay={310}>
          <div className="hero-btns" style={{ display:"flex",gap:14,marginTop:36,alignItems:"center",
    justifyContent:"center" }}>
            <a className="btn-p" href="#plans">See plans & pricing →</a>
            <a className="btn-g" href={wa("Hi! I'd like to learn more about Creator Cuts.")} target="_blank" rel="noopener noreferrer">💬 Talk to us</a>
          </div>
        </Reveal>

        {/* Stats */}
        <Reveal delay={440}>
          <div className="srow" style={{ display:"flex",gap:14,marginTop:60,flexWrap:"wrap",
    justifyContent:"center" }}>
            {[
              { val:"48hr",  sub:"Max turnaround",   note:"Spark plan" },
              { val:"60+",   sub:"Clips per month",   note:"Apex plan"  },
              { val:"3",     sub:"Platforms posted",  note:"Surge plan" },
              { val:"100%",  sub:"Done for you",      note:"You just stream" },
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
          <div className="inter" style={{ fontSize:11.5,fontWeight:700,color:"#A78BFA",letterSpacing:"0.15em",marginBottom:12 }}>HOW IT WORKS</div>
          <h2 className="disp" style={{ fontSize:"clamp(28px,4vw,46px)",maxWidth:640,marginBottom:14,

    textAlign:"center",
    margin:"0 auto" }}>FROM RAW STREAM<br/>TO POSTED CLIP</h2>
          <p className="inter" style={{ fontSize:15,color:"#6E6E82",maxWidth:480,marginBottom:56,lineHeight:1.65,

    textAlign:"center",
    marginLeft:"auto",
    marginRight:"auto" }}>Four steps. Zero effort on your end after step one.</p>
        </Reveal>
        <div className="g4" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18 }}>
          {STEPS.map((s,i) => (
            <Reveal delay={i*100} key={s.n} style={{ height:"100%" }}>
              <div className="step-card">
                <div className="gn" style={{ fontSize:42,marginBottom:18,lineHeight:1 }}>{s.n}</div>
                <div style={{ fontSize:30,marginBottom:14 }}>{s.icon}</div>
                <div className="inter" style={{ fontWeight:700,fontSize:15.5,marginBottom:8,color:"#F0F0F6" }}>{s.title}</div>
                <div className="inter" style={{ fontSize:13.5,color:"#6E6E82",lineHeight:1.7 }}>{s.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── WHY CREATOR CUTS ── */}
      <section style={{ padding:"110px 6vw",background:"#08080E" }}>
        <Reveal>
          <div className="inter" style={{ fontSize:11.5,fontWeight:700,color:"#A78BFA",letterSpacing:"0.15em",marginBottom:12 }}>WHY US</div>
          <h2 className="disp" style={{ fontSize:"clamp(28px,4vw,46px)",marginBottom:14, textAlign:"center",
marginLeft:"auto",
marginRight:"auto" }}>WHAT SETS US APART</h2>
          <p
  className="inter"
  style={{
    fontSize:15,
    color:"#6E6E82",
    maxWidth:480,
    marginBottom:56,
    lineHeight:1.65,

    textAlign:"center",
    marginLeft:"auto",
    marginRight:"auto"
  }}
>Most editors just cut clips. We build a short-form presence that actually grows your channel.</p>
        </Reveal>
        <div className="g3w" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
          {WHY.map((w,i) => (
            <Reveal delay={i*80} key={w.title}>
              <div className="why-card">
                <div style={{ fontSize:28,marginBottom:14 }}>{w.icon}</div>
                <div className="inter" style={{ fontWeight:700,fontSize:15,marginBottom:8,color:"#F0F0F6" }}>{w.title}</div>
                <div className="inter" style={{ fontSize:13.5,color:"#6E6E82",lineHeight:1.7 }}>{w.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PLANS ── */}
      <section id="plans" style={{ padding:"110px 6vw",background:"#0C0C14",borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <Reveal>
          <div style={{ textAlign:"center" }}>
            <div className="inter" style={{ fontSize:11.5,fontWeight:700,color:"#A78BFA",letterSpacing:"0.15em",marginBottom:12 }}>PLANS & PRICING</div>
            <h2 className="disp" style={{ fontSize:"clamp(30px,4.4vw,52px)",marginBottom:14 }}>PICK YOUR CUT</h2>
            <p className="inter" style={{ color:"#6E6E82",maxWidth:480,margin:"0 auto",fontSize:15,lineHeight:1.65 }}>
              Simple monthly plans. No contracts, no per-clip negotiations — cancel or upgrade as your stream grows.
            </p>
          </div>
        </Reveal>

        <div className="g3" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:22,marginTop:56,alignItems:"stretch" }}>
          {PLANS.map((p,i) => (
            <Reveal delay={i*120} key={p.name} style={{ height:"100%" }}>
              <div
                className="plan-card"
                onMouseEnter={() => setHoveredPlan(p.name)}
                onMouseLeave={() => setHoveredPlan(null)}
                style={{
                  position:"relative",height:"100%",
                  background: p.highlight
                    ? "linear-gradient(160deg,rgba(124,58,255,0.18),#111119 50%)"
                    : hoveredPlan === p.name ? "#141420" : "#111119",
                  border: p.highlight
                    ? "1.5px solid rgba(124,58,255,0.55)"
                    : hoveredPlan === p.name
                    ? "1px solid rgba(124,58,255,0.4)"
                    : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: p.highlight || hoveredPlan === p.name
                    ? "0 28px 64px -20px rgba(124,58,255,0.4)"
                    : "none",
                  transform: hoveredPlan === p.name ? "translateY(-10px)" : "translateY(0)",
                  transition:"all .35s cubic-bezier(.16,1,.3,1)",
                }}>
                {p.highlight && (
                  <div style={{ position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#7C3AFF,#D946C9)",padding:"6px 18px",borderRadius:999,fontSize:11,fontWeight:700,whiteSpace:"nowrap",letterSpacing:"0.06em",fontFamily:"Inter,sans-serif" }}>
                    ★ MOST POPULAR
                  </div>
                )}
                <div className="disp" style={{ fontSize:20,marginBottom:6 }}>{p.emoji} {p.name}</div>
                <div className="inter" style={{ fontSize:13,color:"#6E6E82",marginBottom:22,minHeight:36,lineHeight:1.5 }}>{p.tag}</div>
                <div style={{ display:"flex",alignItems:"baseline",gap:4,marginBottom:4 }}>
                  <span className="inter" style={{ fontSize:16,color:"#6E6E82",fontWeight:600 }}>₹</span>
                  <span className="disp" style={{ fontSize:42,lineHeight:1 }}>{p.price}</span>
                  <span className="inter" style={{ fontSize:13,color:"#6E6E82" }}>/month</span>
                </div>
                <div className="inter" style={{ fontSize:13.5,color:"#A78BFA",fontWeight:700,marginBottom:24 }}>{p.clips}</div>
                <div style={{ height:1,background:"rgba(255,255,255,0.07)",marginBottom:22 }} />
                <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:28,flex:1 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
                      <span style={{ color:"#A78BFA",flexShrink:0,marginTop:3,fontSize:12 }}>✓</span>
                      <span className="inter" style={{ fontSize:13.5,color:"#C8C8D8",lineHeight:1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a
                  className={p.highlight ? "btn-p" : "btn-g"}
                  href={wa(`Hi! I'm interested in the ${p.name} plan (₹${p.price}/month) on Creator Cuts.`)}
                  target="_blank" rel="noopener noreferrer"
                  style={{ textAlign:"center",width:"100%",display:"block" }}
                >
                  Choose {p.name} →
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400}>
          <p className="inter" style={{ textAlign:"center",color:"#6E6E82",fontSize:13.5,marginTop:30 }}>
            Need a custom volume or multi-streamer deal?{" "}
            <a href={wa("Hi! I'd like to discuss a custom Creator Cuts plan.")} target="_blank" rel="noopener noreferrer" style={{ color:"#A78BFA",textDecoration:"none",fontWeight:600 }}>
              Talk to us →
            </a>
          </p>
        </Reveal>
      </section>

      {/* ── PLATFORMS ── */}
      <section style={{ padding:"48px 6vw",background:"#08080E",borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <Reveal>
          <div className="inter" style={{ textAlign:"center",marginBottom:22,fontSize:11.5,fontWeight:700,color:"#6E6E82",letterSpacing:"0.14em" }}>WE POST ON</div>
          <div style={{ display:"flex",gap:36,justifyContent:"center",flexWrap:"wrap",alignItems:"center" }}>
            {[["🟣","Twitch"],["▶","YouTube Shorts"],["📸","Instagram Reels"],["⚡","Kick"],["♪","TikTok"]].map(([icon,label]) => (
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
      <section id="faq" style={{ padding:"110px 6vw",background:"#0C0C14",borderTop:"1px solid rgba(255,255,255,0.05)" }}>
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
                {openFaq===i && (
                  <div className="inter" style={{ color:"#6E6E82",fontSize:14.5,lineHeight:1.78,marginTop:14,paddingRight:48 }}>{f.a}</div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding:"120px 6vw",textAlign:"center",position:"relative",overflow:"hidden",background:"#08080E",borderTop:"1px solid rgba(255,255,255,0.05)" }}>
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
              Join the streamers letting Creator Cuts turn their streams into their next thousand subscribers.
            </p>
            <div style={{ marginTop:38,display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap" }}>
              <a className="btn-p" href={wa("Hi! I'd like to book a free consult for Creator Cuts.")} target="_blank" rel="noopener noreferrer" style={{ fontSize:16,padding:"16px 36px" }}>
                Start your free consult →
              </a>
              <a className="btn-g" href="#plans" style={{ fontSize:15,padding:"15px 28px" }}>
                View plans
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"#0C0C14",borderTop:"1px solid rgba(255,255,255,0.06)",padding:"56px 6vw 36px" }}>
        <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1.5fr",gap:40,marginBottom:52,flexWrap:"wrap" }}>

          {/* Brand */}
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

          {/* Services */}
          <div>
            <div className="inter" style={{ fontSize:11,fontWeight:700,color:"#6E6E82",letterSpacing:"0.12em",marginBottom:18 }}>SERVICES</div>
            {["Stream Clipping","Shorts Editing","Thumbnail Design","Channel Strategy","Platform Posting"].map(s => (
              <div key={s} className="inter" style={{ fontSize:13.5,color:"#6E6E82",marginBottom:10,lineHeight:1.4 }}>{s}</div>
            ))}
          </div>

          {/* Plans */}
          <div>
            <div className="inter" style={{ fontSize:11,fontWeight:700,color:"#6E6E82",letterSpacing:"0.12em",marginBottom:18 }}>PLANS</div>
            {[["Spark","₹6,999/mo"],["Surge","₹14,999/mo"],["Apex","₹29,999/mo"]].map(([n,p]) => (
              <a key={n} href="#plans" style={{ display:"block",textDecoration:"none",marginBottom:10 }}>
                <span className="inter" style={{ fontSize:13.5,color:"#6E6E82",transition:"color .2s" }}
                  onMouseEnter={e=>e.currentTarget.style.color="#A78BFA"}
                  onMouseLeave={e=>e.currentTarget.style.color="#6E6E82"}>
                  {n} — {p}
                </span>
              </a>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div className="inter" style={{ fontSize:11,fontWeight:700,color:"#6E6E82",letterSpacing:"0.12em",marginBottom:18 }}>CONTACT US</div>
            <a href="https://www.instagram.com/creatorcuts.in/" target="_blank" rel="noopener noreferrer" style={{ display:"flex",alignItems:"center",gap:10,textDecoration:"none",marginBottom:14 }}>
              <span style={{ fontSize:16 }}>📸</span>
              <span className="inter" style={{ fontSize:13.5,color:"#6E6E82",transition:"color .2s" }}
                onMouseEnter={e=>e.currentTarget.style.color="#A78BFA"}
                onMouseLeave={e=>e.currentTarget.style.color="#6E6E82"}>
                @creatorcuts.in
              </span>
            </a>
            <a href="https://www.youtube.com/@CreatorCuts-in" target="_blank" rel="noopener noreferrer" style={{ display:"flex",alignItems:"center",gap:10,textDecoration:"none",marginBottom:14 }}>
              <span style={{ fontSize:16 }}>▶</span>
              <span className="inter" style={{ fontSize:13.5,color:"#6E6E82",transition:"color .2s" }}
                onMouseEnter={e=>e.currentTarget.style.color="#A78BFA"}
                onMouseLeave={e=>e.currentTarget.style.color="#6E6E82"}>
                @CreatorCuts-in
              </span>
            </a>
            <div
              onClick={copyEmail}
              style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:14 }}>
              <span style={{ fontSize:16 }}>📧</span>
              <span className="inter" style={{ fontSize:13.5,color: copied ? "#A78BFA" : "#6E6E82",transition:"color .2s" }}>
                {copied ? "Copied! ✓" : "info@creatorcuts.in"}
              </span>
            </div>
            <a href={wa("Hi! I'm interested in Creator Cuts.")} target="_blank" rel="noopener noreferrer" style={{ display:"flex",alignItems:"center",gap:10,textDecoration:"none" }}>
              <span style={{ fontSize:16 }}>💬</span>
              <span className="inter" style={{ fontSize:13.5,color:"#6E6E82",transition:"color .2s" }}
                onMouseEnter={e=>e.currentTarget.style.color="#A78BFA"}
                onMouseLeave={e=>e.currentTarget.style.color="#6E6E82"}>
                WhatsApp us
              </span>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:24,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12,alignItems:"center" }}>
          <span className="inter" style={{ fontSize:12,color:"#3a3a52" }}>© 2026 Creator Cuts. All streams, sharpened.</span>
          <span className="inter" style={{ fontSize:12,color:"#3a3a52" }}>creatorcuts.in</span>
        </div>
      </footer>
    </div>
  );
}