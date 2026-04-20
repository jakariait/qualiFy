import { useEffect, useRef, useState } from "react";

export default function useAutoSave(metaValues, saveFn, delay = 3000, enabled = false) {
  const [saveStatus, setSaveStatus] = useState("idle");
  const prevRef = useRef(null);
  const timerRef = useRef(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const serialized = JSON.stringify(metaValues);

    // Skip initial population
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevRef.current = serialized;
      return;
    }

    if (serialized === prevRef.current) return;
    prevRef.current = serialized;

    setSaveStatus("dirty");
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await saveFn(metaValues);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 4000);
      } catch {
        setSaveStatus("error");
      }
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [JSON.stringify(metaValues), enabled]);

  return { saveStatus };
}
