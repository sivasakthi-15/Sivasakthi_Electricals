import { useCallback, useEffect, useRef } from "react";
import type { DraftState } from "@/types/bill";

const KEY = "electrical_billing_draft_v1";

export function loadDraft(): DraftState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftState;
  } catch {
    return null;
  }
}

export function saveDraft(state: DraftState) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, status: "draft" }));
  } catch {
    /* ignore quota */
  }
}

export function clearDraft() {
  localStorage.removeItem(KEY);
}

export function useAutoSaveDraft(state: DraftState, enabled: boolean) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (!enabled) return;
    saveDraft(state);
  }, [enabled, state]);

  useEffect(() => {
    if (!enabled) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => saveDraft(state), 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [enabled, state]);

  return flush;
}
