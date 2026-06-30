import { useEffect, useRef } from "react";

export function useKeyboardShortcuts(handlers: {
  onSave?: () => void;
  onPrint?: () => void;
  onFocusSearch?: () => void;
}) {
  const r = useRef(handlers);
  r.current = handlers;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const h = r.current;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        h.onSave?.();
      }
      if (mod && e.key.toLowerCase() === "p") {
        e.preventDefault();
        h.onPrint?.();
      }
      if (mod && e.key === "/") {
        e.preventDefault();
        h.onFocusSearch?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
