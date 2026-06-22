import { useState, useEffect, useRef } from "react";

// ============================================================
// CONSTANTS
// ============================================================
const WHATSAPP = "919473929150";
const wa = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

const PLANS = [
  {
    name: "Spark",
    emoji: "✦",
    tag: "For streamers just starting their clip game",
    price: "6,999",
    clips: "15 edited clips / month",
    highlight: false,
    features: [
      "Posted to 1 platform of your choice",
      "48-hour turnaround per batch",
      "Cinematic captions & sound design",
      "Monthly performance recap",
    ],
  },
  {
    name: "Surge",
    emoji: "⚡",
    tag: "For streamers ready to scale their reach",
    price: "14,999",
    clips: "35 edited clips / month",
    highlight: true,
    features: [
      "Posted to 3 platforms (YT Shorts, Reels, TikTok)",
      "24-hour turnaround per batch",
      "Custom thumbnail design",
      "Trend-matched hooks & pacing",
      "Bi-weekly strategy check-in",
    ],
  },
  {
    name: "Apex",
    emoji: "◆",
    tag: "For full-time streamers building a brand",
    price: "29,999",
    clips: "60+ edited clips / month",
    highlight: false,
    features: [
      "Posted to all major platforms",
      "12-hour priority turnaround",
      "Dedicated personal editor",
      "Channel art & thumbnail suite",
      "Monthly 1:1 strategy call",
      "Detailed analytics dashboard",
    ],
  },
];

const STEPS = [
  { n: "01", icon: "📡", title: "You stream", desc: "Go live like always on Twitch, Kick or YouTube. That's the only job left for you." },
  { n: "02", icon: "✂️", title: "We watch & cut", desc: "Our editors review every VOD and cut the highlights worth posting." },
  { n: "03", icon: "🎬", title: "We polish", desc: "Captions, sound design, pacing and a thumbnail — built for the scroll." },
  { n: "04", icon: "📲", title: "We post", desc: "Clips go out across your chosen platforms, on schedule, every time." },
];

const FAQS = [
  { q: "Do I need to send you footage?", a: "No — give us access to your VODs and we handle the rest. Nothing extra for you to upload or organize." },
  { q: "Can I change plans later?", a: "Yes, upgrade or downgrade anytime. Your new plan kicks in from the next billing cycle." },
  { q: "Who picks the moments to clip?", a: "Our editors review full VODs and select clips based on what performs — you can also flag timestamps yourself." },
  { q: "What if I stream less in a given month?", a: "Unused clip credits roll over for one month, so a quiet week doesn't cost you." },
];

// ============================================================
// REVEAL ON SCROLL
// ============================================================
const Reveal = ({ children, delay = 0, style = {} }) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: shown ? 1 : 0,
      transform: shown ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
};

// ============================================================
// ANIMATED COUNTER
// ============================================================
const Counter = ({ to, suffix = "" }) => {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        setStarted(true);
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / 1400);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.floor(eased * to));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, started]);
  return <span ref={ref}>{val.toLocaleString("en-IN")}{suffix}</span>;
};

// ============================================================
// MAIN APP
// ============================================================
export default function CreatorCuts() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      background: "#0A0A0F",
      color: "#F4F4F8",
      minHeight: "100vh",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #7C3AFF; color: white; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a40; border-radius: 2px; }
        .disp { font-family: 'Anton', system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.01em; }
        .btn-primary {
          background: linear-gradient(135deg, #7C3AFF, #D946C9);
          color: white; border: none; padding: 14px 28px; border-radius: 999px;
          font-weight: 700; font-size: 15px; cursor: pointer;
          box-shadow: 0 8px 24px -8px rgba(124,58,255,0.6);
          transition: transform 0.25s cubic-bezier(.16,1,.3,1), box-shadow 0.25s;
          display: inline-block; text-decoration: none;
        }
        .btn-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 14px 32px -8px rgba(124,58,255,0.8); }
        .btn-ghost {
          background: rgba(255,255,255,0.04); color: #F4F4F8;
          border: 1px solid rgba(255,255,255,0.12);
          padding: 13px 26px; border-radius: 999px;
          font-weight: 600; font-size: 15px; cursor: pointer;
          transition: all 0.25s; display: inline-block; text-decoration: none;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.25); }
        .nav-link { color: #8E8E9C; text-decoration: none; font-weight: 500; font-size: 14.5px; transition: color .25s; }
        .nav-link:hover { color: #F4F4F8; }
        .step-card { background: #16161E; border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 28px 22px; transition: transform .3s cubic-bezier(.16,1,.3,1), border-color .3s; }
        .step-card:hover { transform: translateY(-6px); border-color: rgba(124,58,255,0.4); }
        .plan-card { background: #16161E; border-radius: 22px; padding: 34px 28px; display: flex; flex-direction: column; transition: transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s, border-color .35s; }
        .plan-card:hover { transform: translateY(-10px); border-color: rgba(124,58,255,0.5) !important; box-shadow: 0 24px 60px -20px rgba(124,58,255,0.45); }
        .faq-row { border-bottom: 1px solid rgba(255,255,255,0.08); padding: 22px 0; cursor: pointer; }
        @keyframes floaty { 0%,100%{ transform: translateY(0);} 50%{ transform: translateY(-14px);} }
        @keyframes drift1 { 0%,100%{ transform: translate(0,0);} 50%{ transform: translate(20px,-30px);} }
        @keyframes drift2 { 0%,100%{ transform: translate(0,0);} 50%{ transform: translate(-20px,30px);} }
        .glow1 { animation: drift1 12s ease-in-out infinite; }
        .glow2 { animation: drift2 16s ease-in-out infinite; }
        .float { animation: floaty 5s ease-in-out infinite; }
        .ghostnum { -webkit-text-stroke: 1.5px rgba(124,58,255,0.4); color: transparent; font-family: 'Anton', system-ui, sans-serif; text-transform: uppercase; }
        @media (max-width: 860px) {
          .nav-links { display: none !important; }
          .grid-4 { grid-template-columns: 1fr 1fr !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .hero-title { font-size: 13vw !important; }
          .stat-row { gap: 28px !important; }
        }
        @media (max-width: 540px) {
          .grid-4 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? "14px 6vw" : "22px 6vw",
        background: scrolled ? "rgba(10,10,15,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        transition: "all .35s cubic-bezier(.16,1,.3,1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg viewBox="0 0 100 100" width="28" height="28">
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#7C3AFF" />
              </linearGradient>
            </defs>
            <path d="M70 20 A30 30 0 1 0 70 80 L50 50 Z" fill="url(#lg)" />
            <path d="M30 20 A30 30 0 1 1 30 80 L50 50 Z" fill="#C7C7D1" />
          </svg>
          <span className="disp" style={{ fontSize: 17 }}>
            CREATOR<span style={{ color: "#A78BFA" }}>CUTS</span>
          </span>
        </div>

        {/* Links */}
        <div className="nav-links" style={{ display: "flex", gap: 36, alignItems: "center" }}>
          <a className="nav-link" href="#how">How it works</a>
          <a className="nav-link" href="#plans">Plans</a>
          <a className="nav-link" href="#faq">FAQ</a>
          <a className="btn-primary" href={wa("Hi! I'm interested in Creator Cuts for my channel.")} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 22px", fontSize: 14 }}>
            Get started →
          </a>
        </div>

        {/* Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", background: "none", border: "none", color: "white", fontSize: 24, cursor: "pointer" }}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", padding: "168px 6vw 100px", minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
        <div className="glow1" style={{ position: "absolute", top: "-10%", right: "-8%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,255,0.35), transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div className="glow2" style={{ position: "absolute", bottom: "-15%", left: "-8%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,70,201,0.25), transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />

        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,255,0.1)", border: "1px solid rgba(124,58,255,0.3)", padding: "7px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, color: "#A78BFA", marginBottom: 28, width: "fit-content" }}>
            ✂️ Now onboarding streamers for July
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="disp hero-title" style={{ fontSize: "clamp(48px, 7.2vw, 108px)", lineHeight: 0.96, maxWidth: 1100 }}>
            WE CUT YOUR <span style={{ color: "#A78BFA" }}>STREAMS</span><br />
            INTO{" "}
            <span style={{ background: "linear-gradient(135deg, #7C3AFF, #D946C9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              VIRAL MOMENTS
            </span>
          </h1>
        </Reveal>

        <Reveal delay={220}>
          <p style={{ fontSize: 19, color: "#8E8E9C", maxWidth: 560, marginTop: 26, lineHeight: 1.6 }}>
            A done-for-you clipping service for streamers. We watch every stream, cut the moments that matter, and post them — so you can focus on going live, not editing footage.
          </p>
        </Reveal>

        <Reveal delay={340}>
          <div style={{ display: "flex", gap: 16, marginTop: 38, flexWrap: "wrap", alignItems: "center" }}>
            <a className="btn-primary" href="#plans">See plans & pricing →</a>
            <a className="btn-ghost" href={wa("Hi! I'd like to see Creator Cuts' work.")} target="_blank" rel="noopener noreferrer">
              ▶ Watch our work
            </a>
          </div>
        </Reveal>

        <Reveal delay={460}>
          <div className="stat-row" style={{ display: "flex", gap: 56, marginTop: 76, flexWrap: "wrap" }}>
            {[
              { val: 2400000, suffix: "+", label: "Views generated for creators" },
              { val: 48, suffix: "hr", label: "Max turnaround, Spark plan" },
              { val: 120, suffix: "+", label: "Clips delivered monthly" },
            ].map(s => (
              <div key={s.label}>
                <div className="disp" style={{ fontSize: 34, color: "#A78BFA" }}>
                  <Counter to={s.val} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 13, color: "#8E8E9C", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: "100px 6vw", background: "#121218", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Reveal>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#A78BFA", letterSpacing: "0.12em", marginBottom: 12 }}>HOW IT WORKS</div>
          <h2 className="disp" style={{ fontSize: "clamp(30px, 4vw, 48px)", maxWidth: 700, marginBottom: 56 }}>
            FROM RAW STREAM TO POSTED CLIP
          </h2>
        </Reveal>
        <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {STEPS.map((s, i) => (
            <Reveal delay={i * 110} key={s.n}>
              <div className="step-card">
                <div className="ghostnum" style={{ fontSize: 40, marginBottom: 14 }}>{s.n}</div>
                <div style={{ fontSize: 26, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: "#F4F4F8" }}>{s.title}</div>
                <div style={{ fontSize: 14, color: "#8E8E9C", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PLANS ── */}
      <section id="plans" style={{ padding: "110px 6vw" }}>
        <Reveal>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#A78BFA", letterSpacing: "0.12em", marginBottom: 12 }}>PLANS & PRICING</div>
            <h2 className="disp" style={{ fontSize: "clamp(32px, 4.4vw, 52px)", marginBottom: 16 }}>PICK YOUR CUT</h2>
            <p style={{ color: "#8E8E9C", maxWidth: 520, margin: "0 auto", fontSize: 16 }}>
              Simple monthly plans. No contracts, no per-clip haggling — cancel or upgrade whenever your stream grows.
            </p>
          </div>
        </Reveal>

        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 60, alignItems: "stretch" }}>
          {PLANS.map((p, i) => (
            <Reveal delay={i * 130} key={p.name} style={{ height: "100%" }}>
              <div className="plan-card" style={{
                position: "relative", height: "100%",
                background: p.highlight ? "linear-gradient(180deg, rgba(124,58,255,0.14), #16161E 40%)" : "#16161E",
                border: p.highlight ? "1.5px solid rgba(124,58,255,0.6)" : "1px solid rgba(255,255,255,0.08)",
              }}>
                {p.highlight && (
                  <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #7C3AFF, #D946C9)", padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                    ★ MOST POPULAR
                  </div>
                )}
                <div className="disp" style={{ fontSize: 22, marginBottom: 6 }}>{p.emoji} {p.name}</div>
                <div style={{ fontSize: 13, color: "#8E8E9C", marginBottom: 24, minHeight: 36 }}>{p.tag}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 16, color: "#8E8E9C" }}>₹</span>
                  <span className="disp" style={{ fontSize: 42 }}>{p.price}</span>
                  <span style={{ fontSize: 14, color: "#8E8E9C" }}>/month</span>
                </div>
                <div style={{ fontSize: 14, color: "#A78BFA", fontWeight: 600, marginBottom: 26 }}>{p.clips}</div>
                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 22 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 30, flex: 1 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 10, fontSize: 14, alignItems: "flex-start" }}>
                      <span style={{ color: "#A78BFA", flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ color: "#F4F4F8" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a
                  className={p.highlight ? "btn-primary" : "btn-ghost"}
                  href={wa(`Hi! I'm interested in the ${p.name} plan (₹${p.price}/month) on Creator Cuts.`)}
                  target="_blank" rel="noopener noreferrer"
                  style={{ textAlign: "center", width: "100%", display: "block" }}
                >
                  Choose {p.name}
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={420}>
          <p style={{ textAlign: "center", color: "#8E8E9C", fontSize: 13.5, marginTop: 32 }}>
            Need a custom deal?{" "}
            <a href={wa("Hi! I'd like to discuss a custom Creator Cuts plan.")} target="_blank" rel="noopener noreferrer" style={{ color: "#A78BFA", textDecoration: "none" }}>
              Talk to us →
            </a>
          </p>
        </Reveal>
      </section>

      {/* ── PLATFORMS ── */}
      <section style={{ padding: "48px 6vw", background: "#121218", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Reveal>
          <div style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap", alignItems: "center", color: "#8E8E9C", fontSize: 15, fontWeight: 600 }}>
            {["🟣 Twitch", "▶ YouTube Shorts", "◻ Instagram Reels", "⚡ Kick", "♩ TikTok"].map(p => (
              <span key={p}>{p}</span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: "110px 6vw", maxWidth: 820, margin: "0 auto" }}>
        <Reveal>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#A78BFA", letterSpacing: "0.12em", marginBottom: 12 }}>FAQ</div>
          <h2 className="disp" style={{ fontSize: "clamp(28px, 3.6vw, 42px)", marginBottom: 50 }}>QUESTIONS, ANSWERED</h2>
        </Reveal>
        {FAQS.map((f, i) => (
          <Reveal delay={i * 90} key={f.q}>
            <div className="faq-row" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#F4F4F8" }}>{f.q}</div>
                <span style={{ color: "#A78BFA", fontSize: 20, flexShrink: 0, marginLeft: 16, transition: "transform .25s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
              </div>
              {openFaq === i && (
                <div style={{ color: "#8E8E9C", fontSize: 14.5, lineHeight: 1.7, marginTop: 12 }}>{f.a}</div>
              )}
            </div>
          </Reveal>
        ))}
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "110px 6vw", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="float" style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(124,58,255,0.22), transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
        <Reveal>
          <h2 className="disp" style={{ fontSize: "clamp(34px, 5vw, 64px)", position: "relative" }}>READY TO GET CUT?</h2>
          <p style={{ color: "#8E8E9C", marginTop: 18, fontSize: 17, maxWidth: 460, margin: "18px auto 0" }}>
            Join the streamers letting Creator Cuts turn their streams into their next thousand subscribers.
          </p>
          <div style={{ marginTop: 36 }}>
            <a className="btn-primary" href={wa("Hi! I'd like to book a free consult for Creator Cuts.")} target="_blank" rel="noopener noreferrer" style={{ fontSize: 16, padding: "16px 34px" }}>
              Start your free consult →
            </a>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "36px 6vw", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
        <span className="disp" style={{ fontSize: 15 }}>CREATOR<span style={{ color: "#A78BFA" }}>CUTS</span></span>
        <span style={{ fontSize: 13, color: "#8E8E9C" }}>© 2026 Creator Cuts. All streams, sharpened.</span>
      </footer>
    </div>
  );
}
