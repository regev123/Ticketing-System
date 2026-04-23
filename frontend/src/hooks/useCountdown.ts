import { useEffect, useState } from 'react';

type UseCountdownTargetOptions = {
  targetTimeMs: number;
  tickMs?: number;
};

export function useCountdownTarget({ targetTimeMs, tickMs = 1000 }: UseCountdownTargetOptions) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, tickMs);
    return () => window.clearInterval(interval);
  }, [tickMs]);

  return Math.max(0, Math.floor((targetTimeMs - nowMs) / 1000));
}
