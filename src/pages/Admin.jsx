import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [channelName, setChannelName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");

  const [workspaces, setWorkspaces] = useState([]);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setLoading(false);

      if (currentSession) {
        loadWorkspaces();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkSession() {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    setSession(currentSession);
    setLoading(false);

    if (currentSession) {
      loadWorkspaces();
    }
  }

  async function login(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setSession(data.session);
    await loadWorkspaces();
  }

  async function logout() {
    await supabase.auth.signOut();

    setSession(null);
    setWorkspaces([]);
  }

  async function loadWorkspaces() {
    setError("");

    const { data, error } = await supabase.rpc("admin_get_workspaces");

    if (error) {
      setError(error.message);
      return;
    }

    setWorkspaces(data || []);
  }

  async function createWorkspace(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!channelName.trim()) {
      setError("Enter a channel name.");
      return;
    }

    if (pin.length < 4) {
      setError("PIN must contain at least 4 characters.");
      return;
    }

    setCreating(true);

    const { error } = await supabase.rpc("admin_create_workspace", {
      p_channel_name: channelName.trim(),
      p_pin: pin,
      p_display_name: displayName.trim() || null,
    });

    setCreating(false);

    if (error) {
      setError(error.message);
      return;
    }

    setChannelName("");
    setDisplayName("");
    setPin("");

    setMessage("Workspace created successfully.");
    setShowCreate(false);

    await loadWorkspaces();

    setTimeout(() => {
      setMessage("");
    }, 3500);
  }

  if (loading) {
    return (
      <>
        <GlobalStyles />
        <div className="admin-loading">
          <div className="loading-mark">CC</div>
          <div className="loading-line" />
          <span>Loading control center</span>
        </div>
      </>
    );
  }

  /* =========================
     LOGIN
  ========================= */

  if (!session) {
    return (
      <>
        <GlobalStyles />

        <div className="admin-page login-page">
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />

          <div className="login-shell">
            <div className="login-brand">
              <div className="brand-symbol">CC</div>

              <div>
                <div className="brand-name">CREATOR CUTS</div>
                <div className="brand-caption">PRIVATE CONTROL CENTER</div>
              </div>
            </div>

            <div className="login-card">
              <div className="login-top">
                <span className="status-dot" />
                <span>ADMIN ACCESS</span>
              </div>

              <h1>
                Welcome
                <br />
                <span>back.</span>
              </h1>

              <p className="login-description">
                Sign in to manage creator workspaces, access controls and
                private channels.
              </p>

              <form onSubmit={login} className="login-form">
                <div className="field">
                  <label>EMAIL ADDRESS</label>

                  <div className="input-wrap">
                    <span className="input-icon">@</span>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label>PASSWORD</label>

                  <div className="input-wrap">
                    <span className="input-icon">•••</span>

                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                {error && <div className="alert error-alert">{error}</div>}

                <button type="submit" className="login-button">
                  <span>Enter control center</span>
                  <span className="button-arrow">↗</span>
                </button>
              </form>

              <div className="login-footer">
                <span className="lock-icon">◈</span>
                Secured with Supabase Authentication
              </div>
            </div>

            <div className="login-bottom">
              <span>CREATOR CUTS</span>
              <span>ADMINISTRATOR ACCESS</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* =========================
     ADMIN DASHBOARD
  ========================= */

  return (
    <>
      <GlobalStyles />

      <div className="admin-page dashboard-page">
        <div className="dashboard-glow" />

        <header className="admin-header">
          <div className="header-brand">
            <div className="brand-symbol small">CC</div>

            <div>
              <div className="brand-name">CREATOR CUTS</div>
              <div className="brand-caption">CONTROL CENTER</div>
            </div>
          </div>

          <div className="header-right">
            <div className="admin-session">
              <span className="online-dot" />
              <span>ADMIN</span>
            </div>

            <button className="signout-button" onClick={logout}>
              Sign out
              <span>↗</span>
            </button>
          </div>
        </header>

        <main className="dashboard-main">
          {/* HERO */}

          <section className="dashboard-hero">
            <div className="hero-copy">
              <div className="section-kicker">
                <span />
                WORKSPACE MANAGEMENT
              </div>

              <h1>
                Your
                <br />
                <span>creators.</span>
              </h1>

              <p>
                Manage private creator spaces and their access credentials
                from one place.
              </p>
            </div>

            <div className="hero-stat">
              <div className="hero-stat-number">{workspaces.length}</div>
              <div className="hero-stat-label">
                {workspaces.length === 1 ? "ACTIVE SPACE" : "ACTIVE SPACES"}
              </div>
            </div>
          </section>

          {/* TOP CARDS */}

          <section className="overview-grid">
            <div className="overview-card">
              <div className="overview-icon">◎</div>

              <div>
                <span>WORKSPACES</span>
                <strong>{workspaces.length}</strong>
              </div>

              <div className="card-arrow">↗</div>
            </div>

            <div className="overview-card">
              <div className="overview-icon green">✓</div>

              <div>
                <span>STATUS</span>
                <strong>
                  {workspaces.length > 0 ? "Online" : "Ready"}
                </strong>
              </div>

              <div className="card-status">
                <span />
              </div>
            </div>

            <button
              className="overview-card action-card"
              onClick={() => {
                setError("");
                setMessage("");
                setShowCreate(true);
              }}
            >
              <div className="overview-icon purple">+</div>

              <div>
                <span>QUICK ACTION</span>
                <strong>Create workspace</strong>
              </div>

              <div className="card-arrow">→</div>
            </button>
          </section>

          {/* WORKSPACES */}

          <section className="workspace-section">
            <div className="section-heading">
              <div>
                <div className="section-kicker">
                  <span />
                  YOUR CHANNELS
                </div>

                <h2>Active workspaces</h2>
              </div>

              <button
                className="new-workspace-button"
                onClick={() => {
                  setError("");
                  setMessage("");
                  setShowCreate(true);
                }}
              >
                <span>+</span>
                New workspace
              </button>
            </div>

            {message && (
              <div className="alert success-alert">
                <span>✓</span>
                {message}
              </div>
            )}

            {error && (
              <div className="alert error-alert dashboard-alert">
                {error}
              </div>
            )}

            {workspaces.length === 0 ? (
              <div className="empty-workspaces">
                <div className="empty-orbit">
                  <div className="empty-icon">+</div>
                </div>

                <h3>No workspaces yet</h3>

                <p>
                  Create your first private creator workspace
                  <br />
                  and it will appear here.
                </p>

                <button
                  className="empty-button"
                  onClick={() => setShowCreate(true)}
                >
                  Create first workspace
                  <span>→</span>
                </button>
              </div>
            ) : (
              <div className="workspace-list">
                {workspaces.map((workspace, index) => (
                  <div
                    key={workspace.id}
                    className="workspace-row"
                    style={{
                      animationDelay: `${index * 70}ms`,
                    }}
                  >
                    <div className="workspace-index">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="workspace-avatar">
                      {(workspace.channel_name || "C")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="workspace-info">
                      <h3>{workspace.channel_name}</h3>

                      <p>
                        {workspace.display_name || "No display name"}
                      </p>
                    </div>

                    <div className="workspace-meta">
                      <div
                        className={
                          workspace.is_active
                            ? "workspace-status active"
                            : "workspace-status"
                        }
                      >
                        <span />
                        {workspace.is_active ? "Active" : "Inactive"}
                      </div>
                    </div>

                    <div className="workspace-chevron">→</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <footer className="dashboard-footer">
            <span>CREATOR CUTS</span>
            <span>PRIVATE ADMIN CONSOLE</span>
            <span>AUTHENTICATED SESSION</span>
          </footer>
        </main>

        {/* CREATE MODAL */}

        {showCreate && (
          <div
            className="modal-backdrop"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreate(false);
              }
            }}
          >
            <div className="create-modal">
              <button
                className="modal-close"
                onClick={() => setShowCreate(false)}
              >
                ×
              </button>

              <div className="modal-kicker">
                <span />
                NEW WORKSPACE
              </div>

              <h2>
                Add a
                <br />
                <span>creator.</span>
              </h2>

              <p className="modal-description">
                Create a private workspace and give the creator their channel
                name and PIN.
              </p>

              <form onSubmit={createWorkspace}>
                <div className="modal-field">
                  <label>CHANNEL NAME</label>

                  <input
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="Rurush"
                    autoFocus
                  />
                </div>

                <div className="modal-field">
                  <label>DISPLAY NAME</label>

                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Rurush Gaming"
                  />
                </div>

                <div className="modal-field">
                  <label>WORKSPACE PIN</label>

                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Minimum 4 characters"
                    minLength={4}
                  />
                </div>

                {error && <div className="alert error-alert">{error}</div>}

                <button
                  type="submit"
                  className="create-button"
                  disabled={creating}
                >
                  <span>
                    {creating ? "Creating workspace..." : "Create workspace"}
                  </span>

                  <span>{creating ? "..." : "↗"}</span>
                </button>
              </form>

              <div className="modal-note">
                <span>◈</span>
                Workspace credentials are securely handled by Supabase.
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* =========================================================
   GLOBAL STYLES
========================================================= */

function GlobalStyles() {
  return (
    <style>{`
      * {
        box-sizing: border-box;
      }

      html,
      body,
      #root {
        margin: 0;
        min-height: 100%;
        background: #07070b;
      }

      body {
        font-family:
          Inter,
          ui-sans-serif,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
        color: #f4f2f8;
        -webkit-font-smoothing: antialiased;
      }

      button,
      input {
        font: inherit;
      }

      button {
        -webkit-tap-highlight-color: transparent;
      }

      .admin-page {
        min-height: 100vh;
        position: relative;
        overflow-x: hidden;
        background:
          radial-gradient(
            ellipse 80% 55% at 50% -15%,
            rgba(124, 58, 237, 0.16),
            transparent 65%
          ),
          #07070b;
      }

      /* =========================
         LOGIN
      ========================= */

      .login-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
      }

      .ambient {
        position: fixed;
        width: 420px;
        height: 420px;
        border-radius: 50%;
        filter: blur(100px);
        pointer-events: none;
        opacity: .13;
      }

      .ambient-one {
        background: #7c3aed;
        top: -180px;
        left: -140px;
        animation: ambientFloat 10s ease-in-out infinite alternate;
      }

      .ambient-two {
        background: #c026d3;
        right: -180px;
        bottom: -200px;
        animation: ambientFloat 13s ease-in-out infinite alternate-reverse;
      }

      .login-shell {
        width: min(430px, 100%);
        position: relative;
        z-index: 2;
        animation: pageEnter .7s cubic-bezier(.16,1,.3,1);
      }

      .login-brand {
        display: flex;
        align-items: center;
        gap: 13px;
        margin-bottom: 32px;
      }

      .brand-symbol {
        width: 42px;
        height: 42px;
        border-radius: 13px;
        display: grid;
        place-items: center;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: .06em;
        color: #fff;
        background:
          linear-gradient(
            135deg,
            #8b5cf6,
            #c026d3
          );
        box-shadow:
          0 10px 40px rgba(139,92,246,.25);
      }

      .brand-symbol.small {
        width: 36px;
        height: 36px;
        border-radius: 11px;
        font-size: 10px;
      }

      .brand-name {
        color: #c4a7ff;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: .18em;
      }

      .brand-caption {
        color: #4d4b59;
        font-size: 8px;
        font-weight: 700;
        letter-spacing: .16em;
        margin-top: 5px;
      }

      .login-card {
        padding: 38px;
        border-radius: 25px;
        border: 1px solid rgba(255,255,255,.09);
        background:
          linear-gradient(
            145deg,
            rgba(255,255,255,.055),
            rgba(255,255,255,.018)
          );
        box-shadow:
          0 40px 100px rgba(0,0,0,.38),
          inset 0 1px 0 rgba(255,255,255,.04);
        backdrop-filter: blur(24px);
      }

      .login-top {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #716d7f;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: .15em;
        margin-bottom: 26px;
      }

      .status-dot,
      .online-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #9b72ff;
        box-shadow: 0 0 12px #9b72ff;
      }

      .login-card h1 {
        margin: 0;
        font-size: clamp(48px, 10vw, 67px);
        line-height: .9;
        letter-spacing: -.065em;
        font-weight: 750;
      }

      .login-card h1 span {
        color: #a78bfa;
      }

      .login-description {
        color: #777482;
        font-size: 13px;
        line-height: 1.7;
        margin: 22px 0 30px;
        max-width: 350px;
      }

      .field {
        margin-bottom: 17px;
      }

      .field label,
      .modal-field label {
        display: block;
        color: #696674;
        font-size: 8px;
        font-weight: 900;
        letter-spacing: .16em;
        margin-bottom: 8px;
      }

      .input-wrap {
        position: relative;
      }

      .input-icon {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #625d70;
        font-size: 11px;
        pointer-events: none;
      }

      .input-wrap input {
        width: 100%;
        height: 49px;
        border: 1px solid rgba(255,255,255,.09);
        border-radius: 13px;
        outline: none;
        background: rgba(255,255,255,.035);
        color: #f4f2f8;
        padding: 0 15px 0 43px;
        transition:
          border-color .2s,
          background .2s,
          box-shadow .2s,
          transform .2s;
      }

      .input-wrap input::placeholder,
      .modal-field input::placeholder {
        color: #4d4a57;
      }

      .input-wrap input:focus,
      .modal-field input:focus {
        border-color: rgba(167,139,250,.55);
        background: rgba(167,139,250,.045);
        box-shadow: 0 0 0 4px rgba(139,92,246,.07);
      }

      .login-button,
      .create-button {
        width: 100%;
        height: 52px;
        margin-top: 7px;
        border: 0;
        border-radius: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 17px 0 19px;
        color: #fff;
        font-size: 12px;
        font-weight: 800;
        background: linear-gradient(
          110deg,
          #7c3aed,
          #a855f7 55%,
          #c026d3
        );
        box-shadow:
          0 12px 35px rgba(124,58,237,.19);
        transition:
          transform .2s,
          box-shadow .2s,
          filter .2s;
      }

      .login-button:hover,
      .create-button:hover {
        transform: translateY(-2px);
        filter: brightness(1.08);
        box-shadow:
          0 17px 42px rgba(124,58,237,.28);
      }

      .login-button:active,
      .create-button:active {
        transform: translateY(0);
      }

      .button-arrow {
        font-size: 17px;
      }

      .login-footer {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 7px;
        color: #45424d;
        font-size: 9px;
        margin-top: 23px;
      }

      .lock-icon {
        color: #6d5c8f;
      }

      .login-bottom {
        display: flex;
        justify-content: space-between;
        color: #35323d;
        font-size: 8px;
        letter-spacing: .14em;
        margin-top: 20px;
        padding: 0 3px;
      }

      /* =========================
         DASHBOARD
      ========================= */

      .dashboard-page {
        background:
          radial-gradient(
            ellipse 70% 45% at 50% -10%,
            rgba(124,58,237,.15),
            transparent 70%
          ),
          #07070b;
      }

      .dashboard-glow {
        position: absolute;
        width: 500px;
        height: 500px;
        top: 100px;
        right: -300px;
        background: rgba(124,58,237,.07);
        filter: blur(120px);
        pointer-events: none;
      }

      .admin-header {
        height: 76px;
        padding: 0 max(28px, 5vw);
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255,255,255,.055);
        background: rgba(7,7,11,.72);
        backdrop-filter: blur(22px);
        position: sticky;
        top: 0;
        z-index: 20;
      }

      .header-brand {
        display: flex;
        align-items: center;
        gap: 11px;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 18px;
      }

      .admin-session {
        display: flex;
        align-items: center;
        gap: 7px;
        color: #5e5a68;
        font-size: 8px;
        font-weight: 900;
        letter-spacing: .15em;
      }

      .online-dot {
        width: 5px;
        height: 5px;
        background: #4ade80;
        box-shadow: 0 0 10px rgba(74,222,128,.8);
      }

      .signout-button {
        border: 1px solid rgba(255,255,255,.09);
        background: rgba(255,255,255,.025);
        color: #85818d;
        height: 36px;
        padding: 0 13px;
        border-radius: 10px;
        cursor: pointer;
        font-size: 10px;
        transition: .2s;
      }

      .signout-button span {
        margin-left: 7px;
        opacity: .5;
      }

      .signout-button:hover {
        color: #fff;
        background: rgba(255,255,255,.06);
        border-color: rgba(255,255,255,.15);
      }

      .dashboard-main {
        width: min(1160px, calc(100% - 40px));
        margin: 0 auto;
        padding: 82px 0 45px;
        position: relative;
        z-index: 2;
      }

      .dashboard-hero {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 40px;
        animation: pageEnter .7s cubic-bezier(.16,1,.3,1);
      }

      .section-kicker,
      .modal-kicker {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #9b72ff;
        font-size: 8px;
        font-weight: 900;
        letter-spacing: .18em;
      }

      .section-kicker > span,
      .modal-kicker > span {
        width: 15px;
        height: 1px;
        background: #9b72ff;
        box-shadow: 0 0 10px #9b72ff;
      }

      .hero-copy h1 {
        margin: 13px 0 15px;
        font-size: clamp(58px, 8vw, 92px);
        line-height: .84;
        letter-spacing: -.075em;
        font-weight: 760;
      }

      .hero-copy h1 span {
        color: #a78bfa;
      }

      .hero-copy p {
        color: #686471;
        font-size: 13px;
        line-height: 1.65;
        max-width: 420px;
        margin: 0;
      }

      .hero-stat {
        text-align: right;
        padding-bottom: 5px;
      }

      .hero-stat-number {
        font-size: 52px;
        line-height: 1;
        font-weight: 700;
        letter-spacing: -.06em;
      }

      .hero-stat-label {
        margin-top: 8px;
        color: #55515f;
        font-size: 8px;
        font-weight: 900;
        letter-spacing: .17em;
      }

      .overview-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-top: 55px;
        animation: cardsEnter .8s .08s both cubic-bezier(.16,1,.3,1);
      }

      .overview-card {
        min-height: 100px;
        border: 1px solid rgba(255,255,255,.075);
        border-radius: 17px;
        background: rgba(255,255,255,.025);
        display: flex;
        align-items: center;
        gap: 13px;
        padding: 18px;
        position: relative;
        overflow: hidden;
        transition:
          transform .25s,
          border-color .25s,
          background .25s;
      }

      .overview-card:hover {
        transform: translateY(-3px);
        border-color: rgba(167,139,250,.2);
        background: rgba(255,255,255,.038);
      }

      .overview-icon {
        width: 39px;
        height: 39px;
        border-radius: 11px;
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        background: rgba(167,139,250,.09);
        border: 1px solid rgba(167,139,250,.12);
        color: #a78bfa;
        font-size: 17px;
      }

      .overview-icon.green {
        color: #4ade80;
        background: rgba(74,222,128,.07);
        border-color: rgba(74,222,128,.12);
      }

      .overview-icon.purple {
        color: #d946ef;
        background: rgba(217,70,239,.07);
        border-color: rgba(217,70,239,.12);
      }

      .overview-card > div:nth-child(2) {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .overview-card span {
        color: #56525f;
        font-size: 7px;
        font-weight: 900;
        letter-spacing: .15em;
      }

      .overview-card strong {
        color: #e8e5ed;
        font-size: 13px;
        font-weight: 700;
      }

      .card-arrow {
        margin-left: auto;
        color: #4c4854;
        font-size: 16px;
      }

      .card-status {
        margin-left: auto;
      }

      .card-status span {
        display: block;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #4ade80;
        box-shadow: 0 0 13px rgba(74,222,128,.8);
      }

      .action-card {
        color: inherit;
        cursor: pointer;
        text-align: left;
      }

      .workspace-section {
        margin-top: 72px;
        animation: cardsEnter .8s .16s both cubic-bezier(.16,1,.3,1);
      }

      .section-heading {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 20px;
        margin-bottom: 22px;
      }

      .section-heading h2 {
        margin: 11px 0 0;
        font-size: 27px;
        letter-spacing: -.035em;
      }

      .new-workspace-button {
        height: 39px;
        padding: 0 14px;
        border: 1px solid rgba(167,139,250,.22);
        border-radius: 10px;
        background: rgba(139,92,246,.08);
        color: #b9a1f7;
        font-size: 10px;
        font-weight: 800;
        cursor: pointer;
        transition: .2s;
      }

      .new-workspace-button span {
        font-size: 15px;
        margin-right: 7px;
      }

      .new-workspace-button:hover {
        background: rgba(139,92,246,.15);
        border-color: rgba(167,139,250,.4);
        transform: translateY(-2px);
      }

      .alert {
        border-radius: 11px;
        padding: 11px 13px;
        font-size: 11px;
        line-height: 1.5;
        margin-bottom: 15px;
        animation: alertIn .3s ease;
      }

      .error-alert {
        color: #ff9cab;
        background: rgba(255,70,100,.07);
        border: 1px solid rgba(255,70,100,.15);
      }

      .success-alert {
        color: #78e8a8;
        background: rgba(74,222,128,.06);
        border: 1px solid rgba(74,222,128,.14);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .dashboard-alert {
        margin-bottom: 18px;
      }

      .empty-workspaces {
        min-height: 300px;
        border: 1px dashed rgba(255,255,255,.085);
        border-radius: 19px;
        background: rgba(255,255,255,.017);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 40px 20px;
      }

      .empty-orbit {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        border: 1px solid rgba(167,139,250,.17);
        box-shadow:
          0 0 0 9px rgba(139,92,246,.025),
          0 0 45px rgba(139,92,246,.08);
        animation: orbitPulse 3s ease-in-out infinite;
      }

      .empty-icon {
        color: #9b72ff;
        font-size: 24px;
        font-weight: 300;
      }

      .empty-workspaces h3 {
        margin: 22px 0 7px;
        font-size: 17px;
        letter-spacing: -.02em;
      }

      .empty-workspaces p {
        margin: 0;
        color: #5f5b68;
        font-size: 11px;
        line-height: 1.7;
      }

      .empty-button {
        margin-top: 22px;
        height: 38px;
        padding: 0 14px;
        border: 1px solid rgba(255,255,255,.09);
        border-radius: 10px;
        background: rgba(255,255,255,.035);
        color: #aaa5b3;
        cursor: pointer;
        font-size: 10px;
        transition: .2s;
      }

      .empty-button span {
        margin-left: 8px;
      }

      .empty-button:hover {
        color: #fff;
        background: rgba(255,255,255,.07);
      }

      .workspace-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .workspace-row {
        min-height: 78px;
        border: 1px solid rgba(255,255,255,.065);
        border-radius: 15px;
        background: rgba(255,255,255,.024);
        display: flex;
        align-items: center;
        padding: 13px 17px;
        gap: 14px;
        transition:
          transform .25s,
          background .25s,
          border-color .25s;
        animation: rowEnter .55s both cubic-bezier(.16,1,.3,1);
      }

      .workspace-row:hover {
        transform: translateX(4px);
        background: rgba(255,255,255,.038);
        border-color: rgba(167,139,250,.16);
      }

      .workspace-index {
        color: #3d3945;
        font-size: 9px;
        font-weight: 800;
        width: 22px;
      }

      .workspace-avatar {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        color: #d8c9ff;
        background:
          linear-gradient(
            135deg,
            rgba(124,58,237,.22),
            rgba(217,70,239,.12)
          );
        border: 1px solid rgba(167,139,250,.16);
        font-size: 14px;
        font-weight: 800;
      }

      .workspace-info {
        min-width: 0;
        flex: 1;
      }

      .workspace-info h3 {
        margin: 0;
        color: #e7e4ec;
        font-size: 13px;
        font-weight: 750;
      }

      .workspace-info p {
        margin: 4px 0 0;
        color: #595561;
        font-size: 10px;
      }

      .workspace-meta {
        margin-left: auto;
      }

      .workspace-status {
        display: flex;
        align-items: center;
        gap: 7px;
        color: #716c78;
        font-size: 9px;
      }

      .workspace-status span {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #77717f;
      }

      .workspace-status.active {
        color: #72d99c;
      }

      .workspace-status.active span {
        background: #4ade80;
        box-shadow: 0 0 9px rgba(74,222,128,.7);
      }

      .workspace-chevron {
        color: #403c47;
        font-size: 15px;
        margin-left: 15px;
        transition: .2s;
      }

      .workspace-row:hover .workspace-chevron {
        color: #9b72ff;
        transform: translateX(3px);
      }

      .dashboard-footer {
        display: flex;
        justify-content: space-between;
        margin-top: 65px;
        padding-top: 18px;
        border-top: 1px solid rgba(255,255,255,.045);
        color: #34313a;
        font-size: 7px;
        font-weight: 800;
        letter-spacing: .16em;
      }

      /* =========================
         MODAL
      ========================= */

      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(2,2,5,.72);
        backdrop-filter: blur(13px);
        animation: fadeIn .2s ease;
      }

      .create-modal {
        width: min(470px, 100%);
        max-height: calc(100vh - 40px);
        overflow-y: auto;
        position: relative;
        padding: 35px;
        border-radius: 23px;
        border: 1px solid rgba(255,255,255,.1);
        background:
          radial-gradient(
            circle at 80% 0%,
            rgba(139,92,246,.12),
            transparent 40%
          ),
          #101015;
        box-shadow:
          0 45px 120px rgba(0,0,0,.6),
          inset 0 1px 0 rgba(255,255,255,.04);
        animation: modalIn .45s cubic-bezier(.16,1,.3,1);
      }

      .modal-close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 32px;
        height: 32px;
        border-radius: 9px;
        border: 1px solid rgba(255,255,255,.07);
        background: rgba(255,255,255,.025);
        color: #77727f;
        cursor: pointer;
        font-size: 20px;
        line-height: 1;
        transition: .2s;
      }

      .modal-close:hover {
        color: #fff;
        background: rgba(255,255,255,.07);
      }

      .create-modal h2 {
        margin: 15px 0 13px;
        font-size: 48px;
        line-height: .9;
        letter-spacing: -.065em;
      }

      .create-modal h2 span {
        color: #a78bfa;
      }

      .modal-description {
        color: #696570;
        font-size: 11px;
        line-height: 1.7;
        max-width: 360px;
        margin: 0 0 26px;
      }

      .modal-field {
        margin-bottom: 15px;
      }

      .modal-field input {
        width: 100%;
        height: 48px;
        border-radius: 11px;
        border: 1px solid rgba(255,255,255,.08);
        background: rgba(255,255,255,.035);
        outline: none;
        color: #f1eef6;
        padding: 0 13px;
        font-size: 12px;
        transition: .2s;
      }

      .create-button {
        margin-top: 8px;
      }

      .create-button:disabled {
        cursor: wait;
        opacity: .55;
        transform: none;
      }

      .modal-note {
        margin-top: 17px;
        padding-top: 15px;
        border-top: 1px solid rgba(255,255,255,.06);
        color: #46424d;
        font-size: 8px;
        line-height: 1.6;
        display: flex;
        gap: 7px;
      }

      .modal-note span {
        color: #7356a8;
      }

      /* =========================
         LOADING
      ========================= */

      .admin-loading {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 15px;
        background: #07070b;
        color: #56515f;
        font-size: 9px;
        letter-spacing: .15em;
        font-weight: 800;
      }

      .loading-mark {
        width: 43px;
        height: 43px;
        border-radius: 13px;
        display: grid;
        place-items: center;
        color: #fff;
        font-size: 10px;
        font-weight: 900;
        background: linear-gradient(135deg,#7c3aed,#c026d3);
        animation: loadingPulse 1.5s ease-in-out infinite;
      }

      .loading-line {
        width: 80px;
        height: 1px;
        background: linear-gradient(90deg,transparent,#9b72ff,transparent);
        animation: loadingLine 1.2s ease-in-out infinite;
      }

      /* =========================
         ANIMATIONS
      ========================= */

      @keyframes pageEnter {
        from {
          opacity: 0;
          transform: translateY(18px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes cardsEnter {
        from {
          opacity: 0;
          transform: translateY(22px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes rowEnter {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes modalIn {
        from {
          opacity: 0;
          transform: translateY(18px) scale(.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes alertIn {
        from {
          opacity: 0;
          transform: translateY(-5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes orbitPulse {
        0%,100% {
          transform: scale(1);
          box-shadow:
            0 0 0 9px rgba(139,92,246,.025),
            0 0 45px rgba(139,92,246,.08);
        }
        50% {
          transform: scale(1.04);
          box-shadow:
            0 0 0 12px rgba(139,92,246,.02),
            0 0 65px rgba(139,92,246,.13);
        }
      }

      @keyframes ambientFloat {
        from { transform: translate(0,0) scale(1); }
        to { transform: translate(40px,25px) scale(1.1); }
      }

      @keyframes loadingPulse {
        0%,100% { opacity: .55; transform: scale(.96); }
        50% { opacity: 1; transform: scale(1); }
      }

      @keyframes loadingLine {
        0%,100% { opacity: .3; transform: scaleX(.5); }
        50% { opacity: 1; transform: scaleX(1); }
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: .01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: .01ms !important;
        }
      }

      /* =========================
         RESPONSIVE
      ========================= */

      @media (max-width: 800px) {
        .dashboard-main {
          width: min(100% - 28px, 650px);
          padding-top: 55px;
        }

        .dashboard-hero {
          align-items: flex-start;
          flex-direction: column;
        }

        .hero-stat {
          text-align: left;
          display: flex;
          align-items: baseline;
          gap: 10px;
        }

        .hero-stat-number {
          font-size: 40px;
        }

        .hero-stat-label {
          margin: 0;
        }

        .overview-grid {
          grid-template-columns: 1fr;
          margin-top: 40px;
        }

        .workspace-section {
          margin-top: 50px;
        }

        .section-heading {
          align-items: flex-start;
          flex-direction: column;
        }

        .new-workspace-button {
          width: 100%;
        }
      }

      @media (max-width: 600px) {
        .admin-header {
          padding: 0 15px;
          height: 68px;
        }

        .brand-caption {
          display: none;
        }

        .admin-session {
          display: none;
        }

        .signout-button {
          height: 34px;
        }

        .dashboard-main {
          width: calc(100% - 24px);
          padding-top: 45px;
        }

        .hero-copy h1 {
          font-size: 61px;
        }

        .hero-copy p {
          font-size: 12px;
        }

        .overview-card {
          min-height: 88px;
        }

        .workspace-row {
          padding: 12px;
          gap: 10px;
        }

        .workspace-index {
          display: none;
        }

        .workspace-avatar {
          width: 38px;
          height: 38px;
        }

        .workspace-meta {
          display: none;
        }

        .workspace-chevron {
          margin-left: 0;
        }

        .dashboard-footer {
          flex-wrap: wrap;
          gap: 10px 20px;
        }

        .login-page {
          padding: 24px 15px;
        }

        .login-card {
          padding: 27px 21px;
          border-radius: 20px;
        }

        .login-card h1 {
          font-size: 53px;
        }

        .login-brand {
          margin-bottom: 23px;
        }

        .login-bottom {
          font-size: 7px;
        }

        .create-modal {
          padding: 27px 20px;
          border-radius: 19px;
        }

        .create-modal h2 {
          font-size: 43px;
        }
      }
    `}</style>
  );
}