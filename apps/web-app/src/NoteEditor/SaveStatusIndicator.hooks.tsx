import { useEffect, useRef, useState } from 'react';

export function useActivityStatus(
  busy: boolean,
  activeText: string,
  doneText: string
) {
  const [showDone, setShowDone] = useState(false);
  const prev = useRef(busy);

  useEffect(() => {
    if (prev.current && !busy) {
      setShowDone(true);
      const timer = setTimeout(() => setShowDone(false), 2000);
      return () => clearTimeout(timer);
    }
    prev.current = busy;
  }, [busy]);

  if (busy) return { visible: true, text: activeText, done: false };
  if (showDone) return { visible: true, text: doneText, done: true };
  return { visible: false, text: '', done: false };
}
