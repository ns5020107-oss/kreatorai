import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { uid } from "../lib/logic";
import { api } from "../lib/api";
import { useAuth } from "./auth";

const StoreCtx = createContext(null);

function readLS(key, fallback) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return fallback;
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function writeLS(key, value) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — app keeps working in memory */
  }
}

const K = {
  briefs: "kreatorai:briefs",
  messages: "kreatorai:messages",
  shortlists: "kreatorai:shortlists",
  stages: "kreatorai:stages",
  notes: "kreatorai:notes",
};

// ---- server sync helpers (briefs only; everything else stays local) ----
// Frontend ids stay stable local uids so shortlists/stages/notes keep
// working; the server row id is tracked in `_serverId`.
function toServerPayload(brief) {
  const { id, _serverId, _server, createdAt, updatedAt, ...rest } = brief;
  return {
    title: String(brief.campaignTitle || "Untitled brief").slice(0, 200),
    brand_name: String(brief.brandName || "").slice(0, 200),
    status: String(brief.status || "Draft").slice(0, 40),
    data: rest,
  };
}

function fromServerBrief(sb) {
  const data = sb.data && typeof sb.data === "object" ? sb.data : {};
  return {
    ...data,
    id: uid("brief"),
    _serverId: String(sb.id),
    _server: true,
    campaignTitle: data.campaignTitle || sb.title || "Untitled brief",
    brandName: data.brandName || sb.brand_name || "",
    status: sb.status || "Draft",
    createdAt: sb.created_at,
    updatedAt: sb.updated_at,
  };
}

export function StoreProvider({ children }) {
  const { user, token, backendUp } = useAuth();
  const [briefs, setBriefs] = useState(() => readLS(K.briefs, []));
  const [messages, setMessages] = useState(() => readLS(K.messages, []));
  const [shortlists, setShortlists] = useState(() => readLS(K.shortlists, {})); // briefId -> [creatorId]
  const [stages, setStages] = useState(() => readLS(K.stages, {})); // briefId -> stageIndex
  const [notes, setNotes] = useState(() => readLS(K.notes, {})); // briefId -> [{id, text, at}]
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);
  const syncing = useRef(false);

  const toast = useCallback((text) => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  // Push one brief to the server in the background. Never throws —
  // the local copy is always the source of truth for the UI.
  const syncBriefToServer = useCallback(
    async (brief) => {
      if (!user || !token || !backendUp) return;
      try {
        if (brief._serverId) {
          await api(`/api/briefs/${brief._serverId}`, {
            method: "PUT",
            body: toServerPayload(brief),
            token,
          });
        } else {
          const res = await api("/api/briefs", {
            method: "POST",
            body: toServerPayload(brief),
            token,
          });
          const serverId = String(res.brief.id);
          setBriefs((prev) => {
            const next = prev.map((b) =>
              b.id === brief.id ? { ...b, _serverId: serverId, _server: true } : b
            );
            writeLS(K.briefs, next);
            return next;
          });
        }
      } catch {
        /* offline or server error — local copy already saved */
      }
    },
    [user, token, backendUp]
  );

  // When the user signs in with a live backend: pull their server briefs
  // in (dedupe by _serverId) and push any local-only briefs up.
  useEffect(() => {
    if (!user || !token || !backendUp || syncing.current) return;
    syncing.current = true;
    (async () => {
      try {
        const res = await api("/api/briefs", { token });
        const serverBriefs = Array.isArray(res.briefs) ? res.briefs : [];
        setBriefs((prev) => {
          const known = new Set(prev.map((b) => b._serverId).filter(Boolean));
          const fresh = serverBriefs
            .filter((sb) => !known.has(String(sb.id)))
            .map(fromServerBrief);
          if (fresh.length === 0) return prev;
          const next = [...fresh, ...prev];
          writeLS(K.briefs, next);
          return next;
        });
        // push local-only briefs created while offline/anonymous
        const local = readLS(K.briefs, []);
        for (const b of local.filter((x) => !x._serverId)) {
          try {
            const created = await api("/api/briefs", {
              method: "POST",
              body: toServerPayload(b),
              token,
            });
            const serverId = String(created.brief.id);
            setBriefs((prev) => {
              const next = prev.map((x) =>
                x.id === b.id ? { ...x, _serverId: serverId, _server: true } : x
              );
              writeLS(K.briefs, next);
              return next;
            });
          } catch {
            /* keep it local */
          }
        }
      } catch {
        /* server unreachable — local data stays */
      } finally {
        syncing.current = false;
      }
    })();
  }, [user, token, backendUp]);

  // On logout, drop server-synced briefs from this browser so the next
  // person on a shared machine doesn't see them. Pure-local briefs stay.
  const wasLoggedIn = useRef(false);
  useEffect(() => {
    if (wasLoggedIn.current && !user) {
      setBriefs((prev) => {
        const next = prev.filter((b) => !b._serverId);
        writeLS(K.briefs, next);
        return next;
      });
    }
    wasLoggedIn.current = !!user;
  }, [user]);

  const saveBrief = useCallback(
    (brief) => {
      const item = { ...brief, id: brief.id || uid("brief"), updatedAt: new Date().toISOString() };
      if (!brief.id) item.createdAt = item.updatedAt;
      setBriefs((prev) => {
        const next = prev.some((b) => b.id === item.id)
          ? prev.map((b) => (b.id === item.id ? item : b))
          : [item, ...prev];
        writeLS(K.briefs, next);
        return next;
      });
      // API-first when signed in: sync in background, UI never waits.
      syncBriefToServer(item);
      return item;
    },
    [syncBriefToServer]
  );

  const deleteBrief = useCallback(
    (id) => {
      let doomed = null;
      setBriefs((prev) => {
        doomed = prev.find((b) => b.id === id) || null;
        const next = prev.filter((b) => b.id !== id);
        writeLS(K.briefs, next);
        return next;
      });
      if (doomed && doomed._serverId && user && token && backendUp) {
        api(`/api/briefs/${doomed._serverId}`, { method: "DELETE", token }).catch(() => {
          /* already gone locally; server copy is harmless */
        });
      }
    },
    [user, token, backendUp]
  );

  const logMessage = useCallback((msg) => {
    const item = { ...msg, id: uid("msg"), at: new Date().toISOString() };
    setMessages((prev) => {
      const next = [item, ...prev];
      writeLS(K.messages, next);
      return next;
    });
    return item;
  }, []);

  const toggleShortlist = useCallback((briefId, creatorId) => {
    setShortlists((prev) => {
      const list = prev[briefId] || [];
      const next = { ...prev, [briefId]: list.includes(creatorId) ? list.filter((c) => c !== creatorId) : [...list, creatorId] };
      writeLS(K.shortlists, next);
      return next;
    });
  }, []);

  const setStage = useCallback((briefId, index) => {
    setStages((prev) => {
      const next = { ...prev, [briefId]: index };
      writeLS(K.stages, next);
      return next;
    });
  }, []);

  const addNote = useCallback((briefId, text) => {
    const note = { id: uid("note"), text, at: new Date().toISOString() };
    setNotes((prev) => {
      const next = { ...prev, [briefId]: [note, ...(prev[briefId] || [])] };
      writeLS(K.notes, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ briefs, saveBrief, deleteBrief, messages, logMessage, shortlists, toggleShortlist, stages, setStage, notes, addNote, toasts, toast }),
    [briefs, saveBrief, deleteBrief, messages, logMessage, shortlists, toggleShortlist, stages, setStage, notes, addNote, toasts, toast]
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
