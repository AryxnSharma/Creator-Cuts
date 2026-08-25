import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const COLORS = {
  bg: "#07070B",
  panel: "#0D0D13",
  panel2: "#111119",
  border: "rgba(255,255,255,.08)",
  text: "#F4F4F7",
  muted: "#77778A",
  purple: "#8B5CF6",
  pink: "#D946EF",
};

function LogoMark() {
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg,#7C3AED,#D946EF)",
        boxShadow: "0 8px 30px rgba(124,58,237,.28)",
        color: "#fff",
        fontWeight: 900,
        fontSize: 15,
      }}
    >
      CC
    </div>
  );
}

function Icon({ children, size = 18 }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

export default function Workspace() {
  const [channelName, setChannelName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadWorkspaces();
  }, []);

  async function loadWorkspaces() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase.rpc("admin_get_workspaces");

    if (error) {
      console.error(error);
      setError(error.message);
      setWorkspaces([]);
    } else {
      setWorkspaces(data || []);
    }

    setLoading(false);
  }

  async function createWorkspace(e) {
    e.preventDefault();

    setError("");
    setNotice("");

    const cleanChannel = channelName.trim();
    const cleanDisplay = displayName.trim();
    const cleanPin = pin.trim();

    if (!cleanChannel || !cleanDisplay || !cleanPin) {
      setError("Please complete all fields.");
      return;
    }

    if (cleanPin.length < 4) {
      setError("PIN must be at least 4 characters.");
      return;
    }

    setCreating(true);

    try {
      const { error } = await supabase.rpc("admin_create_workspace", {
        p_channel_name: cleanChannel,
        p_display_name: cleanDisplay,
        p_pin: cleanPin,
      });

      if (error) throw error;

      setChannelName("");
      setDisplayName("");
      setPin("");
      setModalOpen(false);

      setNotice("Workspace created successfully.");
      await loadWorkspaces();

      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Unable to create workspace.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="cc-workspace">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #07070B;
        }

        .cc-workspace {
          min-height: 100vh;
          background:
            radial-gradient(circle at 75% 5%, rgba(124,58,237,.10), transparent 28%),
            radial-gradient(circle at 15% 35%, rgba(217,70,239,.055), transparent 25%),
            #07070B;
          color: #F4F4F7;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow-x: hidden;
        }

        .cc-shell {
          width: min(1180px, calc(100% - 48px));
          margin: 0 auto;
        }

        .cc-nav {
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }

        .cc-brand {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .cc-brand-name {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: .08em;
        }

        .cc-brand-name span {
          color: #A78BFA;
        }

        .cc-admin-pill {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #8A8A9B;
          font-size: 12px;
          font-weight: 600;
        }

        .cc-online {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #34D399;
          box-shadow: 0 0 12px rgba(52,211,153,.7);
        }

        .cc-main {
          padding: 56px 0 90px;
        }

        .cc-heading-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 42px;
        }

        .cc-eyebrow {
          font-size: 10px;
          font-weight: 800;
          color: #A78BFA;
          letter-spacing: .18em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .cc-title {
          margin: 0;
          font-size: clamp(38px, 5vw, 58px);
          line-height: .98;
          letter-spacing: -.045em;
          font-weight: 800;
        }

        .cc-subtitle {
          margin: 13px 0 0;
          color: #77778A;
          font-size: 14px;
          line-height: 1.6;
          max-width: 510px;
        }

        .cc-primary {
          border: 0;
          border-radius: 11px;
          padding: 13px 18px;
          color: white;
          background: linear-gradient(135deg,#7C3AED,#D946EF);
          font-weight: 750;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 12px 35px rgba(124,58,237,.23);
          transition: .22s ease;
          white-space: nowrap;
        }

        .cc-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(124,58,237,.35);
        }

        .cc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .cc-card {
          background: rgba(15,15,22,.78);
          border: 1px solid rgba(255,255,255,.075);
          border-radius: 18px;
          box-shadow: 0 20px 70px rgba(0,0,0,.22);
          backdrop-filter: blur(18px);
        }

        .cc-workspaces {
          min-height: 390px;
          padding: 26px;
          grid-column: 1 / -1;
        }

        .cc-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 22px;
        }

        .cc-card-title {
          font-size: 14px;
          font-weight: 750;
        }

        .cc-card-meta {
          color: #555566;
          font-size: 11px;
        }

        .cc-empty {
          min-height: 300px;
          border: 1px dashed rgba(255,255,255,.10);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 35px;
          background: rgba(255,255,255,.012);
        }

        .cc-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 15px;
          margin: 0 auto 16px;
          display: grid;
          place-items: center;
          background: rgba(139,92,246,.10);
          border: 1px solid rgba(139,92,246,.18);
          color: #A78BFA;
          font-size: 21px;
        }

        .cc-empty-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .cc-empty-text {
          color: #69697B;
          font-size: 12.5px;
          line-height: 1.6;
          max-width: 330px;
          margin: 0 auto 20px;
        }

        .cc-secondary {
          border: 1px solid rgba(255,255,255,.10);
          background: rgba(255,255,255,.035);
          color: #D8D8E2;
          border-radius: 9px;
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: .2s ease;
        }

        .cc-secondary:hover {
          background: rgba(255,255,255,.07);
          border-color: rgba(255,255,255,.17);
        }

        .cc-stats {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 18px;
        }

        .cc-stat {
          padding: 22px;
          min-height: 142px;
        }

        .cc-stat-label {
          color: #686879;
          font-size: 11px;
          font-weight: 650;
          margin-bottom: 14px;
        }

        .cc-stat-value {
          font-size: 30px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -.04em;
        }

        .cc-stat-note {
          color: #505062;
          font-size: 11px;
          margin-top: 10px;
        }

        .cc-status {
          padding: 22px;
          min-height: 142px;
        }

        .cc-status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 0;
          border-bottom: 1px solid rgba(255,255,255,.055);
          font-size: 12px;
        }

        .cc-status-row:last-child {
          border-bottom: 0;
        }

        .cc-status-label {
          color: #77778A;
        }

        .cc-status-good {
          color: #6EE7B7;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
        }

        .cc-workspace-item {
          padding: 18px;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px;
          background: rgba(255,255,255,.025);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          transition: .2s ease;
        }

        .cc-workspace-item:hover {
          border-color: rgba(139,92,246,.3);
          background: rgba(139,92,246,.045);
          transform: translateY(-1px);
        }

        .cc-workspace-info {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .cc-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg,rgba(124,58,237,.2),rgba(217,70,239,.12));
          border: 1px solid rgba(139,92,246,.2);
          color: #C4B5FD;
          font-weight: 800;
          flex-shrink: 0;
        }

        .cc-workspace-name {
          font-size: 14px;
          font-weight: 750;
        }

        .cc-workspace-channel {
          color: #69697B;
          font-size: 11px;
          margin-top: 4px;
        }

        .cc-open {
          border: 1px solid rgba(139,92,246,.22);
          background: rgba(139,92,246,.08);
          color: #B9A2FF;
          border-radius: 8px;
          padding: 9px 13px;
          font-size: 11px;
          font-weight: 750;
          text-decoration: none;
          white-space: nowrap;
        }

        .cc-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(0,0,0,.70);
          backdrop-filter: blur(12px);
          display: grid;
          place-items: center;
          padding: 20px;
        }

        .cc-modal {
          width: min(470px,100%);
          background: #0D0D13;
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 20px;
          box-shadow: 0 35px 100px rgba(0,0,0,.6);
          padding: 28px;
          animation: ccIn .25s cubic-bezier(.16,1,.3,1);
        }

        @keyframes ccIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .cc-modal-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 25px;
        }

        .cc-modal-title {
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -.025em;
        }

        .cc-modal-sub {
          color: #6F6F80;
          font-size: 12px;
          line-height: 1.6;
          margin-top: 6px;
        }

        .cc-close {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.035);
          color: #888897;
          cursor: pointer;
          font-size: 15px;
        }

        .cc-field {
          margin-bottom: 17px;
        }

        .cc-label {
          display: block;
          color: #9999AA;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .cc-input {
          width: 100%;
          height: 46px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,.09);
          background: #111119;
          color: #F4F4F7;
          outline: none;
          padding: 0 13px;
          font-size: 13px;
          transition: .2s ease;
        }

        .cc-input::placeholder {
          color: #4F4F60;
        }

        .cc-input:focus {
          border-color: rgba(139,92,246,.65);
          box-shadow: 0 0 0 3px rgba(139,92,246,.09);
        }

        .cc-error {
          margin-bottom: 16px;
          padding: 11px 13px;
          border-radius: 9px;
          background: rgba(239,68,68,.08);
          border: 1px solid rgba(239,68,68,.18);
          color: #FCA5A5;
          font-size: 12px;
          line-height: 1.5;
        }

        .cc-notice {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 200;
          background: #111119;
          border: 1px solid rgba(52,211,153,.25);
          color: #A7F3D0;
          border-radius: 10px;
          padding: 12px 15px;
          font-size: 12px;
          box-shadow: 0 15px 40px rgba(0,0,0,.4);
        }

        @media(max-width:760px) {
          .cc-shell {
            width: min(100% - 28px, 600px);
          }

          .cc-nav {
            height: 68px;
          }

          .cc-main {
            padding-top: 38px;
          }

          .cc-heading-row {
            align-items: flex-start;
            flex-direction: column;
            margin-bottom: 30px;
          }

          .cc-primary {
            width: 100%;
          }

          .cc-grid {
            grid-template-columns: 1fr;
          }

          .cc-workspaces {
            grid-column: auto;
            min-height: 330px;
          }

          .cc-stats {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media(max-width:480px) {
          .cc-stats {
            grid-template-columns: 1fr;
          }

          .cc-workspace-item {
            align-items: flex-start;
            flex-direction: column;
          }

          .cc-open {
            width: 100%;
            text-align: center;
          }

          .cc-title {
            font-size: 39px;
          }

          .cc-modal {
            padding: 22px;
          }
        }
      `}</style>

      {/* NAVIGATION */}
      <header className="cc-nav">
        <div className="cc-shell" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "min(1180px, calc(100% - 48px))" }}>
          <div className="cc-brand">
            <LogoMark />
            <div className="cc-brand-name">
              CREATOR<span>CUTS</span>
            </div>
          </div>

          <div className="cc-admin-pill">
            <span className="cc-online" />
            Control Center
          </div>
        </div>
      </header>

      <main className="cc-shell cc-main">
        {/* HEADER */}
        <div className="cc-heading-row">
          <div>
            <div className="cc-eyebrow">Creator management</div>
            <h1 className="cc-title">Workspaces</h1>
            <p className="cc-subtitle">
              Create and manage private creator dashboards from one place.
            </p>
          </div>

          <button
            className="cc-primary"
            onClick={() => {
              setError("");
              setModalOpen(true);
            }}
          >
            + New workspace
          </button>
        </div>

        {/* WORKSPACES */}
        <div className="cc-grid">
          <section className="cc-card cc-workspaces">
            <div className="cc-card-head">
              <div>
                <div className="cc-card-title">Your workspaces</div>
                <div className="cc-card-meta" style={{ marginTop: 5 }}>
                  Private creator environments
                </div>
              </div>

              <div className="cc-card-meta">
                {workspaces.length} {workspaces.length === 1 ? "workspace" : "workspaces"}
              </div>
            </div>

            {loading ? (
              <div className="cc-empty">
                <div>
                  <div className="cc-empty-icon">◌</div>
                  <div className="cc-empty-title">Loading workspaces</div>
                  <div className="cc-empty-text">
                    Fetching your creator environments…
                  </div>
                </div>
              </div>
            ) : workspaces.length === 0 ? (
              <div className="cc-empty">
                <div>
                  <div className="cc-empty-icon">＋</div>
                  <div className="cc-empty-title">No workspaces yet</div>
                  <div className="cc-empty-text">
                    Create your first creator workspace to give a streamer
                    their own private dashboard.
                  </div>

                  <button
                    className="cc-secondary"
                    onClick={() => {
                      setError("");
                      setModalOpen(true);
                    }}
                  >
                    Create first workspace →
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {workspaces.map((workspace, index) => {
                  const name =
                    workspace.display_name ||
                    workspace.channel_name ||
                    workspace.name ||
                    `Workspace ${index + 1}`;

                  const channel =
                    workspace.channel_name ||
                    workspace.channel ||
                    workspace.slug ||
                    "";

                  const initial = name.charAt(0).toUpperCase();

                  return (
                    <div
                      className="cc-workspace-item"
                      key={workspace.id || workspace.uid || index}
                    >
                      <div className="cc-workspace-info">
                        <div className="cc-avatar">{initial}</div>

                        <div style={{ minWidth: 0 }}>
                          <div className="cc-workspace-name">{name}</div>
                          <div className="cc-workspace-channel">
                            {channel ? `@${channel.replace(/^@/, "")}` : "Creator workspace"}
                          </div>
                        </div>
                      </div>

                      <a
                        className="cc-open"
                        href={`/workspace/${encodeURIComponent(channel || name)}`}
                      >
                        Open workspace →
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* STATS */}
          <div className="cc-stats">
            <div className="cc-card cc-stat">
              <div className="cc-stat-label">TOTAL CREATORS</div>
              <div className="cc-stat-value">{workspaces.length}</div>
              <div className="cc-stat-note">
                Private creator environments
              </div>
            </div>

            <div className="cc-card cc-stat">
              <div className="cc-stat-label">ACTIVE WORKSPACES</div>
              <div className="cc-stat-value">{workspaces.length}</div>
              <div className="cc-stat-note">
                Currently available
              </div>
            </div>
          </div>

          {/* SYSTEM STATUS */}
          <div className="cc-card cc-status">
            <div className="cc-card-head" style={{ marginBottom: 4 }}>
              <div>
                <div className="cc-card-title">System</div>
                <div className="cc-card-meta" style={{ marginTop: 5 }}>
                  Creator Cuts infrastructure
                </div>
              </div>
            </div>

            <div className="cc-status-row">
              <span className="cc-status-label">Database</span>
              <span className="cc-status-good">
                ● Connected
              </span>
            </div>

            <div className="cc-status-row">
              <span className="cc-status-label">Workspace API</span>
              <span className="cc-status-good">
                ● Operational
              </span>
            </div>

            <div className="cc-status-row">
              <span className="cc-status-label">Environment</span>
              <span style={{ color: "#BDBDCA", fontSize: 11, fontWeight: 700 }}>
                Production
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* CREATE MODAL */}
      {modalOpen && (
        <div className="cc-overlay" onMouseDown={(e) => {
          if (e.target === e.currentTarget && !creating) {
            setModalOpen(false);
          }
        }}>
          <div className="cc-modal">
            <div className="cc-modal-head">
              <div>
                <div className="cc-eyebrow">New workspace</div>
                <div className="cc-modal-title">Add a creator</div>
                <div className="cc-modal-sub">
                  Create a private dashboard for a creator.
                </div>
              </div>

              <button
                className="cc-close"
                onClick={() => !creating && setModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={createWorkspace}>
              <div className="cc-field">
                <label className="cc-label">Channel name</label>
                <input
                  className="cc-input"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="e.g. Rurush"
                  autoFocus
                  disabled={creating}
                />
              </div>

              <div className="cc-field">
                <label className="cc-label">Display name</label>
                <input
                  className="cc-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Rurush Gaming"
                  disabled={creating}
                />
              </div>

              <div className="cc-field">
                <label className="cc-label">Workspace PIN</label>
                <input
                  className="cc-input"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Minimum 4 characters"
                  type="password"
                  minLength={4}
                  disabled={creating}
                />
              </div>

              {error && (
                <div className="cc-error">
                  {error}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 9,
                  justifyContent: "flex-end",
                  marginTop: 23,
                }}
              >
                <button
                  type="button"
                  className="cc-secondary"
                  onClick={() => setModalOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cc-primary"
                  disabled={creating}
                  style={{ minWidth: 160 }}
                >
                  {creating ? "Creating…" : "Create workspace →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notice && <div className="cc-notice">✓ {notice}</div>}
    </div>
  );
}