import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function WorkspaceDashboard() {
  const { channelName } = useParams();
  const navigate = useNavigate();

  const channel = decodeURIComponent(channelName || "");

  const [pin, setPin] = useState("");
  const [workspace, setWorkspace] = useState(null);
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [clipModal, setClipModal] = useState(false);
  const [editingClip, setEditingClip] = useState(null);
  const [clipSaving, setClipSaving] = useState(false);
  const [clipDeleting, setClipDeleting] = useState(null);
  const [selectedClip, setSelectedClip] = useState(null);

  const [taskModal, setTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskSaving, setTaskSaving] = useState(false);
  const [taskDeleting, setTaskDeleting] = useState(null);
  const [taskToggling, setTaskToggling] = useState(null);
  const [taskStageMap, setTaskStageMap] = useState({});
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [taskDropStage, setTaskDropStage] = useState(null);

  const [noteModal, setNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteDeleting, setNoteDeleting] = useState(null);

  const [analyticsModal, setAnalyticsModal] = useState(false);
  const [editingAnalytics, setEditingAnalytics] = useState(null);
  const [analyticsSaving, setAnalyticsSaving] = useState(false);
  const [analyticsDeleting, setAnalyticsDeleting] = useState(null);
  const [analyticsRange, setAnalyticsRange] = useState("30d");
  const [analyticsMetric, setAnalyticsMetric] = useState("views");
  const [clipSearch, setClipSearch] = useState("");
  const [clipFilter, setClipFilter] = useState("all");
  const [clipSort, setClipSort] = useState("newest");

  const [analyticsForm, setAnalyticsForm] = useState({
    clip_id: "",
    recorded_at: "",
    views: "0",
    likes: "0",
    comments: "0",
    shares: "0",
  });

  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
  });

  const [clipForm, setClipForm] = useState({
    title: "",
    platform: "",
    url: "",
    status: "idea",
    notes: "",
  });

  // =========================================================
  // CHECK EXISTING SESSION
  // =========================================================

  useEffect(() => {
    const saved = sessionStorage.getItem("creator_workspace");

    if (!saved) {
      setChecking(false);
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      if (
        parsed &&
        parsed.uid &&
        parsed.session_token &&
        parsed.channel &&
        parsed.channel.toLowerCase() === channel.toLowerCase()
      ) {
        setWorkspace(parsed);
        loadDashboard(parsed.uid, parsed.session_token);
      }
    } catch {
      sessionStorage.removeItem("creator_workspace");
    }

    setChecking(false);
  }, [channel]);

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  async function loadDashboard(workspaceId, sessionToken) {
    if (!workspaceId || !sessionToken) return;

    setRefreshing(true);

    const { data, error } = await supabase.rpc(
      "workspace_dashboard",
      {
        p_workspace_id: workspaceId,
        p_session_token: sessionToken,
      }
    );

    if (error) {
      console.error("Dashboard error:", error);

      if (
        error.message?.toLowerCase().includes("session") ||
        error.message?.toLowerCase().includes("expired")
      ) {
        sessionStorage.removeItem("creator_workspace");
        setWorkspace(null);
        setError("Your workspace session expired. Please sign in again.");
      } else {
        setError(error.message || "Unable to load workspace.");
      }

      setRefreshing(false);
      return;
    }

    setDashboard(data);
    setRefreshing(false);
  }

  async function refreshDashboard() {
    if (!workspace?.uid || !workspace?.session_token) return;

    await loadDashboard(
      workspace.uid,
      workspace.session_token
    );
  }

  // =========================================================
  // CREATOR LOGIN
  // =========================================================

  async function login(e) {
    e.preventDefault();

    setError("");

    const cleanPin = pin.trim();

    if (!cleanPin) {
      setError("Enter your workspace PIN.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc(
        "workspace_login",
        {
          p_channel_name: channel,
          p_pin: cleanPin,
        }
      );

      if (error) throw error;

      if (!data) {
        throw new Error("Invalid channel name or PIN.");
      }

      const result = Array.isArray(data)
        ? data[0]
        : data;

      if (!result) {
        throw new Error("Invalid channel name or PIN.");
      }

      const uid =
        result.workspace_id ||
        result.uid ||
        result.user_id ||
        result.id;

      const sessionToken =
        result.session_token ||
        result.sessionToken;

      const returnedChannel =
        result.channel_name ||
        result.channel ||
        channel;

      const displayName =
        result.display_name ||
        result.name ||
        channel;

      if (!uid) {
        console.error("workspace_login returned:", result);

        throw new Error(
          "Workspace login succeeded but no workspace ID was returned."
        );
      }

      if (!sessionToken) {
        console.error("workspace_login returned:", result);

        throw new Error(
          "Workspace login succeeded but no session token was returned."
        );
      }

      const session = {
        uid,
        session_token: sessionToken,
        channel: returnedChannel,
        displayName,
      };

      sessionStorage.setItem(
        "creator_workspace",
        JSON.stringify(session)
      );

      setWorkspace(session);
      setPin("");

      await loadDashboard(uid, sessionToken);
    } catch (err) {
      console.error("Workspace login error:", err);

      setError(
        err?.message ||
          "Unable to enter workspace. Check your PIN and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  async function logout() {
    try {
      if (
        workspace?.uid &&
        workspace?.session_token
      ) {
        await supabase.rpc("workspace_logout", {
          p_workspace_id: workspace.uid,
          p_session_token: workspace.session_token,
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    }

    sessionStorage.removeItem("creator_workspace");

    setWorkspace(null);
    setDashboard(null);

    navigate(`/workspace/${encodeURIComponent(channel)}`);
  }

  // =========================================================
  // CLIP FORM
  // =========================================================

  function openAddClip() {
    setEditingClip(null);

    setClipForm({
      title: "",
      platform: "",
      url: "",
      status: "idea",
      notes: "",
    });

    setClipModal(true);
  }

  function openEditClip(clip) {
    setEditingClip(clip);

    setClipForm({
      title: clip.title || "",
      platform: clip.platform || "",
      url: clip.url || "",
      status: clip.status || "idea",
      notes: clip.notes || "",
    });

    setClipModal(true);
  }

  function closeClipModal() {
    if (clipSaving) return;

    setClipModal(false);
    setEditingClip(null);
  }

  function updateClipForm(field, value) {
    setClipForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // =========================================================
  // CREATE / UPDATE CLIP
  // =========================================================

  async function saveClip(e) {
    e.preventDefault();

    const title = clipForm.title.trim();

    if (!title) {
      return;
    }

    if (!workspace?.uid || !workspace?.session_token) {
      setError("Workspace session is missing. Please sign in again.");
      return;
    }

    setClipSaving(true);
    setError("");

    try {
      if (editingClip) {
        const { error } = await supabase.rpc(
          "workspace_clip_update",
          {
            p_workspace_id: workspace.uid,
            p_session_token: workspace.session_token,
            p_clip_id: editingClip.id,
            p_title: title,
            p_platform: clipForm.platform.trim() || null,
            p_url: clipForm.url.trim() || null,
            p_status: clipForm.status,
            p_notes: clipForm.notes.trim() || null,
          }
        );

        if (error) throw error;
      } else {
        const { error } = await supabase.rpc(
          "workspace_clip_create",
          {
            p_workspace_id: workspace.uid,
            p_session_token: workspace.session_token,
            p_title: title,
            p_platform: clipForm.platform.trim() || null,
            p_url: clipForm.url.trim() || null,
            p_status: clipForm.status,
            p_notes: clipForm.notes.trim() || null,
          }
        );

        if (error) throw error;
      }

      setClipModal(false);
      setEditingClip(null);

      setClipForm({
        title: "",
        platform: "",
        url: "",
        status: "idea",
        notes: "",
      });

      await refreshDashboard();
    } catch (err) {
      console.error("Clip save error:", err);

      setError(
        err?.message || "Unable to save clip."
      );
    } finally {
      setClipSaving(false);
    }
  }

  // =========================================================
  // DELETE CLIP
  // =========================================================

  async function deleteClip(clip) {
    if (
      !workspace?.uid ||
      !workspace?.session_token
    ) {
      setError("Workspace session is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${clip.title || "this clip"}"?`
    );

    if (!confirmed) return;

    setClipDeleting(clip.id);
    setError("");

    try {
      const { error } = await supabase.rpc(
        "workspace_clip_delete",
        {
          p_workspace_id: workspace.uid,
          p_session_token: workspace.session_token,
          p_clip_id: clip.id,
        }
      );

      if (error) throw error;

      await refreshDashboard();
    } catch (err) {
      console.error("Clip delete error:", err);

      setError(
        err?.message || "Unable to delete clip."
      );
    } finally {
      setClipDeleting(null);
    }
  }

  // =========================================================
  // CLIP DETAILS
  // =========================================================

  function openClipDetails(clip) {
    setSelectedClip(clip);
  }

  function closeClipDetails() {
    setSelectedClip(null);
  }

  function openAnalyticsForClip(clip) {
    setSelectedClip(null);
    setEditingAnalytics(null);
    setAnalyticsForm({
      clip_id: clip.id,
      recorded_at: new Date().toISOString().slice(0, 16),
      views: "0",
      likes: "0",
      comments: "0",
      shares: "0",
    });
    setAnalyticsModal(true);
  }

  // =========================================================
  // TASK WORKFLOW / KANBAN
  // =========================================================

  const TASK_STAGES = [
    { id: "ideas", label: "Ideas", hint: "Things to explore" },
    { id: "in_progress", label: "In progress", hint: "Currently working" },
    { id: "ready", label: "Ready", hint: "Ready to ship" },
    { id: "done", label: "Done", hint: "Completed" },
  ];

  useEffect(() => {
    if (!workspace?.uid) return;

    try {
      const saved = localStorage.getItem(
        `creator_task_stages_${workspace.uid}`
      );
      setTaskStageMap(saved ? JSON.parse(saved) : {});
    } catch {
      setTaskStageMap({});
    }
  }, [workspace?.uid]);

  function persistTaskStages(next) {
    setTaskStageMap(next);

    if (!workspace?.uid) return;

    try {
      localStorage.setItem(
        `creator_task_stages_${workspace.uid}`,
        JSON.stringify(next)
      );
    } catch {
      // Local persistence is an enhancement; task CRUD remains Supabase-backed.
    }
  }

  function getTaskStage(task) {
    if (task.completed) return "done";
    return taskStageMap[task.id] || "ideas";
  }

  async function moveTaskToStage(task, stage) {
    if (!task || !stage) return;

    const currentStage = getTaskStage(task);
    if (currentStage === stage) return;

    setError("");

    // The existing completed field remains the source of truth for Done.
    if (stage === "done" && !task.completed) {
      await toggleTask(task);
    } else if (stage !== "done" && task.completed) {
      await toggleTask(task);
    }

    const next = {
      ...taskStageMap,
      [task.id]: stage,
    };

    persistTaskStages(next);
    setDraggedTaskId(null);
    setTaskDropStage(null);
  }

  function handleTaskDragStart(task) {
    setDraggedTaskId(task.id);
  }

  function handleTaskDragEnd() {
    setDraggedTaskId(null);
    setTaskDropStage(null);
  }

  function handleTaskDragOver(e, stage) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setTaskDropStage(stage);
  }

  async function handleTaskDrop(e, stage) {
    e.preventDefault();
    const task = tasks.find((item) => item.id === draggedTaskId);
    if (task) await moveTaskToStage(task, stage);
    setDraggedTaskId(null);
    setTaskDropStage(null);
  }

  function getTasksForStage(stage) {
    return tasks.filter((task) => getTaskStage(task) === stage);
  }

  // =========================================================
  // TASK FORM
  // =========================================================

  function openAddTask() {
    setEditingTask(null);
    setTaskForm({
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
    });
    setTaskModal(true);
  }

  function openEditTask(task) {
    setEditingTask(task);
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      due_date: task.due_date
        ? String(task.due_date).slice(0, 10)
        : "",
    });
    setTaskModal(true);
  }

  function closeTaskModal() {
    if (taskSaving) return;
    setTaskModal(false);
    setEditingTask(null);
  }

  function updateTaskForm(field, value) {
    setTaskForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // =========================================================
  // CREATE / UPDATE TASK
  // =========================================================

  async function saveTask(e) {
    e.preventDefault();

    const title = taskForm.title.trim();

    if (!title) {
      setError("Enter a task title.");
      return;
    }

    if (!workspace?.uid || !workspace?.session_token) {
      setError("Workspace session is missing. Please sign in again.");
      return;
    }

    setTaskSaving(true);
    setError("");

    try {
      const safePriority =
        taskForm.priority === "urgent"
          ? "high"
          : ["low", "medium", "high"].includes(taskForm.priority)
            ? taskForm.priority
            : "medium";

      const payload = {
        p_workspace_id: workspace.uid,
        p_session_token: workspace.session_token,
        p_title: title,
        p_description: taskForm.description.trim() || null,
        p_priority: safePriority,
        p_due_date: taskForm.due_date || null,
      };

      if (editingTask) {
        const { error } = await supabase.rpc(
          "workspace_task_update",
          {
            ...payload,
            p_task_id: editingTask.id,
          }
        );

        if (error) throw error;
      } else {
        const { error } = await supabase.rpc(
          "workspace_task_create",
          payload
        );

        if (error) throw error;
      }

      setTaskModal(false);
      setEditingTask(null);
      setTaskForm({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
      });

      await refreshDashboard();
    } catch (err) {
      console.error("Task save error:", err);
      setError(err?.message || "Unable to save task.");
    } finally {
      setTaskSaving(false);
    }
  }

  // =========================================================
  // TOGGLE TASK
  // =========================================================

  async function toggleTask(task) {
    if (!workspace?.uid || !workspace?.session_token) {
      setError("Workspace session is missing.");
      return;
    }

    setTaskToggling(task.id);
    setError("");

    try {
      const { error } = await supabase.rpc(
        "workspace_task_toggle",
        {
          p_workspace_id: workspace.uid,
          p_session_token: workspace.session_token,
          p_task_id: task.id,
        }
      );

      if (error) throw error;

      await refreshDashboard();
    } catch (err) {
      console.error("Task toggle error:", err);
      setError(err?.message || "Unable to update task.");
    } finally {
      setTaskToggling(null);
    }
  }

  // =========================================================
  // DELETE TASK
  // =========================================================

  async function deleteTask(task) {
    if (!workspace?.uid || !workspace?.session_token) {
      setError("Workspace session is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${task.title || "this task"}"?`
    );

    if (!confirmed) return;

    setTaskDeleting(task.id);
    setError("");

    try {
      const { error } = await supabase.rpc(
        "workspace_task_delete",
        {
          p_workspace_id: workspace.uid,
          p_session_token: workspace.session_token,
          p_task_id: task.id,
        }
      );

      if (error) throw error;

      await refreshDashboard();
    } catch (err) {
      console.error("Task delete error:", err);
      setError(err?.message || "Unable to delete task.");
    } finally {
      setTaskDeleting(null);
    }
  }

  // =========================================================
  // NOTE FORM
  // =========================================================

  function openAddNote() {
    setEditingNote(null);
    setNoteForm({
      title: "",
      content: "",
    });
    setNoteModal(true);
  }

  function openEditNote(note) {
    setEditingNote(note);
    setNoteForm({
      title: note.title || "",
      content: note.content || "",
    });
    setNoteModal(true);
  }

  function closeNoteModal() {
    if (noteSaving) return;
    setNoteModal(false);
    setEditingNote(null);
  }

  function updateNoteForm(field, value) {
    setNoteForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // =========================================================
  // CREATE / UPDATE NOTE
  // =========================================================

  async function saveNote(e) {
    e.preventDefault();

    const title = noteForm.title.trim();
    const content = noteForm.content.trim();

    if (!title) {
      setError("Enter a note title.");
      return;
    }

    if (!content) {
      setError("Enter some note content.");
      return;
    }

    if (!workspace?.uid || !workspace?.session_token) {
      setError("Workspace session is missing. Please sign in again.");
      return;
    }

    setNoteSaving(true);
    setError("");

    try {
      const payload = {
        p_workspace_id: workspace.uid,
        p_session_token: workspace.session_token,
        p_title: title,
        p_content: content,
      };

      if (editingNote) {
        const { error } = await supabase.rpc(
          "workspace_note_update",
          {
            ...payload,
            p_note_id: editingNote.id,
          }
        );

        if (error) throw error;
      } else {
        const { error } = await supabase.rpc(
          "workspace_note_create",
          payload
        );

        if (error) throw error;
      }

      setNoteModal(false);
      setEditingNote(null);
      setNoteForm({
        title: "",
        content: "",
      });

      await refreshDashboard();
    } catch (err) {
      console.error("Note save error:", err);
      setError(err?.message || "Unable to save note.");
    } finally {
      setNoteSaving(false);
    }
  }

  // =========================================================
  // DELETE NOTE
  // =========================================================

  async function deleteNote(note) {
    if (!workspace?.uid || !workspace?.session_token) {
      setError("Workspace session is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${note.title || "this note"}"?`
    );

    if (!confirmed) return;

    setNoteDeleting(note.id);
    setError("");

    try {
      const { error } = await supabase.rpc(
        "workspace_note_delete",
        {
          p_workspace_id: workspace.uid,
          p_session_token: workspace.session_token,
          p_note_id: note.id,
        }
      );

      if (error) throw error;

      await refreshDashboard();
    } catch (err) {
      console.error("Note delete error:", err);
      setError(err?.message || "Unable to delete note.");
    } finally {
      setNoteDeleting(null);
    }
  }

  // =========================================================
  // ANALYTICS FORM
  // =========================================================

  function openAddAnalytics() {
    setEditingAnalytics(null);

    setAnalyticsForm({
      clip_id: clips[0]?.id || "",
      recorded_at: new Date().toISOString().slice(0, 16),
      views: "0",
      likes: "0",
      comments: "0",
      shares: "0",
    });

    setAnalyticsModal(true);
  }

  function openEditAnalytics(item) {
    setEditingAnalytics(item);

    setAnalyticsForm({
      clip_id: item.clip_id || "",
      recorded_at: item.recorded_at
        ? new Date(item.recorded_at).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      views: String(item.views ?? 0),
      likes: String(item.likes ?? 0),
      comments: String(item.comments ?? 0),
      shares: String(item.shares ?? 0),
    });

    setAnalyticsModal(true);
  }

  function closeAnalyticsModal() {
    if (analyticsSaving) return;

    setAnalyticsModal(false);
    setEditingAnalytics(null);
  }

  function updateAnalyticsForm(field, value) {
    setAnalyticsForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // =========================================================
  // CREATE / UPDATE ANALYTICS
  // =========================================================

  async function saveAnalytics(e) {
    e.preventDefault();

    if (!workspace?.uid || !workspace?.session_token) {
      setError("Workspace session is missing. Please sign in again.");
      return;
    }

    if (!analyticsForm.clip_id) {
      setError("Select a clip.");
      return;
    }

    setAnalyticsSaving(true);
    setError("");

    try {
      const payload = {
        p_workspace_id: workspace.uid,
        p_session_token: workspace.session_token,
        p_clip_id: analyticsForm.clip_id,
        p_views: Math.max(0, Number(analyticsForm.views) || 0),
        p_likes: Math.max(0, Number(analyticsForm.likes) || 0),
        p_comments: Math.max(0, Number(analyticsForm.comments) || 0),
        p_shares: Math.max(0, Number(analyticsForm.shares) || 0),
        p_recorded_at: analyticsForm.recorded_at
          ? new Date(analyticsForm.recorded_at).toISOString()
          : new Date().toISOString(),
      };

      if (editingAnalytics) {
        const { error } = await supabase.rpc(
          "workspace_analytics_update",
          {
            ...payload,
            p_analytics_id: editingAnalytics.id,
          }
        );

        if (error) throw error;
      } else {
        const { error } = await supabase.rpc(
          "workspace_analytics_create",
          payload
        );

        if (error) throw error;
      }

      setAnalyticsModal(false);
      setEditingAnalytics(null);

      setAnalyticsForm({
        clip_id: "",
        recorded_at: "",
        views: "0",
        likes: "0",
        comments: "0",
        shares: "0",
      });

      await refreshDashboard();
    } catch (err) {
      console.error("Analytics save error:", err);
      setError(err?.message || "Unable to save analytics.");
    } finally {
      setAnalyticsSaving(false);
    }
  }

  // =========================================================
  // DELETE ANALYTICS
  // =========================================================

  async function deleteAnalytics(item) {
    if (!workspace?.uid || !workspace?.session_token) {
      setError("Workspace session is missing.");
      return;
    }

    const clip = clips.find((c) => c.id === item.clip_id);

    const confirmed = window.confirm(
      `Delete analytics for "${clip?.title || "this clip"}"?`
    );

    if (!confirmed) return;

    setAnalyticsDeleting(item.id);
    setError("");

    try {
      const { error } = await supabase.rpc(
        "workspace_analytics_delete",
        {
          p_workspace_id: workspace.uid,
          p_session_token: workspace.session_token,
          p_analytics_id: item.id,
        }
      );

      if (error) throw error;

      await refreshDashboard();
    } catch (err) {
      console.error("Analytics delete error:", err);
      setError(err?.message || "Unable to delete analytics.");
    } finally {
      setAnalyticsDeleting(null);
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (checking) {
    return (
      <>
        <style>{styles}</style>

        <div className="cw-page cw-loading-page">
          <div className="cw-loader" />
          <span>Loading workspace…</span>
        </div>
      </>
    );
  }

  // =========================================================
  // LOGIN SCREEN
  // =========================================================

  if (!workspace) {
    return (
      <>
        <style>{styles}</style>

        <div className="cw-page">
          <div className="cw-glow cw-glow-one" />
          <div className="cw-glow cw-glow-two" />

          <header className="cw-nav">
            <div className="cw-logo">
              <div className="cw-logo-mark">
                CC
              </div>

              <div>
                <div className="cw-logo-name">
                  CREATOR<span>CUTS</span>
                </div>

                <div className="cw-logo-sub">
                  PRIVATE WORKSPACE
                </div>
              </div>
            </div>

            <div className="cw-secure">
              <span />
              Secure workspace
            </div>
          </header>

          <main className="cw-login-area">
            <div className="cw-login-card">
              <div className="cw-badge">
                CREATOR ACCESS
              </div>

              <div className="cw-avatar">
                {channel.charAt(0).toUpperCase()}
              </div>

              <h1>{channel}</h1>

              <p className="cw-description">
                Enter your workspace PIN to continue to
                your private Creator Cuts dashboard.
              </p>

              <form onSubmit={login}>
                <label>WORKSPACE PIN</label>

                <input
                  type="password"
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value)
                  }
                  placeholder="Enter your PIN"
                  autoFocus
                  disabled={loading}
                  autoComplete="off"
                />

                {error && (
                  <div className="cw-error">
                    <span>!</span>
                    {error}
                  </div>
                )}

                <button
                  className="cw-enter"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="cw-button-spinner" />
                      Verifying…
                    </>
                  ) : (
                    <>
                      Enter workspace
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>

              <div className="cw-protected">
                <span>◆</span>
                Private creator environment
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  // =========================================================
  // DASHBOARD DATA
  // =========================================================

  const data = dashboard || {};

  const workspaceData =
    data.workspace || workspace;

  const clips = Array.isArray(data.clips)
    ? data.clips
    : [];

  const analytics = Array.isArray(data.analytics)
    ? data.analytics
    : [];

  const tasks = Array.isArray(data.tasks)
    ? data.tasks
    : [];

  const notes = Array.isArray(data.notes)
    ? data.notes
    : [];

  const clipStatuses = ["idea", "editing", "ready", "published", "archived"];

  const filteredClips = clips
    .filter((clip) => {
      const query = clipSearch.trim().toLowerCase();
      const matchesSearch = !query || [
        clip.title,
        clip.platform,
        clip.notes,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesFilter =
        clipFilter === "all" || clip.status === clipFilter;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (clipSort === "oldest") {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }

      if (clipSort === "az") {
        return String(a.title || "").localeCompare(String(b.title || ""));
      }

      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks =
    tasks.length - completedTasks;

  const totalViews = analytics.reduce(
    (sum, item) =>
      sum + Number(item.views || 0),
    0
  );

  const totalLikes = analytics.reduce(
    (sum, item) =>
      sum + Number(item.likes || 0),
    0
  );

  const totalComments = analytics.reduce(
    (sum, item) =>
      sum + Number(item.comments || 0),
    0
  );

  const totalShares = analytics.reduce(
    (sum, item) =>
      sum + Number(item.shares || 0),
    0
  );

  const latestAnalytics =
  analytics.length > 0
    ? analytics[0]
    : null;

const latestRecordedAt =
  latestAnalytics?.recorded_at || null;

  const analyticsChart = buildAnalyticsSeries(
    analytics,
    analyticsRange,
    analyticsMetric
  );

  const chartFirst = analyticsChart.length
    ? analyticsChart[0].value
    : 0;

  const chartLast = analyticsChart.length
    ? analyticsChart[analyticsChart.length - 1].value
    : 0;

  const chartChange =
    analyticsChart.length > 1 && chartFirst !== 0
      ? ((chartLast - chartFirst) / Math.abs(chartFirst)) * 100
      : null;

  const chartPeak = analyticsChart.length
    ? Math.max(...analyticsChart.map((point) => point.value))
    : 0;

  return (
    <>
      <style>{styles}</style>

      <div className="cw-page cw-dashboard">
        <div className="cw-glow cw-glow-one" />
        <div className="cw-glow cw-glow-two" />

        {/* NAVBAR */}

        <header className="cw-nav">
          <div className="cw-logo">
            <div className="cw-logo-mark">
              CC
            </div>

            <div>
              <div className="cw-logo-name">
                CREATOR<span>CUTS</span>
              </div>

              <div className="cw-logo-sub">
                CREATOR WORKSPACE
              </div>
            </div>
          </div>

          <div className="cw-nav-right">
            <div className="cw-secure">
              <span />
              Workspace active
            </div>

            <button
              className="cw-logout"
              onClick={logout}
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="cw-main">

          {/* HEADER */}

          <div className="cw-dashboard-head">
            <div>
              <div className="cw-badge">
                CREATOR WORKSPACE
              </div>

              <h1>
                Welcome back,
                <br />
                <span>
                  {workspaceData.display_name ||
                    workspace.displayName}
                </span>
              </h1>

              <p>
                Your private Creator Cuts command
                center.
              </p>
            </div>

            <div className="cw-live">
              <span />
              Workspace active
            </div>
          </div>

          {/* WORKSPACE OVERVIEW */}

          <section className="cw-overview-card">
            <div className="cw-overview-left">
              <div className="cw-card-label">
                WORKSPACE
              </div>

              <h2>
                {workspaceData.display_name ||
                  workspace.displayName}
              </h2>

              <p>
                @
                {(
                  workspaceData.channel_name ||
                  workspace.channel ||
                  ""
                ).replace(/^@/, "")}
              </p>
            </div>

            <div className="cw-big-avatar">
              {(
                workspaceData.display_name ||
                workspace.displayName ||
                "C"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="cw-overview-footer">
              <div>
                <span className="cw-status-dot" />
                Connected to Creator Cuts
              </div>

              <span>Private</span>
            </div>
          </section>

          {/* QUICK STATS */}

          <section className="cw-stats-grid">
            <StatCard
              label="CLIPS"
              value={clips.length}
              note="Content items"
            />

            <StatCard
              label="TASKS"
              value={pendingTasks}
              note={
                pendingTasks === 1
                  ? "Task remaining"
                  : "Tasks remaining"
              }
            />

            <StatCard
              label="VIEWS"
              value={formatNumber(totalViews)}
              note="Recorded views"
            />

            <StatCard
              label="LIKES"
              value={formatNumber(totalLikes)}
              note="Recorded likes"
            />
          </section>

          {/* ANALYTICS */}

          <section className="cw-section">
            <div className="cw-section-head">
              <div>
                <div className="cw-card-label">
                  PERFORMANCE
                </div>

                <h2>Analytics</h2>
              </div>

              <div className="cw-section-actions">
                <span className="cw-section-count">
                  {analytics.length}{" "}
                  {analytics.length === 1 ? "record" : "records"}
                </span>

                <button
                  className="cw-add-button"
                  onClick={openAddAnalytics}
                  disabled={clips.length === 0}
                >
                  <span>+</span>
                  Add analytics
                </button>
              </div>
            </div>

            <div className="cw-analytics-grid">
              <Metric
                label="Views"
                value={formatNumber(totalViews)}
              />

              <Metric
                label="Likes"
                value={formatNumber(totalLikes)}
              />

              <Metric
                label="Comments"
                value={formatNumber(totalComments)}
              />

              <Metric
                label="Shares"
                value={formatNumber(totalShares)}
              />
            </div>

            <div className="cw-chart-card">
              <div className="cw-chart-head">
                <div>
                  <div className="cw-chart-kicker">TREND</div>
                  <h3>Performance over time</h3>
                  <p>Track how your recorded performance is moving.</p>
                </div>

                <div className="cw-chart-controls">
                  <div className="cw-chart-tabs" role="tablist" aria-label="Analytics metric">
                    {[['views', 'Views'], ['likes', 'Likes'], ['comments', 'Comments'], ['shares', 'Shares']].map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        className={analyticsMetric === key ? "active" : ""}
                        onClick={() => setAnalyticsMetric(key)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="cw-chart-range" aria-label="Analytics range">
                    {[['7d', '7D'], ['30d', '30D'], ['90d', '90D'], ['all', 'ALL']].map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        className={analyticsRange === key ? "active" : ""}
                        onClick={() => setAnalyticsRange(key)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="cw-chart-summary">
                <div>
                  <span>Latest</span>
                  <strong>{formatNumber(chartLast)}</strong>
                </div>
                <div>
                  <span>Peak</span>
                  <strong>{formatNumber(chartPeak)}</strong>
                </div>
                <div>
                  <span>Change</span>
                  <strong className={chartChange === null ? "" : chartChange >= 0 ? "positive" : "negative"}>
                    {chartChange === null
                      ? "—"
                      : `${chartChange >= 0 ? "+" : ""}${chartChange.toFixed(1)}%`}
                  </strong>
                </div>
              </div>

              {analyticsChart.length === 0 ? (
                <div className="cw-chart-empty">
                  <div className="cw-chart-empty-icon">⌁</div>
                  <strong>No data in this range</strong>
                  <span>Add an analytics snapshot or choose a wider range.</span>
                </div>
              ) : (
                <AnalyticsChart
                  data={analyticsChart}
                  metric={analyticsMetric}
                />
              )}
            </div>

            {analytics.length === 0 ? (
              <div className="cw-empty">
                <div className="cw-empty-icon">↗</div>

                <strong>No analytics yet</strong>

                <span>
                  Add performance numbers to start tracking your clips.
                </span>

                {clips.length > 0 ? (
                  <button
                    className="cw-empty-action"
                    onClick={openAddAnalytics}
                  >
                    Add your first record
                    <span>→</span>
                  </button>
                ) : (
                  <span>Create a clip first.</span>
                )}
              </div>
            ) : (
              <div className="cw-list">
                {analytics.map((item) => {
                  const clip = clips.find(
                    (c) => c.id === item.clip_id
                  );

                  return (
                    <div
                      className="cw-list-item"
                      key={item.id}
                    >
                      <div className="cw-list-main">
                        <strong>
                          {clip?.title || "Untitled clip"}
                        </strong>

                        <span>
                          {item.recorded_at
                            ? new Date(
                                item.recorded_at
                              ).toLocaleString()
                            : "No date"}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "18px",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>
                          👁 {formatNumber(item.views)}
                        </span>

                        <span>
                          ♥ {formatNumber(item.likes)}
                        </span>

                        <span>
                          💬 {formatNumber(item.comments)}
                        </span>

                        <span>
                          ↗ {formatNumber(item.shares)}
                        </span>
                      </div>

                      <div className="cw-clip-actions">
                        <button
                          type="button"
                          onClick={() => openEditAnalytics(item)}
                          disabled={
                            analyticsDeleting === item.id
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="cw-delete-button"
                          onClick={() => deleteAnalytics(item)}
                          disabled={
                            analyticsDeleting === item.id
                          }
                        >
                          {analyticsDeleting === item.id
                            ? "Deleting…"
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {latestAnalytics && (
              <div className="cw-latest">
                <div>
                  <span>Latest record</span>
                  <strong>
                    {latestRecordedAt
                      ? new Date(
                          latestRecordedAt
                        ).toLocaleString()
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>Clips tracked</span>
                  <strong>{analytics.length}</strong>
                </div>
              </div>
            )}
          </section>

          {/* ================================================= */}
          {/* CLIPS */}
          {/* ================================================= */}

          <section className="cw-section">
            <div className="cw-section-head">
              <div>
                <div className="cw-card-label">
                  CONTENT
                </div>

                <h2>Clips</h2>
              </div>

              <div className="cw-section-actions cw-content-actions">
                <span className="cw-section-count">
                  {filteredClips.length}/{clips.length}
                </span>

                <button
                  className="cw-add-button"
                  onClick={openAddClip}
                >
                  <span>+</span>
                  Add clip
                </button>
              </div>
            </div>

            <div className="cw-content-toolbar">
              <div className="cw-content-search">
                <span>⌕</span>
                <input
                  value={clipSearch}
                  onChange={(e) => setClipSearch(e.target.value)}
                  placeholder="Search clips…"
                  aria-label="Search clips"
                />
                {clipSearch && (
                  <button type="button" onClick={() => setClipSearch("")}>
                    ×
                  </button>
                )}
              </div>

              <div className="cw-content-filters">
                <select
                  value={clipFilter}
                  onChange={(e) => setClipFilter(e.target.value)}
                  aria-label="Filter clips by status"
                >
                  <option value="all">All statuses</option>
                  {clipStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={clipSort}
                  onChange={(e) => setClipSort(e.target.value)}
                  aria-label="Sort clips"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="az">A–Z</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="cw-dashboard-error">
                <span>!</span>
                {error}

                <button
                  onClick={() => setError("")}
                >
                  ×
                </button>
              </div>
            )}

            {clips.length === 0 ? (
              <div className="cw-empty cw-empty-large">
                <div className="cw-empty-icon">
                  ◫
                </div>

                <strong>No clips yet</strong>

                <span>
                  Add your first piece of content to
                  start building your workspace.
                </span>

                <button
                  className="cw-empty-action"
                  onClick={openAddClip}
                >
                  Add your first clip
                  <span>→</span>
                </button>
              </div>
            ) : (
              <div className="cw-clip-list">
                {filteredClips.map((clip) => (
                  <div
                    className="cw-clip-item"
                    key={clip.id}
                  >
                    <div className="cw-clip-icon">
                      ▶
                    </div>

                    <div className="cw-clip-main">
                      <div className="cw-clip-title-row">
                        <strong>
                          {clip.title ||
                            "Untitled clip"}
                        </strong>

                        <StatusBadge
                          status={clip.status}
                        />
                      </div>

                      <div className="cw-clip-meta">
                        {clip.platform && (
                          <span>
                            {clip.platform}
                          </span>
                        )}

                        {clip.url && (
                          <a
                            href={clip.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                          >
                            Open link ↗
                          </a>
                        )}

                        <span>
                          {formatDate(
                            clip.created_at
                          )}
                        </span>
                      </div>

                      {clip.notes && (
                        <p className="cw-clip-notes">
                          {clip.notes}
                        </p>
                      )}
                    </div>

                    <div className="cw-clip-actions">
                      <button
                        type="button"
                        className="cw-view-button"
                        onClick={() =>
                          openClipDetails(clip)
                        }
                      >
                        View
                      </button>

                      <button
                        onClick={() =>
                          openEditClip(clip)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="cw-delete-button"
                        disabled={
                          clipDeleting === clip.id
                        }
                        onClick={() =>
                          deleteClip(clip)
                        }
                      >
                        {clipDeleting === clip.id
                          ? "Deleting…"
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {clips.length > 0 && filteredClips.length === 0 && (
              <div className="cw-filter-empty">
                <div className="cw-empty-icon">⌕</div>
                <strong>No matching clips</strong>
                <span>Try a different search or status filter.</span>
                <button
                  className="cw-empty-action"
                  onClick={() => {
                    setClipSearch("");
                    setClipFilter("all");
                  }}
                >
                  Clear filters <span>→</span>
                </button>
              </div>
            )}
          </section>

          {/* CONTENT + TASKS */}

          <section className="cw-two-column">

            {/* TASK WORKFLOW */}

            <div className="cw-section cw-task-workflow-section">
              <div className="cw-section-head">
                <div>
                  <div className="cw-card-label">
                    PRODUCTION WORKFLOW
                  </div>
                  <h2>Tasks</h2>
                  <p className="cw-section-subtitle">
                    Drag tasks through your production pipeline.
                  </p>
                </div>

                <div className="cw-section-actions">
                  <span className="cw-section-count">
                    {completedTasks}/{tasks.length} done
                  </span>

                  <button
                    className="cw-add-button"
                    onClick={openAddTask}
                  >
                    <span>+</span>
                    Add task
                  </button>
                </div>
              </div>

              {tasks.length === 0 ? (
                <div className="cw-empty">
                  <div className="cw-empty-icon">✓</div>
                  <strong>No tasks yet</strong>
                  <span>
                    Create a task to start building your production pipeline.
                  </span>
                  <button
                    className="cw-empty-action"
                    onClick={openAddTask}
                  >
                    Create your first task
                    <span>→</span>
                  </button>
                </div>
              ) : (
                <div className="cw-kanban">
                  {TASK_STAGES.map((stage) => {
                    const stageTasks = getTasksForStage(stage.id);
                    const isDropTarget = taskDropStage === stage.id;

                    return (
                      <div
                        className={`cw-kanban-column ${
                          isDropTarget ? "cw-kanban-drop-target" : ""
                        }`}
                        key={stage.id}
                        onDragOver={(e) => handleTaskDragOver(e, stage.id)}
                        onDrop={(e) => handleTaskDrop(e, stage.id)}
                        onDragLeave={(e) => {
                          if (e.currentTarget === e.target) {
                            setTaskDropStage(null);
                          }
                        }}
                      >
                        <div className="cw-kanban-column-head">
                          <div>
                            <span className={`cw-stage-dot cw-stage-${stage.id}`} />
                            <strong>{stage.label}</strong>
                          </div>
                          <span>{stageTasks.length}</span>
                        </div>

                        <span className="cw-kanban-hint">{stage.hint}</span>

                        <div className="cw-kanban-cards">
                          {stageTasks.map((task) => (
                            <article
                              className={`cw-kanban-card ${
                                draggedTaskId === task.id
                                  ? "cw-kanban-card-dragging"
                                  : ""
                              } ${task.completed ? "cw-kanban-card-done" : ""}`}
                              key={task.id}
                              draggable
                              onDragStart={() => handleTaskDragStart(task)}
                              onDragEnd={handleTaskDragEnd}
                            >
                              <div className="cw-kanban-card-top">
                                <button
                                  type="button"
                                  className={`cw-task-check cw-task-check-button ${
                                    task.completed ? "is-checked" : ""
                                  }`}
                                  onClick={() => toggleTask(task)}
                                  disabled={
                                    taskToggling === task.id ||
                                    taskDeleting === task.id
                                  }
                                  aria-label={
                                    task.completed
                                      ? "Mark task incomplete"
                                      : "Mark task complete"
                                  }
                                >
                                  {taskToggling === task.id ? (
                                    <span className="cw-mini-spinner" />
                                  ) : task.completed ? (
                                    "✓"
                                  ) : (
                                    ""
                                  )}
                                </button>

                                <span className="cw-drag-handle" title="Drag task">
                                  ⋮⋮
                                </span>
                              </div>

                              <strong className="cw-kanban-title">
                                {task.title || "Untitled task"}
                              </strong>

                              {task.description && (
                                <p className="cw-kanban-description">
                                  {task.description}
                                </p>
                              )}

                              <div className="cw-kanban-meta">
                                {task.priority && (
                                  <span
                                    className={`cw-priority-badge cw-priority-${String(
                                      task.priority
                                    ).toLowerCase()}`}
                                  >
                                    {task.priority}
                                  </span>
                                )}

                                {task.due_date && (
                                  <span className="cw-kanban-due">
                                    {formatDate(task.due_date)}
                                  </span>
                                )}
                              </div>

                              <div className="cw-kanban-actions">
                                <button
                                  type="button"
                                  onClick={() => openEditTask(task)}
                                  disabled={
                                    taskToggling === task.id ||
                                    taskDeleting === task.id
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="cw-delete-button"
                                  onClick={() => deleteTask(task)}
                                  disabled={
                                    taskDeleting === task.id ||
                                    taskToggling === task.id
                                  }
                                >
                                  {taskDeleting === task.id
                                    ? "Deleting…"
                                    : "Delete"}
                                </button>
                              </div>
                            </article>
                          ))}

                          {stageTasks.length === 0 && (
                            <div className="cw-kanban-empty">
                              Drop tasks here
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </section>
        </main>

        {/* CLIP DETAILS MODAL */}

        {selectedClip && (() => {
          const clipAnalytics = analytics
            .filter((item) => item.clip_id === selectedClip.id)
            .sort((a, b) => new Date(b.recorded_at || 0) - new Date(a.recorded_at || 0));

          const latest = clipAnalytics[0] || null;
          const previous = clipAnalytics[1] || null;
          const change = (key) => previous && latest
            ? Number(latest[key] || 0) - Number(previous[key] || 0)
            : null;

          return (
            <div
              className="cw-modal-backdrop"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) closeClipDetails();
              }}
            >
              <div className="cw-modal cw-clip-detail-modal">
                <div className="cw-modal-head">
                  <div>
                    <div className="cw-card-label">CLIP DETAILS</div>
                    <h2>{selectedClip.title || "Untitled clip"}</h2>
                  </div>
                  <button className="cw-modal-close" onClick={closeClipDetails} type="button">×</button>
                </div>

                <div className="cw-clip-detail-top">
                  <div><span>STATUS</span><StatusBadge status={selectedClip.status} /></div>
                  <div><span>PLATFORM</span><strong>{selectedClip.platform || "—"}</strong></div>
                  <div><span>CREATED</span><strong>{formatDate(selectedClip.created_at)}</strong></div>
                </div>

                {selectedClip.url && (
                  <a className="cw-clip-detail-link" href={selectedClip.url} target="_blank" rel="noreferrer">
                    Open original link ↗
                  </a>
                )}

                {selectedClip.notes && (
                  <div className="cw-clip-detail-notes">
                    <span>NOTES</span>
                    <p>{selectedClip.notes}</p>
                  </div>
                )}

                <div className="cw-clip-detail-section-head">
                  <div>
                    <div className="cw-card-label">PERFORMANCE</div>
                    <h3>Analytics history</h3>
                  </div>
                  <button type="button" className="cw-add-button" onClick={() => openAnalyticsForClip(selectedClip)}>
                    <span>+</span> Add snapshot
                  </button>
                </div>

                {latest ? (
                  <>
                    <div className="cw-clip-detail-metrics">
                      {[
                        ["Views", "views", "👁"],
                        ["Likes", "likes", "♥"],
                        ["Comments", "comments", "💬"],
                        ["Shares", "shares", "↗"],
                      ].map(([label, key, icon]) => {
                        const delta = change(key);
                        return (
                          <div className="cw-detail-metric" key={key}>
                            <span>{icon} {label}</span>
                            <strong>{formatNumber(latest[key])}</strong>
                            {delta !== null && (
                              <small className={delta >= 0 ? "cw-delta-up" : "cw-delta-down"}>
                                {delta >= 0 ? "+" : ""}{formatNumber(delta)} vs previous
                              </small>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="cw-history-list">
                      {clipAnalytics.map((item) => (
                        <div className="cw-history-row" key={item.id}>
                          <div>
                            <strong>{item.recorded_at ? new Date(item.recorded_at).toLocaleString() : "No date"}</strong>
                            <span>
                              {formatNumber(item.views)} views · {formatNumber(item.likes)} likes · {formatNumber(item.comments)} comments · {formatNumber(item.shares)} shares
                            </span>
                          </div>
                          <button type="button" onClick={() => { closeClipDetails(); openEditAnalytics(item); }}>Edit</button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="cw-empty cw-detail-empty">
                    <div className="cw-empty-icon">↗</div>
                    <strong>No analytics for this clip</strong>
                    <span>Add the first performance snapshot.</span>
                    <button type="button" className="cw-empty-action" onClick={() => openAnalyticsForClip(selectedClip)}>
                      Add first snapshot <span>→</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ANALYTICS MODAL */}

        {analyticsModal && (
          <div
            className="cw-modal-backdrop"
            onMouseDown={(e) => {
              if (
                e.target === e.currentTarget &&
                !analyticsSaving
              ) {
                closeAnalyticsModal();
              }
            }}
          >
            <div className="cw-modal cw-task-modal">
              <div className="cw-modal-head">
                <div>
                  <div className="cw-card-label">
                    {editingAnalytics
                      ? "EDIT ANALYTICS"
                      : "NEW ANALYTICS"}
                  </div>

                  <h2>
                    {editingAnalytics
                      ? "Edit performance"
                      : "Add performance"}
                  </h2>
                </div>

                <button
                  className="cw-modal-close"
                  onClick={closeAnalyticsModal}
                  disabled={analyticsSaving}
                  type="button"
                >
                  ×
                </button>
              </div>

              <form
                className="cw-clip-form"
                onSubmit={saveAnalytics}
              >
                <div className="cw-form-field cw-full">
                  <label>CLIP</label>

                  <select
                    value={analyticsForm.clip_id}
                    onChange={(e) =>
                      updateAnalyticsForm(
                        "clip_id",
                        e.target.value
                      )
                    }
                    disabled={analyticsSaving}
                  >
                    <option value="">
                      Select a clip
                    </option>

                    {clips.map((clip) => (
                      <option
                        key={clip.id}
                        value={clip.id}
                      >
                        {clip.title || "Untitled clip"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cw-form-field cw-full">
                  <label>RECORDED AT</label>

                  <input
                    type="datetime-local"
                    value={analyticsForm.recorded_at}
                    onChange={(e) =>
                      updateAnalyticsForm(
                        "recorded_at",
                        e.target.value
                      )
                    }
                    disabled={analyticsSaving}
                  />
                </div>

                <div className="cw-form-row">
                  <div className="cw-form-field">
                    <label>VIEWS</label>

                    <input
                      type="number"
                      min="0"
                      value={analyticsForm.views}
                      onChange={(e) =>
                        updateAnalyticsForm(
                          "views",
                          e.target.value
                        )
                      }
                      disabled={analyticsSaving}
                      placeholder="0"
                    />
                  </div>

                  <div className="cw-form-field">
                    <label>LIKES</label>

                    <input
                      type="number"
                      min="0"
                      value={analyticsForm.likes}
                      onChange={(e) =>
                        updateAnalyticsForm(
                          "likes",
                          e.target.value
                        )
                      }
                      disabled={analyticsSaving}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="cw-form-row">
                  <div className="cw-form-field">
                    <label>COMMENTS</label>

                    <input
                      type="number"
                      min="0"
                      value={analyticsForm.comments}
                      onChange={(e) =>
                        updateAnalyticsForm(
                          "comments",
                          e.target.value
                        )
                      }
                      disabled={analyticsSaving}
                      placeholder="0"
                    />
                  </div>

                  <div className="cw-form-field">
                    <label>SHARES</label>

                    <input
                      type="number"
                      min="0"
                      value={analyticsForm.shares}
                      onChange={(e) =>
                        updateAnalyticsForm(
                          "shares",
                          e.target.value
                        )
                      }
                      disabled={analyticsSaving}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="cw-modal-footer">
                  <button
                    type="button"
                    className="cw-cancel"
                    onClick={closeAnalyticsModal}
                    disabled={analyticsSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="cw-save"
                    disabled={
                      analyticsSaving ||
                      !analyticsForm.clip_id ||
                      clips.length === 0
                    }
                  >
                    {analyticsSaving ? (
                      <>
                        <span className="cw-button-spinner" />
                        Saving…
                      </>
                    ) : (
                      <>
                        {editingAnalytics
                          ? "Save changes"
                          : "Add analytics"}
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TASK MODAL */}


        {taskModal && (
          <div
            className="cw-modal-backdrop"
            onMouseDown={(e) => {
              if (
                e.target === e.currentTarget &&
                !taskSaving
              ) {
                closeTaskModal();
              }
            }}
          >
            <div className="cw-modal cw-task-modal">
              <div className="cw-modal-head">
                <div>
                  <div className="cw-card-label">
                    {editingTask
                      ? "EDIT TASK"
                      : "NEW TASK"}
                  </div>

                  <h2>
                    {editingTask
                      ? "Edit task"
                      : "Create a task"}
                  </h2>
                </div>

                <button
                  className="cw-modal-close"
                  onClick={closeTaskModal}
                  disabled={taskSaving}
                  type="button"
                >
                  ×
                </button>
              </div>

              <form
                className="cw-clip-form"
                onSubmit={saveTask}
              >
                <div className="cw-form-field cw-full">
                  <label>TASK TITLE</label>

                  <input
                    value={taskForm.title}
                    onChange={(e) =>
                      updateTaskForm(
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="e.g. Edit today's short"
                    autoFocus
                    disabled={taskSaving}
                  />
                </div>

                <div className="cw-form-field cw-full">
                  <label>DESCRIPTION</label>

                  <textarea
                    value={taskForm.description}
                    onChange={(e) =>
                      updateTaskForm(
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="What needs to be done?"
                    rows={4}
                    disabled={taskSaving}
                  />
                </div>

                <div className="cw-form-row">
                  <div className="cw-form-field">
                    <label>PRIORITY</label>

                    <select
                      value={taskForm.priority}
                      onChange={(e) =>
                        updateTaskForm(
                          "priority",
                          e.target.value
                        )
                      }
                      disabled={taskSaving}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="cw-form-field">
                    <label>DUE DATE</label>

                    <input
                      type="date"
                      value={taskForm.due_date}
                      onChange={(e) =>
                        updateTaskForm(
                          "due_date",
                          e.target.value
                        )
                      }
                      disabled={taskSaving}
                    />
                  </div>
                </div>

                <div className="cw-modal-footer">
                  <button
                    type="button"
                    className="cw-cancel"
                    onClick={closeTaskModal}
                    disabled={taskSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="cw-save"
                    disabled={
                      taskSaving ||
                      !taskForm.title.trim()
                    }
                  >
                    {taskSaving ? (
                      <>
                        <span className="cw-button-spinner" />
                        Saving…
                      </>
                    ) : (
                      <>
                        {editingTask
                          ? "Save changes"
                          : "Create task"}
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* NOTE MODAL */}

        {noteModal && (
          <div
            className="cw-modal-backdrop"
            onMouseDown={(e) => {
              if (
                e.target === e.currentTarget &&
                !noteSaving
              ) {
                closeNoteModal();
              }
            }}
          >
            <div className="cw-modal cw-note-modal">
              <div className="cw-modal-head">
                <div>
                  <div className="cw-card-label">
                    {editingNote ? "EDIT NOTE" : "NEW NOTE"}
                  </div>

                  <h2>
                    {editingNote ? "Edit note" : "Create a note"}
                  </h2>
                </div>

                <button
                  className="cw-modal-close"
                  onClick={closeNoteModal}
                  disabled={noteSaving}
                  type="button"
                >
                  ×
                </button>
              </div>

              <form
                className="cw-clip-form"
                onSubmit={saveNote}
              >
                <div className="cw-form-field cw-full">
                  <label>NOTE TITLE</label>

                  <input
                    value={noteForm.title}
                    onChange={(e) =>
                      updateNoteForm("title", e.target.value)
                    }
                    placeholder="e.g. Video ideas"
                    autoFocus
                    disabled={noteSaving}
                  />
                </div>

                <div className="cw-form-field cw-full">
                  <label>CONTENT</label>

                  <textarea
                    value={noteForm.content}
                    onChange={(e) =>
                      updateNoteForm("content", e.target.value)
                    }
                    placeholder="Write anything you want to remember..."
                    rows={10}
                    disabled={noteSaving}
                  />
                </div>

                <div className="cw-modal-footer">
                  <button
                    type="button"
                    className="cw-cancel"
                    onClick={closeNoteModal}
                    disabled={noteSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="cw-save"
                    disabled={
                      noteSaving ||
                      !noteForm.title.trim() ||
                      !noteForm.content.trim()
                    }
                  >
                    {noteSaving ? (
                      <>
                        <span className="cw-button-spinner" />
                        Saving…
                      </>
                    ) : (
                      <>
                        {editingNote ? "Save changes" : "Create note"}
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CLIP MODAL */}

        {clipModal && (
          <div
            className="cw-modal-backdrop"
            onMouseDown={(e) => {
              if (
                e.target === e.currentTarget &&
                !clipSaving
              ) {
                closeClipModal();
              }
            }}
          >
            <div className="cw-modal">
              <div className="cw-modal-head">
                <div>
                  <div className="cw-card-label">
                    {editingClip
                      ? "EDIT CONTENT"
                      : "NEW CONTENT"}
                  </div>

                  <h2>
                    {editingClip
                      ? "Edit clip"
                      : "Add a clip"}
                  </h2>
                </div>

                <button
                  className="cw-modal-close"
                  onClick={closeClipModal}
                  disabled={clipSaving}
                >
                  ×
                </button>
              </div>

              <form
                className="cw-clip-form"
                onSubmit={saveClip}
              >
                <div className="cw-form-field cw-full">
                  <label>CLIP TITLE</label>

                  <input
                    value={clipForm.title}
                    onChange={(e) =>
                      updateClipForm(
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="e.g. Best moments from stream"
                    autoFocus
                    disabled={clipSaving}
                  />
                </div>

                <div className="cw-form-row">
                  <div className="cw-form-field">
                    <label>PLATFORM</label>

                    <select
                      value={clipForm.platform}
                      onChange={(e) =>
                        updateClipForm(
                          "platform",
                          e.target.value
                        )
                      }
                      disabled={clipSaving}
                    >
                      <option value="">
                        Select platform
                      </option>
                      <option value="YouTube">
                        YouTube
                      </option>
                      <option value="TikTok">
                        TikTok
                      </option>
                      <option value="Instagram">
                        Instagram
                      </option>
                      <option value="X">
                        X
                      </option>
                      <option value="Facebook">
                        Facebook
                      </option>
                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  <div className="cw-form-field">
                    <label>STATUS</label>

                    <select
                      value={clipForm.status}
                      onChange={(e) =>
                        updateClipForm(
                          "status",
                          e.target.value
                        )
                      }
                      disabled={clipSaving}
                    >
                      <option value="idea">
                        Idea
                      </option>
                      <option value="editing">
                        Editing
                      </option>
                      <option value="ready">
                        Ready
                      </option>
                      <option value="published">
                        Published
                      </option>
                      <option value="archived">
                        Archived
                      </option>
                    </select>
                  </div>
                </div>

                <div className="cw-form-field cw-full">
                  <label>VIDEO URL</label>

                  <input
                    type="url"
                    value={clipForm.url}
                    onChange={(e) =>
                      updateClipForm(
                        "url",
                        e.target.value
                      )
                    }
                    placeholder="https://..."
                    disabled={clipSaving}
                  />
                </div>

                <div className="cw-form-field cw-full">
                  <label>NOTES</label>

                  <textarea
                    value={clipForm.notes}
                    onChange={(e) =>
                      updateClipForm(
                        "notes",
                        e.target.value
                      )
                    }
                    placeholder="Anything you want to remember about this clip..."
                    rows={4}
                    disabled={clipSaving}
                  />
                </div>

                <div className="cw-modal-footer">
                  <button
                    type="button"
                    className="cw-cancel"
                    onClick={closeClipModal}
                    disabled={clipSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="cw-save"
                    disabled={
                      clipSaving ||
                      !clipForm.title.trim()
                    }
                  >
                    {clipSaving ? (
                      <>
                        <span className="cw-button-spinner" />
                        Saving…
                      </>
                    ) : (
                      <>
                        {editingClip
                          ? "Save changes"
                          : "Create clip"}
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {refreshing && (
          <div className="cw-refresh-indicator">
            <span className="cw-button-spinner" />
            Syncing
          </div>
        )}
      </div>
    </>
  );
}

// =========================================================
// SMALL COMPONENTS
// =========================================================

function StatCard({ label, value, note }) {
  return (
    <div className="cw-stat-card">
      <div className="cw-card-label">
        {label}
      </div>

      <div className="cw-stat-number">
        {value}
      </div>

      <div className="cw-stat-note">
        {note}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="cw-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusBadge({ status }) {
  const value = status || "idea";

  return (
    <span
      className={`cw-status-badge cw-status-${value}`}
    >
      {value}
    </span>
  );
}

function EmptyState({ icon, title, text }) {
  return (
    <div className="cw-empty">
      <div className="cw-empty-icon">
        {icon}
      </div>

      <strong>{title}</strong>

      <span>{text}</span>
    </div>
  );
}

// =========================================================
// HELPERS
// =========================================================

function formatNumber(value) {
  const number = Number(value || 0);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN", {
    notation:
      number >= 1000
        ? "compact"
        : "standard",
    maximumFractionDigits: 1,
  }).format(number);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildAnalyticsSeries(items, range, metric) {
  const now = new Date();
  const cutoff = new Date(now);

  if (range !== "all") {
    const days = Number.parseInt(range, 10);
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - (days - 1));
  }

  const grouped = new Map();

  items.forEach((item) => {
    if (!item?.recorded_at) return;

    const date = new Date(item.recorded_at);
    if (Number.isNaN(date.getTime())) return;
    if (range !== "all" && date < cutoff) return;

    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    const current = grouped.get(key) || {
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      value: 0,
    };

    current.value += Math.max(0, Number(item[metric]) || 0);
    grouped.set(key, current);
  });

  return Array.from(grouped.values())
    .sort((a, b) => a.date - b.date)
    .map((point) => ({
      ...point,
      label: point.date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
    }));
}

function AnalyticsChart({ data, metric }) {
  const width = 920;
  const height = 300;
  const padLeft = 58;
  const padRight = 24;
  const padTop = 24;
  const padBottom = 46;
  const innerWidth = width - padLeft - padRight;
  const innerHeight = height - padTop - padBottom;
  const maxValue = Math.max(...data.map((point) => point.value), 1);
  const stepX = data.length > 1 ? innerWidth / (data.length - 1) : 0;

  const points = data.map((point, index) => ({
    ...point,
    x: data.length === 1 ? padLeft + innerWidth / 2 : padLeft + index * stepX,
    y: padTop + innerHeight - (point.value / maxValue) * innerHeight,
  }));

  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padLeft},${padTop + innerHeight} ${line} ${padLeft + innerWidth},${padTop + innerHeight}`;
  const gridValues = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="cw-chart-wrap">
      <svg
        className="cw-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${metric} performance chart`}
      >
        <defs>
          <linearGradient id="cwChartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="cwChartStroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>
        </defs>

        {gridValues.map((ratio) => {
          const y = padTop + innerHeight - ratio * innerHeight;
          const value = maxValue * ratio;

          return (
            <g key={ratio}>
              <line
                x1={padLeft}
                x2={padLeft + innerWidth}
                y1={y}
                y2={y}
                className="cw-chart-gridline"
              />
              <text x={padLeft - 10} y={y + 4} textAnchor="end" className="cw-chart-label">
                {formatNumber(value)}
              </text>
            </g>
          );
        })}

        {data.length > 1 && (
          <polygon points={area} fill="url(#cwChartFill)" className="cw-chart-area" />
        )}

        <polyline
          points={line}
          fill="none"
          stroke="url(#cwChartStroke)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          className="cw-chart-line"
        />

        {points.map((point) => (
          <g key={`${point.label}-${point.x}`}>
            <circle cx={point.x} cy={point.y} r="7" className="cw-chart-point-ring" />
            <circle cx={point.x} cy={point.y} r="3.5" className="cw-chart-point" />
            <title>{`${point.label}: ${formatNumber(point.value)}`}</title>
          </g>
        ))}

        {points.map((point, index) => {
          const show = data.length <= 7 || index === 0 || index === data.length - 1 || index % Math.ceil(data.length / 6) === 0;
          if (!show) return null;

          return (
            <text
              key={`label-${point.x}`}
              x={point.x}
              y={height - 16}
              textAnchor="middle"
              className="cw-chart-label cw-chart-x-label"
            >
              {point.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: #07070B;
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  .cw-page {
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
    color: #F5F4F8;

    background:
      radial-gradient(
        circle at 78% 2%,
        rgba(124,58,237,.13),
        transparent 31%
      ),
      radial-gradient(
        circle at 8% 55%,
        rgba(217,70,239,.055),
        transparent 27%
      ),
      #07070B;

    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .cw-glow {
    position: fixed;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(100px);
    opacity: .12;
    z-index: 0;
  }

  .cw-glow-one {
    background: #7C3AED;
    top: -240px;
    right: -100px;
  }

  .cw-glow-two {
    background: #D946EF;
    bottom: -280px;
    left: -150px;
    opacity: .06;
  }

  .cw-nav {
    height: 76px;
    padding: 0 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255,255,255,.065);
    position: relative;
    z-index: 5;
    background: rgba(7,7,11,.62);
    backdrop-filter: blur(18px);
  }

  .cw-logo {
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .cw-logo-mark {
    width: 35px;
    height: 35px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg,#7C3AED,#D946EF);
    box-shadow: 0 8px 30px rgba(124,58,237,.28);
    color: white;
    font-size: 12px;
    font-weight: 900;
  }

  .cw-logo-name {
    font-size: 13px;
    font-weight: 850;
    letter-spacing: .08em;
  }

  .cw-logo-name span {
    color: #A78BFA;
  }

  .cw-logo-sub {
    margin-top: 3px;
    color: #555568;
    font-size: 8px;
    letter-spacing: .17em;
    font-weight: 700;
  }

  .cw-nav-right {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .cw-secure,
  .cw-live {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #77778A;
    font-size: 11px;
    font-weight: 650;
  }

  .cw-secure span,
  .cw-live span,
  .cw-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #34D399;
    box-shadow: 0 0 12px rgba(52,211,153,.8);
  }

  .cw-logout {
    border: 1px solid rgba(255,255,255,.10);
    background: rgba(255,255,255,.025);
    color: #A7A7B7;
    padding: 10px 16px;
    border-radius: 10px;
    transition: .2s ease;
  }

  .cw-logout:hover {
    color: white;
    border-color: rgba(167,139,250,.35);
    background: rgba(124,58,237,.08);
  }

  .cw-main {
    width: min(1180px, calc(100% - 48px));
    margin: 0 auto;
    padding: 68px 0 100px;
    position: relative;
    z-index: 1;
  }

  .cw-dashboard-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 42px;
  }

  .cw-badge,
  .cw-card-label {
    color: #A78BFA;
    font-size: 10px;
    letter-spacing: .17em;
    font-weight: 800;
  }

  .cw-dashboard-head h1 {
    font-size: clamp(44px, 6vw, 66px);
    line-height: .98;
    letter-spacing: -.045em;
    margin: 14px 0 16px;
  }

  .cw-dashboard-head h1 span {
    color: #C4B5FD;
  }

  .cw-dashboard-head p {
    color: #707084;
    margin: 0;
    font-size: 14px;
  }

  .cw-live {
    margin-bottom: 8px;
  }

  .cw-overview-card,
  .cw-section,
  .cw-stat-card {
    border: 1px solid rgba(255,255,255,.075);
    background: rgba(13,13,19,.72);
    box-shadow: 0 24px 80px rgba(0,0,0,.22);
  }

  .cw-overview-card {
    min-height: 190px;
    border-radius: 20px;
    padding: 30px;
    position: relative;
    overflow: hidden;
  }

  .cw-overview-card::after {
    content: "";
    position: absolute;
    width: 300px;
    height: 300px;
    right: -120px;
    top: -170px;
    border-radius: 50%;
    background: rgba(124,58,237,.08);
    filter: blur(30px);
  }

  .cw-overview-left h2 {
    margin: 10px 0 5px;
    font-size: 24px;
  }

  .cw-overview-left p {
    color: #666678;
    margin: 0;
    font-size: 13px;
  }

  .cw-big-avatar {
    position: absolute;
    right: 30px;
    top: 30px;
    width: 56px;
    height: 56px;
    border-radius: 15px;
    display: grid;
    place-items: center;
    color: #C4B5FD;
    font-size: 23px;
    font-weight: 800;
    background: rgba(124,58,237,.10);
    border: 1px solid rgba(139,92,246,.25);
  }

  .cw-overview-footer {
    position: absolute;
    left: 30px;
    right: 30px;
    bottom: 24px;
    padding-top: 18px;
    border-top: 1px solid rgba(255,255,255,.06);
    display: flex;
    justify-content: space-between;
    color: #69697A;
    font-size: 11px;
  }

  .cw-overview-footer div {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cw-stats-grid {
    display: grid;
    grid-template-columns: repeat(4,1fr);
    gap: 12px;
    margin: 12px 0;
  }

  .cw-stat-card {
    border-radius: 16px;
    padding: 22px;
    transition: transform .2s ease, border-color .2s ease;
  }

  .cw-stat-card:hover {
    transform: translateY(-2px);
    border-color: rgba(167,139,250,.18);
  }

  .cw-stat-number {
    margin-top: 10px;
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -.04em;
  }

  .cw-stat-note {
    color: #555568;
    font-size: 11px;
    margin-top: 5px;
  }

  .cw-section {
    border-radius: 20px;
    padding: 28px;
    margin-top: 12px;
  }

  .cw-section-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 22px;
  }

  .cw-section-head h2 {
    margin: 8px 0 0;
    font-size: 24px;
    letter-spacing: -.025em;
  }

  .cw-section-count {
    color: #555568;
    font-size: 11px;
  }

  .cw-analytics-grid {
    display: grid;
    grid-template-columns: repeat(4,1fr);
    gap: 10px;
  }
  .cw-chart-card {
    margin-top: 12px;
    padding: 22px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,.055);
    background: linear-gradient(145deg, rgba(124,58,237,.045), rgba(255,255,255,.018));
    overflow: hidden;
  }

  .cw-chart-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }

  .cw-chart-kicker {
    color: #8B7CCB;
    font-size: 9px;
    letter-spacing: .16em;
    font-weight: 800;
  }

  .cw-chart-head h3 {
    margin: 7px 0 4px;
    font-size: 18px;
    letter-spacing: -.02em;
  }

  .cw-chart-head p {
    margin: 0;
    color: #666678;
    font-size: 11px;
  }

  .cw-chart-controls {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .cw-chart-tabs,
  .cw-chart-range {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px;
    border-radius: 9px;
    background: rgba(255,255,255,.025);
    border: 1px solid rgba(255,255,255,.05);
  }

  .cw-chart-tabs button,
  .cw-chart-range button {
    border: 0;
    background: transparent;
    color: #68687A;
    border-radius: 7px;
    padding: 7px 9px;
    font-size: 10px;
    font-weight: 700;
    transition: .2s ease;
  }

  .cw-chart-range button {
    padding: 6px 9px;
    font-size: 9px;
    letter-spacing: .04em;
  }

  .cw-chart-tabs button:hover,
  .cw-chart-range button:hover {
    color: #BFAAFF;
    background: rgba(124,58,237,.07);
  }

  .cw-chart-tabs button.active,
  .cw-chart-range button.active {
    color: #F7F4FF;
    background: rgba(124,58,237,.18);
    box-shadow: inset 0 0 0 1px rgba(167,139,250,.12);
  }

  .cw-chart-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 18px;
  }

  .cw-chart-summary div {
    padding: 12px 14px;
    border-radius: 11px;
    background: rgba(255,255,255,.018);
    border: 1px solid rgba(255,255,255,.04);
  }

  .cw-chart-summary span {
    display: block;
    color: #5F5F70;
    font-size: 9px;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: .08em;
  }

  .cw-chart-summary strong {
    font-size: 15px;
  }

  .cw-chart-summary strong.positive {
    color: #7DE2B4;
  }

  .cw-chart-summary strong.negative {
    color: #F38B9A;
  }

  .cw-chart-wrap {
    width: 100%;
    margin-top: 8px;
    min-height: 250px;
  }

  .cw-chart {
    display: block;
    width: 100%;
    height: auto;
    min-height: 250px;
    overflow: visible;
  }

  .cw-chart-gridline {
    stroke: rgba(255,255,255,.055);
    stroke-width: 1;
    stroke-dasharray: 4 7;
  }

  .cw-chart-label {
    fill: #555568;
    font-size: 10px;
  }

  .cw-chart-line {
    stroke-dashoffset: 1;
    animation: cwChartDraw 1.1s cubic-bezier(.2,.7,.2,1) forwards;
    filter: drop-shadow(0 0 8px rgba(139,92,246,.25));
  }

  .cw-chart-area {
    animation: cwChartFade .8s ease forwards;
  }

  .cw-chart-point-ring {
    fill: rgba(167,139,250,.12);
    stroke: rgba(167,139,250,.08);
    stroke-width: 1;
    transition: r .2s ease, fill .2s ease;
  }

  .cw-chart-point {
    fill: #D8CCFF;
    stroke: #7C3AED;
    stroke-width: 2;
    transition: r .2s ease;
  }

  .cw-chart-point-ring:hover {
    r: 10;
  }

  .cw-chart-empty {
    min-height: 250px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    text-align: center;
  }

  .cw-chart-empty-icon {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    color: #BFAAFF;
    background: rgba(124,58,237,.10);
    border: 1px solid rgba(139,92,246,.15);
    font-size: 18px;
    margin-bottom: 5px;
  }

  .cw-chart-empty strong {
    font-size: 13px;
  }

  .cw-chart-empty span {
    color: #5F5F70;
    font-size: 11px;
  }

  @keyframes cwChartDraw {
    to { stroke-dashoffset: 0; }
  }

  @keyframes cwChartFade {
    from { opacity: 0; }
    to { opacity: 1; }
  }


  .cw-metric {
    padding: 22px;
    border-radius: 14px;
    background: rgba(255,255,255,.025);
    border: 1px solid rgba(255,255,255,.045);
  }

  .cw-metric span {
    display: block;
    color: #666678;
    font-size: 11px;
    margin-bottom: 10px;
  }

  .cw-metric strong {
    font-size: 26px;
  }

  .cw-latest {
    display: flex;
    gap: 50px;
    margin-top: 12px;
    padding: 18px 20px;
    border-radius: 13px;
    background: rgba(124,58,237,.045);
    border: 1px solid rgba(124,58,237,.10);
  }

  .cw-latest span {
    display: block;
    color: #666678;
    font-size: 10px;
    margin-bottom: 5px;
  }

  .cw-latest strong {
    font-size: 13px;
  }

  .cw-section-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .cw-add-button {
    border: 0;
    border-radius: 10px;
    padding: 10px 15px;
    color: white;
    font-size: 12px;
    font-weight: 750;
    background: linear-gradient(135deg,#7C3AED,#D946EF);
    box-shadow: 0 10px 28px rgba(124,58,237,.20);
    transition: .2s ease;
  }

  .cw-add-button:hover,
  .cw-empty-action:hover,
  .cw-save:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 35px rgba(124,58,237,.28);
  }

  .cw-add-button span {
    font-size: 16px;
    margin-right: 5px;
  }

  .cw-content-actions {
    flex-wrap: wrap;
  }

  .cw-content-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin: 14px 0 12px;
  }

  .cw-content-search {
    min-width: 220px;
    flex: 1;
    height: 40px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 0 12px;
    border: 1px solid rgba(255,255,255,.065);
    border-radius: 11px;
    background: rgba(255,255,255,.018);
    transition: .2s ease;
  }

  .cw-content-search:focus-within {
    border-color: rgba(167,139,250,.32);
    background: rgba(124,58,237,.035);
    box-shadow: 0 0 0 3px rgba(124,58,237,.06);
  }

  .cw-content-search > span {
    color: #73738a;
    font-size: 18px;
  }

  .cw-content-search input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: #eeeef5;
    font: inherit;
    font-size: 12px;
  }

  .cw-content-search input::placeholder {
    color: #5f5f72;
  }

  .cw-content-search button {
    border: 0;
    background: transparent;
    color: #77778b;
    cursor: pointer;
    font-size: 18px;
  }

  .cw-content-filters {
    display: flex;
    gap: 8px;
  }

  .cw-content-filters select {
    height: 40px;
    min-width: 125px;
    padding: 0 30px 0 11px;
    border: 1px solid rgba(255,255,255,.065);
    border-radius: 11px;
    background: rgba(255,255,255,.018);
    color: #b8b8c8;
    outline: 0;
    font: inherit;
    font-size: 11px;
  }

  .cw-filter-empty {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 8px;
    padding: 40px 20px;
    text-align: center;
    border: 1px dashed rgba(255,255,255,.07);
    border-radius: 14px;
    background: rgba(255,255,255,.012);
  }

  .cw-filter-empty span {
    color: #67677b;
    font-size: 11px;
  }

  .cw-clip-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .cw-clip-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    border: 1px solid rgba(255,255,255,.055);
    background: rgba(255,255,255,.018);
    border-radius: 13px;
    transition: .2s ease;
  }

  .cw-clip-item:hover {
    border-color: rgba(167,139,250,.20);
    background: rgba(124,58,237,.035);
  }

  .cw-clip-icon {
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: rgba(124,58,237,.10);
    color: #BFAAFF;
    font-size: 12px;
  }

  .cw-clip-main {
    min-width: 0;
    flex: 1;
  }

  .cw-clip-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .cw-clip-title-row strong {
    font-size: 14px;
  }

  .cw-clip-meta {
    display: flex;
    gap: 13px;
    margin-top: 6px;
    color: #626275;
    font-size: 11px;
  }

  .cw-clip-meta a {
    color: #A78BFA;
    text-decoration: none;
  }

  .cw-clip-meta a:hover {
    text-decoration: underline;
  }

  .cw-clip-notes {
    margin: 9px 0 0;
    color: #707084;
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cw-status-badge {
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: .06em;
    font-weight: 800;
    background: rgba(167,139,250,.10);
    color: #BBA8FF;
  }

  .cw-status-published {
    color: #6EE7B7;
    background: rgba(52,211,153,.08);
  }

  .cw-status-ready {
    color: #93C5FD;
    background: rgba(59,130,246,.08);
  }

  .cw-status-editing {
    color: #FCD34D;
    background: rgba(245,158,11,.08);
  }

  .cw-status-archived {
    color: #88889A;
    background: rgba(255,255,255,.06);
  }

  .cw-clip-actions {
    display: flex;
    gap: 7px;
  }

  .cw-view-button {
    color: #C4B5FD !important;
    border-color: rgba(167,139,250,.18) !important;
    background: rgba(139,92,246,.07) !important;
  }

  .cw-clip-detail-modal { width: min(760px, calc(100vw - 32px)); max-height: min(86vh, 820px); overflow-y: auto; }
  .cw-clip-detail-top { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
  .cw-clip-detail-top > div { padding: 13px; border: 1px solid rgba(255,255,255,.06); border-radius: 12px; background: rgba(255,255,255,.018); display: flex; flex-direction: column; gap: 7px; }
  .cw-clip-detail-top span, .cw-clip-detail-notes > span { font-size: 9px; letter-spacing: .12em; color: #77778A; font-weight: 800; }
  .cw-clip-detail-top strong { color: #E8E8F0; font-size: 12px; }
  .cw-clip-detail-link { display: inline-flex; margin: 2px 0 14px; color: #B9A7FF; font-size: 12px; }
  .cw-clip-detail-notes { padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,.05); background: rgba(255,255,255,.018); margin-bottom: 18px; }
  .cw-clip-detail-notes p { margin: 7px 0 0; color: #9A9AAD; line-height: 1.6; font-size: 12px; white-space: pre-wrap; }
  .cw-clip-detail-section-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 20px 0 12px; }
  .cw-clip-detail-section-head h3 { margin: 4px 0 0; font-size: 18px; color: #F1F1F5; }
  .cw-clip-detail-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .cw-detail-metric { padding: 13px; border-radius: 12px; border: 1px solid rgba(255,255,255,.06); background: rgba(255,255,255,.018); }
  .cw-detail-metric > span { display: block; color: #77778A; font-size: 10px; margin-bottom: 7px; }
  .cw-detail-metric strong { display: block; font-size: 19px; color: #F1F1F5; }
  .cw-detail-metric small { display: block; margin-top: 6px; font-size: 9px; }
  .cw-delta-up { color: #6EE7B7; } .cw-delta-down { color: #FCA5A5; }
  .cw-history-list { display: flex; flex-direction: column; gap: 7px; margin-top: 10px; }
  .cw-history-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 13px; border-radius: 11px; border: 1px solid rgba(255,255,255,.05); background: rgba(255,255,255,.015); }
  .cw-history-row > div { min-width: 0; }
  .cw-history-row strong, .cw-history-row span { display: block; }
  .cw-history-row strong { color: #E7E7EF; font-size: 11px; }
  .cw-history-row span { margin-top: 5px; color: #77778A; font-size: 10px; }
  .cw-history-row button { flex: 0 0 auto; border: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.025); color: #AFA0E8; padding: 7px 10px; border-radius: 8px; font-size: 10px; }
  .cw-detail-empty { margin-top: 8px; }

  .cw-clip-actions button {
    border: 1px solid rgba(255,255,255,.07);
    background: rgba(255,255,255,.025);
    color: #8B8B9D;
    padding: 8px 11px;
    border-radius: 8px;
    font-size: 10px;
    transition: .2s ease;
  }

  .cw-clip-actions button:hover {
    color: white;
    border-color: rgba(167,139,250,.25);
  }

  .cw-clip-actions .cw-delete-button:hover {
    color: #FCA5A5;
    border-color: rgba(239,68,68,.25);
  }

  .cw-clip-actions button:disabled {
    opacity: .5;
    cursor: wait;
  }

  .cw-two-column {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .cw-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .cw-list-item {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 13px;
    border-radius: 11px;
    background: rgba(255,255,255,.018);
    border: 1px solid rgba(255,255,255,.04);
  }

  .cw-list-icon,
  .cw-task-check {
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: rgba(124,58,237,.09);
    color: #BCA7FF;
    font-size: 11px;
  }

  .cw-task-check {
    border: 1px solid rgba(255,255,255,.09);
    background: transparent;
  }

  .cw-task-done .cw-task-check {
    background: rgba(52,211,153,.10);
    border-color: rgba(52,211,153,.20);
    color: #6EE7B7;
  }

  .cw-list-main {
    min-width: 0;
    flex: 1;
  }

  .cw-list-main strong {
    display: block;
    font-size: 12px;
  }

  .cw-list-main span {
    display: block;
    color: #606072;
    margin-top: 4px;
    font-size: 10px;
  }

  .cw-list-date {
    color: #555568;
    font-size: 10px;
    white-space: nowrap;
  }

  .cw-task-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .cw-task-title-row strong {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cw-task-item {
    transition:
      transform .2s ease,
      border-color .2s ease,
      background .2s ease,
      opacity .2s ease;
  }

  .cw-task-item:hover {
    transform: translateY(-1px);
    border-color: rgba(167,139,250,.18);
    background: rgba(124,58,237,.035);
  }

  .cw-task-done {
    opacity: .68;
  }

  .cw-task-done .cw-list-main strong {
    text-decoration: line-through;
    text-decoration-color: rgba(167,139,250,.45);
  }

  .cw-task-check-button {
    border: 1px solid rgba(255,255,255,.09);
    cursor: pointer;
    transition:
      transform .18s ease,
      background .18s ease,
      border-color .18s ease;
  }

  .cw-task-check-button:hover:not(:disabled) {
    transform: scale(1.06);
    border-color: rgba(167,139,250,.35);
    background: rgba(124,58,237,.10);
  }

  .cw-task-check-button:active:not(:disabled) {
    transform: scale(.94);
  }

  .cw-task-check-button:disabled {
    cursor: wait;
    opacity: .7;
  }

  .cw-mini-spinner {
    width: 11px;
    height: 11px;
    border: 2px solid rgba(255,255,255,.16);
    border-top-color: #A78BFA;
    border-radius: 50%;
    animation: cwSpin .65s linear infinite;
  }

  .cw-priority-badge {
    flex: 0 0 auto;
    padding: 4px 7px;
    border-radius: 999px;
    font-size: 8px;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: .06em;
    font-weight: 800;
  }

  .cw-priority-low {
    color: #86EFAC;
    background: rgba(34,197,94,.08);
  }

  .cw-priority-medium {
    color: #C4B5FD;
    background: rgba(124,58,237,.10);
  }

  .cw-priority-high {
    color: #FCD34D;
    background: rgba(245,158,11,.08);
  }

  .cw-priority-urgent {
    color: #FCA5A5;
    background: rgba(239,68,68,.10);
  }

  .cw-task-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 0 0 auto;
  }

  .cw-task-actions button {
    border: 1px solid rgba(255,255,255,.07);
    background: rgba(255,255,255,.025);
    color: #8B8B9D;
    padding: 7px 9px;
    border-radius: 8px;
    font-size: 9px;
    transition: .2s ease;
  }

  .cw-task-actions button:hover:not(:disabled) {
    color: white;
    border-color: rgba(167,139,250,.25);
    background: rgba(124,58,237,.06);
  }

  .cw-task-actions .cw-task-delete:hover:not(:disabled) {
    color: #FCA5A5;
    border-color: rgba(239,68,68,.25);
    background: rgba(239,68,68,.04);
  }

  .cw-task-actions button:disabled {
    opacity: .45;
    cursor: wait;
  }

  .cw-task-more {
    margin-top: 12px;
    text-align: center;
    color: #555568;
    font-size: 10px;
  }

  .cw-notes-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .cw-note {
    min-height: 130px;
    padding: 16px;
    border-radius: 12px;
    background: rgba(255,255,255,.018);
    border: 1px solid rgba(255,255,255,.045);
  }

  .cw-note-title {
    font-size: 12px;
    font-weight: 750;
    min-width: 0;
  }

  .cw-note-title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .cw-note-actions {
    display: flex;
    gap: 5px;
    opacity: 0;
    transform: translateY(-2px);
    transition: opacity .18s ease, transform .18s ease;
  }

  .cw-note:hover .cw-note-actions,
  .cw-note:focus-within .cw-note-actions {
    opacity: 1;
    transform: translateY(0);
  }

  .cw-note-actions button {
    border: 1px solid rgba(255,255,255,.07);
    background: rgba(255,255,255,.025);
    color: #777789;
    border-radius: 7px;
    padding: 5px 7px;
    font-size: 9px;
    transition: .18s ease;
  }

  .cw-note-actions button:hover {
    color: white;
    border-color: rgba(167,139,250,.25);
    background: rgba(124,58,237,.08);
  }

  .cw-note-actions .cw-note-delete:hover {
    color: #FCA5A5;
    border-color: rgba(239,68,68,.22);
    background: rgba(127,29,29,.12);
  }

  .cw-note-actions button:disabled {
    opacity: .45;
    cursor: wait;
  }

  .cw-note p {
    color: #666678;
    font-size: 11px;
    line-height: 1.6;
    margin: 9px 0;
  }

  .cw-note > span {
    color: #4F4F60;
    font-size: 9px;
  }

  .cw-empty {
    min-height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    gap: 8px;
    border-radius: 13px;
    border: 1px dashed rgba(255,255,255,.08);
    color: #666678;
  }

  .cw-empty-large {
    min-height: 230px;
  }

  .cw-empty-icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    margin-bottom: 3px;
    border-radius: 12px;
    background: rgba(124,58,237,.08);
    color: #A78BFA;
    font-size: 16px;
  }

  .cw-empty strong {
    color: #A3A3B2;
    font-size: 13px;
  }

  .cw-empty span {
    max-width: 330px;
    font-size: 11px;
  }

  .cw-empty-action {
    margin-top: 8px;
    border: 0;
    border-radius: 9px;
    padding: 10px 14px;
    color: white;
    background: linear-gradient(135deg,#7C3AED,#D946EF);
    font-size: 11px;
    font-weight: 750;
    transition: .2s ease;
  }

  .cw-empty-action span {
    margin-left: 5px;
  }

  .cw-dashboard-error {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 11px 13px;
    margin-bottom: 13px;
    border-radius: 10px;
    color: #FCA5A5;
    background: rgba(127,29,29,.15);
    border: 1px solid rgba(239,68,68,.20);
    font-size: 11px;
  }

  .cw-dashboard-error > span {
    width: 19px;
    height: 19px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: rgba(239,68,68,.15);
  }

  .cw-dashboard-error button {
    margin-left: auto;
    border: 0;
    background: transparent;
    color: #8F5151;
    font-size: 18px;
  }

  /* MODAL */

  .cw-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(2,2,6,.72);
    backdrop-filter: blur(14px);
    animation: cwFade .18s ease;
  }

  .cw-modal {
    width: min(570px, 100%);
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,.10);
    background:
      radial-gradient(
        circle at 90% 0%,
        rgba(124,58,237,.10),
        transparent 35%
      ),
      #0C0C12;
    box-shadow:
      0 40px 120px rgba(0,0,0,.65),
      0 0 80px rgba(124,58,237,.08);
    animation: cwModalIn .22s ease;
  }

  .cw-modal-head {
    display: flex;
    justify-content: space-between;
    padding: 25px 25px 20px;
    border-bottom: 1px solid rgba(255,255,255,.06);
  }

  .cw-modal-head h2 {
    margin: 8px 0 0;
    font-size: 24px;
    letter-spacing: -.03em;
  }

  .cw-modal-close {
    width: 34px;
    height: 34px;
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 9px;
    background: rgba(255,255,255,.025);
    color: #777789;
    font-size: 20px;
    transition: .2s ease;
  }

  .cw-modal-close:hover {
    color: white;
  }

  .cw-clip-form {
    padding: 25px;
  }

  .cw-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .cw-form-field {
    margin-bottom: 17px;
  }

  .cw-form-field label,
  .cw-login-card label {
    display: block;
    margin-bottom: 8px;
    color: #777789;
    font-size: 9px;
    letter-spacing: .14em;
    font-weight: 800;
  }

  .cw-form-field input,
  .cw-form-field textarea,
  .cw-form-field select,
  .cw-login-card input {
    width: 100%;
    border: 1px solid rgba(255,255,255,.09);
    outline: none;
    border-radius: 10px;
    padding: 12px 13px;
    color: #E8E7ED;
    background: rgba(255,255,255,.025);
    transition: .2s ease;
  }

  .cw-form-field textarea {
    resize: vertical;
    min-height: 95px;
  }

  .cw-form-field select {
    appearance: auto;
  }

  .cw-form-field input:focus,
  .cw-form-field textarea:focus,
  .cw-form-field select:focus,
  .cw-login-card input:focus {
    border-color: rgba(167,139,250,.45);
    box-shadow: 0 0 0 3px rgba(124,58,237,.08);
  }

  .cw-form-field input::placeholder,
  .cw-form-field textarea::placeholder,
  .cw-login-card input::placeholder {
    color: #4F4F60;
  }

  .cw-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 9px;
    padding-top: 7px;
  }

  .cw-cancel,
  .cw-save {
    border-radius: 9px;
    padding: 11px 16px;
    font-size: 11px;
    font-weight: 750;
  }

  .cw-cancel {
    color: #89899A;
    border: 1px solid rgba(255,255,255,.08);
    background: rgba(255,255,255,.025);
  }

  .cw-save {
    border: 0;
    color: white;
    background: linear-gradient(135deg,#7C3AED,#D946EF);
    box-shadow: 0 10px 28px rgba(124,58,237,.20);
    transition: .2s ease;
  }

  .cw-save:disabled {
    opacity: .45;
    cursor: not-allowed;
    transform: none;
  }

  .cw-save span:last-child {
    margin-left: 7px;
  }

  .cw-button-spinner,
  .cw-loader {
    display: inline-block;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,.25);
    border-top-color: white;
    animation: cwSpin .7s linear infinite;
  }

  .cw-button-spinner {
    width: 12px;
    height: 12px;
    margin-right: 7px;
    vertical-align: -2px;
  }

  .cw-loader {
    width: 28px;
    height: 28px;
    border-width: 3px;
  }

  .cw-refresh-indicator {
    position: fixed;
    right: 22px;
    bottom: 22px;
    z-index: 20;
    display: flex;
    align-items: center;
    padding: 9px 12px;
    border-radius: 999px;
    background: rgba(16,16,23,.92);
    border: 1px solid rgba(255,255,255,.08);
    color: #89899A;
    font-size: 10px;
    backdrop-filter: blur(15px);
  }

  /* LOGIN */

  .cw-login-area {
    min-height: calc(100vh - 76px);
    display: grid;
    place-items: center;
    padding: 50px 20px;
    position: relative;
    z-index: 1;
  }

  .cw-login-card {
    width: min(430px,100%);
    padding: 44px;
    text-align: center;
    border-radius: 22px;
    border: 1px solid rgba(255,255,255,.08);
    background: rgba(12,12,18,.76);
    box-shadow: 0 30px 100px rgba(0,0,0,.35);
    animation: cwModalIn .3s ease;
  }

  .cw-avatar {
    width: 58px;
    height: 58px;
    margin: 30px auto 18px;
    display: grid;
    place-items: center;
    border-radius: 16px;
    color: #D4C6FF;
    font-size: 24px;
    font-weight: 800;
    background: rgba(124,58,237,.12);
    border: 1px solid rgba(139,92,246,.25);
  }

  .cw-login-card h1 {
    margin: 0;
    font-size: 31px;
    letter-spacing: -.035em;
  }

  .cw-description {
    color: #686879;
    font-size: 12px;
    line-height: 1.7;
    margin: 10px 0 30px;
  }

  .cw-login-card form {
    text-align: left;
  }

  .cw-login-card input {
    margin-bottom: 12px;
  }

  .cw-error {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 10px 12px;
    margin-bottom: 12px;
    border-radius: 9px;
    color: #FCA5A5;
    background: rgba(127,29,29,.16);
    border: 1px solid rgba(239,68,68,.20);
    font-size: 10px;
  }

  .cw-error span {
    width: 18px;
    height: 18px;
    display: grid;
    place-items: center;
    flex: 0 0 18px;
    border-radius: 50%;
    background: rgba(239,68,68,.15);
  }

  .cw-enter {
    width: 100%;
    border: 0;
    border-radius: 10px;
    padding: 14px;
    color: white;
    font-weight: 800;
    font-size: 12px;
    background: linear-gradient(135deg,#7C3AED,#D946EF);
    box-shadow: 0 15px 35px rgba(124,58,237,.22);
    transition: .2s ease;
  }

  .cw-enter:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 40px rgba(124,58,237,.30);
  }

  .cw-enter:disabled {
    opacity: .6;
    cursor: wait;
    transform: none;
  }

  .cw-enter > span:last-child {
    margin-left: 7px;
  }

  .cw-protected {
    margin-top: 24px;
    color: #4F4F60;
    font-size: 9px;
  }

  .cw-protected span {
    color: #8B5CF6;
    margin-right: 5px;
  }

  .cw-loading-page {
    display: grid;
    place-items: center;
    align-content: center;
    gap: 13px;
    color: #6D6D7F;
    font-size: 11px;
  }

  @keyframes cwSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes cwFade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes cwModalIn {
    from {
      opacity: 0;
      transform: translateY(10px) scale(.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }


  .cw-section-subtitle {
    margin: 7px 0 0;
    color: rgba(255,255,255,.46);
    font-size: 13px;
    line-height: 1.5;
  }

  .cw-kanban {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 20px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .cw-kanban-column {
    min-width: 220px;
    min-height: 300px;
    padding: 13px;
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 16px;
    background: rgba(255,255,255,.018);
    transition: border-color .2s ease, background .2s ease, transform .2s ease;
  }

  .cw-kanban-drop-target {
    border-color: rgba(170,110,255,.55);
    background: rgba(150,90,255,.07);
  }

  .cw-kanban-column-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }

  .cw-kanban-column-head > div {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cw-kanban-column-head strong {
    font-size: 13px;
  }

  .cw-kanban-column-head > span:last-child {
    min-width: 23px;
    height: 23px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: rgba(255,255,255,.07);
    color: rgba(255,255,255,.68);
    font-size: 11px;
  }

  .cw-kanban-hint {
    display: block;
    margin: 6px 0 12px;
    color: rgba(255,255,255,.31);
    font-size: 10px;
    letter-spacing: .02em;
  }

  .cw-stage-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(255,255,255,.35);
    box-shadow: 0 0 12px currentColor;
  }

  .cw-stage-in_progress { background: #a96cff; }
  .cw-stage-ready { background: #61d7ff; }
  .cw-stage-done { background: #64e5a2; }

  .cw-kanban-cards {
    display: grid;
    gap: 9px;
  }

  .cw-kanban-card {
    padding: 12px;
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 13px;
    background: rgba(12,12,18,.72);
    box-shadow: 0 8px 24px rgba(0,0,0,.12);
    cursor: grab;
    transition: transform .18s ease, border-color .18s ease, opacity .18s ease;
  }

  .cw-kanban-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255,255,255,.14);
  }

  .cw-kanban-card:active { cursor: grabbing; }

  .cw-kanban-card-dragging {
    opacity: .45;
    transform: scale(.98);
  }

  .cw-kanban-card-done { opacity: .62; }

  .cw-kanban-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .cw-drag-handle {
    color: rgba(255,255,255,.23);
    font-size: 14px;
    letter-spacing: -3px;
    user-select: none;
  }

  .cw-kanban-title {
    display: block;
    font-size: 13px;
    line-height: 1.4;
  }

  .cw-kanban-description {
    margin: 7px 0 0;
    color: rgba(255,255,255,.42);
    font-size: 11px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .cw-kanban-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 11px;
  }

  .cw-kanban-due {
    color: rgba(255,255,255,.38);
    font-size: 10px;
  }

  .cw-kanban-actions {
    display: flex;
    gap: 6px;
    margin-top: 11px;
    padding-top: 9px;
    border-top: 1px solid rgba(255,255,255,.055);
  }

  .cw-kanban-actions button {
    flex: 1;
    min-height: 29px;
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 8px;
    background: rgba(255,255,255,.035);
    color: rgba(255,255,255,.62);
    font-size: 10px;
    cursor: pointer;
  }

  .cw-kanban-actions button:hover {
    background: rgba(255,255,255,.07);
    color: #fff;
  }

  .cw-kanban-actions .cw-delete-button:hover {
    color: #ff8f9b;
  }

  .cw-kanban-empty {
    min-height: 76px;
    display: grid;
    place-items: center;
    border: 1px dashed rgba(255,255,255,.065);
    border-radius: 11px;
    color: rgba(255,255,255,.22);
    font-size: 10px;
  }

  @media (max-width: 800px) {

    .cw-kanban {
      grid-template-columns: repeat(4, minmax(230px, 1fr));
      overflow-x: auto;
      scroll-snap-type: x proximity;
    }

    .cw-kanban-column {
      scroll-snap-align: start;
    }
    .cw-nav {
      padding: 0 20px;
    }

    .cw-main {
      width: min(100% - 28px, 680px);
      padding-top: 42px;
    }

    .cw-dashboard-head {
      align-items: flex-start;
      flex-direction: column;
      gap: 20px;
    }

    .cw-stats-grid,
    .cw-analytics-grid {
      grid-template-columns: 1fr 1fr;
    }

    .cw-two-column {
      grid-template-columns: 1fr;
    }

    .cw-clip-item {
      align-items: flex-start;
    }

    .cw-content-toolbar {
      align-items: stretch;
      flex-direction: column;
    }

    .cw-content-search {
      width: 100%;
      min-width: 0;
    }

    .cw-content-filters {
      width: 100%;
    }

    .cw-content-filters select {
      flex: 1;
      min-width: 0;
    }

    .cw-clip-detail-top { grid-template-columns: 1fr; }
    .cw-clip-detail-metrics { grid-template-columns: repeat(2, 1fr); }
    .cw-clip-detail-section-head { align-items: flex-start; flex-direction: column; }

    .cw-clip-actions {
      flex-direction: column;
    }

    .cw-overview-card {
      min-height: 205px;
    }
  }

  @media (max-width: 800px) {
    .cw-chart-head {
      flex-direction: column;
    }

    .cw-chart-controls {
      width: 100%;
      align-items: stretch;
    }

    .cw-chart-tabs,
    .cw-chart-range {
      width: 100%;
      justify-content: space-between;
    }

    .cw-chart-tabs button,
    .cw-chart-range button {
      flex: 1;
    }
  }

  @media (max-width: 560px) {
    .cw-nav {
      height: 68px;
    }

    .cw-nav-right .cw-secure {
      display: none;
    }

    .cw-main {
      width: calc(100% - 20px);
      padding-top: 30px;
    }

    .cw-dashboard-head h1 {
      font-size: 42px;
    }

    .cw-section,
    .cw-overview-card {
      padding: 20px;
      border-radius: 16px;
    }

    .cw-stats-grid,
    .cw-analytics-grid,
    .cw-form-row,
    .cw-notes-grid {
      grid-template-columns: 1fr;
    }

    .cw-clip-item {
      flex-wrap: wrap;
    }

    .cw-task-item {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .cw-task-title-row {
      flex-wrap: wrap;
    }

    .cw-note-title-row {
      align-items: flex-start;
    }

    .cw-note-actions {
      opacity: 1;
      transform: none;
    }

    .cw-task-actions {
      width: 100%;
      padding-left: 47px;
    }

    .cw-task-actions button {
      flex: 1;
    }

    .cw-clip-main {
      width: calc(100% - 57px);
    }

    .cw-clip-actions {
      width: 100%;
      flex-direction: row;
      padding-left: 57px;
    }

    .cw-section-head {
      align-items: flex-start;
      gap: 12px;
    }

    .cw-section-actions {
      align-items: flex-end;
      flex-direction: column;
      gap: 8px;
    }

    .cw-login-card {
      padding: 30px 22px;
    }
  }
`;